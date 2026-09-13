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

    category: {
      type: String,
      enum: ["home", "stories", "images", "films", "faq"],
      default: "home",
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

heroSectionSchema.index({ category: 1, createdAt: -1 });
heroSectionSchema.index({ createdAt: -1 });

export default mongoose.model(
  "HeroSection",
  heroSectionSchema
);