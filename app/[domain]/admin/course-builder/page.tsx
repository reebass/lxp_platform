"use client";

import React from 'react';
import { CourseBuilderCanvas } from '@/components/course-builder/CourseBuilderCanvas';

export default function TenantCourseBuilderPage() {
  const handleSave = (data: any) => {
    console.log('Saving to tenant courses table:', data);
  };

  return (
    <div className="w-full h-full">
      <CourseBuilderCanvas mode="tenant" onSave={handleSave} />
    </div>
  );
}