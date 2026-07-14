import User from "../model/authModel.js";
import History from "../model/historyModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS,
  },
});

// Helper: send password email
const sendCredentialsEmail = async (user, tempPassword) => {
  const hasEmailConfig =
    (process.env.GMAIL_USER && process.env.GMAIL_PASS) ||
    (process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (hasEmailConfig) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Account Credentials - Photo Studio Portal",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #5a7863;">Welcome to Photo Studio!</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your account has been created by the administrator. You can now login to your dashboard using the following credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0;">
            <p style="margin: 5px 0;"><strong>Role:</strong> ${user.role}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
          </div>
          <p>Please change your password after logging in for security.</p>
          <p>Warm regards,<br/>The Photo Studio Team</p>
        </div>
      `,
    });
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] Credentials email to: ${user.email}`);
    console.log(`Password: ${tempPassword}`);
    console.log("=========================================");
  }
};

// 1. Create Admin (ADMIN ONLY)
export const createAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED", // Admin created admins are approved
      createdBy: req.user._id,
    });

    // History log
    await History.create({
      action: "Admin Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created Admin account for ${name} (${emailLower})`,
    });

    await sendCredentialsEmail(newUser, tempPassword);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully and credentials sent.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Editor (ADMIN ONLY)
export const createEditor = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "EDITOR",
      status: "APPROVED",
      createdBy: req.user._id,
      permissions: ["overview", "posts", "settings"], // default editor permissions
    });

    // History log
    await History.create({
      action: "Editor Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created Editor account for ${name} (${emailLower})`,
    });

    await sendCredentialsEmail(newUser, tempPassword);

    return res.status(201).json({
      success: true,
      message: "Editor created successfully and credentials sent.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create User (ADMIN & EDITOR)
export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const emailLower = email.toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const firstName = name.trim().split(/\s+/)[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "USER",
      status: "APPROVED", // Dashboard created users are approved immediately
      createdBy: req.user._id,
      permissions: ["view_dashboard"],
    });

    // History log
    await History.create({
      action: "User Created",
      performedBy: req.user._id,
      role: req.user.role,
      remarks: `Created User account for ${name} (${emailLower})`,
    });

    await sendCredentialsEmail(newUser, tempPassword);

    return res.status(201).json({
      success: true,
      message: "User created successfully and credentials sent.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Users (Admins, Editors, approved/rejected Clients)
export const getAllUsers = async (req, res) => {
  try {
    // If request contains query params, filter accordingly, otherwise return all
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Pending Users (ADMIN ONLY)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "PENDING" }).select("-password");
    return res.status(200).json({ success: true, pendingUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Approve User (ADMIN ONLY)
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

    // Send Credentials
    const firstName = user.name.trim().split(/\s+/)[0];
    const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const tempPassword = `${formattedFirstName}@123`;
    await sendCredentialsEmail(user, tempPassword);

    return res.status(200).json({ success: true, message: "User approved successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Reject User (ADMIN ONLY)
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

    return res.status(200).json({ success: true, message: "User rejected successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
