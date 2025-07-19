'use client'

import React, { useEffect } from 'react'
import { useLayout } from '@/app/contexts/LayoutContext';
import GroupList from './my-group/GroupList';

function MyGroup() {

    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("My Groups")
    }, []);
    return (
        <>
            <GroupList></GroupList>
        </>
    )
}

export default MyGroup
