import nodemailer from "nodemailer";
import Otp from "../model/otpModel.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER|| process.env.EMAIL_USER,
    pass: process.env.GMAIL_PASS|| process.env.EMAIL_PASS,
  },
});

// ==========================
// Generate OTP
// ==========================

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================
// Send OTP
// ==========================

export const sendOTP = async (email) => {
  const otp = generateOTP();

  // Delete old OTPs
  await Otp.deleteMany({ email });

  // Save new OTP
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  // Send Email
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS || process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER|| process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:5px;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
        </div>
      `,
    });
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] OTP for ${email} is: ${otp}`);
    console.log("=========================================");
  }

  return true;
};

// ==========================
// Verify OTP
// ==========================

export const verifyOTP = async (email, otp) => {
  const record = await Otp.findOne({
    email,
    otp,
  });

  if (!record) {
    return false;
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    return false;
  }

  // OTP is valid, delete it after use
  await Otp.deleteOne({ _id: record._id });

  return true;
};