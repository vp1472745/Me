import HeroSection from "../../model/heroModel.js";
import { uploadPublicAssetToDrive, deletePublicAssetFromDrive } from "../../services/googleDriveService.js";

// Helper Function: Upload binary files to Google Drive
const streamUploadToDrive = async (fileBuffer, mediaType, reqUser) => {
  const result = await uploadPublicAssetToDrive(
    `hero-${Date.now()}.${mediaType === "video" ? "mp4" : "jpg"}`,
    fileBuffer,
    mediaType === "video" ? "video/mp4" : "image/jpeg",
    "Hero Sections",
    reqUser
  );
  return {
    secure_url: result.url,
    public_id: result.id,
  };
};

// ==============================
// CREATE HERO SECTION (Handles Client-Side Cloudinary Uploads)
// ==============================
export const createHeroSection = async (req, res) => {
  try {

    console.log("BODY => ", req.body);

    const {
      mediaUrl,
      mediaType,
      public_id,
    } = req.body || {};

    console.log("mediaUrl => ", mediaUrl);
    console.log("mediaType => ", mediaType);
    console.log("public_id => ", public_id);

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Media URL is required",
      });
    }

    const hero = await HeroSection.create({
      mediaUrl,
      mediaType,
      public_id,
    });

    return res.status(201).json({
      success: true,
      data: hero,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==============================
// GET ALL HERO SECTIONS
// ==============================
export const getAllHeroSections = async (req, res) => {
  try {
    const heroes = await HeroSection.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: heroes.length,
      data: heroes,
    });

  } catch (error) {
    console.error("GET HEROES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET SINGLE HERO SECTION
// ==============================
export const getSingleHeroSection = async (req, res) => {
  try {
    const hero = await HeroSection.findById(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Requested hero canvas mapping not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: hero,
    });

  } catch (error) {
    console.error("GET HERO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE HERO SECTION
// ==============================
export const updateHeroSection = async (req, res) => {
  try {
    const hero = await HeroSection.findById(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero media target record not found.",
      });
    }

    let mediaUrl = hero.mediaUrl;
    let public_id = hero.public_id;
    const mediaType = req.body.mediaType || hero.mediaType;

    // If a brand new file is dispatched during the update transaction sequence
    if (req.file) {
      // 1. Purge old asset tracker reference securely
      if (hero.public_id) {
        try {
          await deletePublicAssetFromDrive(hero.public_id, req.user);
        } catch (cloudErr) {
          console.warn("⚠️ Non-blocking warning: Failed to purge old asset from Drive:", cloudErr.message);
        }
      }

      // 2. Upload substitute payload directly to Google Drive
      const freshCloudAsset = await streamUploadToDrive(req.file.buffer, mediaType, req.user);
      mediaUrl = freshCloudAsset.secure_url;
      public_id = freshCloudAsset.public_id;
    }


    hero.mediaUrl = mediaUrl;
    hero.mediaType = mediaType;
    hero.public_id = public_id;

    await hero.save();

    return res.status(200).json({
      success: true,
      message: "Hero media tracking schema refreshed successfully.",
      data: hero,
    });

  } catch (error) {
    console.error("UPDATE HERO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE HERO SECTION (With Cloud Safeguards)
// ==============================
export const deleteHeroSection = async (req, res) => {
  try {
    const hero = await HeroSection.findById(req.params.id);

    if (!hero) {
      return res.status(404).json({
        success: false,
        message: "Hero target matrix mapping does not exist.",
      });
    }

    // Attempt cloud asset erasure wrapped inside try-catch block to prevent server drop
    if (hero.public_id) {
      try {
        await deletePublicAssetFromDrive(hero.public_id, req.user);
      } catch (cloudErr) {
        console.error("🚨 Google Drive asset destruction failed:", cloudErr.message);
        // We continue execution so the database record can still be purged locally if needed
      }
    }


    await hero.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Hero media record permanently erased from system matrices.",
    });

  } catch (error) {
    console.error("DELETE HERO ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};