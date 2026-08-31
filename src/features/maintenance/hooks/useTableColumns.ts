import { useState } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  /** Columns that can't be hidden (e.g. the primary name column) omit this hook entirely for that key. */
}

export function useTableColumns(storageKey: string) {
  const fullKey = `fv-maint-cols-${storageKey}`;

  const [hidden, setHidden] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const isVisible = (key: string) => !hidden.has(key);

  const toggle = (key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(fullKey, JSON.stringify(Array.from(next)));
      } catch { /* ignore */ }
      return next;
    });
  };

  return { isVisible, toggle };
}
