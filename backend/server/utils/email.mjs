import nodemailer from "nodemailer";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}
console.log("EMAIL:", process.env.SMTP_FROM_EMAIL);
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET?.substring(0, 8)
);
console.log(
  "REFRESH_TOKEN:",
  process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 10)
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  family: 4,
  auth: {
    type: "OAuth2",
    user: required("SMTP_FROM_EMAIL"),
    clientId: required("GOOGLE_CLIENT_ID"),
    clientSecret: required("GOOGLE_CLIENT_SECRET"),
    refreshToken: required("GOOGLE_REFRESH_TOKEN"),
  },
});

transporter.on("token", (token) => {
  console.log("✅ New Gmail access token generated");
  console.log("Expires:", new Date(token.expires));
});

export async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: `"Sentinel Edge AI" <${required("SMTP_FROM_EMAIL")}>`,
    to: email,
    subject: "Sentinel Edge AI - Email Verification OTP",
    text: `Hello,

Your verification code is:

${otp}

This OTP expires in 5 minutes.

If you did not request this email, please ignore it.`,
  });

  console.log("✅ OTP email sent to", email);
}

export async function sendAlertEmail(alert, recipientEmail) {
  await transporter.sendMail({
    from: `"Sentinel Edge AI" <${required("SMTP_FROM_EMAIL")}>`,
    to: recipientEmail,
    subject: alert?.subject || "Sentinel Edge AI Security Alert",
    text:
      alert?.body ??
      `Title: ${alert?.title ?? "N/A"}

Severity: ${alert?.severity ?? "N/A"}

Location: ${alert?.location ?? "N/A"}

Time: ${alert?.timestamp ?? "N/A"}`,
  });

  console.log("✅ Alert email sent");
}