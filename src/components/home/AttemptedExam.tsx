'use client'

import React, { useEffect } from 'react'
import { useLayout } from '@/app/contexts/LayoutContext';

function AttemptedExam() {

 const { setTitle } = useLayout();
 
     useEffect(() => {
         setTitle("Attempted Exams")
     }, []);
  return (
    <div>
      Attempted exam
    </div>
  )
}

export default AttemptedExam
