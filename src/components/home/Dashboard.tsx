'use client'
import { useLayout } from '@/app/contexts/LayoutContext';
import React, { useEffect } from 'react'
import DashboardPage from './dashboard/DashboardPage';

function Dashboard() {


    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("Dashboard")
    }, []);
    return (
        <>
         <DashboardPage></DashboardPage>   
        </>
    )
}

export default Dashboard
