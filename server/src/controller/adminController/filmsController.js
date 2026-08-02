import Video from "../../model/filmsModel.js";
import { deletePublicAssetFromDrive } from "../../services/googleDriveService.js";
import { getCleanMediaUrl } from "../../utils/cleanUrl.js";

// ==============================
// CREATE VIDEO (YouTube URL only)
// ==============================
export const createVideo = async (req, res) => {
  try {
    const { title, category, youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    const video = await Video.create({
      title: title || "",
      category: category || "",
      youtubeUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Video Added Successfully",
      video,
    });
  } catch (error) {
    console.error("CREATE VIDEO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET ALL VIDEOS
// ==============================
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).lean();

    const cleaned = videos.map((v) => ({
      ...v,
      videoUrl: getCleanMediaUrl(v.videoUrl),
      thumbnail: getCleanMediaUrl(v.thumbnail),
    }));

    return res.status(200).json({
      success: true,
      count: cleaned.length,
      videos: cleaned,
    });
  } catch (error) {
    console.error("GET VIDEOS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET SINGLE VIDEO
// ==============================
export const getSingleVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).lean();
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video Not Found",
      });
    }

    const cleaned = {
      ...video,
      videoUrl: getCleanMediaUrl(video.videoUrl),
      thumbnail: getCleanMediaUrl(video.thumbnail),
    };

    return res.status(200).json({
      success: true,
      video: cleaned,
    });
  } catch (error) {
    console.error("GET VIDEO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE VIDEO
// ==============================
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video Not Found",
      });
    }

    video.title = req.body.title || video.title;
    video.category = req.body.category || video.category;
    video.youtubeUrl = req.body.youtubeUrl || video.youtubeUrl;

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Video Updated Successfully",
      video,
    });
  } catch (error) {
    console.error("UPDATE VIDEO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE VIDEO (No Google Drive cleanup needed)
// ==============================
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video Not Found",
      });
    }

    // Remove any Google Drive asset if it exists (optional)
    if (video.public_id) {
      try {
        await deletePublicAssetFromDrive(video.public_id, req.user);
      } catch (cloudErr) {
        console.warn("Google Drive cleanup skipped:", cloudErr.message);
      }
    }


    await video.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Video Deleted Successfully",
    });
  } catch (error) {
    console.error("DELETE VIDEO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};