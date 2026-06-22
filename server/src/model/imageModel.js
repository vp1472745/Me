// ==============================
// models/galleryModel.js
// ==============================

import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
  
    },

    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Gallery =
  mongoose.model(
    "Gallery",
    gallerySchema
  );

export default Gallery;