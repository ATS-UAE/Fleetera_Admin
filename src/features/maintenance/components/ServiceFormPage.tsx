import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { v4 as uuidv4 } from 'uuid';
import {
  Text, Button, Group, Card, TextInput, Select, NumberInput,
  Textarea, Badge, SimpleGrid, ActionIcon, Table, Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft, IconChevronRight, IconTool, IconFlag, IconAlertTriangle,
  IconCalendar, IconGauge, IconClock, IconPlus, IconMinus, IconUpload,
  IconRefresh, IconInfoCircle, IconAdjustments, IconCurrencyDollar, IconDeviceFloppy,
  IconFile, IconX,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import { addService, updateService } from '@/store/slices/maintenanceSlice';
import type {
  ServiceItem, ServicePlan, ServiceItemEntry, ServicePriority, ServiceStatus,
  CounterType, ServiceUsedItem,
} from '@/store/slices/maintenanceSlice';
import type { Vehicle } from '@/types';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from './ServicesView';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesGuard } from './UnsavedChangesContext';
import pageStyles from './MaintenancePage.module.css';

const PRIORITY_OPTIONS: ServicePriority[] = ['normal', 'high', 'critical'];
const STATUS_OPTIONS: ServiceStatus[] = ['todo', 'inprogress', 'done', 'rejected'];

const COUNTER_ORDER: CounterType[] = ['mileage', 'engineHours', 'days'];
const PARAM_META: Record<CounterType, { label: string; icon: TablerIcon; unit: string; color: string }> = {
  mileage: { label: 'Mileage', icon: IconGauge, unit: 'km', color: 'grape' },
  engineHours: { label: 'Engine Hours', icon: IconClock, unit: 'h', color: 'orange' },
  days: { label: 'Days', icon: IconCalendar, unit: 'd', color: 'green' },
};

