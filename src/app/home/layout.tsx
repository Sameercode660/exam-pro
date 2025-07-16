import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Main from '@/components/home/Main'
import React from 'react'
import { LayoutProvider } from '../contexts/LayoutContext'

function layout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <ProtectedRoute>
                <Main>
                    {children}
                </Main>
            </ProtectedRoute>
        </LayoutProvider>
    )
}

export default layout
