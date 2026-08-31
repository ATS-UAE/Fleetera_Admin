import React from 'react';
import { Popover, ActionIcon, Text, Stack, Checkbox, Tooltip } from '@mantine/core';
import { IconColumns } from '@tabler/icons-react';
import type { ColumnDef } from '../hooks/useTableColumns';

interface ColumnConfigButtonProps {
  columns: ColumnDef[];
  isVisible: (key: string) => boolean;
  onToggle: (key: string) => void;
}

export default function ColumnConfigButton({ columns, isVisible, onToggle }: ColumnConfigButtonProps) {
  return (
    <Popover width={200} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Tooltip label="Configure columns">
          <ActionIcon variant="subtle" color="gray">
            <IconColumns size={16} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={8}>Columns</Text>
        <Stack gap={6}>
          {columns.map(col => (
            <Checkbox
              key={col.key}
              label={col.label}
              size="xs"
              checked={isVisible(col.key)}
              onChange={() => onToggle(col.key)}
            />
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
