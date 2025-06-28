'use client';

import React from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const router = useRouter();

  if (!token || !user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
