import multer from "multer";
import Work from "../model/workModel.js";
import User from "../model/authModel.js";
import History from "../model/historyModel.js";
import Notification from "../model/notificationModel.js";
import { getAccessToken, findOrCreateFolder, uploadFile } from "../services/googleDriveService.js";

// Multer memory configuration
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Single Upload (Photo / Video / deliverable)
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
      file.originalname,
      file.buffer,
      file.mimetype
    );

    // Add deliverable to Work document
    const newDeliverable = {
      fileId: uploadRes.id,
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

    // Log History
    await History.create({
      workId: work._id,
      action: "Upload Completed",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Uploaded file '${file.originalname}' (${subFolder}) into client's Google Drive`,
    });

    // Notify Client User
    await Notification.create({
      recipient: work.client,
      message: `A new file '${file.originalname}' has been uploaded to your '${subFolder}' folder.`,
      type: "UPLOAD_COMPLETED",
      link: `/dashboard/gallery`,
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully to client's Google Drive.",
      deliverable: newDeliverable,
    });
  } catch (error) {
    console.error("Single file upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Multiple Uploads
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

    // Refresh client's token
    const accessToken = await getAccessToken(clientUser);

    // Resolve or Create subfolder
    const subFolderId = await findOrCreateFolder(
      accessToken,
      subFolder,
      clientUser.googleDrive.rootFolderId
    );

    const uploadedDeliverables = [];

    for (const file of files) {
      const uploadRes = await uploadFile(
        accessToken,
        subFolderId,
        file.originalname,
        file.buffer,
        file.mimetype
      );

      const deliverable = {
        fileId: uploadRes.id,
        name: file.originalname,
        category: subFolder,
        size: file.size,
        version: 1,
        uploadedBy: req.user.role === "ADMIN" ? "Admin" : "Editor",
        uploadedAt: new Date(),
        status: "APPROVED",
      };

      work.deliverables.push(deliverable);
      uploadedDeliverables.push(deliverable);
    }

    await work.save();

    // Log History
    await History.create({
      workId: work._id,
      action: "Upload Completed",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Uploaded ${files.length} files (${subFolder}) into client's Google Drive`,
    });

    // Notify Client
    await Notification.create({
      recipient: work.client,
      message: `${files.length} new files have been uploaded to your '${subFolder}' folder.`,
      type: "UPLOAD_COMPLETED",
      link: `/dashboard/gallery`,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} files.`,
      deliverables: uploadedDeliverables,
    });
  } catch (error) {
    console.error("Multiple files upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
