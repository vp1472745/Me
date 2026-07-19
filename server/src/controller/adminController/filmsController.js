import Video from "../../model/filmsModel.js";
import cloudinary from "../../config/cloudinary.js";

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
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: videos.length,
      videos,
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
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      video,
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
// DELETE VIDEO (No Cloudinary cleanup needed)
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

    // Remove any Cloudinary asset if it exists (optional)
    if (video.public_id) {
      try {
        await cloudinary.uploader.destroy(video.public_id, {
          resource_type: "video",
        });
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup skipped:", cloudErr.message);
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