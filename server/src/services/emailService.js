import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// ==========================================
// Nodemailer Transporter Configuration
// ==========================================
const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const FROM_SENDER = `"The Wedding Sedding" <${process.env.EMAIL_USER || process.env.GMAIL_USER || "noreply@theweddingsedding.com"}>`;

// ==========================================
// Reusable Modern Luxury Studio Email Wrapper
// ==========================================
const getEmailWrapper = ({ title, subtitle, content }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f3;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2d3748;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f3;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1b3323 0%, #2e4f3e 50%, #1b3323 100%);
      padding: 35px 30px;
      text-align: center;
      color: #ffffff;
      position: relative;
    }
    .brand-badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #c9a96e;
      background: rgba(201, 169, 110, 0.15);
      padding: 6px 16px;
      border-radius: 50px;
      margin-bottom: 12px;
      font-weight: 600;
      border: 1px solid rgba(201, 169, 110, 0.3);
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 6px;
      font-weight: 300;
      letter-spacing: 0.5px;
    }
    .content-body {
      padding: 35px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 15px;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.7;
      color: #4a5568;
      margin-bottom: 20px;
    }
    .card-box {
      background-color: #f8faf9;
      border: 1px solid #e2ece5;
      border-radius: 14px;
      padding: 22px;
      margin: 25px 0;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #2e4f3e;
      margin-top: 0;
      margin-bottom: 15px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #718096;
      font-weight: 500;
    }
    .detail-value {
      color: #1a202c;
      font-weight: 600;
      font-family: inherit;
    }
    .detail-value-highlight {
      color: #2e4f3e;
      background: #eaf2ec;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 20px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2e4f3e 0%, #3f6853 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(46, 79, 62, 0.25);
    }
    .otp-code {
      display: inline-block;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #2e4f3e;
      background: #eaf2ec;
      padding: 16px 32px;
      border-radius: 12px;
      border: 2px dashed #9bc4ab;
      margin: 15px 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .security-notice {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px 30px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-brand {
      font-weight: 700;
      color: #2e4f3e;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <div class="brand-badge">📸 Photo & Cinema Studio</div>
        <h1 class="brand-title">The Wedding Sedding</h1>
        <div class="brand-subtitle">Capturing Timeless Stories • Premium Wedding Photography Shop</div>
      </div>

      <!-- BODY -->
      <div class="content-body">
        ${content}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-brand">The Wedding Sedding Photo Studio</div>
        <p style="margin: 4px 0;">Premium Wedding Photography • Pre-Wedding Shoots • Cinematic Films • Custom Photo Books</p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;">© ${new Date().getFullYear()} The Wedding Sedding. All rights reserved. This is an automated system email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// =================================================================
// 1. Send OTP Email
// =================================================================
export const sendOtpEmail = async (email, otp) => {
  const hasCreds =
    (process.env.EMAIL_USER && process.env.EMAIL_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_PASS);

  if (hasCreds) {
    try {
      const transporter = createTransporter();
      const content = `
        <div class="greeting">Email Verification Code</div>
        <p class="paragraph">
          Thank you for connecting with <strong>The Wedding Sedding</strong>, your premier photography & cinematic studio shop.
        </p>
        <p class="paragraph">
          Please use the verification code below to verify your email address and complete your account registration:
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <div class="otp-code">${otp}</div>
          <p style="font-size: 13px; color: #718096; margin-top: 8px;">
            ⏱️ This verification code is valid for <strong>5 minutes</strong>.
          </p>
        </div>
        <div class="security-notice">
          <strong>Security Tip:</strong> Never share this code with anyone. The Wedding Sedding team will never ask for your verification code.
        </div>
        <p class="paragraph" style="margin-top: 25px; margin-bottom: 0;">
          Warm regards,<br />
          <strong>The Wedding Sedding Studio Team</strong>
        </p>
      `;

      await transporter.sendMail({
        from: FROM_SENDER,
        to: email,
        subject: `Verification Code: ${otp} - The Wedding Sedding Photo Studio`,
        html: getEmailWrapper({
          title: "Verify Your Email - The Wedding Sedding",
          content,
        }),
      });

      console.log(`[EMAIL] OTP verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send OTP email:", error.message);
      console.log(`[DEV FALLBACK] OTP for ${email} is: ${otp}`);
      return false;
    }
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] OTP for ${email} is: ${otp}`);
    console.log("=========================================");
    return true;
  }
};

// =================================================================
// 2. Send Welcome & Credentials Email (User ID + Password + Portal)
// =================================================================
export const sendCredentialsEmail = async (user, tempPassword) => {
  const hasCreds =
    (process.env.EMAIL_USER && process.env.EMAIL_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_PASS);

  const clientUrl = config.CLIENT_URL || "http://localhost:5173";
  const loginUrl =
    user.role === "ADMIN"
      ? `${clientUrl}/adminlogin`
      : `${clientUrl}/login`;

  const roleLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : user.role === "EDITOR"
      ? "Studio Editor"
      : "Client User";

  if (hasCreds) {
    try {
      const transporter = createTransporter();
      const content = `
        <div class="greeting">Welcome, ${user.name}!</div>
        <p class="paragraph">
          Your account has been successfully created and configured for <strong>The Wedding Sedding</strong> photo studio workspace portal.
        </p>
        <p class="paragraph">
          You can now sign in using your official credentials below to access your assignments, client galleries, albums, and deliverables:
        </p>

        <!-- CREDENTIALS CARD -->
        <div class="card-box">
          <div class="card-title">🔐 Your Studio Account Credentials</div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 9px 0; color: #718096; font-size: 13px; font-weight: 500;">Assigned Role</td>
              <td style="padding: 9px 0; text-align: right; color: #2e4f3e; font-size: 13px; font-weight: 700;">${roleLabel}</td>
            </tr>
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 9px 0; color: #718096; font-size: 13px; font-weight: 500;">User ID / Email</td>
              <td style="padding: 9px 0; text-align: right; color: #1a202c; font-size: 13px; font-weight: 600;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 9px 0; color: #718096; font-size: 13px; font-weight: 500;">Temporary Password</td>
              <td style="padding: 9px 0; text-align: right;">
                <span class="detail-value-highlight">${tempPassword}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="btn-container">
          <a href="${loginUrl}" class="btn" target="_blank">Access Studio Portal &rarr;</a>
        </div>

        <div class="security-notice">
          <strong>Security Notice:</strong> Please sign in and update your password under your profile settings for privacy and safety.
        </div>

        <p class="paragraph" style="margin-top: 25px; margin-bottom: 0;">
          Need assistance? Feel free to contact our studio manager.<br />
          Warm regards,<br />
          <strong>The Wedding Sedding Photo Studio Team</strong>
        </p>
      `;

      await transporter.sendMail({
        from: FROM_SENDER,
        to: user.email,
        subject: `Welcome to The Wedding Sedding - Your Studio Account Credentials`,
        html: getEmailWrapper({
          title: "Account Provisioned - The Wedding Sedding",
          content,
        }),
      });

      console.log(`[EMAIL] Credentials email successfully sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send credentials email:", error.message);
      console.log(`[DEV FALLBACK] Credentials for ${user.email}: Password = ${tempPassword}`);
      return false;
    }
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] Credentials email for ${user.email}`);
    console.log(`User ID: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password: ${tempPassword}`);
    console.log(`Login URL: ${loginUrl}`);
    console.log("=========================================");
    return true;
  }
};

// =================================================================
// 3. Send Account Approved Email
// =================================================================
export const sendApprovalEmail = async (user, tempPassword) => {
  const hasCreds =
    (process.env.EMAIL_USER && process.env.EMAIL_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_PASS);

  const clientUrl = config.CLIENT_URL || "http://localhost:5173";
  const loginUrl =
    user.role === "ADMIN"
      ? `${clientUrl}/adminlogin`
      : `${clientUrl}/login`;

  if (hasCreds) {
    try {
      const transporter = createTransporter();
      const content = `
        <div class="greeting">Good News, ${user.name}!</div>
        <p class="paragraph">
          Your account registration request for <strong>The Wedding Sedding</strong> photo studio portal has been <strong>approved</strong> by the administrator.
        </p>
        <p class="paragraph">
          You can now log in to your account and explore your photo books, pre-wedding films, high-resolution galleries, and project assignments:
        </p>

        <!-- CREDENTIALS CARD -->
        <div class="card-box">
          <div class="card-title">🔐 Your Verified Login Details</div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 9px 0; color: #718096; font-size: 13px; font-weight: 500;">User ID / Email</td>
              <td style="padding: 9px 0; text-align: right; color: #1a202c; font-size: 13px; font-weight: 600;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 9px 0; color: #718096; font-size: 13px; font-weight: 500;">Temporary Password</td>
              <td style="padding: 9px 0; text-align: right;">
                <span class="detail-value-highlight">${tempPassword}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="btn-container">
          <a href="${loginUrl}" class="btn" target="_blank">Sign In Now &rarr;</a>
        </div>

        <div class="security-notice">
          <strong>Tip:</strong> For your security, we recommend changing your password once logged in.
        </div>

        <p class="paragraph" style="margin-top: 25px; margin-bottom: 0;">
          Warm regards,<br />
          <strong>The Wedding Sedding Photo Studio Team</strong>
        </p>
      `;

      await transporter.sendMail({
        from: FROM_SENDER,
        to: user.email,
        subject: `Account Approved! - The Wedding Sedding Photo Studio`,
        html: getEmailWrapper({
          title: "Account Approved - The Wedding Sedding",
          content,
        }),
      });

      console.log(`[EMAIL] Approval email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send approval email:", error.message);
      console.log(`[DEV FALLBACK] Approved ${user.email} with Password: ${tempPassword}`);
      return false;
    }
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] Approved ${user.email} with Password: ${tempPassword}`);
    console.log("=========================================");
    return true;
  }
};

// =================================================================
// 4. Send Google Drive Connection Email
// =================================================================
export const sendDriveConnectEmail = async (user, authUrl) => {
  const hasCreds =
    (process.env.EMAIL_USER && process.env.EMAIL_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_PASS);

  if (hasCreds) {
    try {
      const transporter = createTransporter();
      const content = `
        <div class="greeting">Hello, ${user.name}!</div>
        <p class="paragraph">
          To enable automated syncing of your high-resolution wedding photos, teaser reels, and albums directly to your personal Google Drive, please connect your account:
        </p>

        <div class="btn-container">
          <a href="${authUrl}" class="btn" target="_blank">Connect Google Drive &rarr;</a>
        </div>

        <div class="security-notice">
          <strong>Safe & Secure:</strong> This connection uses Google's official OAuth authorization to safely store deliverables in your designated studio folder.
        </div>

        <p class="paragraph" style="margin-top: 25px; margin-bottom: 0;">
          Warm regards,<br />
          <strong>The Wedding Sedding Photo Studio Team</strong>
        </p>
      `;

      await transporter.sendMail({
        from: FROM_SENDER,
        to: user.email,
        subject: `Connect Google Drive - The Wedding Sedding Photo Studio`,
        html: getEmailWrapper({
          title: "Connect Google Drive - The Wedding Sedding",
          content,
        }),
      });

      return true;
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send drive connect email:", error.message);
      return false;
    }
  } else {
    console.log("=========================================");
    console.log(`[DEV ONLY] Drive connect email for ${user.email}. AuthUrl: ${authUrl}`);
    console.log("=========================================");
    return true;
  }
};
