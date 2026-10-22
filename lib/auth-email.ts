import nodemailer from "nodemailer";

export async function sendAuthEmail(to: string, subject: string, url: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const from = process.env.SMTP_FROM;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from) {
    throw new Error("SMTP_HOST, SMTP_PORT, and SMTP_FROM are required to send auth email.");
  }
  if ((user && !password) || (!user && password)) {
    throw new Error("SMTP_USER and SMTP_PASSWORD must be configured together.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    ...(user && password ? { auth: { user, pass: password } } : {}),
  });

  await transporter.sendMail({ from, to, subject, text: url });
}