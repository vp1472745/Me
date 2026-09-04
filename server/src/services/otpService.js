import Otp from "../model/otpModel.js";
import { sendOtpEmail } from "./emailService.js";

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
  const emailLower = email.toLowerCase().trim();
  const otp = generateOTP();

  // Delete old OTPs for this email
  await Otp.deleteMany({ email: emailLower });

  // Save new OTP with 5 minute expiration
  await Otp.create({
    email: emailLower,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  // Send branded OTP email
  await sendOtpEmail(emailLower, otp);

  return true;
};

// ==========================
// Verify OTP
// ==========================
export const verifyOTP = async (email, otp) => {
  const emailLower = email.toLowerCase().trim();
  const trimmedOtp = otp?.toString().trim();

  const record = await Otp.findOne({
    email: emailLower,
    otp: trimmedOtp,
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