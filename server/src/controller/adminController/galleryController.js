import Work from "../../model/workModel.js";
import User from "../../model/authModel.js";
import History from "../../model/historyModel.js";
import TempFile from "../../model/tempFileModel.js";
import { tempMemoryCache } from "../../utils/memoryCache.js";
import { getAccessToken, getFileStream } from "../../services/googleDriveService.js";

// 1. Get Gallery deliverables
export const getGallery = async (req, res) => {
  try {
    const { workId } = req.query;
    const filter = {};

    if (workId) {
      filter._id = workId;
    } else {
      if (req.user.role === "USER") {
        filter.client = req.user._id;
      } else if (req.user.role === "EDITOR") {
        filter.editor = req.user._id;
      }
    }

    const projects = await Work.find(filter)
      .populate("client", "name email")
      .populate("editor", "name email");

    // Gather all deliverables from matched projects
    let deliverables = [];
    projects.forEach((proj) => {
      proj.deliverables.forEach((item) => {
        deliverables.push({
          projectId: proj._id,
          projectCategory: proj.category,
          clientName: proj.client?.name || "Client",
          editorName: proj.editor?.name || "Editor",
          ...item.toObject(),
        });
      });
    });

    return res.status(200).json({ success: true, deliverables });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Download / Proxy file from Google Drive
export const downloadFile = async (req, res) => {
  try {
    let { fileId, workId } = req.query;

    if (!fileId || !workId) {
      return res.status(400).json({ success: false, message: "File ID and Work ID are required" });
    }

    // Serve local file from RAM cache if it's not yet synced
    if (fileId.startsWith("local-")) {
      if (tempMemoryCache.has(fileId)) {
        const cached = tempMemoryCache.get(fileId);
        res.setHeader("Content-Disposition", `attachment; filename="${fileId}"`);
        res.setHeader("Content-Type", cached.mimeType || "application/octet-stream");
        return res.send(cached.buffer);
      }

      // If missing from RAM cache, check if it has been synced to Google Drive
      const syncedFile = await TempFile.findOne({ localId: fileId });
      if (syncedFile && syncedFile.status === "COMPLETED" && syncedFile.driveId) {
        fileId = syncedFile.driveId; // Switch to the Google Drive ID
      } else {
        return res.status(404).json({ success: false, message: "File is still uploading or has failed." });
      }
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    const clientUser = await User.findById(work.client);
    if (!clientUser || !clientUser.googleDrive?.connected) {
      return res.status(400).json({ success: false, message: "Client's Google Drive is disconnected" });
    }

    // Refresh client's Google token
    const accessToken = await getAccessToken(clientUser);

    // Get stream from Google Drive
    const driveRes = await getFileStream(accessToken, fileId);

    // Set headers
    const contentDisposition = driveRes.headers["content-disposition"] || `attachment; filename="${fileId}"`;
    const contentType = driveRes.headers["content-type"] || "application/octet-stream";

    res.setHeader("Content-Disposition", contentDisposition);
    res.setHeader("Content-Type", contentType);

    // Pipe stream response
    driveRes.data.pipe(res);

    // Log History (Don't block response)
    History.create({
      workId: work._id,
      action: "Downloaded",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Downloaded file ID ${fileId} via Google Drive Proxy`,
    }).catch(console.error);
  } catch (error) {
    console.error("Proxy download error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

// 3. Toggle Favorite Status
export const toggleFavorite = async (req, res) => {
  try {
    const { workId, fileId } = req.body;

    if (!workId || !fileId) {
      return res.status(400).json({ success: false, message: "Work ID and File ID are required" });
    }

    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const deliverable = work.deliverables.find((d) => d.fileId === fileId);
    if (!deliverable) {
      return res.status(404).json({ success: false, message: "Deliverable item not found" });
    }

    // Toggle favorite state
    deliverable.favorite = !deliverable.favorite;
    await work.save();

    return res.status(200).json({
      success: true,
      message: `Favorite status updated to ${deliverable.favorite}`,
      deliverable,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
