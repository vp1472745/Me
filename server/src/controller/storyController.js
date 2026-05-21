import Story from "../model/storyModel.js";


// ==========================
// CREATE STORY
// ==========================

export const createStory =
  async (req, res) => {
    try {

      console.log("Request Files:", req.files);
      console.log("Request Body:", req.body);

      const {
        title,
        couple,
        location,
        date,
        description,
      } = req.body;


      // COVER IMAGE

      const coverImage =
        req.files?.coverImage?.[0]
          ?.path || "";


      // AUDIO

      const audio =
        req.files?.audio?.[0]
          ?.path || "";


      // GALLERY IMAGES

      const galleryImages =
        req.files?.galleryImages?.map(
          (file) => file.path
        ) || [];


      // GALLERY VIDEOS

      const galleryVideos =
        req.files?.galleryVideos?.map(
          (file) => file.path
        ) || [];


      const story =
        await Story.create({
          title,
          couple,
          location,
          date,
          description,
          coverImage,
          audio,
          galleryImages,
          galleryVideos,
        });


      res.status(201).json({
        success: true,
        message:
          "Story Created Successfully",
        story,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };


// ==========================
// GET ALL STORIES
// ==========================

export const getAllStories =
  async (req, res) => {
    try {

      const stories =
        await Story.find().sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        stories,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };


// ==========================
// GET SINGLE STORY
// ==========================

export const getSingleStory =
  async (req, res) => {
    try {

      const story =
        await Story.findById(
          req.params.id
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message:
            "Story Not Found",
        });
      }

      res.status(200).json({
        success: true,
        story,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };


// ==========================
// DELETE STORY
// ==========================

export const deleteStory =
  async (req, res) => {
    try {

      const story =
        await Story.findById(
          req.params.id
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message:
            "Story Not Found",
        });
      }

      await Story.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message:
          "Story Deleted Successfully",
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };