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

    const hashedPassword =
      await bcrypt.hash("123456", 10);

    // Create Users

await User.create([
  {
    name: "admin",
    password: hashedPassword,
    role: "ADMIN",
    permissions: [],
  },

  {
    name: "editor",
    password: hashedPassword,
    role: "EDITOR",
    permissions: [],
  },
]);
    console.log("Seed Inserted");

    process.exit();

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};