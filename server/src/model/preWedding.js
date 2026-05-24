import mongoose from "mongoose";

const preWeddingSchema = new mongoose.Schema(
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

const preWeddingModel = mongoose.model(
  "PreWedding",
  preWeddingSchema
);

export default preWeddingModel;