
"use client";

import React from 'react'
import SchoolsManager from '../../components/SchoolsManager'
import CoursesManager from '../../components/CoursesManager'

const page = () => {
  return (
    <>
      <CoursesManager />
      <br />
      <SchoolsManager />
    </>
  )
}

export default page