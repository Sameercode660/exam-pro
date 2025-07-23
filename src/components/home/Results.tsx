'use client'

import React, { useEffect } from 'react'
import { useLayout } from '@/app/contexts/LayoutContext';
import ResultList from './results/ResultList';

function Results() {

    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle("Resutls")
    }, []);
    return (
        <>
            <ResultList></ResultList>
        </>
    )
}

export default Results
