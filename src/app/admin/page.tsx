'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// There is no separate admin login here. An admin signs in on the normal /account page, and the backend
// decides who is an admin from the account's role in the database. This page only routes people:
// admins go to the dashboard, everyone else goes home. (It used to hold a hard-coded admin password.)
export default function AdminEntryPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAdmin ? '/admin/dashboard' : '/');
  }, [isAdmin, isLoading, router]);

  return <div style={{ backgroundColor: 'var(--black)', minHeight: '100vh' }} />;
}
