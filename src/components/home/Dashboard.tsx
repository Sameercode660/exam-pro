'use client'
import { useLayout } from '@/app/contexts/LayoutContext';
import React, { useEffect } from 'react'

function Dashboard() {


    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("Dashboard")
    }, []);
    return (
        <div>
            this is Dashboard
        </div>
    )
}

export default Dashboard
