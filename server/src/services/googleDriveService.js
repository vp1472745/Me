import axios from "axios";

/**
 * Construct Google OAuth authorize URL for Consent Screen
 */
export const getAuthUrl = (userId, req = null) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  let redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  // Determine if we are running in production
  const host = req ? (req.get("host") || "") : "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || process.env.NODE_ENV !== "production" && !host;
  
  if (!isLocal) {
    // In production, force the exact production callback URL registered in Google Console
    redirectUri = "https://me-vp02.onrender.com/api/google/callback";
  } else {
    // In local development, use localhost
    redirectUri = "http://localhost:5000/api/google/callback";
  }

  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: userId,
  };
  return `${rootUrl}?${new URLSearchParams(options).toString()}`;
};

/**
 * Exchange OAuth auth code for access & refresh tokens
 */
export const getTokens = async (code, req = null) => {
  let redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  const host = req ? (req.get("host") || "") : "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || process.env.NODE_ENV !== "production" && !host;
  
  if (!isLocal) {
    redirectUri = "https://me-vp02.onrender.com/api/google/callback";
  } else {
    redirectUri = "http://localhost:5000/api/google/callback";
  }

  const response = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  return response.data;
};

/**
 * Fetch connected Google account email
 */
export const getUserEmail = async (accessToken) => {
  const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.email;
};

/**
 * Exchange refresh token for a new access token
 */
export const getAccessTokenFromRefreshToken = async (refreshToken) => {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    throw new Error("Failed to refresh Google Drive access token");
  }
};

/**
 * Automatically refresh access token using refresh token
 */
export const getAccessToken = async (user) => {
  if (!user.googleDrive?.refreshToken) {
    throw new Error("Google Drive not connected for this client");
  }
  try {
    const access_token = await getAccessTokenFromRefreshToken(user.googleDrive.refreshToken);
    user.googleDrive.accessToken = access_token;
    await user.save();
    return access_token;
  } catch (error) {
    throw error;
  }
};

/**
 * Find folder ID by name and parent folder
 */
export const findFolder = async (accessToken, name, parentId = null) => {
  let query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  try {
    const response = await axios.get("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      },
    });
    const files = response.data.files;
    return files && files.length > 0 ? files[0].id : null;
  } catch (error) {
    console.error(`Error finding folder ${name}:`, error.response?.data || error.message);
    return null;
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (accessToken, folderName, parentId = null) => {
  const body = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    body.parents = [parentId];
  }
  try {
    const response = await axios.post("https://www.googleapis.com/drive/v3/files", body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.id;
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error.response?.data || error.message);
    throw new Error(`Failed to create Google Drive folder: ${folderName}`);
  }
};

/**
 * Find existing folder or create it if not found (Prevents duplication)
 */
export const findOrCreateFolder = async (accessToken, name, parentId = null) => {
  let folderId = await findFolder(accessToken, name, parentId);
  if (!folderId) {
    folderId = await createFolder(accessToken, name, parentId);
  }
  return folderId;
};

/**
 * Setup default folders structure inside the client root folder
 */
export const setupClientFolders = async (accessToken, rootFolderId) => {
  const subFolders = [
    "Wedding",
    "Pre Wedding",
    "Haldi",
    "Mehendi",
    "Reception",
    "RAW Photos",
    "Edited Photos",
    "Videos",
    "Albums",
    "Final Delivery",
  ];
  const mapping = {};
  for (const folder of subFolders) {
    const folderId = await findOrCreateFolder(accessToken, folder, rootFolderId);
    mapping[folder] = folderId;
  }
  return mapping;
};

/**
 * Upload file directly to Google Drive via multipart REST API request
 */
export const uploadFile = async (accessToken, parentId, fileName, fileBuffer, mimeType) => {
  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [parentId],
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    fileBuffer.toString("base64") +
    closeDelimiter;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size",
      multipartRequestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": multipartRequestBody.length,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file to Drive:", error.response?.data || error.message);
    throw new Error("Failed to upload file to Google Drive");
  }
};

/**
 * Download/Stream file content directly from Google Drive
 */
export const getFileStream = async (accessToken, fileId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "stream",
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading file from Drive:", error.response?.data || error.message);
    throw new Error("Failed to retrieve file content from Google Drive");
  }
};

