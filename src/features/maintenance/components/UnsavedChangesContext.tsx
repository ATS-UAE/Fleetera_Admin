import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import UnsavedChangesModal from './UnsavedChangesModal';

interface FormGuard {
  isDirty: boolean;
  onSave: () => void;
}

interface UnsavedChangesContextValue {
  setGuard: (guard: FormGuard | null) => void;
  guardedNavigate: (action: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

// Lets any currently-mounted form (Service/Service plan/Workshop) register whether
// it has unsaved changes, so navigation that happens ABOVE that form — like
// switching the top-level Maintenance tabs — can still warn before discarding them.
export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const guardRef = useRef<FormGuard | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const setGuard = useCallback((guard: FormGuard | null) => {
    guardRef.current = guard;
  }, []);

  const guardedNavigate = useCallback((action: () => void) => {
    if (guardRef.current?.isDirty) {
      setPendingAction(() => action);
    } else {
      action();
    }
  }, []);

  const handleSave = () => {
    guardRef.current?.onSave();
    pendingAction?.();
    setPendingAction(null);
  };
  const handleDiscard = () => {
    pendingAction?.();
    setPendingAction(null);
  };
  const handleCancel = () => setPendingAction(null);

  return (
    <UnsavedChangesContext.Provider value={{ setGuard, guardedNavigate }}>
      {children}
      <UnsavedChangesModal
        opened={!!pendingAction}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesGuard() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error('useUnsavedChangesGuard must be used within an UnsavedChangesProvider');
  return ctx;
}
