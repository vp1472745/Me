import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../model/authModel.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    seedData();
  });

const seedData = async () => {
  try {
    // Delete Old Users
    await User.deleteMany();

    // Hash Password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create Users with APPROVED status so they can login immediately
    await User.create([
      {
        name: "admin",
        email: "vineetpancheshwar1611@gmail.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "APPROVED",
        permissions: [
          "view_dashboard",
          "manage_users",
          "manage_roles",
          "manage_stories",
          "manage_hero",
          "manage_gallery",
          "manage_films",
          "manage_prewedding",
          "view_analytics",
          "delete_content",
        ],
      },
      {
        name: "editor",
        email: "editor@example.com",
        password: hashedPassword,
        role: "EDITOR",
        status: "APPROVED",
        permissions: [
          "view_dashboard",
          "manage_stories",
          "manage_gallery",
          "manage_films",
          "manage_prewedding",
          "view_analytics",
        ],
      },
    ]);
    console.log("Seed Inserted");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};