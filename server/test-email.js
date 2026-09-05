import "dotenv/config";
import dns from "node:dns";
import nodemailer from "nodemailer";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const user = (process.env.EMAIL_USER || process.env.GMAIL_USER || "").trim();
const rawPass = (process.env.EMAIL_PASS || process.env.GMAIL_PASS || "").trim();
const pass = rawPass.replace(/\s+/g, "");

async function test587() {
  console.log("Testing Port 587 with STARTTLS...");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS via STARTTLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false, ciphers: "SSLv3" },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });

  const t0 = Date.now();
  await transporter.verify();
  console.log(`Port 587 verified in ${Date.now() - t0}ms`);

  const tSend = Date.now();
  const info = await transporter.sendMail({
    from: `"The Wedding Sedding" <${user}>`,
    to: user,
    subject: "Fast 587 OTP: 778899",
    text: "OTP is 778899",
    priority: "high",
    headers: { "X-Priority": "1" },
  });
  console.log(`Mail sent in ${Date.now() - tSend}ms! Message ID: ${info.messageId}`);
}

test587().then(() => process.exit(0)).catch((err) => { console.error("Error:", err.message); process.exit(1); });
