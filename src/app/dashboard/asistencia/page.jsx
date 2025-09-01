"use client";


import React from 'react'
import { Suspense } from "react";

import AttendanceManager from '../../components/AttendanceManager'

const page = () => {
  return (
    <>
      <Suspense fallback={<div>Cargando asistencia...</div>}>
        <AttendanceManager />
      </Suspense>
    </>
  )
}

export default page