function emptyParameters() {
  return {
    mileage: { initial: null as number | null, final: null as number | null },
    engineHours: { initial: null as number | null, final: null as number | null },
    days: { initial: null as number | null, final: null as number | null },
  };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

interface ServiceFormPageProps {
  service: ServiceItem | null;
  onBack: () => void;
}

export default function ServiceFormPage({ service, onBack }: ServiceFormPageProps) {
  const dispatch = useDispatch();
  const isEdit = !!service;
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const servicePlans: ServicePlan[] = useSelector((s: any) => s.maintenance.servicePlans);
  const catalogItems: ServiceItemEntry[] = useSelector((s: any) => s.maintenance.serviceItems);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm({
    initialValues: {
      dateOfService: service?.dateOfService || null as string | null,
      vehicleId: service?.vehicleId || '',
      servicePlanId: service?.servicePlanId || null as string | null,
      name: service?.name || '',
      priority: service?.priority || 'normal' as ServicePriority,
      status: service?.status || 'todo' as ServiceStatus,
      cost: service?.cost || '',
      deadline: service?.deadline || null as string | null,
      notes: service?.notes || '',
      additionalProperties: service?.additionalProperties || '',
      // Cloned rather than reused directly — Redux Toolkit deep-freezes state in
      // development, and Mantine's nested setFieldValue mutates in place, so
      // editing these against the frozen service object would silently fail.
      parameters: service
        ? {
            mileage: { ...service.parameters.mileage },
            engineHours: { ...service.parameters.engineHours },
            days: { ...service.parameters.days },
          }
        : emptyParameters(),
      usedItems: (service?.usedItems || []).map(u => ({ ...u })) as ServiceUsedItem[],
      files: service?.files || [] as string[],
    },
  });

  const computeCost = () => form.values.usedItems.reduce((sum, u) => {
    const item = catalogItems.find(i => i.id === u.itemId);
    return sum + (item ? (parseFloat(item.cost) || 0) : 0) * u.qty;
  }, 0);

  React.useEffect(() => {
    form.setFieldValue('cost', computeCost().toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.usedItems]);

  React.useEffect(() => {
    const { dateOfService, vehicleId, servicePlanId } = form.values;
    if (!dateOfService || !vehicleId || !servicePlanId) return;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const plan = servicePlans.find(p => p.id === servicePlanId);
    if (vehicle && plan) {
      form.setFieldValue('name', `${vehicle.name}_${plan.name}_${formatDate(dateOfService)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.dateOfService, form.values.vehicleId, form.values.servicePlanId]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files || []).map(f => f.name);
    if (names.length) form.setFieldValue('files', [...form.values.files, ...names]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    form.setFieldValue('files', form.values.files.filter((_, i) => i !== index));
  };

  const handlePlanChange = (planId: string | null) => {
    form.setFieldValue('servicePlanId', planId);
    const plan = servicePlans.find(p => p.id === planId);
    if (plan) {
      form.setFieldValue('priority', plan.defaultPriority);
      form.setFieldValue('status', 'todo');
      if (plan.daysToComplete != null) {
        const base = form.values.dateOfService ? new Date(form.values.dateOfService) : new Date();
        const deadline = new Date(base.getTime() + plan.daysToComplete * 24 * 60 * 60 * 1000);
        form.setFieldValue('deadline', deadline.toISOString());
      }
    }
  };

  const selectedPlan = servicePlans.find(p => p.id === form.values.servicePlanId) || null;
  const isCounterRequired = (type: CounterType) => !!selectedPlan?.counters[type]?.active;
  const requiredCountersMissing = COUNTER_ORDER.some(type => {
    if (!isCounterRequired(type)) return false;
    return form.values.parameters[type].initial == null;
  });

  const canSave = !!form.values.name.trim() && !!form.values.vehicleId && !!form.values.dateOfService && !requiredCountersMissing;
  const isDirty = form.isDirty();
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);

  const requestBack = () => {
    if (isDirty) setShowUnsavedModal(true);
    else onBack();
  };

  const persist = () => {
    if (!canSave) return;
    const values = form.values;
    if (isEdit && service) {
      dispatch(updateService({ id: service.id, updates: values }));
    } else {
      dispatch(addService(values));
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    persist();
    onBack();
  };

  // Registers this form with the shared unsaved-changes guard so switching the
  // top-level Maintenance tabs (owned by MaintenancePage, above this form) also
  // warns before discarding changes — re-registered every render so the guard
  // always calls back into the latest persist()/isDirty, not a stale closure.
  const { setGuard } = useUnsavedChangesGuard();
  React.useEffect(() => {
    setGuard({ isDirty, onSave: persist });
    return () => setGuard(null);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
      <div className={pageStyles.breadcrumb}>
        <button className={pageStyles.breadcrumbLink} onClick={requestBack}>Maintenance</button>
        <IconChevronRight size={12} />
        <button className={pageStyles.breadcrumbLink} onClick={requestBack}>Services</button>
        <IconChevronRight size={12} />
        <span>{isEdit ? service!.name : 'New service'}</span>
      </div>

      <div className={pageStyles.detailHeader}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          onClick={requestBack}
          styles={{ root: { color: 'var(--fv-text-secondary)' } }}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <h2 className={pageStyles.detailTitle}>{isEdit ? service!.name : 'New service'}</h2>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px 24px' }}>
        <div className={pageStyles.planCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Group gap={12}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--mantine-color-green-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <IconTool size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Service</div>
              <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>
                {isEdit ? `Created ${formatDateTime(service!.creationDate)}` : 'New maintenance service'}
              </div>
            </div>
          </Group>
          <Group gap={8}>
            <Badge color={PRIORITY_COLORS[form.values.priority]} variant="outline" radius="xl" leftSection={<IconFlag size={11} />}>
              {PRIORITY_LABELS[form.values.priority]}
            </Badge>
            <Badge color={STATUS_COLORS[form.values.status]} variant="outline" radius="xl">
              {STATUS_LABELS[form.values.status]}
            </Badge>
            {isDirty && (
              <Badge color="orange" variant="outline" radius="xl" leftSection={<IconAlertTriangle size={11} />}>
                Unsaved changes
              </Badge>
            )}
          </Group>
        </div>jpshankari

        <SimpleGrid cols={3} spacing="md" style={{ alignItems: 'start' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <Card withBorder mb="md">
              <Text fw={600} mb="md">Service details</Text>

              <DateInput
                label="Date of service"
                placeholder="Select date"
                required
                mb="md"
                leftSection={<IconCalendar size={14} />}
                value={form.values.dateOfService ? new Date(form.values.dateOfService) : null}
                onChange={val => form.setFieldValue('dateOfService', val ? new Date(val as any).toISOString() : null)}
                error={!form.values.dateOfService ? 'Required' : undefined}
              />

              <Select
                label="Vehicle"
                placeholder="Select vehicle"
                required
                mb="md"
                data={vehicles.map(v => ({ value: v.id, label: `${v.name} — ${v.plate}` }))}
                value={form.values.vehicleId || null}
                onChange={val => form.setFieldValue('vehicleId', val || '')}
                error={!form.values.vehicleId ? 'Vehicle is required' : undefined}
              />

              <Select
                label="Service plan"
                placeholder="Select service plan"
                mb="md"
                clearable
                data={servicePlans.map(p => ({ value: p.id, label: p.name }))}
                value={form.values.servicePlanId}
                onChange={handlePlanChange}
              />

              <TextInput
                label="Name"
                placeholder="Service name (required)"
                required
                mb="md"
                leftSection={<IconTool size={14} />}
                {...form.getInputProps('name')}
              />

              <Group grow mb="md">
                <Select
                  label="Priority"
                  data={PRIORITY_OPTIONS.map(p => ({ value: p, label: PRIORITY_LABELS[p] }))}
                  {...form.getInputProps('priority')}
                />
                <Select
                  label="Status"
                  data={STATUS_OPTIONS.map(s => ({ value: s, label: STATUS_LABELS[s] }))}
                  {...form.getInputProps('status')}
                />
              </Group>

              <Group align="flex-end" gap={6} wrap="nowrap" mb="md">
                <NumberInput
                  label="Cost"
                  placeholder="0.00"
                  decimalScale={2}
                  fixedDecimalScale
                  leftSection={<IconCurrencyDollar size={14} />}
                  style={{ flex: 1 }}
                  value={form.values.cost === '' ? '' : Number(form.values.cost)}
                  onChange={val => form.setFieldValue('cost', val === '' ? '' : String(val))}
                />
                <Tooltip label="Recalculate from service items used">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={() => form.setFieldValue('cost', computeCost().toFixed(2))}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <DateInput
                label="Deadline"
                placeholder="Select deadline"
                mb="md"
                clearable
                leftSection={<IconCalendar size={14} />}
                value={form.values.deadline ? new Date(form.values.deadline) : null}
                onChange={val => form.setFieldValue('deadline', val ? new Date(val as any).toISOString() : null)}
              />

              <Textarea
                label="Notes"
                placeholder="Add notes..."
                minRows={3}
                mb="md"
                {...form.getInputProps('notes')}
              />

              <Textarea
                label="Additional properties"
                placeholder="{ }"
                minRows={3}
                styles={{ input: { fontFamily: 'var(--fv-font-mono, monospace)' } }}
                {...form.getInputProps('additionalProperties')}
              />
            </Card>

            <Card withBorder>
              <Group gap={10} mb="xs">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'var(--mantine-color-cyan-6)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconAdjustments size={14} />
                </div>
                <Text fw={600}>Service items used</Text>
                <Tooltip label="Parts/items consumed by this service">
                  <IconInfoCircle size={14} style={{ opacity: 0.5 }} />
                </Tooltip>
              </Group>

              {form.values.usedItems.length === 0 ? (
                <Text size="sm" c="dimmed" mb="md">No items added yet.</Text>
              ) : (
                <>
                  <Group mb={4} gap={10} wrap="nowrap">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ flex: 1 }}>Item</Text>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">Qty</Text>
                    <div style={{ width: 32 }} />
                  </Group>
                  {form.values.usedItems.map((u, index) => (
                    <Group key={u.id} mb={8} gap={10} wrap="nowrap">
                      <Select
                        placeholder="Select item"
                        data={catalogItems.map(i => ({ value: i.id, label: i.name }))}
                        value={u.itemId || null}
                        onChange={val => form.setFieldValue(`usedItems.${index}.itemId`, val || '')}
                        style={{ flex: 1 }}
                        searchable
                      />
                      <NumberInput
                        min={1}
                        value={u.qty}
                        onChange={val => form.setFieldValue(`usedItems.${index}.qty`, val === '' ? 1 : Number(val))}
                        style={{ width: 90 }}
                      />
                      <ActionIcon
                        variant="filled"
                        color="red"
                        radius="xl"
                        onClick={() => form.removeListItem('usedItems', index)}
                      >
                        <IconMinus size={14} />
                      </ActionIcon>
                    </Group>
                  ))}
                </>
              )}

              <Button
                variant="outline"
                color="green"
                fullWidth
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('usedItems', { id: uuidv4(), itemId: '', qty: 1 })}
              >
                Add item
              </Button>
            </Card>
          </div>

          <div>
            <Card withBorder mb="md">
              <Group gap={10} mb="md">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'var(--mantine-color-violet-6)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconAdjustments size={14} />
                </div>
                <Text fw={600}>Service parameters</Text>
              </Group>
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Parameter</Table.Th>
                    <Table.Th>Initial</Table.Th>
                    <Table.Th>Final</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {COUNTER_ORDER.map(type => {
                    const meta = PARAM_META[type];
                    const Icon = meta.icon;
                    const required = isCounterRequired(type);
                    const values = form.values.parameters[type];
                    return (
                      <Table.Tr key={type}>
                        <Table.Td>
                          <Group gap={8} wrap="nowrap">
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                              background: `var(--mantine-color-${meta.color}-light)`,
                              color: `var(--mantine-color-${meta.color}-7)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon size={11} />
                            </div>
                            <div>
                              <Text size="sm" fw={500}>
                                {meta.label}{required && <Text component="span" c="red"> *</Text>}
                              </Text>
                              <Text size="xs" c="dimmed">({meta.unit})</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            size="xs"
                            min={0}
                            style={{ width: 80 }}
                            value={values.initial ?? ''}
                            onChange={val => form.setFieldValue(`parameters.${type}.initial`, val === '' ? null : Number(val))}
                            error={required && values.initial == null ? 'Required' : undefined}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            size="xs"
                            min={0}
                            style={{ width: 80 }}
                            value={values.final ?? ''}
                            onChange={val => form.setFieldValue(`parameters.${type}.final`, val === '' ? null : Number(val))}
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>

            <Card withBorder>
              <Group gap={10} mb="md">
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'var(--mantine-color-green-6)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconUpload size={14} />
                </div>
                <Text fw={600}>Attachments</Text>
              </Group>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFilesSelected}
              />
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconUpload size={14} />}
                mb="md"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
              >
                Upload file
              </Button>
              {form.values.files.length === 0 ? (
                <div style={{ border: '1px dashed var(--fv-border)', borderRadius: 8, padding: '24px 0', textAlign: 'center' }}>
                  <IconUpload size={22} style={{ opacity: 0.3 }} />
                  <Text size="sm" c="dimmed" mt={6}>No attachments yet</Text>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.values.files.map((name, index) => (
                    <Group key={`${name}-${index}`} justify="space-between" wrap="nowrap" style={{
                      border: '1px solid var(--fv-border)', borderRadius: 8, padding: '6px 10px',
                    }}>
                      <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                        <IconFile size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                        <Text size="sm" truncate>{name}</Text>
                      </Group>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleRemoveFile(index)}>
                        <IconX size={13} />
                      </ActionIcon>
                    </Group>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </SimpleGrid>
      </div>

      <div
        className={pageStyles.formFooter}
        style={{
          margin: 0, flexShrink: 0, alignItems: 'center',
          padding: '14px 32px',
          borderTop: '1px solid var(--fv-border)',
          background: 'var(--fv-bg-base)',
        }}
      >
        <Button
          color="green"
          radius="md"
          leftSection={<IconDeviceFloppy size={14} />}
          disabled={!canSave}
          onClick={handleSave}
          style={{ minWidth: 110, fontWeight: 600 }}
        >
          Save
        </Button>
        <Button
          variant="default"
          radius="md"
          onClick={requestBack}
          styles={{
            root: {
              minWidth: 110,
              background: 'var(--fv-bg-panel)',
              border: '1px solid var(--fv-border)',
              color: 'var(--fv-text-secondary)',
            },
          }}
        >
          Cancel
        </Button>
        {isDirty && (
          <Group gap={4} ml={8}>
            <IconAlertTriangle size={13} color="var(--mantine-color-orange-6)" />
            <Text size="xs" c="orange">You have unsaved changes</Text>
          </Group>
        )}
      </div>

      <UnsavedChangesModal
        opened={showUnsavedModal}
        onSave={() => { handleSave(); setShowUnsavedModal(false); }}
        onDiscard={() => { setShowUnsavedModal(false); onBack(); }}
        onCancel={() => setShowUnsavedModal(false)}
      />
    </div>
  );
}
