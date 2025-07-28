'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


const Register: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await axios.get(`/api/participants/fetch-all-orgs`);
        setOrganizations(res.data.organizations);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to load organizations');
      }
    };

    fetchOrganizations();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !mobileNumber || !organizationId) {
      toast.error('Please fill all the fields');
      return;
    }


    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    const res = await register(name, email, password, mobileNumber, organizationId);

    if (res.success) {
      setShowModal(true); // Show Instagram style modal
    } else {
      toast.error(res.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Create an Account</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <select
            value={organizationId || ''}
            onChange={(e) => setOrganizationId(Number(e.target.value))}
            className="w-full border p-2 rounded-md"
          >
            <option value="">Select Organization</option>
            {organizations.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition cursor-pointer ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <span onClick={() => router.push('/')} className="text-blue-500 hover:underline cursor-pointer">
            Log in
          </span>
        </p>
        <ToastContainer position="top-center" />
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Registration Successful!</DialogTitle>
            <DialogDescription>
              Your registration request has been submitted. You'll be notified once approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/')}>Go to Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
