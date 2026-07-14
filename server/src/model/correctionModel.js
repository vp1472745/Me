import mongoose from "mongoose";

const correctionHistorySchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    userComment: {
      type: String,
      default: "",
    },
    editorNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const correctionSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Work",
      required: true,
    },
    fileId: {
      type: String,
      required: true, // Google Drive File ID of the image being corrected
    },
    fileName: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    userComment: {
      type: String,
      required: true,
    },
    editorNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
    history: [correctionHistorySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Correction", correctionSchema);
