import "dotenv/config";
import dns from "node:dns";
import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// =================================================================
// 0. Force IPv4 First (Eliminates cloud IPv6 connection timeouts)
// =================================================================
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // Ignore on environments where dns.setDefaultResultOrder is not available
}

// =================================================================
// Helper: Get Cleaned Credentials & SMTP Configuration
// =================================================================
const getSmtpConfig = () => {
  const user = (
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    ""
  ).trim();

  // Strip all spaces from app passwords (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const rawPass = (
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.SMTP_PASS ||
    ""
  ).trim();
  const pass = rawPass.replace(/\s+/g, "");

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  const isGmail = host.includes("gmail.com") || user.endsWith("@gmail.com");

  return { user, pass, host, port, secure, isGmail, hasCreds: Boolean(user && pass) };
};

export const getFromSender = () => {
  const { user } = getSmtpConfig();
  const fallback = user || "noreply@theweddingsedding.com";
  return `"The Wedding Sedding" <${fallback}>`;
};

// =================================================================
// High-Speed Cloud-Resilient Transporters
// 1. Primary: Port 465 Direct SSL / Gmail Service (Instant TLS, No STARTTLS Drops)
// 2. Fallback: Port 587 (STARTTLS with TLSv1.2)
// Note: pool: false prevents cloud containers from hanging on dead sockets
// =================================================================
const createPrimaryTransporter = () => {
  const { user, pass, host, port, secure, isGmail } = getSmtpConfig();

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
};

