import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["ADMIN", "EDITOR"],
    required: true,
  },

  // ==========================
  // Dynamic Permissions
  // ==========================

  permissions: [
    {
      type: String,
    },
  ],

});

const User = mongoose.model("User", userSchema);

export default User;