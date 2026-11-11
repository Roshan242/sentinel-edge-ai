import nodemailer from "nodemailer";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

let transporter;

function getTransporter() {
  if (!transporter) {
    const user = required("SMTP_FROM_EMAIL");
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      auth: {
        type: "OAuth2",
        user,
        clientId: required("GOOGLE_CLIENT_ID"),
        clientSecret: required("GOOGLE_CLIENT_SECRET"),
        refreshToken: required("GOOGLE_REFRESH_TOKEN"),
      },
    });
  }

  return transporter;
}

export async function sendAlertEmail(alert, recipientEmail) {
  const from = required("SMTP_FROM_EMAIL");
  await getTransporter().sendMail({
    from: `"Sentinel Edge AI" <${from}>`,
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
  return { success: true };
}