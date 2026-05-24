import Video
  from "../model/filmsModel.js";


// ==============================
// CREATE VIDEO
// ==============================

export const createVideo =
  async (req, res) => {

    try {

      // ==============================
      // FORM DATA
      // ==============================

      const title =
        req.body.title || "";

      const category =
        req.body.category || "";

      const youtubeUrl =
        req.body.youtubeUrl || "";

      // ==============================
      // CLOUDINARY VIDEO
      // ==============================

      const uploadedVideo =
        req.file?.path || "";

      const publicId =
        req.file?.filename || "";

      // ==============================
      // THUMBNAIL
      // ==============================

      const thumbnail =
        publicId

          ? `https://res.cloudinary.com/dzopb3luc/video/upload/so_1/${publicId}.jpg`

          : "";




      // ==============================
      // CREATE
      // ==============================

      const video =
        await Video.create({

          title,

          category,

          youtubeUrl,

          videoUrl:
            uploadedVideo,

          thumbnail,

          public_id:
            publicId,
        });

      return res.status(201).json({

        success: true,

        message:
          "Video Created Successfully",

        video,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  };


// ==============================
// GET ALL VIDEOS
// ==============================

export const getAllVideos =
  async (req, res) => {

    try {

      const videos =
        await Video.find().sort({

          createdAt: -1,
        });

      return res.status(200).json({

        success: true,

        videos,
      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  };


// ==============================
// UPDATE VIDEO
// ==============================

export const updateVideo =
  async (req, res) => {

    try {

      const video =
        await Video.findById(
          req.params.id,
        );

      if (!video) {

        return res.status(404).json({

          success: false,

          message:
            "Video Not Found",
        });
      }

      video.youtubeUrl =
        req.body.youtubeUrl ||
        video.youtubeUrl;

      await video.save();

      return res.status(200).json({

        success: true,

        message:
          "YouTube URL Updated",

        video,
      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  };


// ==============================
// DELETE VIDEO
// ==============================

export const deleteVideo =
  async (req, res) => {

    try {

      const video =
        await Video.findByIdAndDelete(
          req.params.id,
        );

      if (!video) {

        return res.status(404).json({

          success: false,

          message:
            "Video Not Found",
        });
      }

      return res.status(200).json({

        success: true,

        message:
          "Video Deleted Successfully",
      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  };