import nodemailer from "nodemailer";

const getRequiredEnv = (key) => {
  const v = process.env[key];
  if (!v || typeof v !== "string") throw new Error(`Missing ${key} in environment`);
  return v;
};

let transporterPromise;

export function createTransporter() {
  if (transporterPromise) return transporterPromise;

  const SMTP_HOST = getRequiredEnv("SMTP_HOST");
  const SMTP_PORT_RAW = getRequiredEnv("SMTP_PORT");
  const SMTP_PORT = Number(SMTP_PORT_RAW);
  if (!Number.isFinite(SMTP_PORT)) throw new Error("SMTP_PORT must be a valid number");

  const SMTP_USER = getRequiredEnv("SMTP_USER");
  const SMTP_PASS = getRequiredEnv("SMTP_PASS");

  const SMTP_SECURE_RAW = process.env.SMTP_SECURE;
  const SMTP_SECURE =
    SMTP_SECURE_RAW === undefined
      ? SMTP_PORT === 465
      : String(SMTP_SECURE_RAW).toLowerCase() === "true";

  const SMTP_FROM = getRequiredEnv("SMTP_FROM");

  transporterPromise = (async () => {
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 60000,   // 60 seconds
  socketTimeout: 60000,     // 60 seconds

  from: SMTP_FROM,
});

    try {
  await transporter.verify();
  console.log("✅ SMTP verified");
} catch (err) {
  console.error("❌ SMTP verify failed:", err);
  throw err;
}

return transporter;
  })();

  return transporterPromise;
}

export async function sendOtpEmail(email, otp) {
  if (!email || typeof email !== "string") throw new Error("sendOtpEmail: invalid email");
  if (!otp) throw new Error("sendOtpEmail: otp is required");

  const transporter = await createTransporter();

  const subject = "Sentinel Edge AI - Email Verification OTP";
  const body = `Hello,\n\nYour verification code is:\n\n  ${otp}\n\nThis OTP expires in 5 minutes.\n\nIf you did not request this, please ignore this email.`;

  const from = process.env.SMTP_FROM;

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text: body,
  });
}

export async function sendAlertEmail(alert, recipientEmail) {
  if (!recipientEmail || typeof recipientEmail !== "string") throw new Error("sendAlertEmail: invalid recipientEmail");

  const transporter = await createTransporter();

  const subject = alert?.subject || alert?.title || "Test Alert";
  const body =
    alert?.body ||
    `This is a test alert email\n\nTitle: ${alert?.title || "N/A"}\nSeverity: ${alert?.severity || "N/A"}\nLocation: ${alert?.location || "N/A"}\nTime: ${alert?.timestamp || "N/A"}`;

  const from = process.env.SMTP_FROM;

  await transporter.sendMail({
    from,
    to: recipientEmail,
    subject,
    text: body,
  });
}

