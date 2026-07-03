import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
    },

    relation: {
      type: String,
      required: true,
      enum: [
        "Brother",
        "Sister",
        "Father",
        "Mother",
        "Son",
        "Daughter",
        "Husband",
        "Wife",
        "Other",
      ],
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "USER"],
      required: true,
    },

    permissions: [
      {
        type: String,
      },
    ],

    // Family Access Requests
    familyRequests: [familyMemberSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;