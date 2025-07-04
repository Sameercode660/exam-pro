'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, mobileNumber: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps & { isInitialized: boolean } | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Initialization flag
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.warn('Invalid user data in localStorage');
        setUser(null);
      }
    }
    setIsInitialized(true); // Mark initialization as complete
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/authentication/user/login', { email, password });
      const { token, participant } = res.data;
      setToken(token);
      setUser(participant);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(participant));
      router.push('/home');
    } catch (error: any) {
      console.error('Login failed', error.response?.data?.message || error.message);
    }
  };

  const register = async (name: string, email: string, password: string, mobileNumber: string) => {
    try {
      const res: any = await axios.post('/api/authentication/user/register', { name, email, password, mobileNumber });
      alert(res.data.message);
      router.push('/login');
    } catch (error: any) {
      console.error('Registration failed', error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
