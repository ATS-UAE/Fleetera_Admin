import React from 'react';
import { Modal, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface UnsavedChangesModalProps {
  opened: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({ opened, onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      centered
      size="sm"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      zIndex={2100}
      styles={{
        content: {
          background: 'var(--fv-bg-panel)',
          border: '1px solid var(--fv-border-light)',
          borderRadius: 'var(--fv-r-lg)',
        },
      }}
    >
      <div style={{ textAlign: 'center', padding: '8px 4px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
          background: 'var(--mantine-color-orange-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconAlertTriangle size={28} color="var(--mantine-color-orange-6)" />
        </div>
        <Text fw={700} size="lg" mb={8}>Unsaved changes</Text>
        <Text size="sm" c="dimmed" mb={20}>
          You have unsaved changes. Do you want to save before leaving?
        </Text>
        <Group justify="center" gap={10}>
          <Button variant="default" onClick={onCancel}>Keep editing</Button>
          <Button variant="outline" color="red" onClick={onDiscard}>Discard</Button>
          <Button color="green" onClick={onSave}>Save</Button>
        </Group>
      </div>
    </Modal>
  );
}
