import Gallery from "../../model/imageModel.js";
import { deletePublicAssetFromDrive } from "../../services/googleDriveService.js";

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
  const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");
  return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
};

// ==============================
// CREATE GALLERY (JSON payload)
// ==============================
export const createGallery = async (req, res) => {
  try {
    const { images } = req.body; // Array of Cloudinary URLs from frontend

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    const gallery = await Gallery.create({
      title: "Media Collection",
      images,
    });

    return res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    console.error("Gallery creation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ==============================
// GET ALL GALLERIES
// ==============================
export const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==============================
// GET SINGLE GALLERY
// ==============================
export const getSingleGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery Not Found" });
    }
    return res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==============================
// DELETE GALLERY (with Cloudinary cleanup)
// ==============================
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: "Gallery Not Found" });
    }

    if (gallery.images && gallery.images.length > 0) {
      const deletePromises = gallery.images.map((imageUrl) => {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          return deletePublicAssetFromDrive(publicId, req.user);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }


    await Gallery.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Gallery and all linked images purged from cloud storage successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};