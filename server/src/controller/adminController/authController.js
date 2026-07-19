import User from "../../model/authModel.js";
import Otp from "../../model/otpModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  sendOTP as sendOTPService,
  verifyOTP,
} from "../../services/otpService.js";

// ==========================
// Nodemailer Transporter Configuration
// ==========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS,
  },
});

// ==========================
// 1. Send OTP
// ==========================
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email required
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailLower = email.toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Check duplicate username if schema contains username
    if (User.schema.path("username")) {
      const username = req.body.username || req.body.name;
      if (username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: "Username is already taken",
          });
        }
      }
    }

    // Call service to send OTP
    await sendOTPService(emailLower);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while sending OTP",
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
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
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

    const emailLower = email.toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Check duplicate username if schema contains username
    if (User.schema.path("username")) {
      const username = req.body.username || name;
      if (username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: "Username is already taken",
          });
        }
      }
    }

    // Check OTP in database first to identify if invalid or expired
    const otpRecord = await Otp.findOne({ email: emailLower });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Expired OTP",
      });
    }

    // Verify OTP using the service (which deletes OTP record and returns validation result)
    const isOtpVerified = await verifyOTP(emailLower, otp);
    if (!isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP verification failed",
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
      name,
      email: emailLower,
      password: hashedPassword,
      role,
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
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration",
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
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
    res.clearCookie("token");
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

    // Send email with credentials details
    const firstName = user.name.trim().split(/\s+/)[0];
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;

    const hasEmailConfig =
      (process.env.GMAIL_USER && process.env.GMAIL_PASS) ||
      (process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (hasEmailConfig) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER || process.env.EMAIL_USER,
        to: user.email,
        subject: "Account Approved",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2e7d32;">Account Approved</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your account has been approved by the administrator.</p>
            <p>You can now log in using the credentials below:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
            </div>
            <p>Please change your password immediately after logging in for security reasons.</p>
            <p>Warm regards,<br/>The Wedding Sedding Team</p>
          </div>
        `,
      });
    } else {
      console.log("=========================================");
      console.log(`[DEV ONLY] Approval email not sent (missing SMTP configs).`);
      console.log(`To: ${user.email}`);
      console.log(`Temp Password: ${tempPassword}`);
      console.log("=========================================");
    }

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