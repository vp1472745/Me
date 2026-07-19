import Correction from "../../model/correctionModel.js";
import Work from "../../model/workModel.js";
import User from "../../model/authModel.js";
import History from "../../model/historyModel.js";
import Notification from "../../model/notificationModel.js";
import { getAccessToken, findOrCreateFolder, uploadFile } from "../../services/googleDriveService.js";

// 1. Create Correction Request (USER ONLY)
export const createCorrection = async (req, res) => {
  try {
    const { workId, fileId, fileName, userComment } = req.body;

    if (!workId || !fileId || !fileName || !userComment) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Work assignment not found" });
    }

    // Set deliverable status to NEEDS_CORRECTION
    const deliverable = work.deliverables.find((d) => d.fileId === fileId);
    if (deliverable) {
      deliverable.status = "NEEDS_CORRECTION";
      await work.save();
    }

    // Find or create Correction document for this fileId
    let correction = await Correction.findOne({ fileId });
    const currentVersion = correction ? correction.version : 1;

    if (!correction) {
      correction = await Correction.create({
        workId,
        fileId,
        fileName,
        version: currentVersion,
        userComment,
        status: "Pending",
      });
    } else {
      // Add previous state to history
      correction.history.push({
        version: correction.version,
        fileId: correction.fileId,
        userComment: correction.userComment,
        editorNotes: correction.editorNotes,
        status: correction.status,
        updatedBy: req.user._id,
      });

      correction.userComment = userComment;
      correction.status = "Pending";
      await correction.save();
    }

    // Notify Editor
    await Notification.create({
      recipient: work.editor,
      message: `Client ${req.user.name} requested correction on image '${fileName}': "${userComment}"`,
      type: "CORRECTION_REQUESTED",
      link: `/dashboard/posts`,
    });

    // Log History
    await History.create({
      workId: work._id,
      action: "Correction Requested",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Requested correction for '${fileName}' (Version: ${currentVersion}): "${userComment}"`,
    });

    return res.status(201).json({ success: true, message: "Correction request sent successfully.", correction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Correction Status / Upload New version (EDITOR ONLY)
export const updateCorrection = async (req, res) => {
  try {
    const { correctionId, status, editorNotes } = req.body;
    const file = req.file; // Uploaded revision file

    if (!correctionId || !status) {
      return res.status(400).json({ success: false, message: "Correction ID and status are required" });
    }

    const correction = await Correction.findById(correctionId);
    if (!correction) {
      return res.status(404).json({ success: false, message: "Correction request not found" });
    }
    const originalFileId = correction.fileId;

    const work = await Work.findById(correction.workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    // If Editor uploaded a new version file & status is marked Completed
    if (status === "Completed" && file) {
      const clientUser = await User.findById(work.client);
      const accessToken = await getAccessToken(clientUser);

      // Resolve 'Edited Photos' directory
      const editedPhotosFolderId = await findOrCreateFolder(
        accessToken,
        "Edited Photos",
        clientUser.googleDrive.rootFolderId
      );

      // Upload file to Google Drive
      const uploadRes = await uploadFile(
        accessToken,
        editedPhotosFolderId,
        file.originalname,
        file.buffer,
        file.mimetype
      );

      // Increment version number
      const nextVersion = correction.version + 1;

      // Keep previous state in history
      correction.history.push({
        version: correction.version,
        fileId: correction.fileId,
        userComment: correction.userComment,
        editorNotes: correction.editorNotes,
        status: correction.status,
        updatedBy: req.user._id,
      });

      // Update Correction info to the new file details
      correction.fileId = uploadRes.id;
      correction.fileName = file.originalname;
      correction.version = nextVersion;
      correction.status = "Completed";
      correction.editorNotes = editorNotes || "Uploaded version " + nextVersion;
      await correction.save();

      // Update deliverable item inside the Work document to point to the new version
      const deliverable = work.deliverables.find(
        (d) => d.fileId === originalFileId || d.name === correction.fileName
      );

      if (deliverable) {
        deliverable.fileId = uploadRes.id;
        deliverable.name = file.originalname;
        deliverable.version = nextVersion;
        deliverable.status = "APPROVED"; // Reset back to approved until user requests changes again
        deliverable.uploadedAt = new Date();
        await work.save();
      } else {
        // Create new version deliverable if not matched
        work.deliverables.push({
          fileId: uploadRes.id,
          name: file.originalname,
          category: "Edited Photos",
          size: file.size,
          version: nextVersion,
          uploadedBy: "Editor",
          uploadedAt: new Date(),
          status: "APPROVED",
        });
        await work.save();
      }

      // Notify Client User
      await Notification.create({
        recipient: work.client,
        message: `Editor ${req.user.name} uploaded corrected Version ${nextVersion} for '${file.originalname}'.`,
        type: "CORRECTION_COMPLETED",
        link: `/dashboard/gallery`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: "Correction Completed",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Uploaded corrected Version ${nextVersion} for '${file.originalname}'`,
      });
    } else {
      // General status updates (Accepted, In Progress, Rejected)
      correction.status = status;
      if (editorNotes) correction.editorNotes = editorNotes;
      await correction.save();

      // Notify Client
      await Notification.create({
        recipient: work.client,
        message: `Correction status for '${correction.fileName}' updated to '${status}'.`,
        type: "CORRECTION_UPDATED",
        link: `/dashboard/gallery`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: `Correction ${status}`,
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Updated correction status to: ${status}. Notes: ${editorNotes || ""}`,
      });
    }

    return res.status(200).json({ success: true, message: "Correction request updated.", correction });
  } catch (error) {
    console.error("Correction update error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Correction Logs/History (ADMIN/EDITOR/USER)
export const getCorrectionHistory = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) {
      return res.status(400).json({ success: false, message: "File ID is required" });
    }

    const correction = await Correction.findOne({ fileId }).populate("history.updatedBy", "name role");
    return res.status(200).json({ success: true, correction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Approve corrected Image (USER ONLY)
export const approveImage = async (req, res) => {
  try {
    const { workId, fileId, action } = req.body;

    if (!workId || !fileId || !action) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const deliverable = work.deliverables.find((d) => d.fileId === fileId);
    if (!deliverable) {
      return res.status(404).json({ success: false, message: "Deliverable item not found" });
    }

    if (action === "APPROVE") {
      deliverable.status = "APPROVED";
      work.status = "COMPLETED";
      await work.save();

      // If active correction exists, mark status as Completed/Closed
      const correction = await Correction.findOne({ fileId });
      if (correction) {
        correction.status = "Completed";
        await correction.save();
      }

      // Notify Editor
      await Notification.create({
        recipient: work.editor,
        message: `Client approved image '${deliverable.name}' (Version: ${deliverable.version}).`,
        type: "IMAGE_APPROVED",
        link: `/dashboard/posts`,
      });

      // Log History
      await History.create({
        workId: work._id,
        action: "Image Approved",
        performedBy: req.user._id,
        role: req.user.role,
        remarks: `Approved image '${deliverable.name}' (Version: ${deliverable.version})`,
      });

      return res.status(200).json({ success: true, message: "Image approved successfully." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get all corrections (ADMIN/EDITOR/USER view lists)
export const getCorrectionsList = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "USER") {
      const userProjects = await Work.find({ client: req.user._id }).select("_id");
      filter.workId = { $in: userProjects.map((p) => p._id) };
    } else if (req.user.role === "EDITOR") {
      const editorProjects = await Work.find({ editor: req.user._id }).select("_id");
      filter.workId = { $in: editorProjects.map((p) => p._id) };
    }

    const corrections = await Correction.find(filter)
      .populate("workId", "category client editor")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, corrections });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
