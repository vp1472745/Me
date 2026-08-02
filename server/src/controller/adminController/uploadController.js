import multer from "multer";
import Work from "../../model/workModel.js";
import User from "../../model/authModel.js";
import History from "../../model/historyModel.js";
import Notification from "../../model/notificationModel.js";
import TempFile from "../../model/tempFileModel.js";
import { tempMemoryCache } from "../../utils/memoryCache.js";
import { getAccessToken, findOrCreateFolder, uploadFile, uploadPublicAssetToDrive, makeFilePublic } from "../../services/googleDriveService.js";

// Multer memory configuration
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Helper for Background Syncing of Public Assets using RAM Cache
const uploadPublicAssetBackground = async (originalName, mimeType, folderName, userContext, localId) => {
  try {
    const cachedItem = tempMemoryCache.get(localId);
    if (!cachedItem) {
      throw new Error("Temporary file buffer missing from RAM cache");
    }

    const buffer = cachedItem.buffer;
    
    // Find connected Google Drive user
    const User = (await import("../../model/authModel.js")).default;
    let driveUser = null;
    if (userContext) {
      driveUser = await User.findById(userContext._id);
    }
    if (!driveUser || !driveUser.googleDrive?.connected) {
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
      accessToken = await getAccessTokenFromRefreshToken(envRefreshToken);
    }

    if (!accessToken) {
      throw new Error("Failed to refresh Google Drive access token");
    }

    // 1. Find or create root folder "Studio Public Assets"
    const rootFolderId = await findOrCreateFolder(accessToken, "Studio Public Assets");

    // 2. Find or create subfolder inside root folder
    const subFolderId = await findOrCreateFolder(accessToken, folderName, rootFolderId);

    // 3. Upload file
    const uploadRes = await uploadFile(accessToken, subFolderId, originalName, buffer, mimeType);

    // 4. Make the file publicly viewable
    await makeFilePublic(accessToken, uploadRes.id);

    // 5. Update status
    await TempFile.findOneAndUpdate(
      { localId },
      { status: "COMPLETED", driveId: uploadRes.id }
    );

    // 6. Delete from RAM cache immediately to free memory!
    tempMemoryCache.delete(localId);
    console.log(`Background public sync completed for ${localId} -> Google Drive: ${uploadRes.id}`);
  } catch (error) {
    console.error(`Background public sync failed for ${localId}:`, error.message);
    await TempFile.findOneAndUpdate(
      { localId },
      { status: "FAILED", error: error.message }
    );
    // Delete from RAM cache even on failure to avoid leak
    tempMemoryCache.delete(localId);
  }
};

// Helper for Background Syncing of Deliverables using RAM Cache
const uploadDeliverableBackground = async (originalName, mimeType, subFolder, clientId, workId, localId) => {
  try {
    const cachedItem = tempMemoryCache.get(localId);
    if (!cachedItem) {
      throw new Error("Temporary deliverable buffer missing from RAM cache");
    }

    const buffer = cachedItem.buffer;
    const User = (await import("../../model/authModel.js")).default;
    const Work = (await import("../../model/workModel.js")).default;

    const clientUser = await User.findById(clientId);
    if (!clientUser || !clientUser.googleDrive?.connected) {
      throw new Error("Client's Google Drive is not connected");
    }

    // Refresh client's Google Drive access token
    const accessToken = await getAccessToken(clientUser);

    // Resolve or Create subfolder inside Client's Root Folder
    const subFolderId = await findOrCreateFolder(
      accessToken,
      subFolder,
      clientUser.googleDrive.rootFolderId
    );

    // Upload file to client's Drive
    const uploadRes = await uploadFile(
      accessToken,
      subFolderId,
      originalName,
      buffer,
      mimeType
    );

    // Update TempFile tracking
    await TempFile.findOneAndUpdate(
      { localId },
      { status: "COMPLETED", driveId: uploadRes.id }
    );

    // Update the fileId in Work deliverables
    const work = await Work.findById(workId);
    if (work) {
      const del = work.deliverables.find(d => d.fileId === localId);
      if (del) {
        del.fileId = uploadRes.id;
        await work.save();
      }
    }

    // Delete from RAM cache immediately to free memory!
    tempMemoryCache.delete(localId);

    // Log History
    await History.create({
      workId,
      action: "Upload Completed",
      remarks: `Background sync completed for file '${originalName}'`,
    });

    // Notify Client User
    await Notification.create({
      recipient: clientId,
      message: `A new file '${originalName}' has been successfully synced to your '${subFolder}' folder.`,
      type: "UPLOAD_COMPLETED",
      link: `/dashboard/gallery`,
    });

    console.log(`Background deliverable sync completed for ${localId} -> Google Drive: ${uploadRes.id}`);
  } catch (error) {
    console.error(`Background deliverable sync failed for ${localId}:`, error.message);
    await TempFile.findOneAndUpdate(
      { localId },
      { status: "FAILED", error: error.message }
    );
    // Delete from RAM cache even on failure to avoid leak
    tempMemoryCache.delete(localId);
  }
};

