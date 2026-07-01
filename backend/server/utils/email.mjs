import nodemailer from "nodemailer";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeEnvLog(value) {
  // never leak secrets
  if (value === undefined) return undefined;
  const s = String(value);
  if (!s) return s;
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function parseBool(v, defaultValue) {
  if (v === undefined) return defaultValue;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST) {
    throw new Error("Missing SMTP_HOST in environment");
  }

  const portNum = Number(SMTP_PORT);
  if (!Number.isFinite(portNum)) {
    throw new Error("Missing or invalid SMTP_PORT in environment");
  }

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("Missing SMTP_USER or SMTP_PASS in environment");
  }

  // If not explicitly provided, infer from port.
  const secure =
    SMTP_SECURE !== undefined
      ? parseBool(SMTP_SECURE, portNum === 465)
      : portNum === 465;

  return {
    SMTP_HOST,
    SMTP_PORT: portNum,
    SMTP_SECURE: secure,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM: SMTP_FROM || SMTP_USER,
  };
}


async function dnsResolve(host) {
  try {
    const dns = await import("node:dns");
    const res = await dns.promises.lookup(host);
    return res;
  } catch (e) {
    return { error: e?.message || String(e) };
  }
}

function isTransientNetworkError(err) {
  const msg = String(err?.message || "");
  const code = String(err?.code || "");
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EHOSTUNREACH" ||
    msg.includes("timed out") ||
    msg.includes("ENETUNREACH")
  );
}

function buildEmailContent(alert) {
  const subject = alert?.subject || alert?.title || "Test Alert";
  const body =
    alert?.body ||
    `This is a test alert email\n\nTitle: ${alert?.title || "N/A"}\nSeverity: ${alert?.severity || "N/A"}\nLocation: ${alert?.location || "N/A"}\nTime: ${alert?.timestamp || "N/A"}`;

  return { subject, body };
}


