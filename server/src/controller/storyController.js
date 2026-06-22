import Story from "../model/storyModel.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Helper function to extract public_id safely from Cloudinary secure asset URL strings
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  // Strips version prefixes (like v1738219/) and removes the file extension
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
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
    const stories = await Story.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      stories,
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
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      story,
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

    // Cloudinary purge if cover image string link changed
    if (coverImage && coverImage !== story.coverImage && story.coverImage) {
      const oldCoverId = getPublicIdFromUrl(story.coverImage);
      if (oldCoverId) {
        cleanupPromises.push(
          cloudinary.uploader.destroy(oldCoverId, { resource_type: "image" })
        );
      }
    }

    // Cloudinary purge if audio string link changed
    if (audio && audio !== story.audio && story.audio) {
      const oldAudioId = getPublicIdFromUrl(story.audio);
      if (oldAudioId) {
        cleanupPromises.push(
          cloudinary.uploader.destroy(oldAudioId, { resource_type: "video" })
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
          cloudinary.uploader.destroy(coverId, { resource_type: "image" })
        );
      }
    }

    if (story.audio) {
      const audioId = getPublicIdFromUrl(story.audio);
      if (audioId) {
        cleanupPromises.push(
          cloudinary.uploader.destroy(audioId, { resource_type: "video" })
        );
      }
    }

    if (story.galleryImages && story.galleryImages.length > 0) {
      story.galleryImages.forEach((imgUrl) => {
        const imgId = getPublicIdFromUrl(imgUrl);
        if (imgId) {
          cleanupPromises.push(
            cloudinary.uploader.destroy(imgId, { resource_type: "image" })
          );
        }
      });
    }

    if (story.galleryVideos && story.galleryVideos.length > 0) {
      story.galleryVideos.forEach((vidUrl) => {
        const vidId = getPublicIdFromUrl(vidUrl);
        if (vidId) {
          cleanupPromises.push(
            cloudinary.uploader.destroy(vidId, { resource_type: "video" })
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