import mongoose from "mongoose";

const deliverableSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true, // Wedding, Pre Wedding, Haldi, RAW Photos, Edited Photos, etc.
    },
    size: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: String,
      enum: ["Admin", "Editor"],
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["NEEDS_CORRECTION", "APPROVED"],
      default: "APPROVED",
    },
    corrections: [
      {
        comment: String,
        requestedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
        newVersionFileId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const workSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "WAITING_FOR_EDITOR",
        "WAITING_FOR_ADMIN_APPROVAL",
        "IN_PROGRESS",
        "NEEDS_CORRECTION",
        "COMPLETED",
      ],
      default: "WAITING_FOR_EDITOR",
    },
    duration: {
      estimated: {
        type: String,
        default: "",
      },
      expectedCompletionDate: {
        type: Date,
        default: null,
      },
      notes: {
        type: String,
        default: "",
      },
    },
    deliverables: [deliverableSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Work", workSchema);
