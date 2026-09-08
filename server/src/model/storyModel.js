import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    couple: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    audio: {
      type: String,
      default: "",
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    galleryVideos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

storySchema.index({ createdAt: -1 });

const Story = mongoose.model("Story", storySchema);

export default Story;