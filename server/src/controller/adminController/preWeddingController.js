// ======================================================
// FILE: controller/preWeddingController.js
// ======================================================
import WeddingStoryModel from "../../model/preWedding.js";
import cloudinary from "../../config/cloudinary.js";

// Helper function to extract public_id safely from Cloudinary secure asset URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  
  // Removes version strings (e.g., v1628392/) and strips extensions (.jpg, .webp)
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
};

/* =========================
   CREATE STORY
========================= */
export const createPreWeddingStory = async (req, res) => {
  try {
    const { title, description, coverImage, galleryImages } = req.body;

    if (!title || !coverImage) {
      return res.status(400).json({ success: false, message: "Title and cover image are required." });
    }

    // Generate unique slug (same logic)
    const baseSlug = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    let slug = baseSlug;
    let suffix = 1;
    while (await WeddingStoryModel.exists({ slug })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const story = await WeddingStoryModel.create({
      title,
      slug,
      description,
      coverImage,
      galleryImages,
    });

    return res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL STORIES
========================= */
export const getAllPreWeddingStories = async (req, res) => {
  try {
    const stories = await WeddingStoryModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Error fetching all pre-wedding items:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   GET SINGLE STORY
========================= */
export const getSinglePreWeddingStory = async (req, res) => {
  try {
    const story = await WeddingStoryModel.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error("Individual entity lookup error context:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   DELETE STORY (WITH HYBRID CLOUD FLUSHING)
========================= */
export const deletePreWeddingStory = async (req, res) => {
  try {
    const story = await WeddingStoryModel.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const cleanupPromises = [];

    // 1. Push single cover image reference into queue
    if (story.coverImage) {
      const coverPublicId = getPublicIdFromUrl(story.coverImage);
      if (coverPublicId) {
        cleanupPromises.push(
          cloudinary.uploader.destroy(coverPublicId, { resource_type: "image" })
        );
      }
    }

    // 2. Loop and push multiple gallery image elements into queue
    if (story.galleryImages && story.galleryImages.length > 0) {
      story.galleryImages.forEach((imageUrl) => {
        const galleryPublicId = getPublicIdFromUrl(imageUrl);
        if (galleryPublicId) {
          cleanupPromises.push(
            cloudinary.uploader.destroy(galleryPublicId, { resource_type: "image" })
          );
        }
      });
    }

    // Fire all Cloudinary storage deletions concurrently
    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
    }

    // Finally, delete the MongoDB document maps
    await WeddingStoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Story and all linked cloud binary assets deleted successfully.",
    });
  } catch (error) {
    console.error("Error executing database/cloud asset purge sequence:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};