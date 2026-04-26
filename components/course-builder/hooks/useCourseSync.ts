"use client";

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';
import { type Node, type Edge } from '@xyflow/react';
import { saveCourse } from '@/app/actions/course';
import { dict } from '@/lib/i18n/dictionaries';

/**
 * Custom hook for managing course save state.
 * Wraps the saveCourse server action with useTransition + sonner toasts.
 */
export function useCourseSync(initialCourseId: string | null) {
  const t = dict.uk.course_builder;
  const [courseId, setCourseId] = useState<string | null>(initialCourseId);
  const [isPending, startTransition] = useTransition();

  const save = useCallback(
    (flowData: { nodes: Node[]; edges: Edge[] }) => {
      startTransition(async () => {
        const result = await saveCourse(courseId, flowData);

        if (result.success && result.courseId) {
          // Capture the ID after first save (for subsequent updates)
          if (!courseId) {
            setCourseId(result.courseId);
            // Update URL without full reload so the ID is bookmarkable
            window.history.replaceState(null, '', `?id=${result.courseId}`);
          }
          toast.success(t.toast_save_success);
        } else {
          toast.error(result.error || t.toast_save_error);
        }
      });
    },
    [courseId, startTransition, t],
  );

  return { courseId, isPending, save };
}
