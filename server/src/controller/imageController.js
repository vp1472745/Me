// ======================================================
// FILE: controller/galleryController.js
// ======================================================
import Gallery from "../model/imageModel.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to safely extract public_id from a Cloudinary secure asset URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  
  // Removes version tags (e.g., v1738291/) and strips the format extension (.png, .jpg)
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
};

// ==============================
// CREATE GALLERY (IMAGES ONLY)
// ==============================
export const createGallery = async (req, res) => {
  try {
    const { images } = req.body; // Frontend se aayi hui URLs ki array

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "No assets provided" });
    }

    const gallery = await Gallery.create({
      title: "Media Collection",
      images, // Cloudinary URLs
    });

    return res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==============================
// GET ALL GALLERIES
// ==============================
export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: galleries,
    });
  } catch (error) {
    console.error("Internal core fetching matrix tracking exception:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==============================
// GET SINGLE GALLERY
// ==============================
export const getSingleGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error("Individual entity lookup operation fail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==============================
// DELETE GALLERY (WITH CLOUDINARY MULTI-ASSET CLEANUP)
// ==============================
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery Not Found",
      });
    }

    // 🔥 Storage Optimization: Array mapping iteration to extract public_ids and clear Cloudinary space
    if (gallery.images && gallery.images.length > 0) {
      const deletePromises = gallery.images.map((imageUrl) => {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          // Explicit resource_type mapping for clean batch removal processing
          return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
        return Promise.resolve(); // Fallback for invalid URLs
      });

      // Execute all cleanup promises in parallel for rapid server execution
      await Promise.all(deletePromises);
    }

    // Document target wiped out from Mongo tracking stack
    await Gallery.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Gallery and all linked images purged from cloud storage successfully.",
    });
  } catch (error) {
    console.error("Purging operations execution exception context:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};