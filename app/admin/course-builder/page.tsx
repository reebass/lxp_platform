"use client";

import React from 'react';
import { CourseBuilderCanvas } from '@/components/course-builder/CourseBuilderCanvas';

export default function MasterCourseBuilderPage() {
  const handleSave = (data: any) => {
    console.log('Saving to master_courses table:', data);
  };

  return (
    <div className="w-full h-full">
      <CourseBuilderCanvas mode="master" onSave={handleSave} />
    </div>
  );
}