/**
 * Delete file directly from Google Drive
 */
export const deleteFile = async (accessToken, fileId) => {
  try {
    await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId} from Drive:`, error.response?.data || error.message);
    return false;
  }
};

/**
 * Helper to upload a public asset (Stories, Hero, PhotoBook, etc.) to the connected Admin's Google Drive.
 */
export const uploadPublicAssetToDrive = async (fileName, fileBuffer, mimeType, subFolderName, currentUser) => {
  const User = (await import("../model/authModel.js")).default;

  // Find connected Google Drive user
  let driveUser = null;
  if (currentUser && currentUser.googleDrive?.connected) {
    driveUser = currentUser;
  } else {
    driveUser = await User.findOne({ "googleDrive.connected": true, role: "ADMIN" });
    if (!driveUser) {
      driveUser = await User.findOne({ "googleDrive.connected": true });
    }
  }

  let accessToken = null;
  const envRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (driveUser) {
    accessToken = await getAccessToken(driveUser);
  } else if (envRefreshToken) {
    try {
      console.log("Using global GOOGLE_REFRESH_TOKEN from environment for Google Drive upload");
      accessToken = await getAccessTokenFromRefreshToken(envRefreshToken);
    } catch (err) {
      console.warn("Global Google Drive refresh token exchange failed:", err.message);
    }
  }

  if (!accessToken) {
    throw new Error("⚠️ No Google Drive account is connected. Please connect your Google Drive account in the Admin Overview page to upload files.");
  }

  // 1. Find or create root folder "Studio Public Assets"
  const rootFolderId = await findOrCreateFolder(accessToken, "Studio Public Assets");

  // 2. Find or create subfolder inside root folder
  const subFolderId = await findOrCreateFolder(accessToken, subFolderName, rootFolderId);

  // 3. Upload file
  const uploadRes = await uploadFile(accessToken, subFolderId, fileName, fileBuffer, mimeType);

  // 4. Make the file publicly viewable
  await makeFilePublic(accessToken, uploadRes.id);

  const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
  return {
    id: uploadRes.id,
    url: `${serverUrl}/api/google/file/${uploadRes.id}`,
  };
};

/**
 * Make a Google Drive file publicly viewable (anyone with link can view)
 */
export const makeFilePublic = async (accessToken, fileId) => {
  try {
    await axios.post(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        role: "reader",
        type: "anyone",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return true;
  } catch (error) {
    console.error(`Error making file ${fileId} public:`, error.response?.data || error.message);
    return false;
  }
};

/**
 * Helper to delete a public asset from the connected Admin's Google Drive.
 */
export const deletePublicAssetFromDrive = async (fileId, currentUser) => {
  if (!fileId) return false;

  if (fileId.startsWith("local-")) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const fileName = fileId.replace("local-", "");
      const filePath = path.join(process.cwd(), "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted local asset: ${fileName}`);
        return true;
      }
    } catch (err) {
      console.warn("Failed to delete local asset:", err.message);
    }
    return false;
  }

  const User = (await import("../model/authModel.js")).default;

  let driveUser = null;
  if (currentUser && currentUser.googleDrive?.connected) {
    driveUser = currentUser;
  } else {
    driveUser = await User.findOne({ "googleDrive.connected": true, role: "ADMIN" });
    if (!driveUser) {
      driveUser = await User.findOne({ "googleDrive.connected": true });
    }
  }

  let accessToken = null;
  const envRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (driveUser) {
    try {
      accessToken = await getAccessToken(driveUser);
    } catch (err) {
      console.warn("Failed to get user access token for deletion:", err.message);
    }
  } else if (envRefreshToken) {
    try {
      accessToken = await getAccessTokenFromRefreshToken(envRefreshToken);
    } catch (err) {
      console.warn("Failed to get env access token for deletion:", err.message);
    }
  }

  if (!accessToken) {
    console.warn("No Google Drive account connected to delete public asset:", fileId);
    return false;
  }

  try {
    return await deleteFile(accessToken, fileId);
  } catch (err) {
    console.error(`Failed to delete public asset ${fileId} from Drive:`, err.message);
    return false;
  }
};

