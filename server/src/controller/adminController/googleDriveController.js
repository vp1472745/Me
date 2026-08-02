import User from "../../model/authModel.js";
import config from "../../config/config.js";
import History from "../../model/historyModel.js";
import nodemailer from "nodemailer";
import TempFile from "../../model/tempFileModel.js";
import { tempMemoryCache } from "../../utils/memoryCache.js";
import {
  getAuthUrl,
  getTokens,
  getUserEmail,
  findOrCreateFolder,
  setupClientFolders,
  getFileStream,
  getAccessToken,
  getAccessTokenFromRefreshToken,
} from "../../services/googleDriveService.js";

// 1. Connect drive - return authUrl
export const connectDrive = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const authUrl = getAuthUrl(userId, req);
    console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("REDIRECT_URI:", config.GOOGLE_REDIRECT_URI);
    console.log("AUTH_URL:", authUrl);
    return res.status(200).json({ success: true, authUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Callback - Google OAuth redirect handler
export const driveCallback = async (req, res) => {
  const { code, state: userId } = req.query;
  const clientUrl = config.CLIENT_URL;

  if (!code || !userId) {
    return res.redirect(`${clientUrl}/dashboard/admin-overview?google=failed`);
  }

  let userRole = "ADMIN";
  try {
    // Exchange code for tokens
    const tokenData = await getTokens(code, req);
    const { access_token, refresh_token } = tokenData;

    // Get google email
    const googleEmail = await getUserEmail(access_token);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("Client User not found");
    }
    userRole = user.role;

    // Find or Create Root Folder in client's Google Drive: Name = client.name
    const rootFolderId = await findOrCreateFolder(access_token, user.name);

    // Auto-create subfolders: Wedding, Pre Wedding, Haldi, etc.
    await setupClientFolders(access_token, rootFolderId);

    // Save tokens and properties to user document
    user.googleDrive = {
      connected: true,
      googleEmail,
      accessToken: access_token,
      // Only update refresh token if Google sent it (sent only on first consent/consent prompt)
      refreshToken: refresh_token || user.googleDrive?.refreshToken || "",
      rootFolderId,
      connectedAt: new Date(),
    };

    await user.save();

    // Log History
    await History.create({
      action: "Google Drive Connected",
      performedBy: user._id, // Connected on this user's account
      role: user.role,
      remarks: `Connected Google Drive (${googleEmail}) with root folder '${user.name}'`,
    });

    // Redirect to frontend dashboard page based on role
    const redirectPath = userRole === "ADMIN" ? "admin-overview" : "admin-all-users";
    return res.redirect(`${clientUrl}/dashboard/${redirectPath}?google=success`);
  } catch (error) {
    console.error("Google Drive connection callback error:", error);
    const redirectPath = userRole === "ADMIN" ? "admin-overview" : "admin-all-users";
    return res.redirect(`${clientUrl}/dashboard/${redirectPath}?google=error`);
  }
};

// 3. Status - Get Google Drive connection status for user
export const driveStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const envRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const isConnected = user.googleDrive?.connected || !!envRefreshToken;

    return res.status(200).json({
      success: true,
      connected: isConnected,
      googleEmail: user.googleDrive?.googleEmail || (envRefreshToken ? "Global / System Drive" : ""),
      connectedAt: user.googleDrive?.connectedAt || null,
      rootFolderId: user.googleDrive?.rootFolderId || "",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Disconnect drive
export const disconnectDrive = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Reset googleDrive stats
    user.googleDrive = {
      connected: false,
      googleEmail: "",
      accessToken: "",
      refreshToken: "",
      rootFolderId: "",
      connectedAt: null,
    };

    await user.save();

    // Log History
    await History.create({
      action: "Google Drive Disconnected",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Disconnected Google Drive connection for user ${user.name}`,
    });

    return res.status(200).json({
      success: true,
      message: "Google Drive disconnected successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Send Google Drive connection link email to client user
export const sendDriveLinkEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const authUrl = getAuthUrl(userId, req);

    // Setup nodemailer transport using OTP service configuration credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || process.env.EMAIL_USER,
        pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS,
      },
    });

    const hasCreds = (process.env.GMAIL_USER && process.env.GMAIL_PASS) || (process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (hasCreds) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER || process.env.EMAIL_USER,
        to: user.email,
        subject: "Action Required: Connect Google Drive to Photo Studio Management System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #DDE7D8; border-radius: 16px; background-color: #F7F9F4; color: #3B4953;">
            <h2 style="color: #5A7863; border-bottom: 2px solid #DDE7D8; pb-10px; margin-bottom: 20px;">Connect Your Google Drive</h2>
            <p>Hello <b>${user.name}</b>,</p>
            <p style="line-height: 1.6;">To enable automated deliverables syncing and wedding photo delivery directly to your personal Google Drive, please connect your account by clicking the secure authorization button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${authUrl}" style="background-color: #5A7863; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(90,120,99,0.15);">Connect Google Drive</a>
            </div>
            <p style="font-size: 11px; color: #90AB8B; text-align: center; margin-top: 25px;">This is a secure connection handled directly via Google OAuth authorization screen.</p>
          </div>
        `,
      });
    } else {
      console.log("=========================================");
      console.log(`[DEV ONLY] Send Google Drive connection email for ${user.email}. URL: ${authUrl}`);
      console.log("=========================================");
    }

    return res.status(200).json({
      success: true,
      message: `Google Drive connection link emailed to ${user.email} successfully.`,
    });
  } catch (error) {
    console.error("sendDriveLinkEmail Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Proxy/Stream public file content from Google Drive
export const proxyPublicFile = async (req, res) => {
  try {
    let { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ success: false, message: "File ID is required" });
    }

    // Check if it's a local/temporary ID
    if (fileId.startsWith("local-")) {
      // Serve from RAM cache if still syncing
      if (tempMemoryCache.has(fileId)) {
        const cached = tempMemoryCache.get(fileId);
        res.setHeader("Content-Type", cached.mimeType || "application/octet-stream");
        return res.send(cached.buffer);
      }

      // If missing from RAM cache, check if it has been synced to Google Drive in the background
      const syncedFile = await TempFile.findOne({ localId: fileId });
      if (syncedFile && syncedFile.status === "COMPLETED" && syncedFile.driveId) {
        fileId = syncedFile.driveId; // Switch to the real Google Drive ID
      } else if (syncedFile && syncedFile.status === "FAILED") {
        return res.status(500).json({ success: false, message: `Background sync failed: ${syncedFile.error}` });
      } else {
        return res.status(404).json({ success: false, message: "File is syncing or not found" });
      }
    }

    // Find connected Google Drive user (preferably an admin)
    let driveUser = await User.findOne({ "googleDrive.connected": true, role: "ADMIN" });
    if (!driveUser) {
      driveUser = await User.findOne({ "googleDrive.connected": true });
    }

    let accessToken = null;
    const envRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (driveUser) {
      accessToken = await getAccessToken(driveUser);
    } else if (envRefreshToken) {
      accessToken = await getAccessTokenFromRefreshToken(envRefreshToken);
    }

    if (!accessToken) {
      return res.status(400).json({ success: false, message: "No connected Google Drive found to stream asset" });
    }

    // Get stream from Google Drive
    const driveRes = await getFileStream(accessToken, fileId);

    // Set headers
    const contentType = driveRes.headers["content-type"] || "application/octet-stream";
    const contentLength = driveRes.headers["content-length"];

    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Pipe stream response
    driveRes.data.pipe(res);
  } catch (error) {
    console.error("Public file proxy error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
