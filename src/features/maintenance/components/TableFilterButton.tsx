import React from 'react';
import { Popover, Button, Stack, MultiSelect, Badge } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface TableFilterButtonProps {
  filters: FilterDef[];
  values: Record<string, string[]>;
  onChange: (key: string, values: string[]) => void;
}

export default function TableFilterButton({ filters, values, onChange }: TableFilterButtonProps) {
  const activeCount = filters.reduce((sum, f) => sum + (values[f.key]?.length || 0), 0);

  return (
    <Popover width={260} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Button
          variant={activeCount > 0 ? 'light' : 'default'}
          size="xs"
          leftSection={<IconFilter size={14} />}
          rightSection={activeCount > 0 ? <Badge size="xs" circle>{activeCount}</Badge> : null}
        >
          Filters
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={10}>
          {filters.map(f => (
            <MultiSelect
              key={f.key}
              label={f.label}
              data={f.options}
              value={values[f.key] || []}
              onChange={val => onChange(f.key, val)}
              size="xs"
              clearable
              searchable
            />
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
