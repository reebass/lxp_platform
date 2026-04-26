import React from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { notFound } from 'next/navigation';
import { CourseBuilderCanvas } from '@/components/course-builder/CourseBuilderCanvas';
import { getCourse } from '@/app/actions/course';

export default async function MasterCourseBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let initialFlowData: { nodes: Node[]; edges: Edge[] } | null = null;
  let loadError: string | null = null;

  if (id) {
    const result = await getCourse(id);

    if (result.errorCode === 'not_found') {
      notFound();
    }

    if (result.data?.flow_data) {
      initialFlowData = result.data.flow_data as { nodes: Node[]; edges: Edge[] };
    } else if (result.error) {
      loadError = result.error;
    }
  }

  return (
    <div className="w-full h-full">
      <CourseBuilderCanvas
        mode="master"
        courseId={id ?? null}
        initialFlowData={initialFlowData}
        loadError={loadError}
      />
    </div>
  );
}