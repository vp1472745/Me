import mongoose from "mongoose";

const tempFileSchema = new mongoose.Schema(
  {
    localId: { type: String, required: true, unique: true },
    driveId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TempFile", tempFileSchema);
