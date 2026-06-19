'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// OTP verification is now part of the /account flow
export default function VerifyEmailRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/account'); }, [router]);
  return null;
}
