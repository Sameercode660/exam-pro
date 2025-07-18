'use client';

import { useLayout } from '@/app/contexts/LayoutContext';
import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface HomeProps {
  children: React.ReactNode;
}

const Home: React.FC<HomeProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { title } = useLayout();
  const { logout } = useAuth()
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">

      {/* Drawer Sidebar */}
      <aside
        className={`
          fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg transform
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-5 flex justify-between items-center border-b">
          <div className="text-2xl font-bold">ExamPro</div>
          <button
            className="md:hidden text-xl"
            onClick={() => setDrawerOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4 items-start">
          <button className="px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            onClick={() => {
              router.push('/home')
            }}>Dashboard</button>
          <button className="px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            onClick={() => {
              router.push('/home/attempted-exams')
            }}
          >Attempted Exam</button>
          <button className="px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            onClick={() => {
              router.push('/home/my-groups')
            }}
          >My Groups</button>
          <button className="px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            onClick={() => {
              router.push('/home/results')
            }}
          >Results</button>
          <button className="px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer" onClick={() => {
            logout();
          }}>Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow-md px-6 py-4">
          <button
            className="md:hidden text-2xl"
            onClick={() => setDrawerOpen(true)}
          >
            &#9776; {/* Menu icon */}
          </button>
          <div className="text-xl font-semibold">{title}</div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">P</div>
            <span className="text-gray-600">Profile</span>
          </div>
        </header>

        {/* Scrollable Child Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
