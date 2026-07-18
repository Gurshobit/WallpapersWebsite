const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const FROM = process.env.EMAIL_FROM ?? "noreply@hdwallpapers.site";

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  url: string;
}) {
  const { to, name, url } = opts;
  const subject = "Reset your HD Wallpapers password";
  const html = `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the link below to choose a new one:</p>
    <p><a href="${url}">${url}</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
    return;
  }

  // Dev fallback — log reset URL when email is not configured
  console.log(`[password-reset] To: ${to}`);
  console.log(`[password-reset] URL: ${url}`);
}

export async function sendContactEmail(opts: {
  to: string;
  subject: string;
  name: string;
  email: string;
  website?: string;
  message: string;
  ip?: string;
}) {
  const { to, subject, name, email, website, message, ip } = opts;
  const date = new Date().toUTCString();
  const mailSubject = `[Contact] ${subject}`;
  const html = `
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    ${website ? `<p><strong>Website:</strong> ${escapeHtml(website)}</p>` : ""}
    <p><strong>Date:</strong> ${escapeHtml(date)}</p>
    ${ip ? `<p><strong>IP:</strong> ${escapeHtml(ip)}</p>` : ""}
    <hr />
    <div>${message}</div>
  `;

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: email,
      subject: mailSubject,
      html,
    });
    return;
  }

  console.log(`[contact] To: ${to}`);
  console.log(`[contact] From: ${name} <${email}>`);
  console.log(`[contact] Subject: ${subject}`);
  console.log(`[contact] Message: ${message}`);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { SITE_URL };
