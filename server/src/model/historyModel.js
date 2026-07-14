import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Work",
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("History", historySchema);
