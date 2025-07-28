'use client';

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      toast.error(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Welcome Back 👋</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <span onClick={() => {router.push('/register')}} className="text-blue-500 hover:underline cursor-pointer">Register</span>
        </p>

        <p className="text-sm text-blue-500 mt-4 text-center hover:underline cursor-pointer" onClick={() => {
          router.push('/forgot-password')
        }}>
          Forgot Password?
        </p>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;
