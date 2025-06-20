'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function UserStatus() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (user) {
    return <span>Welcome, <b>{user.email}</b>!</span>;
  }

  return (
    <Link href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
      Login
    </Link>
  );
} 