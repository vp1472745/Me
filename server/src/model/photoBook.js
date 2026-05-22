import mongoose from "mongoose";

const weddingStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    coverImage: {
      type: String,
      required: true,
    },

    galleryImages: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const WeddingStoryModel = mongoose.model(
  "WeddingStory",
  weddingStorySchema
);

export default WeddingStoryModel;