'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && (!token || !user)) {
      router.push('/login');
    }
  }, [isInitialized, token, user, router]);

  if (!isInitialized) {
    return <div>Loading...</div>; 
  }

   
  if (!token || !user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
