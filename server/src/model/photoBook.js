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

weddingStorySchema.index({ createdAt: -1 });

const WeddingStoryModel = mongoose.model(
  "WeddingStory",
  weddingStorySchema
);

export default WeddingStoryModel;