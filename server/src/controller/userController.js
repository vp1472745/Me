import User from "../model/authModel.js";
import History from "../model/historyModel.js";
import bcrypt from "bcryptjs";
import { verifyOTP } from "../services/otpService.js";
import {
  sendCredentialsEmail,
  sendApprovalEmail,
} from "../services/emailService.js";

// ==========================================
// 1. Create Admin (ADMIN ONLY)
// ==========================================
export const createAdmin = async (req, res) => {
  try {
    const { name, email, otp, permissions } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Verify OTP if provided
    if (otp) {
      const isOtpVerified = await verifyOTP(emailLower, otp);
      if (!isOtpVerified) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please verify email and try again.",
        });
      }
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const defaultAdminPermissions = [
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
    ];

    const newUser = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED",
      permissions: permissions && permissions.length > 0 ? permissions : defaultAdminPermissions,
      createdBy: req.user._id,
      googleDrive: {
        connected: false,
      },
    });

    // History log
    await History.create({
      action: "Admin Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created Admin account for ${name} (${emailLower})`,
    });

    // Send credentials email with The Wedding Sedding branding
    sendCredentialsEmail(newUser, tempPassword).catch((e) =>
      console.error("[EMAIL ERROR]", e.message)
    );

    return res.status(201).json({
      success: true,
      message: `Admin account for ${name} created successfully! Credentials sent to email.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. Create Editor (ADMIN ONLY)
// ==========================================
export const createEditor = async (req, res) => {
  try {
    const { name, email, otp, permissions } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Verify OTP if provided
    if (otp) {
      const isOtpVerified = await verifyOTP(emailLower, otp);
      if (!isOtpVerified) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please verify email and try again.",
        });
      }
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const defaultEditorPermissions = [
      "view_dashboard",
      "manage_stories",
      "manage_gallery",
      "manage_films",
      "manage_prewedding",
      "view_analytics",
    ];

    const newUser = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: "EDITOR",
      status: "APPROVED",
      createdBy: req.user._id,
      permissions: permissions && permissions.length > 0 ? permissions : defaultEditorPermissions,
      googleDrive: {
        connected: false,
      },
    });

    // History log
    await History.create({
      action: "Editor Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created Editor account for ${name} (${emailLower})`,
    });

    // Send credentials email with The Wedding Sedding branding
    sendCredentialsEmail(newUser, tempPassword).catch((e) =>
      console.error("[EMAIL ERROR]", e.message)
    );

    return res.status(201).json({
      success: true,
      message: `Editor account for ${name} created successfully! Credentials sent to email.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. Create User (ADMIN & EDITOR)
// ==========================================
export const createUser = async (req, res) => {
  try {
    const { name, email, otp, permissions } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Verify OTP if provided
    if (otp) {
      const isOtpVerified = await verifyOTP(emailLower, otp);
      if (!isOtpVerified) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please verify email and try again.",
        });
      }
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: "USER",
      status: "APPROVED",
      createdBy: req.user._id,
      permissions: permissions && permissions.length > 0 ? permissions : ["view_dashboard"],
      googleDrive: {
        connected: false,
      },
    });

    // History log
    await History.create({
      action: "User Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created User account for ${name} (${emailLower})`,
    });

    // Send credentials email with The Wedding Sedding branding
    sendCredentialsEmail(newUser, tempPassword).catch((e) =>
      console.error("[EMAIL ERROR]", e.message)
    );

    return res.status(201).json({
      success: true,
      message: `User account for ${name} created successfully! Credentials sent to email.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. Get All Directory Users
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. Get Pending Users (ADMIN ONLY)
// ==========================================
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "PENDING" }).select("-password");
    return res.status(200).json({ success: true, pendingUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. Approve User (ADMIN ONLY)
// ==========================================
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = "APPROVED";
    await user.save();

    // Log History
    await History.create({
      action: "Approved",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Approved user registration for ${user.name} (${user.email})`,
    });

    // Send Credentials with The Wedding Sedding branding
    const firstName = user.name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;

    sendApprovalEmail(user, tempPassword).catch((e) =>
      console.error("[EMAIL ERROR]", e.message)
    );

    return res.status(200).json({
      success: true,
      message: "User approved successfully and approval email sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. Reject User (ADMIN ONLY)
// ==========================================
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = "REJECTED";
    await user.save();

    // Log History
    await History.create({
      action: "Rejected",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Rejected user registration for ${user.name} (${user.email})`,
    });

    return res.status(200).json({
      success: true,
      message: "User registration rejected successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

