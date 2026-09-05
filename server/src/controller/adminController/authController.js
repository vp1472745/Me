import User from "../../model/authModel.js";
import Otp from "../../model/otpModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendOTP as sendOTPService,
  verifyOTP,
} from "../../services/otpService.js";
import { sendApprovalEmail, sendTestDiagnosticEmail } from "../../services/emailService.js";


// ==========================
// 1. Send OTP
// ==========================
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email required
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please log in.",
      });
    }

    // Call service to send OTP
    await sendOTPService(emailLower);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email address",
    });
  } catch (error) {
    console.error("[SEND OTP ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred while sending OTP",
      error: error.message,
    });
  }
};

// ==========================
// 2. Register
// ==========================
export const register = async (req, res) => {
  try {
    const { name, email, role, otp } = req.body;

    // Validation checks for required registration fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const emailLower = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Check duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please log in.",
      });
    }

    // Check OTP in database first to identify if invalid or expired
    const otpRecord = await Otp.findOne({ email: emailLower });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please enter the correct code.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Expired OTP. Please request a new code.",
      });
    }

    // Verify OTP using the service (which deletes OTP record and returns validation result)
    const isOtpVerified = await verifyOTP(emailLower, cleanOtp);
    if (!isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP verification failed. Please try again.",
      });
    }

    // Password should NOT come from frontend. Generate dynamically: FirstName + "@123"
    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const generatedPassword = `${formattedFirstName}@123`;

    // Hash generated password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user with status = "PENDING" and googleDrive.connected = false
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: role || "USER",
      status: "PENDING",
      googleDrive: {
        connected: false,
      },
    });

    // Return safe user information (never return password)
    return res.status(201).json({
      success: true,
      message: "Registration successful. Your account is pending admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
        googleDrive: {
          connected: user.googleDrive.connected,
        },
      },
    });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred during registration",
      error: error.message,
    });
  }
};

// ==========================
// 3. Login
// ==========================
export const login = async (req, res) => {
  try {
    const { email, name, username, password } = req.body;
    const identifier = email || name || username;

    // Validation
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Email or Username is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const identifierLower = identifier.toLowerCase();

    // Check user exists (supports email, name, or username matching)
    const user = await User.findOne({
      $or: [
        { email: identifierLower },
        { name: identifier },
      ],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check status before login
    if (user.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval.",
      });
    }

    // Check password correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Set HTTP Only Cookie
    const origin = req.get("origin") || "";
    const isProduction = process.env.NODE_ENV === "production" || (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1"));

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success response with token and safe user details (no password or refreshToken)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        googleDrive: {
          connected: user.googleDrive.connected,
          googleEmail: user.googleDrive.googleEmail,
          accessToken: user.googleDrive.accessToken,
          rootFolderId: user.googleDrive.rootFolderId,
          connectedAt: user.googleDrive.connectedAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login",
      error: error.message,
    });
  }
};

// ==========================
// 4. Logout
// ==========================
export const logout = async (req, res) => {
  try {
    const origin = req.get("origin") || "";
    const isProduction = process.env.NODE_ENV === "production" || (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1"));

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during logout",
      error: error.message,
    });
  }
};

// ==========================
// 5. Admin: Get All Users
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching users",
      error: error.message,
    });
  }
};

// ==========================
// 6. Admin: Get All Editors
// ==========================
export const getAllEditors = async (req, res) => {
  try {
    const editors = await User.find({ role: "EDITOR" }).select("-password");

    return res.status(200).json({
      success: true,
      editors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching editors",
      error: error.message,
    });
  }
};

// ==========================
// 7. Admin: Get Pending Users
// ==========================
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "PENDING" }).select("-password");

    return res.status(200).json({
      success: true,
      pendingUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching pending users",
      error: error.message,
    });
  }
};

// ==========================
// 8. Admin: Approve User
// ==========================
export const approveUser = async (req, res) => {
  try {
    const userId = req.body.userId || req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "APPROVED";
    await user.save();

    // Send email with credentials details using The Wedding Sedding branding
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
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while approving the user",
      error: error.message,
    });
  }
};

// ==========================
// 9. Admin: Reject User
// ==========================
export const rejectUser = async (req, res) => {
  try {
    const userId = req.body.userId || req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = "REJECTED";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User rejected successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while rejecting the user",
      error: error.message,
    });
  }
};

// ==========================
// 10. Test Email Diagnostic (For Deployment Health Check)
// ==========================
export const testEmailController = async (req, res) => {
  try {
    const targetEmail = req.query.email || req.query.to || req.body?.email;
    const result = await sendTestDiagnosticEmail(targetEmail);
    return res.status(200).json({
      success: true,
      message: `Diagnostic email dispatched successfully in ${result.durationMs}ms to ${result.email}`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to deliver test email",
      error: error.message,
    });
  }
};