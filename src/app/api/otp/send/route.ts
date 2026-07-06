import { NextRequest, NextResponse } from 'next/server';

// Shared singleton across route files (same Next.js server process)
declare global {
  // eslint-disable-next-line no-var
  var __qotn_otp_store: Map<string, { otp: string; expires: number; attempts: number }> | undefined;
}
if (!globalThis.__qotn_otp_store) {
  globalThis.__qotn_otp_store = new Map();
}
const otpStore = globalThis.__qotn_otp_store;

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expires < now) otpStore.delete(key);
  }
}, 60_000);

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmail(to: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[OTP DEV] ${to} → ${otp}`);
    return;
  }

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #F5F0E8; padding: 40px 32px;">
      <p style="font-size: 20px; font-weight: 300; letter-spacing: 0.1em; color: #1A1A1A; margin: 0 0 8px;">QOTN</p>
      <p style="font-size: 11px; letter-spacing: 0.12em; color: #9E9987; text-transform: uppercase; margin: 0 0 32px;">Pure Cotton. Nothing Else.</p>
      <h1 style="font-size: 16px; font-weight: 500; letter-spacing: 0.08em; color: #1A1A1A; margin: 0 0 8px; text-transform: uppercase;">Order Verification</h1>
      <p style="font-size: 13px; color: #9E9987; line-height: 1.6; margin: 0 0 28px;">
        Your verification code to confirm your Cash on Delivery order:
      </p>
      <div style="background: #1A1A1A; padding: 20px 24px; text-align: center; margin-bottom: 28px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; color: #F5F0E8; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #9E9987; line-height: 1.6;">
        Valid for 10 minutes. If you did not place this order, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #D4CFC6; margin: 28px 0;" />
      <p style="font-size: 11px; color: #C8C3BA;">
        QOTN · Sanganer, Jaipur · <a href="mailto:Helloqotn@gmail.com" style="color: #9E9987;">Helloqotn@gmail.com</a>
      </p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'QOTN Orders <orders@qotn.in>',
      to: [to],
      subject: `${otp} — Your QOTN order verification code`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email address is required.' }, { status: 400 });
    }

    const key = email.toLowerCase();
    const existing = otpStore.get(key);

    // Rate limit: 1 OTP per 30 seconds
    if (existing && existing.expires - 570_000 > Date.now()) {
      return NextResponse.json({ message: 'Please wait 30 seconds before requesting a new code.' }, { status: 429 });
    }

    const otp = generateOTP();
    otpStore.set(key, { otp, expires: Date.now() + 10 * 60_000, attempts: 0 });

    await sendEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });
  } catch (err: any) {
    console.error('[OTP send]', err);
    return NextResponse.json({ message: 'Failed to send verification code. Please try again.' }, { status: 500 });
  }
}
