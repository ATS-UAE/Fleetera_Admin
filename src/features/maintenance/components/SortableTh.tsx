import React from 'react';
import { Table, Group } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconArrowsSort } from '@tabler/icons-react';

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

interface SortableThProps {
  label: React.ReactNode;
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
  style?: React.CSSProperties;
}

export default function SortableTh({ label, sortKey, sort, onSort, style }: SortableThProps) {
  const active = sort?.key === sortKey;
  return (
    <Table.Th
      style={{ cursor: 'pointer', userSelect: 'none', ...style }}
      onClick={() => onSort(sortKey)}
    >
      <Group gap={4} wrap="nowrap">
        <span>{label}</span>
        {active ? (
          sort!.dir === 'asc' ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
        ) : (
          <IconArrowsSort size={12} style={{ opacity: 0.35 }} />
        )}
      </Group>
    </Table.Th>
  );
}
