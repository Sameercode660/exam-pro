'use client';

import React from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();

  if (!isInitialized) {
    return <div>Loading...</div>; // Wait for initialization
  }

  if (!token || !user) {
    router.push('/login');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
