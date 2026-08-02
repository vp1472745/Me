import Story from "../../model/storyModel.js";
import { deletePublicAssetFromDrive } from "../../services/googleDriveService.js";
import { getCleanMediaUrl } from "../../utils/cleanUrl.js";

/**
 * Helper function to extract public_id safely from Google Drive secure URL strings
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  if (url.includes("/uploads/")) {
    return "local-" + url.split("/uploads/").pop();
  }
  if (url.includes("drive.google.com") || url.includes("id=")) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("id");
    } catch (e) {
      const match = url.match(/[?&]id=([^&]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
};

// ==========================
// CREATE STORY
// ==========================
export const createStory = async (req, res) => {
  try {
    // Extracted directly from incoming JSON payload string body
    const { 
      title, 
      couple, 
      location, 
      date, 
      description,
      coverImage,
      audio,
      galleryImages,
      galleryVideos 
    } = req.body;

    const story = await Story.create({
      title,
      couple,
      location,
      date,
      description,
      coverImage,             // Read straight from JSON string URL
      audio,                  // Read straight from JSON string URL
      galleryImages: galleryImages || [],
      galleryVideos: galleryVideos || [],
    });

    return res.status(201).json({
      success: true,
      message: "Story Created Successfully",
      story,
    });
  } catch (error) {
    console.error("Error inside createStory transaction:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET ALL STORIES
// ==========================
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).lean();

    const cleaned = stories.map((story) => ({
      ...story,
      coverImage: getCleanMediaUrl(story.coverImage),
      audio: getCleanMediaUrl(story.audio),
      galleryImages: story.galleryImages ? story.galleryImages.map((img) => getCleanMediaUrl(img)) : [],
      galleryVideos: story.galleryVideos ? story.galleryVideos.map((vid) => getCleanMediaUrl(vid)) : [],
    }));

    return res.status(200).json({
      success: true,
      stories: cleaned,
    });
  } catch (error) {
    console.error("Error fetching all stories:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE STORY
// ==========================
export const getSingleStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story Not Found",
      });
    }

    const cleaned = {
      ...story,
      coverImage: getCleanMediaUrl(story.coverImage),
      audio: getCleanMediaUrl(story.audio),
      galleryImages: story.galleryImages ? story.galleryImages.map((img) => getCleanMediaUrl(img)) : [],
      galleryVideos: story.galleryVideos ? story.galleryVideos.map((vid) => getCleanMediaUrl(vid)) : [],
    };

    return res.status(200).json({
      success: true,
      story: cleaned,
    });
  } catch (error) {
    console.error("Individual story lookup failure:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE STORY
// ==========================
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      couple, 
      location, 
      date, 
      description, 
      coverImage, 
      audio, 
      galleryImages, 
      galleryVideos 
    } = req.body;

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story Not Found",
      });
    }

    const cleanupPromises = [];

    // Google Drive purge if cover image string link changed
    if (coverImage && coverImage !== story.coverImage && story.coverImage) {
      const oldCoverId = getPublicIdFromUrl(story.coverImage);
      if (oldCoverId) {
        cleanupPromises.push(
          deletePublicAssetFromDrive(oldCoverId, req.user)
        );
      }
    }

    // Google Drive purge if audio string link changed
    if (audio && audio !== story.audio && story.audio) {
      const oldAudioId = getPublicIdFromUrl(story.audio);
      if (oldAudioId) {
        cleanupPromises.push(
          deletePublicAssetFromDrive(oldAudioId, req.user)
        );
      }
    }


    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
    }

    const updatedStory = await Story.findByIdAndUpdate(
      id,
      {
        title: title || story.title,
        couple: couple || story.couple,
        location: location || story.location,
        date: date || story.date,
        description: description || story.description,
        coverImage: coverImage || story.coverImage,
        audio: audio !== undefined ? audio : story.audio,
        galleryImages: galleryImages || story.galleryImages,
        galleryVideos: galleryVideos || story.galleryVideos,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Story Updated Successfully",
      story: updatedStory,
    });
  } catch (error) {
    console.error("Error during story update:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// DELETE STORY
// ==========================
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story Not Found",
      });
    }

    const cleanupPromises = [];

    if (story.coverImage) {
      const coverId = getPublicIdFromUrl(story.coverImage);
      if (coverId) {
        cleanupPromises.push(
          deletePublicAssetFromDrive(coverId, req.user)
        );
      }
    }

    if (story.audio) {
      const audioId = getPublicIdFromUrl(story.audio);
      if (audioId) {
        cleanupPromises.push(
          deletePublicAssetFromDrive(audioId, req.user)
        );
      }
    }

    if (story.galleryImages && story.galleryImages.length > 0) {
      story.galleryImages.forEach((imgUrl) => {
        const imgId = getPublicIdFromUrl(imgUrl);
        if (imgId) {
          cleanupPromises.push(
            deletePublicAssetFromDrive(imgId, req.user)
          );
        }
      });
    }

    if (story.galleryVideos && story.galleryVideos.length > 0) {
      story.galleryVideos.forEach((vidUrl) => {
        const vidId = getPublicIdFromUrl(vidUrl);
        if (vidId) {
          cleanupPromises.push(
            deletePublicAssetFromDrive(vidId, req.user)
          );
        }
      });
    }


    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
    }

    await Story.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Story and all associated cloud assets deleted successfully.",
    });
  } catch (error) {
    console.error("Purging storage stream execution block exception:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};