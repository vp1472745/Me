import mongoose from "mongoose";

const heroSectionSchema = new mongoose.Schema(
  {
    mediaUrl: {
      type: String,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    public_id: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

heroSectionSchema.index({ createdAt: -1 });

export default mongoose.model(
  "HeroSection",
  heroSectionSchema
);