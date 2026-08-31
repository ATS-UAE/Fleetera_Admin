import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  Modal, TextInput, Select, NumberInput, Button, Group, Text, Badge, ActionIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconInfoCircle, IconListDetails, IconSettings2, IconCoin, IconPlus, IconMinus, IconList,
  IconBuildingWarehouse,
} from '@tabler/icons-react';
import { addServiceItem, updateServiceItem } from '@/store/slices/maintenanceSlice';
import type { ServiceItemEntry, Workshop } from '@/store/slices/maintenanceSlice';
import pageStyles from './MaintenancePage.module.css';

const TYPE_OPTIONS = ['Part', 'Labour'];

interface ServiceItemFormModalProps {
  opened: boolean;
  onClose: () => void;
  item: ServiceItemEntry | null;
  workshops: Workshop[];
  /** When set, the Workshop field is pre-filled to this workshop and locked (not editable) —
   * used when this modal is opened from within a specific workshop's own "Service items" tab. */
  lockedWorkshopId?: string | null;
}

export default function ServiceItemFormModal({ opened, onClose, item, workshops, lockedWorkshopId }: ServiceItemFormModalProps) {
  const dispatch = useDispatch();
  const isEdit = !!item;
  const [activeTab, setActiveTab] = useState<string>('details');

  const form = useForm({
    initialValues: {
      name: '',
      type: 'Part',
      unit: '',
      cost: '',
      stockEntries: [] as { id: string; date: string | null; quantity: number }[],
      workshopId: null as string | null,
    },
    validate: {
      name: value => (!value.trim() ? 'Name is required' : null),
    },
  });

  useEffect(() => {
    if (item) {
      form.setValues({
        name: item.name, type: item.type, unit: item.unit, cost: item.cost,
        // Cloned rather than reused directly — Redux Toolkit deep-freezes state
        // in development, and editing an entry via a nested setFieldValue path
        // would otherwise mutate the still-frozen item.stockEntries in place.
        stockEntries: item.stockEntries.map(e => ({ ...e })),
        workshopId: lockedWorkshopId ?? item.workshopId,
      });
    } else {
      form.reset();
      if (lockedWorkshopId) form.setFieldValue('workshopId', lockedWorkshopId);
    }
    setActiveTab('details');
  }, [item, opened, lockedWorkshopId]);

  const handleSubmit = (values: typeof form.values) => {
    if (isEdit && item) {
      dispatch(updateServiceItem({ id: item.id, updates: values }));
      notifications.show({ title: 'Service item updated', message: `${values.name} has been updated.`, color: 'blue' });
    } else {
      dispatch(addServiceItem(values));
      notifications.show({ title: 'Service item added', message: `${values.name} has been added.`, color: 'green' });
    }
    onClose();
  };

  const entries = form.values.stockEntries;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? `Edit — ${item?.name}` : 'New service item'}
      size="lg"
      zIndex={2000}
      styles={{ title: { fontWeight: 700, fontSize: '16px' } }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className={pageStyles.detailTabs} style={{ margin: '0 0 16px' }}>
          <button
            type="button"
            className={`${pageStyles.detailTab} ${activeTab === 'details' ? pageStyles.detailTabActive : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconInfoCircle size={14} />
              Details
            </span>
          </button>
          <button
            type="button"
            className={`${pageStyles.detailTab} ${activeTab === 'quantity' ? pageStyles.detailTabActive : ''}`}
            onClick={() => setActiveTab('quantity')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconListDetails size={14} />
              Quantity
              {entries.length > 0 && <Badge circle size="sm" color="green">{entries.length}</Badge>}
            </span>
          </button>
        </div>

        {activeTab === 'details' && (
          <div>
            <Group mb="md" gap={10}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--fv-accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconSettings2 size={16} />
              </div>
              <Text fw={600}>Item details</Text>
            </Group>

            <TextInput
              label="Name"
              placeholder="e.g. Oil Filter"
              required
              leftSection={<IconSettings2 size={14} />}
              mb="md"
              {...form.getInputProps('name')}
            />

            <Group align="flex-end" mb="md" gap={10} wrap="nowrap">
              <Select
                label="Type"
                data={TYPE_OPTIONS}
                required
                style={{ flex: 1 }}
                {...form.getInputProps('type')}
              />
              <Badge color="green" variant="outline" size="lg" radius="xl" style={{ marginBottom: 2 }}>
                {form.values.type}
              </Badge>
            </Group>

            <Group grow mb="md">
              <TextInput label="Unit" placeholder="e.g. pieces, liters" {...form.getInputProps('unit')} />
              <NumberInput
                label="Cost"
                placeholder="0.00"
                decimalScale={2}
                fixedDecimalScale
                leftSection={<IconCoin size={14} />}
                value={form.values.cost === '' ? '' : Number(form.values.cost)}
                onChange={val => form.setFieldValue('cost', val === '' ? '' : String(val))}
              />
            </Group>

            <Select
              label="Workshop"
              placeholder="Not assigned"
              leftSection={<IconBuildingWarehouse size={14} />}
              data={workshops.map(w => ({ value: w.id, label: w.name }))}
              clearable={!lockedWorkshopId}
              disabled={!!lockedWorkshopId}
              description={lockedWorkshopId ? 'Locked — this item is being added for this workshop.' : undefined}
              {...form.getInputProps('workshopId')}
            />
          </div>
        )}

        {activeTab === 'quantity' && (
          <div>
            <Group justify="space-between" mb="md">
              <Group gap={10}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'var(--fv-accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconList size={16} />
                </div>
                <Text fw={600}>Stock entries</Text>
              </Group>
              <Button
                variant="outline"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('stockEntries', { id: uuidv4(), date: null, quantity: 0 })}
              >
                Add quantity
              </Button>
            </Group>

            {entries.length === 0 ? (
              <div style={{
                border: '1px dashed var(--fv-border)', borderRadius: 8,
                padding: '32px 0', textAlign: 'center',
              }}>
                <IconList size={22} style={{ opacity: 0.35 }} />
                <Text size="sm" c="dimmed" mt={8}>No records yet. Click "Add quantity" to start.</Text>
              </div>
            ) : (
              <>
                <Group mb={4} gap={10} wrap="nowrap">
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ flex: 1 }}>Date</Text>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ flex: 1 }}>Quantity</Text>
                  <div style={{ width: 32 }} />
                </Group>
                {entries.map((entry, index) => (
                  <Group key={entry.id} mb={8} gap={10} wrap="nowrap" align="center">
                    <DateInput
                      placeholder="Select date..."
                      style={{ flex: 1 }}
                      value={entry.date ? new Date(entry.date) : null}
                      onChange={val => form.setFieldValue(`stockEntries.${index}.date`, val ? new Date(val as any).toISOString() : null)}
                    />
                    <NumberInput
                      placeholder="0"
                      min={0}
                      leftSection={<IconList size={14} />}
                      style={{ flex: 1 }}
                      {...form.getInputProps(`stockEntries.${index}.quantity`)}
                    />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      radius="xl"
                      onClick={() => form.removeListItem('stockEntries', index)}
                    >
                      <IconMinus size={14} />
                    </ActionIcon>
                  </Group>
                ))}
              </>
            )}
          </div>
        )}

        <Group justify="center" mt="lg">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
}
