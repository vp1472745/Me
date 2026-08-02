import mongoose from "mongoose";

const flimSchema =
  new mongoose.Schema(

    {
      title: {
        type: String,
    
      },

      category: {
        type: String,
        default: "Wedding",
      },

      // ==========================
      // SHORT VIDEO URL
      // ==========================

      videoUrl: {
        type: String,
        default: "",
      },

      // ==========================
      // FULL YOUTUBE VIDEO
      // ==========================

      youtubeUrl: {
        type: String,
        default: "",
      },

      // ==========================
      // THUMBNAIL
      // ==========================

      thumbnail: {
        type: String,
        default: "",
      },

      // ==========================
      // GOOGLE DRIVE FILE ID
      // ==========================

      public_id: {
        type: String,
        default: "",
      },
    },

    {
      timestamps: true,
    },
  );

const Video =
  mongoose.model(
    "Film",
    flimSchema,
  );

export default Video;