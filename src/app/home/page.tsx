import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Main from '@/components/home/Main'
import React from 'react'

function page() {
    return (
        <>
            <ProtectedRoute>
                <Main></Main>
            </ProtectedRoute>
        </>
    )
}

export default page
