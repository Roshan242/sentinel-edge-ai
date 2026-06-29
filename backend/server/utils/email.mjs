import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load env (works when executed from server/ or project root)

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in .env");
  }

  return {
    SMTP_HOST: SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: Number(SMTP_PORT || 465),
    SMTP_SECURE: SMTP_SECURE ? String(SMTP_SECURE).toLowerCase() === "true" : true,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM: SMTP_FROM || SMTP_USER,
  };
}

export async function sendAlertEmail(alert, recipientEmail) {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = getSmtpConfig();

    console.log('[sendAlertEmail] SMTP_HOST:', SMTP_HOST);
    console.log('[sendAlertEmail] SMTP_PORT:', SMTP_PORT);
    console.log('[sendAlertEmail] SMTP_SECURE:', SMTP_SECURE);
    console.log('[sendAlertEmail] SMTP_USER:', SMTP_USER);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // If the caller provided plain test alert fields (title/location/etc), still produce a usable email body.
    const subject = alert?.subject || alert?.title || "Test Alert";
    const body =
      alert?.body ||
      `This is a test alert email\n\nTitle: ${alert?.title || "N/A"}\nSeverity: ${alert?.severity || "N/A"}\nLocation: ${alert?.location || "N/A"}\nTime: ${alert?.timestamp || "N/A"}`;

    console.log('[sendAlertEmail] before sendMail');
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject,
      text: body,
    });
    console.log('[sendAlertEmail] after sendMail messageId:', info?.messageId);

    return { success: true };
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

