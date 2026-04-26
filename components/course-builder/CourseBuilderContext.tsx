"use client";

import { createContext, useContext } from 'react';

// Context for explicit "edit this node" intent (gear icon click).
// Decoupled from React Flow's native selection (which fires on any click/drag).

interface EditingContextValue {
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
}

export const EditingContext = createContext<EditingContextValue>({
  editingNodeId: null,
  setEditingNodeId: () => {},
});

export const useEditingContext = () => useContext(EditingContext);
