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
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "EDITOR", "USER"],
      default: "USER",
    },

    permissions: [
      {
        type: String,
      },
    ],

    // User created by Admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
},

    // ===========================
    // Google Drive Integration
    // ===========================

    googleDrive: {
      connected: {
        type: Boolean,
        default: false,
      },

      googleEmail: {
        type: String,
        default: "",
      },

      accessToken: {
        type: String,
        default: "",
      },

      refreshToken: {
        type: String,
        default: "",
      },

      rootFolderId: {
        type: String,
        default: "",
      },

      connectedAt: {
        type: Date,
        default: null,
      },
    },

    // ===========================
    // Family Access Requests
    // ===========================

    familyRequests: [familyMemberSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);