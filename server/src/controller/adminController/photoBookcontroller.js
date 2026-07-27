// ======================================================
// FILE: controller/weddingStoryController.js
// ======================================================
import WeddingStoryModel from "../../model/photoBook.js";
import { deletePublicAssetFromDrive } from "../../services/googleDriveService.js";

// Helper function to extract public_id safely from Cloudinary URL strings
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
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  
  // Strip out versioning prefix strings and trailing image file extensions
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
};

/* =========================
   CREATE STORY (Updated for Frontend Direct URLs)
========================= */
export const createWeddingStory = async (req, res) => {
  try {
    // FIX: Ab coverImage aur galleryImages direct req.body ke andar milenge as strings
    const { title, description, coverImage, galleryImages } = req.body;

    /* STRICT ROUTE VALIDATION */
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: "Cover image required",
      });
    }

    /* DYNAMIC SLUG GENERATION GENERATOR */
    const baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""); // Strips special characters safely

    let slug = baseSlug;
    let suffix = 1;

    while (await WeddingStoryModel.exists({ slug })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    /* MONGO RECORD ENTRY EXECUTION */
    const story = await WeddingStoryModel.create({
      title,
      slug,
      description,
      coverImage, // Direct URL string saved
      galleryImages: galleryImages || [], // Array of URL strings saved
    });

    return res.status(201).json({
      success: true,
      message: "Wedding story created successfully",
      data: story,
    });
  } catch (error) {
    console.error("Wedding story creation transaction block exception:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A wedding story with this title already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL STORIES
========================= */
export const getAllWeddingStories = async (req, res) => {
  try {
    const stories = await WeddingStoryModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Core global fetching error on story structures:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   GET SINGLE STORY
========================= */
export const getSingleWeddingStory = async (req, res) => {
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
    console.error("Individual entity lookup failure:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   DELETE STORY (WITH FULL CLOUD CLEANUP)
========================= */
export const deleteWeddingStory = async (req, res) => {
  try {
    const story = await WeddingStoryModel.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const cleanupPromises = [];

    // 1. Queue Singular Cover Image Storage Cleanup
    if (story.coverImage) {
      const coverPublicId = getPublicIdFromUrl(story.coverImage);
      if (coverPublicId) {
        cleanupPromises.push(
          deletePublicAssetFromDrive(coverPublicId, req.user)
        );
      }
    }

    // 2. Queue Dynamic Multiple Gallery Images Array Cleanup
    if (story.galleryImages && story.galleryImages.length > 0) {
      story.galleryImages.forEach((imageUrl) => {
        const galleryPublicId = getPublicIdFromUrl(imageUrl);
        if (galleryPublicId) {
          cleanupPromises.push(
            deletePublicAssetFromDrive(galleryPublicId, req.user)
          );
        }
      });
    }


    // Concurrent async cleanup process execution sequence
    if (cleanupPromises.length > 0) {
      await Promise.all(cleanupPromises);
    }

    // Clear document from database collection
    await WeddingStoryModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Story and all associated cloud image binaries successfully deleted.",
    });
  } catch (error) {
    console.error("Purging storage operation fail context:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};