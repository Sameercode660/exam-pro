// components/LayoutContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  title: string;
  setTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  title: 'Dashboard',
  setTitle: () => {},
});

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState('Dashboard');

  return (
    <LayoutContext.Provider value={{ title, setTitle }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
