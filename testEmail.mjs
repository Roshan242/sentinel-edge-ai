import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

async function sendAlertEmail(alert, recipientEmail) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from,
    to: recipientEmail,
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    html: `
      <h2 style="color:red;">🚨 ${alert.title}</h2>
      <p><b>Severity:</b> ${alert.severity}</p>
      <p><b>Location:</b> ${alert.location}</p>
      <p><b>Time:</b> ${alert.timestamp}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    return { success: false, error: err.message };
  }
}

// Run test
(async () => {
  const alert = {
    title: "Unauthorized Access Detected",
    severity: "critical",
    location: "Server Room",
    timestamp: new Date().toISOString(),
  };

  const recipient = "roshanmunda242@gmail.com"; // ← यहाँ अपना email डालो
  const result = await sendAlertEmail(alert, recipient);

  console.log("Result:", result);
})();