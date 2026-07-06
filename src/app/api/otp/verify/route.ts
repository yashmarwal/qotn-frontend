import { NextRequest, NextResponse } from 'next/server';

// Shared store — must be the same module instance as send/route.ts.
// In Next.js each route file is its own module, so we export a singleton from a shared file.
// For simplicity we re-import from a shared helper.
// NOTE: This works because Next.js bundles route handlers in the same server process.

// We need access to the same Map. Re-declare it here and rely on the fact that
// the module cache keeps one instance per process. The send route sets the same
// global Map key we read here via a shared singleton.

declare global {
  // eslint-disable-next-line no-var
  var __qotn_otp_store: Map<string, { otp: string; expires: number; attempts: number }> | undefined;
}

// Ensure we use a single Map instance across both route files
if (!globalThis.__qotn_otp_store) {
  globalThis.__qotn_otp_store = new Map();
}
const otpStore = globalThis.__qotn_otp_store;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required.' }, { status: 400 });
    }

    const key = email.toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
      return NextResponse.json({ message: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (record.expires < Date.now()) {
      otpStore.delete(key);
      return NextResponse.json({ message: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Limit attempts to prevent brute-force
    if (record.attempts >= 5) {
      otpStore.delete(key);
      return NextResponse.json({ message: 'Too many incorrect attempts. Please request a new code.' }, { status: 400 });
    }

    if (record.otp !== String(otp).trim()) {
      otpStore.set(key, { ...record, attempts: record.attempts + 1 });
      const remaining = 5 - record.attempts - 1;
      return NextResponse.json(
        { message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 },
      );
    }

    // Verified — remove from store so it cannot be reused
    otpStore.delete(key);
    return NextResponse.json({ message: 'Verified.' }, { status: 200 });
  } catch (err: any) {
    console.error('[OTP verify]', err);
    return NextResponse.json({ message: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