const createFallbackTransporter = () => {
  const { user, pass, host } = getSmtpConfig();

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

let primaryTransporter = null;
let fallbackTransporter = null;

const getPrimaryTransporter = () => {
  if (!primaryTransporter) {
    primaryTransporter = createPrimaryTransporter();
  }
  return primaryTransporter;
};

const getFallbackTransporter = () => {
  if (!fallbackTransporter) {
    fallbackTransporter = createFallbackTransporter();
  }
  return fallbackTransporter;
};

// =================================================================
// Verification Helper: Run at startup to log SMTP / HTTPS Email Health
// =================================================================
export const verifyEmailTransporter = async () => {
  const { user, hasCreds } = getSmtpConfig();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();

  if (resendApiKey) {
    console.log("✅ [EMAIL SYSTEM] Resend HTTPS API configured (Bypasses Render cloud SMTP port blocks).");
    return true;
  }

  if (brevoApiKey) {
    console.log("✅ [EMAIL SYSTEM] Brevo HTTPS API configured (Bypasses Render cloud SMTP port blocks).");
    return true;
  }

  if (!hasCreds) {
    console.warn("⚠️ [EMAIL SYSTEM] Missing EMAIL_USER/EMAIL_PASS (or RESEND_API_KEY/BREVO_API_KEY). Real email dispatch is disabled.");
    return false;
  }

  try {
    const transporter = getPrimaryTransporter();
    await transporter.verify();
    console.log(`✅ [EMAIL SYSTEM] High-speed SMTP connected successfully (User: ${user})`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [EMAIL SYSTEM] Primary SMTP verification failed (${err.message}). Trying fallback port 587...`);
    try {
      const fallback = getFallbackTransporter();
      await fallback.verify();
      console.log(`✅ [EMAIL SYSTEM] Fallback SMTP connection verified successfully.`);
      return true;
    } catch (fallbackErr) {
      console.warn(`⚠️ [EMAIL SYSTEM] SMTP ports (465 & 587) are unreachable (${fallbackErr.message}).`);
      console.warn(`💡 Tip for Render Free Tier: Render blocks outbound SMTP ports 25, 465, 587. Use RESEND_API_KEY or BREVO_API_KEY for free instant HTTPS delivery.`);
      return false;
    }
  }
};

// =================================================================
// Resilient Dispatch Helper (HTTPS Resend / Brevo API -> Nodemailer SMTP)
// =================================================================
const dispatchMail = async (mailOptions) => {
  const { user, hasCreds } = getSmtpConfig();
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();

  // 1. PROVIDER 1: RESEND HTTPS API (Port 443 - 100% Render Free Tier Compatible)
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM?.trim() || "The Wedding Sedding <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [mailOptions.to],
          subject: mailOptions.subject,
          html: mailOptions.html,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.id) {
        console.log(`✅ [EMAIL SUCCESS - RESEND HTTPS] Delivered to ${mailOptions.to} (ID: ${resData.id})`);
        return { success: true, messageId: resData.id, provider: "resend_https" };
      }
      console.warn("⚠️ [EMAIL WARNING] Resend HTTPS dispatch failed:", resData);
    } catch (resendError) {
      console.warn("⚠️ [EMAIL WARNING] Resend HTTPS error:", resendError.message);
    }
  }

  // 2. PROVIDER 2: BREVO (SENDINBLUE) HTTPS API (Port 443 - 100% Render Free Tier Compatible)
  if (brevoApiKey) {
    try {
      const senderEmail = (process.env.BREVO_SENDER_EMAIL || user || "voteease1611@gmail.com").trim();
      const senderName = process.env.BREVO_SENDER_NAME || "The Wedding Sedding";

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: mailOptions.to }],
          subject: mailOptions.subject,
          htmlContent: mailOptions.html,
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.messageId || resData.id)) {
        const id = resData.messageId || resData.id;
        console.log(`✅ [EMAIL SUCCESS - BREVO HTTPS] Delivered to ${mailOptions.to} (ID: ${id})`);
        return { success: true, messageId: id, provider: "brevo_https" };
      }
      console.warn("⚠️ [EMAIL WARNING] Brevo HTTPS dispatch failed:", resData);
    } catch (brevoError) {
      console.warn("⚠️ [EMAIL WARNING] Brevo HTTPS error:", brevoError.message);
    }
  }

  // 3. PROVIDER 3: NODEMAILER SMTP (Localhost / Paid VPS / Non-blocked clouds)
  if (!hasCreds) {
    if (isProduction) {
      throw new Error(
        "Render Free Tier blocks SMTP ports 25/465/587. Please add RESEND_API_KEY (from resend.com) or BREVO_API_KEY (from brevo.com) in your Render Environment settings for HTTPS delivery."
      );
    }

    console.log("=================================================");
    console.log(`[DEV MODE - NO SMTP CREDENTIALS] Email to: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log("=================================================");
    return { success: true, mode: "dev_log" };
  }

  // Ensure high-priority headers for instant inbox delivery
  const enhancedOptions = {
    ...mailOptions,
    from: mailOptions.from || getFromSender(),
    priority: "high",
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "high",
      ...(mailOptions.headers || {}),
    },
  };

  try {
    const transporter = getPrimaryTransporter();
    const info = await transporter.sendMail(enhancedOptions);
    console.log(`✅ [EMAIL SUCCESS - SMTP 465] Delivered to ${mailOptions.to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, port: "primary_465" };
  } catch (primaryError) {
    console.warn(`⚠️ [EMAIL WARNING] Primary SMTP send failed (${primaryError.message}). Attempting fallback transporter (Port 587)...`);
    try {
      const fallback = getFallbackTransporter();
      const fallbackInfo = await fallback.sendMail(enhancedOptions);
      console.log(`✅ [EMAIL SUCCESS - SMTP 587] Delivered to ${mailOptions.to} (ID: ${fallbackInfo.messageId})`);
      return { success: true, messageId: fallbackInfo.messageId, port: "fallback_587" };
    } catch (fallbackError) {
      console.error(`❌ [EMAIL ERROR] Both primary and fallback SMTP failed:`, fallbackError.message);
      if (fallbackError.message.includes("timeout") || fallbackError.message.includes("ETIMEDOUT")) {
        throw new Error(
          "Render Free Tier blocks SMTP ports 25, 465 & 587 (Connection timeout). Please add RESEND_API_KEY (free at resend.com) in Render Environment tab to enable instant HTTPS port 443 email delivery."
        );
      }
      throw new Error(`Failed to deliver OTP email: ${fallbackError.message || primaryError.message}`);
    }
  }
};

// =================================================================
// Reusable Modern Luxury Studio Email Wrapper (Lightweight & Responsive)
// =================================================================
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2d3748;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f3;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1b3323 0%, #2e4f3e 50%, #1b3323 100%);
      padding: 30px 24px;
      text-align: center;
      color: #ffffff;
    }
    .brand-badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #c9a96e;
      background: rgba(201, 169, 110, 0.15);
      padding: 5px 14px;
      border-radius: 50px;
      margin-bottom: 10px;
      font-weight: 600;
      border: 1px solid rgba(201, 169, 110, 0.3);
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #cbd5e1;
      margin-top: 5px;
      font-weight: 300;
    }
    .content-body {
      padding: 30px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.65;
      color: #4a5568;
      margin-bottom: 16px;
    }
    .card-box {
      background-color: #f8faf9;
      border: 1px solid #e2ece5;
      border-radius: 12px;
      padding: 18px;
      margin: 20px 0;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #2e4f3e;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
    }
    .otp-box {
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      display: inline-block;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1b3323;
      background: #eef5f0;
      padding: 14px 28px;
      border-radius: 12px;
      border: 2px dashed #5a7863;
      font-family: 'Courier New', Courier, monospace;
    }
    .security-notice {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
      margin: 18px 0;
    }
    .btn-container {
      text-align: center;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background: #2e4f3e;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(46, 79, 62, 0.2);
    }
    .detail-value-highlight {
      color: #2e4f3e;
      background: #eaf2ec;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer-brand {
      font-weight: 700;
      color: #2e4f3e;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <div class="brand-badge">📸 Photography & Cinema Studio</div>
        <h1 class="brand-title">The Wedding Sedding</h1>
        <div class="brand-subtitle">Capturing Timeless Stories • Studio Portal</div>
      </div>

      <!-- BODY -->
      <div class="content-body">
        ${content}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-brand">The Wedding Sedding Photo Studio</div>
        <p style="margin: 3px 0;">Premium Wedding Photography • Pre-Wedding Films • Custom Photo Books</p>
        <p style="margin: 6px 0 0 0; color: #94a3b8;">© ${new Date().getFullYear()} The Wedding Sedding. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// =================================================================
// 1. Send OTP Email (High Speed)
// =================================================================
export const sendOtpEmail = async (email, otp) => {
  const cleanEmail = email.toLowerCase().trim();
  const content = `
    <div class="greeting">Email Verification Code</div>
    <p class="paragraph">
      Thank you for connecting with <strong>The Wedding Sedding</strong> photo & cinematic studio.
    </p>
    <p class="paragraph">
      Please use the 6-digit verification code below to verify your email address:
    </p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="font-size: 12px; color: #718096; margin-top: 8px;">
        ⏱️ This verification code is valid for <strong>5 minutes</strong>.
      </p>
    </div>
    <div class="security-notice">
      <strong>Security Notice:</strong> Never share this OTP code with anyone. Our studio team will never ask for your verification code.
    </div>
    <p class="paragraph" style="margin-top: 20px; margin-bottom: 0;">
      Warm regards,<br />
      <strong>The Wedding Sedding Studio Team</strong>
    </p>
  `;

  try {
    await dispatchMail({
      to: cleanEmail,
      subject: `Verification Code: ${otp} - The Wedding Sedding`,
      html: getEmailWrapper({
        title: "Verify Your Email - The Wedding Sedding",
        content,
      }),
    });

    console.log(`[EMAIL] OTP verification email dispatched to ${cleanEmail}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send OTP email:", error.message);
    console.log(`[DEV FALLBACK] OTP for ${cleanEmail} is: ${otp}`);
    throw new Error(`Failed to deliver OTP email: ${error.message}`);
  }
};

// =================================================================
// 2. Send Welcome & Credentials Email
// =================================================================
export const sendCredentialsEmail = async (user, tempPassword) => {
  const cleanEmail = user.email.toLowerCase().trim();
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

  const content = `
    <div class="greeting">Welcome, ${user.name}!</div>
    <p class="paragraph">
      Your official account has been created for <strong>The Wedding Sedding</strong> studio workspace portal.
    </p>
    <p class="paragraph">
      You can now sign in using your official credentials below to access client galleries, albums, and assignments:
    </p>

    <!-- CREDENTIALS CARD -->
    <div class="card-box">
      <div class="card-title">🔐 Your Studio Account Credentials</div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #718096; font-size: 13px;">Assigned Role</td>
          <td style="padding: 8px 0; text-align: right; color: #2e4f3e; font-size: 13px; font-weight: 700;">${roleLabel}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #718096; font-size: 13px;">User ID / Email</td>
          <td style="padding: 8px 0; text-align: right; color: #1a202c; font-size: 13px; font-weight: 600;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-size: 13px;">Temporary Password</td>
          <td style="padding: 8px 0; text-align: right;">
            <span class="detail-value-highlight">${tempPassword}</span>
          </td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${loginUrl}" class="btn" target="_blank">Access Studio Portal &rarr;</a>
    </div>

    <div class="security-notice">
      <strong>Tip:</strong> Please sign in and update your password under your profile settings.
    </div>

    <p class="paragraph" style="margin-top: 20px; margin-bottom: 0;">
      Warm regards,<br />
      <strong>The Wedding Sedding Photo Studio Team</strong>
    </p>
  `;

  try {
    await dispatchMail({
      to: cleanEmail,
      subject: `Welcome to The Wedding Sedding - Your Studio Account Credentials`,
      html: getEmailWrapper({
        title: "Account Provisioned - The Wedding Sedding",
        content,
      }),
    });
    console.log(`[EMAIL] Credentials email successfully sent to ${cleanEmail}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send credentials email:", error.message);
    console.log(`[DEV FALLBACK] Credentials for ${cleanEmail}: Password = ${tempPassword}`);
    return false;
  }
};

// =================================================================
// 3. Send Account Approved Email
// =================================================================
export const sendApprovalEmail = async (user, tempPassword) => {
  const cleanEmail = user.email.toLowerCase().trim();
  const clientUrl = config.CLIENT_URL || "http://localhost:5173";
  const loginUrl =
    user.role === "ADMIN"
      ? `${clientUrl}/adminlogin`
      : `${clientUrl}/login`;

  const content = `
    <div class="greeting">Good News, ${user.name}!</div>
    <p class="paragraph">
      Your account registration request for <strong>The Wedding Sedding</strong> studio portal has been <strong>approved</strong> by the administrator.
    </p>
    <p class="paragraph">
      You can now log in to view photo books, pre-wedding films, high-resolution galleries, and assignments:
    </p>

    <!-- CREDENTIALS CARD -->
    <div class="card-box">
      <div class="card-title">🔐 Your Verified Login Details</div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #718096; font-size: 13px;">User ID / Email</td>
          <td style="padding: 8px 0; text-align: right; color: #1a202c; font-size: 13px; font-weight: 600;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #718096; font-size: 13px;">Temporary Password</td>
          <td style="padding: 8px 0; text-align: right;">
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

    <p class="paragraph" style="margin-top: 20px; margin-bottom: 0;">
      Warm regards,<br />
      <strong>The Wedding Sedding Photo Studio Team</strong>
    </p>
  `;

  try {
    await dispatchMail({
      to: cleanEmail,
      subject: `Account Approved! - The Wedding Sedding Photo Studio`,
      html: getEmailWrapper({
        title: "Account Approved - The Wedding Sedding",
        content,
      }),
    });
    console.log(`[EMAIL] Approval email sent to ${cleanEmail}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send approval email:", error.message);
    console.log(`[DEV FALLBACK] Approved ${cleanEmail} with Password: ${tempPassword}`);
    return false;
  }
};

// =================================================================
// 4. Send Google Drive Connection Email
// =================================================================
export const sendDriveConnectEmail = async (user, authUrl) => {
  const cleanEmail = user.email.toLowerCase().trim();
  const content = `
    <div class="greeting">Hello, ${user.name}!</div>
    <p class="paragraph">
      To enable automated syncing of your high-resolution wedding photos, teaser reels, and albums directly to your Google Drive, please connect your account:
    </p>

    <div class="btn-container">
      <a href="${authUrl}" class="btn" target="_blank">Connect Google Drive &rarr;</a>
    </div>

    <div class="security-notice">
      <strong>Safe & Secure:</strong> This connection uses Google's official OAuth authorization to safely store deliverables in your designated studio folder.
    </div>

    <p class="paragraph" style="margin-top: 20px; margin-bottom: 0;">
      Warm regards,<br />
      <strong>The Wedding Sedding Photo Studio Team</strong>
    </p>
  `;

  try {
    await dispatchMail({
      to: cleanEmail,
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
};

// =================================================================
// 5. Diagnostic Test Email Dispatch
// =================================================================
export const sendTestDiagnosticEmail = async (targetEmail) => {
  const cleanEmail = (targetEmail || getSmtpConfig().user).toLowerCase().trim();
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const start = Date.now();
  await sendOtpEmail(cleanEmail, testOtp);
  const duration = Date.now() - start;

  return {
    success: true,
    email: cleanEmail,
    testOtp,
    durationMs: duration,
    smtpConfig: {
      host: getSmtpConfig().host,
      port: getSmtpConfig().port,
      user: getSmtpConfig().user,
    },
  };
};