async function sendViaSmtp(alert, recipientEmail) {
  const {

    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = getSmtpConfig();

  console.log("[email][smtp] provider=smtp starting send");
  console.log("[email][smtp] host=", SMTP_HOST);
  console.log("[email][smtp] port=", SMTP_PORT);
  console.log("[email][smtp] secure(implicitTLS)=", SMTP_SECURE);
  console.log("[email][smtp] user=", safeEnvLog(SMTP_USER));
  console.log("[email][smtp] from=", SMTP_FROM);
  console.log("[email][smtp] to=", recipientEmail);

  // Surface likely misconfig early (reduces iteration time)
  if (SMTP_PORT === 465 && SMTP_SECURE !== true) {
    console.warn(
      "[email][smtp] Potential misconfiguration: port=465 but SMTP_SECURE is false. Gmail typically uses implicit TLS on 465."
    );
  }
  if (SMTP_PORT === 587 && SMTP_SECURE !== false) {
    console.warn(
      "[email][smtp] Potential misconfiguration: port=587 but SMTP_SECURE is true. Gmail typically uses STARTTLS on 587 (secure=false)."
    );
  }

  const dnsResult = await dnsResolve(SMTP_HOST);
  console.log("[email][smtp] step=dns-lookup host=", SMTP_HOST, "result=", dnsResult);
  if (dnsResult?.error) {
    console.warn(
      "[email][smtp] dns-lookup failed; likely DNS issue (Render networking/DNS). error=",
      dnsResult?.error
    );
  }
  console.log("[email][smtp] step=tcp-probe about to probe host/port");
  const tcpResult = await tcpProbe(SMTP_HOST, SMTP_PORT);
  console.log("[email][smtp] step=tcp-probe result=", tcpResult);

  if (!tcpResult?.ok) {
    console.warn(
      "[email][smtp] tcp-probe failed; ETIMEDOUT likely due to TCP connectivity (firewall/egress/port). stage=",
      tcpResult?.stage,
      "errorCode=",
      tcpResult?.errorCode,
      "message=",
      tcpResult?.message
    );
  }

  const { subject, body } = buildEmailContent(alert);


  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // timeouts & retries are critical on PaaS.
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10_000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10_000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15_000),
    tls: {
      rejectUnauthorized: true,
      // If you ever need to debug cert issues, you can set SMTP_TLS_REJECT_UNAUTHORIZED=false
      // but in production it's safer to keep true.
      ...(parseBool(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true) === false
        ? { rejectUnauthorized: false }
        : {}),
    },
    logger: true,
    debug: true,
    // Note: nodemailer supports more logs via stream, but logger+debug is enough here.
  });

  console.log("[email][smtp] step=verify transporter.verify()");
  const verifyResult = await transporter.verify();
  console.log("[email][smtp] step=verify success=", verifyResult);

  const maxAttempts = Number(process.env.EMAIL_SEND_MAX_ATTEMPTS || 3);
  const baseDelay = Number(process.env.EMAIL_SEND_RETRY_BASE_DELAY_MS || 1000);

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[email][smtp] step=sendMail attempt=${attempt}/${maxAttempts}`);
    try {
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to: recipientEmail,
        subject,
        text: body,
      });
      console.log("[email][smtp] step=sendMail success messageId=", info?.messageId);
      console.log("[email][smtp] step=sendMail info=", {
        envelope: info?.envelope,
        accepted: info?.accepted,
        rejected: info?.rejected,
      });
      return { success: true, provider: "smtp", messageId: info?.messageId };
    } catch (err) {
      lastErr = err;
      const code = err?.code;
      const msg = err?.message || String(err);
      console.error("[email][smtp] step=sendMail failed code=", code, "message=", msg);

      if (attempt < maxAttempts && isTransientNetworkError(err)) {
        const delay = baseDelay * 2 ** (attempt - 1);
        console.warn(`[email][smtp] transient error -> retrying after ${delay}ms`);
        await sleep(delay);
        continue;
      }

      return {
        success: false,
        provider: "smtp",
        error: msg,
        code,
      };
    }
  }

  return {
    success: false,
    provider: "smtp",
    error: lastErr?.message || String(lastErr),
    code: lastErr?.code,
  };
}

async function tcpProbe(host, port) {
  // isolates DNS/TCP connectivity issues from SMTP handshake/auth/verify.
  try {
    const net = await import("node:net");
    return await new Promise((resolve) => {
      const socket = new net.Socket();
      const timeoutMs = Number(process.env.SMTP_TCP_PROBE_TIMEOUT_MS || 5000);

      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        try {
          socket.destroy();
        } catch {}
        resolve(result);
      };

      socket.setTimeout(timeoutMs);
      socket.once("connect", () => finish({ ok: true }));
      socket.once("timeout", () => finish({ ok: false, errorCode: "ETIMEDOUT", stage: "tcp-timeout" }));
      socket.once("error", (err) =>
        finish({
          ok: false,
          errorCode: err?.code,
          message: err?.message || String(err),
          stage: "tcp-error",
        })
      );

      console.log(`[email][tcp] probe starting host=${host} port=${port} timeoutMs=${timeoutMs}`);
      socket.connect(port, host);
    });
  } catch (e) {
    return { ok: false, errorCode: e?.code, message: e?.message || String(e), stage: "tcp-probe-exception" };
  }
}

export async function sendAlertEmail(alert, recipientEmail) {
  console.log("[email] sendAlertEmail start provider=smtp-only");

  // Validate recipientEmail early.
  if (!recipientEmail || typeof recipientEmail !== "string") {
    return { success: false, error: "Invalid recipientEmail" };
  }

  try {
    return await sendViaSmtp(alert, recipientEmail);
  } catch (err) {
    console.error("[email][smtp] fatal sendViaSmtp error:", err?.code, err?.message || String(err));
    return { success: false, provider: "smtp", error: err?.message || String(err), code: err?.code };
  }
}