// 1. Single Upload (Photo / Video / deliverable)
export const uploadSingleFile = async (req, res) => {
  try {
    const { workId, subFolder } = req.body;
    const file = req.file;

    if (!workId || !subFolder || !file) {
      return res.status(400).json({ success: false, message: "Missing workId, subFolder, or file" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    // Client user details
    const clientUser = await User.findById(work.client);
    if (!clientUser || !clientUser.googleDrive?.connected) {
      return res.status(400).json({
        success: false,
        message: "Client's Google Drive is not connected. Admin must connect it first.",
      });
    }

    // Generate local temp ID
    const fileExt = file.originalname.split(".").pop();
    const localFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const localId = `local-${localFileName}`;

    // Save in RAM cache (Zero Disk Writes)
    tempMemoryCache.set(localId, file.buffer, file.mimetype);

    // Create TempFile entry
    await TempFile.create({
      localId,
      status: "PENDING",
    });

    // Add deliverable to Work document instantly!
    const newDeliverable = {
      fileId: localId, // Immediate local ID
      name: file.originalname,
      category: subFolder,
      size: file.size,
      version: 1,
      uploadedBy: req.user.role === "ADMIN" ? "Admin" : "Editor",
      uploadedAt: new Date(),
      status: "APPROVED",
    };

    work.deliverables.push(newDeliverable);
    await work.save();

    // Trigger background sync using RAM buffer
    uploadDeliverableBackground(file.originalname, file.mimetype, subFolder, clientUser._id, workId, localId)
      .catch(err => console.error(`Background deliverable sync fail for ${localId}:`, err));

    // Log History
    await History.create({
      workId: work._id,
      action: "Upload Initiated",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Initiated upload of '${file.originalname}' (${subFolder})`,
    });

    return res.status(200).json({
      success: true,
      message: "File upload initiated successfully (syncing in background).",
      deliverable: newDeliverable,
    });
  } catch (error) {
    console.error("Single file upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Multiple Uploads
export const uploadMultipleFiles = async (req, res) => {
  try {
    const { workId, subFolder } = req.body;
    const files = req.files;

    if (!workId || !subFolder || !files || files.length === 0) {
      return res.status(400).json({ success: false, message: "Missing workId, subFolder, or files" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    const clientUser = await User.findById(work.client);
    if (!clientUser || !clientUser.googleDrive?.connected) {
      return res.status(400).json({
        success: false,
        message: "Client's Google Drive is not connected. Admin must connect it first.",
      });
    }

    const deliverables = [];

    // Save all files in RAM cache and trigger background uploads
    for (const file of files) {
      const fileExt = file.originalname.split(".").pop();
      const localFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
      const localId = `local-${localFileName}`;

      // Save in RAM cache (Zero Disk Writes)
      tempMemoryCache.set(localId, file.buffer, file.mimetype);

      await TempFile.create({
        localId,
        status: "PENDING",
      });

      const newDeliverable = {
        fileId: localId,
        name: file.originalname,
        category: subFolder,
        size: file.size,
        version: 1,
        uploadedBy: req.user.role === "ADMIN" ? "Admin" : "Editor",
        uploadedAt: new Date(),
        status: "APPROVED",
      };

      deliverables.push(newDeliverable);

      // Trigger background upload
      uploadDeliverableBackground(file.originalname, file.mimetype, subFolder, clientUser._id, workId, localId)
        .catch(err => console.error(`Background deliverable sync fail for ${localId}:`, err));
    }

    work.deliverables.push(...deliverables);
    await work.save();

    // Log History
    await History.create({
      workId: work._id,
      action: "Upload Initiated",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Initiated upload of ${files.length} files (${subFolder})`,
    });

    return res.status(200).json({
      success: true,
      message: `Initiated upload of ${files.length} files (syncing in background).`,
      deliverables,
    });
  } catch (error) {
    console.error("Multiple files upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Upload Public Asset
export const uploadPublicAsset = async (req, res) => {
  try {
    const file = req.file;
    const { subFolder } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const folderName = subFolder || "General Assets";

    // Generate local temp ID
    const fileExt = file.originalname.split(".").pop();
    const localFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const localId = `local-${localFileName}`;
    
    // Save in RAM cache (Zero Disk Writes)
    tempMemoryCache.set(localId, file.buffer, file.mimetype);

    // Create tracking doc
    await TempFile.create({
      localId,
      status: "PENDING",
    });

    // Start background sync
    const userContext = req.user ? { _id: req.user._id, role: req.user.role } : null;
    
    uploadPublicAssetBackground(file.originalname, file.mimetype, folderName, userContext, localId)
      .catch(err => console.error(`Background upload fail for ${localId}:`, err));

    // Respond immediately to the frontend
    const instantUrl = `https://drive.google.com/uc?export=view&id=${localId}`;
    return res.status(200).json({
      success: true,
      message: "Asset uploaded successfully (local caching pending Google Drive sync)",
      url: instantUrl,
      public_id: localId,
    });
  } catch (error) {
    console.error("Public asset upload controller error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
