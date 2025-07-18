'use client'

import React, { useEffect } from 'react'
import { useLayout } from '@/app/contexts/LayoutContext';

function MyGroup() {

    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("My Groups")
    }, []);
    return (
        <div>
            My groups
        </div>
    )
}

export default MyGroup
