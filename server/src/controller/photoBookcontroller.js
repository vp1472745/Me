import WeddingStoryModel from "../model/photoBook.js";

/* =========================
   CREATE STORY
========================= */

export const createWeddingStory = async (
  req,
  res
) => {
  try {

    const {
      title,
      description,
    } = req.body;

    /* COVER IMAGE */

    const coverImage =
      req.files?.coverImage?.[0]?.path;

    /* GALLERY IMAGES */

    const galleryImages =
      req.files?.galleryImages?.map(
        (file) => file.path
      ) || [];

    /* VALIDATION */

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

    /* SLUG */

    const baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    let slug = baseSlug;
    let suffix = 1;

    while (
      await WeddingStoryModel.exists({
        slug,
      })
    ) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    /* CREATE */

    const story =
      await WeddingStoryModel.create({
        title,
        slug,
        description,
        coverImage,
        galleryImages,
      });

    return res.status(201).json({
      success: true,
      message:
        "Wedding story created successfully",
      data: story,
    });

  } catch (error) {

    console.log(error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A wedding story with this title already exists",
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

export const getAllWeddingStories =
  async (req, res) => {
    try {

      const stories =
        await WeddingStoryModel.find()
          .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: stories,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

/* =========================
   GET SINGLE STORY
========================= */

export const getSingleWeddingStory =
  async (req, res) => {
    try {

      const story =
        await WeddingStoryModel.findById(
          req.params.id
        );

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

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };

/* =========================
   DELETE STORY
========================= */

export const deleteWeddingStory =
  async (req, res) => {
    try {

      const story =
        await WeddingStoryModel.findByIdAndDelete(
          req.params.id
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message: "Story not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Story deleted successfully",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };