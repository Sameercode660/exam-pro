'use client'

import React, { useEffect } from 'react'
import { useLayout } from '@/app/contexts/LayoutContext';

function Results() {

    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("Resutls")
    }, []);
    return (
        <div>
            Results
        </div>
    )
}

export default Results
