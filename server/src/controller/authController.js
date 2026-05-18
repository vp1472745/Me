import User from "../model/authModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================
// Register
// ==========================

export const register = async (req, res) => {
  try {

    const {
      name,
      password,
      role,
    } = req.body;

    // ==========================
    // Check User
    // ==========================

    const existingUser = await User.findOne({
      name,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ==========================
    // Hash Password
    // ==========================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ==========================
    // Create User
    // ==========================

    const user = await User.create({
      name,
      password: hashedPassword,
      role,
    });

    // ==========================
    // Response
    // ==========================

    res.status(201).json({
      success: true,
      message: "Register Successfully",

      user: {
        id: user._id,
        name: user.name,
        role: user.role,
          permissions: user.permissions,

      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Login
// ==========================

export const login = async (req, res) => {

  try {
    // Debug: log incoming request body
    console.log('Login request body:', req.body);
    const { name, password } = req.body;

    // ==========================
    // Find User
    // ==========================

    const user = await User.findOne({
      name,
    });

    if (!user) {
      console.log('User not found for name:', name);
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================
    // Compare Password
    // ==========================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isMatch) {
      console.log('Invalid password for user:', name);
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // ==========================
    // Token
    // ==========================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // ==========================
    // Cookie
    // ==========================

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // ==========================
    // Response
    // ==========================

    res.status(200).json({
      success: true,
      message: "Login Successfully",

      user: {
        id: user._id,
        name: user.name,
        role: user.role,
          permissions: user.permissions,

      },

      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Logout
// ==========================

export const logout = async (req, res) => {
  try {

    // ==========================
    // Clear Cookie
    // ==========================

    res.clearCookie("token");

    // ==========================
    // Response
    // ==========================

    res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};