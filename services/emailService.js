import "dotenv/config";
import nodemailer from "nodemailer";

const buildTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const transporter = buildTransport();

const sendViaEmailJs = async ({ to, subject, text, templateId }) => {
  const resolvedTemplateId = templateId || process.env.EMAILJS_TEMPLATE_ID || "";
  const emailJsServiceId = process.env.EMAILJS_SERVICE_ID || "";
  const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY || "";
  const emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY || "";

  if (!emailJsServiceId || !resolvedTemplateId || !emailJsPublicKey) {
    return null;
  }

  const payload = {
    service_id: emailJsServiceId,
    template_id: resolvedTemplateId,
    user_id: emailJsPublicKey,
    template_params: {
      to_email: to,
      email: to,
      otp: text.match(/\b(\d{6})\b/)?.[1] || "",
      code: text.match(/\b(\d{6})\b/)?.[1] || "",
      passcode: text.match(/\b(\d{6})\b/)?.[1] || "",
      subject,
      message: text,
      user_name: to.split("@")[0] || "User"
    }
  };

  if (emailJsPrivateKey) {
    payload.accessToken = emailJsPrivateKey;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS send failed: ${errorText}`);
  }

  return { mode: "emailjs" };
};

export const sendEmail = async ({ to, subject, text, html, templateId }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@secureexam.local";

  try {
    const emailJsResult = await sendViaEmailJs({ to, subject, text, templateId });
    if (emailJsResult) {
      return emailJsResult;
    }
  } catch (error) {
    console.log("[EMAILJS_FALLBACK]", { to, subject, error: error.message });
  }

  if (!transporter) {
    console.log("[EMAIL_FALLBACK]", { to, subject, text });
    return { mode: "fallback_console" };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { mode: "smtp" };
};
