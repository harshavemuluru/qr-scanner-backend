import QRCode from "qrcode";

interface Entry {
  id: string;
  name: string;
  email: string;
  number: string;
}

async function buildHtml(entry: Entry): Promise<string> {
  // Generate QR as a self-contained base64 PNG and attach via CID
  const qrBuffer = await QRCode.toBuffer(entry.id, {
    width: 280,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const qrBase64 = qrBuffer.toString("base64");

  return { html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f3f4f6;padding:0;margin:0;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#7c3aed;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:-0.5px;">Soulful Pop Up</h1>
      <p style="color:#ddd6fe;margin:8px 0 0;font-size:14px;">VIP Entry Pass</p>
    </div>
    <div style="padding:32px;text-align:center;">
      <p style="font-size:20px;font-weight:600;color:#111827;margin:0 0 6px;">Hi ${entry.name}!</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 28px;">Your VIP pass is ready. Present the QR code below at the entrance.</p>
      <div style="display:inline-block;padding:12px;border-radius:16px;border:1px solid #e5e7eb;background:#fff;">
        <img src="cid:qrcode@soulfulpopup" width="220" height="220" alt="Your QR Code" style="display:block;border-radius:8px;" />
      </div>
      <table style="margin:28px auto 0;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;color:#9ca3af;">Name</td><td style="padding:4px 0;font-weight:600;">${entry.name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#9ca3af;">Email</td><td style="padding:4px 0;">${entry.email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#9ca3af;">Phone</td><td style="padding:4px 0;">${entry.number}</td></tr>
      </table>
    </div>
    <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 6px;">Questions? Call us at <a href="tel:9542760910" style="color:#7c3aed;text-decoration:none;font-weight:600;">9542760910</a></p>
      <p style="font-size:11px;color:#9ca3af;margin:0;">This QR code is unique to you — please do not share it.</p>
    </div>
  </div>
</body>
</html>`, qrBase64 };
}

async function sendViaGmail(entry: Entry, html: string, qrBase64: string): Promise<void> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: `"Soulful Pop Up" <${process.env.GMAIL_USER}>`,
    to: entry.email,
    subject: "Your VIP pass — Soulful Pop Up 🎶",
    html,
    attachments: [
      {
        filename: "qrcode.png",
        content: Buffer.from(qrBase64, "base64"),
        cid: "qrcode@soulfulpopup",
      },
    ],
  });
}

async function sendViaResend(entry: Entry, html: string, qrBase64: string): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
    to: entry.email,
    subject: "Your VIP pass — Soulful Pop Up 🎶",
    html,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrBase64,
      },
    ],
  });
}

export async function sendQREmail(entry: Entry): Promise<void> {
  const { html, qrBase64 } = await buildHtml(entry);
  const provider = process.env.EMAIL_PROVIDER ?? "gmail";

  if (provider === "resend") {
    await sendViaResend(entry, html, qrBase64);
  } else {
    await sendViaGmail(entry, html, qrBase64);
  }
}
