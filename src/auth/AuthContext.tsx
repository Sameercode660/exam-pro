'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';


interface AuthContextProps {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, mobileNumber: string, organizationId: number) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps & { isInitialized: boolean } | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Initialization flag
  const router = useRouter();
  const socket = useSocket()


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

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axios.post('/api/authentication/user/login', { email, password });
      const { token, participant } = res.data;
      console.log(res.data)

      if (!participant.approved) {
        return { success: false, message: "Your account is not approved yet." };
      }

      socket?.emit('user-online', { participantId: res.data.participant.id })

      setToken(token);
      setUser(participant);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(participant));
      router.push('/home');

      return { success: true, message: "Login successful" };
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message: msg };
    }
  };


  const register = async (
    name: string,
    email: string,
    password: string,
    mobileNumber: string,
    organizationId: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await axios.post('/api/participants/create-participant', {
        name, email, password, mobileNumber, organizationId
      });

      return { success: true, message: "Registration successful. You'll be notified after approval." };

    } catch (error: any) {
      console.error('Registration failed', error.response?.data?.message || error.message);

      return {
        success: false,
        message: error.response?.data?.error || "Something went wrong! Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      const storedUser = user || JSON.parse(localStorage.getItem('user') || '{}');

      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');


      if (storedUser?.id) {
        axios.post('/api/participant-activity-tracking/participant-logout-time', {
          participantId: storedUser.id
        });
      } else {
        console.warn('No valid user ID found for logout tracking');
      }
    } catch (err) {
      console.error('Error tracking logout time:', err);
    } finally {
      setTimeout(() => {
        router.push('/');
      }, 0);
    }

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
