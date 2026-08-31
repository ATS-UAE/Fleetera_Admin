import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import {
  Text, Button, Group, Card, TextInput, Select, NumberInput,
  Textarea, Switch, Badge, SimpleGrid, Checkbox, Pill, Table, ActionIcon, ScrollArea,
} from '@mantine/core';
import {
  IconArrowLeft, IconChevronRight, IconSettings, IconCar, IconListDetails,
  IconPlus, IconAlertTriangle, IconGauge, IconClock, IconCalendar, IconDeviceFloppy,
  IconSearch, IconFolder, IconChevronDown, IconTrash, IconX, IconCheck,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import { addServicePlan, updateServicePlan } from '@/store/slices/maintenanceSlice';
import type { ServicePlan, CounterType, CounterConfig, ServicePriority } from '@/store/slices/maintenanceSlice';
import type { Vehicle } from '@/types';
import { groups } from '@/data';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesGuard } from './UnsavedChangesContext';
import pageStyles from './MaintenancePage.module.css';

const DEFAULT_COUNTER: CounterConfig = { active: false, frequency: null, autoCreation: null, notifyWhen: null };

const COUNTER_ORDER: CounterType[] = ['mileage', 'engineHours', 'days'];
// Order used for the Assigned vehicles table + the combined Next Service pill.
const VEHICLE_TABLE_ORDER: CounterType[] = ['days', 'mileage', 'engineHours'];
const COUNTER_META: Record<CounterType, { label: string; icon: TablerIcon; unit: string; pillUnit: string; color: string }> = {
  mileage: { label: 'Mileage, km', icon: IconGauge, unit: 'km', pillUnit: 'km', color: 'grape' },
  engineHours: { label: 'Engine hours, h', icon: IconClock, unit: 'h', pillUnit: 'EH', color: 'orange' },
  days: { label: 'Days', icon: IconCalendar, unit: 'd', pillUnit: 'd', color: 'green' },
};

function CounterIcon({ type, size = 12 }: { type: CounterType; size?: number }) {
  const meta = COUNTER_META[type];
  const Icon = meta.icon;
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      background: `var(--mantine-color-${meta.color}-light)`,
      color: `var(--mantine-color-${meta.color}-7)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={size} />
    </div>
  );
}

const counterInputStyles = (color: string) => ({
  input: {
    background: 'var(--fv-bg-panel)',
    border: '1px solid var(--fv-border)',
    color: 'var(--fv-text-primary)',
    fontSize: 13,
    '&:focus': {
      borderColor: `var(--mantine-color-${color}-6)`,
    },
  },
});

const PRIORITY_OPTIONS: ServicePriority[] = ['normal', 'high', 'critical'];
const PRIORITY_LABELS: Record<ServicePriority, string> = {  normal: 'Normal', high: 'High', critical: 'Critical' };
const PRIORITY_COLORS: Record<ServicePriority, string> = {  normal: 'cyan', high: 'orange', critical: 'red' };

function CounterRow({ type, config, onChange }: {
  type: CounterType; config: CounterConfig; onChange: (updates: Partial<CounterConfig>) => void;
}) {
  const meta = COUNTER_META[type];
  const Icon = meta.icon;

  return (
    <div style={{
      borderLeft: `3px solid ${config.active ? `var(--mantine-color-${meta.color}-6)` : 'transparent'}`,
      paddingLeft: 12, marginBottom: 16,
    }}>
      <Group justify="space-between" mb={config.active ? 10 : 0}>
        <Group gap={10}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: `var(--mantine-color-${meta.color}-light)`, color: `var(--mantine-color-${meta.color}-7)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} />
          </div>
          <Text size="sm" fw={600}>{meta.label}</Text>
        </Group>
        <Group gap={8}>
          {config.active && <Text size="xs" c="green" fw={600}>Active</Text>}
          <Switch
            checked={config.active}
            onChange={e => onChange({ active: e.currentTarget.checked })}
            color="blue"
          />
        </Group>
      </Group>

      {config.active && (
        <Group grow gap={10} align="flex-start">
          <NumberInput
            label={`Frequency (${meta.unit})`}
            required
            placeholder="e.g. 1000"
            min={0}
            value={config.frequency ?? ''}
            onChange={val => onChange({ frequency: val === '' ? null : Number(val) })}
            error={config.frequency == null ? 'Required' : undefined}
          />
          <NumberInput
            label="Auto-creation"
            placeholder="e.g. 50"
            min={0}
            value={config.autoCreation ?? ''}
            onChange={val => onChange({ autoCreation: val === '' ? null : Number(val) })}
            error={
              config.autoCreation != null && config.frequency != null && config.autoCreation >= config.frequency
                ? 'Must be less than frequency'
                : undefined
            }
          />
          <NumberInput
            label={`Notify when (${meta.unit} left)`}
            placeholder="e.g. 100"
            min={0}
            value={config.notifyWhen ?? ''}
            onChange={val => onChange({ notifyWhen: val === '' ? null : Number(val) })}
          />
        </Group>
      )}
    </div>
  );
}

interface ServicePlanFormPageProps {
  plan: ServicePlan | null;
  onBack: () => void;
  initialTab?: 'settings' | 'vehicles';
}

export default function ServicePlanFormPage({ plan, onBack, initialTab }: ServicePlanFormPageProps) {
  const dispatch = useDispatch();
  const isEdit = !!plan;
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const [activeTab, setActiveTab] = React.useState<'settings' | 'vehicles'>(initialTab || 'settings');
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [vehicleSearch, setVehicleSearch] = React.useState('');

  const form = useForm({
    initialValues: {
      name: plan?.name || '',
      // Cloned rather than reused directly — Redux Toolkit deep-freezes state in
      // development, and Mantine's nested setFieldValue mutates in place, so
      // toggling a counter would silently fail against the frozen plan object.
      counters: {
        mileage: { ...(plan?.counters.mileage || DEFAULT_COUNTER) },
        engineHours: { ...(plan?.counters.engineHours || DEFAULT_COUNTER) },
        days: { ...(plan?.counters.days || DEFAULT_COUNTER) },
      },
      defaultPriority: plan?.defaultPriority || 'normal' as ServicePriority,
      daysToComplete: plan?.daysToComplete ?? null,
      defaultNotes: plan?.defaultNotes || '',
      vehicleIds: plan?.vehicleIds || [],
      lastMileageByVehicle: plan?.lastMileageByVehicle || {} as Record<string, number>,
      lastEngineHoursByVehicle: plan?.lastEngineHoursByVehicle || {} as Record<string, number>,
      lastServiceDateByVehicle: plan?.lastServiceDateByVehicle || {} as Record<string, string>,
    },
  });

  const vehiclesByGroup = (groupId: string) => vehicles.filter(v => v.groupId === groupId);

  const isSearchingVehicles = vehicleSearch.trim().length > 0;
  const matchesVehicleSearch = (v: Vehicle) => {
    const q = vehicleSearch.trim().toLowerCase();
    return v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q);
  };
  const visibleGroups = groups
    .map(group => ({ group, vehicles: vehiclesByGroup(group.id).filter(v => !isSearchingVehicles || matchesVehicleSearch(v)) }))
    .filter(({ vehicles: gv }) => !isSearchingVehicles || gv.length > 0);

  const toggleVehicle = (id: string) => {
    const cur = form.values.vehicleIds;
    form.setFieldValue('vehicleIds', cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  };

  const toggleGroup = (groupId: string) => {
    const groupVehicleIds = vehiclesByGroup(groupId).map(v => v.id);
    const allSelected = groupVehicleIds.every(id => form.values.vehicleIds.includes(id));
    form.setFieldValue(
      'vehicleIds',
      allSelected
        ? form.values.vehicleIds.filter(id => !groupVehicleIds.includes(id))
        : Array.from(new Set([...form.values.vehicleIds, ...groupVehicleIds]))
    );
  };

  const hasActiveCounter = COUNTER_ORDER.some(t => form.values.counters[t].active);
  const activeCountersValid = COUNTER_ORDER.every(t => {
    const c = form.values.counters[t];
    if (!c.active) return true;
    if (c.frequency == null) return false;
    if (c.autoCreation != null && c.autoCreation >= c.frequency) return false;
    return true;
  });
  const canSave = !!form.values.name.trim() && hasActiveCounter && activeCountersValid;
  const isDirty = form.isDirty();
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);

  const requestBack = () => {
    if (isDirty) setShowUnsavedModal(true);
    else onBack();
  };

  const persist = () => {
    if (!canSave) return;
    const values = form.values;
    if (isEdit && plan) {
      dispatch(updateServicePlan({ id: plan.id, updates: values }));
    } else {
      dispatch(addServicePlan({ ...values, issueCount: 0 }));
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
        <button className={pageStyles.breadcrumbLink} onClick={requestBack}>Service plans</button>
        <IconChevronRight size={12} />
        <span>{isEdit ? plan!.name : 'New service plan'}</span>
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
        <h2 className={pageStyles.detailTitle}>{isEdit ? plan!.name : 'New service plan'}</h2>
      </div>

      <div className={pageStyles.detailTabs}>
        <button
          className={`${pageStyles.detailTab} ${activeTab === 'settings' ? pageStyles.detailTabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconSettings size={14} />
            Settings
          </span>
        </button>
        <button
          className={`${pageStyles.detailTab} ${activeTab === 'vehicles' ? pageStyles.detailTabActive : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconCar size={14} />
            Vehicles
          </span>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px 24px' }}>
        <div className={pageStyles.planCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Group gap={12}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--mantine-color-green-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <IconListDetails size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{isEdit ? plan!.name : 'New service plan'}</div>
              <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>Configure counters, auto-creation triggers and service defaults</div>
            </div>
          </Group>
          <Group gap={8}>
            {!isEdit && (
              <Badge color="green" variant="outline" radius="xl" leftSection={<IconPlus size={11} />}>
                New plan
              </Badge>
            )}
            {isDirty && (
              <Badge color="orange" variant="outline" radius="xl" leftSection={<IconAlertTriangle size={11} />}>
                Unsaved changes
              </Badge>
            )}
          </Group>
        </div>

        {activeTab === 'settings' ? (
          <SimpleGrid cols={2} spacing="md" style={{ alignItems: 'start' }}>
            <div>
              <Card withBorder mb="md">
                <Text fw={600} mb="md">Plan details</Text>
                <TextInput
                  label="Plan name"
                  placeholder="Plan name (required)"
                  required
                  {...form.getInputProps('name')}
                />
              </Card>

              <Card withBorder>
                <Group justify="space-between" mb="md">
                  <Text fw={600}>Service counters</Text>
                  <Text size="xs" c={hasActiveCounter ? 'dimmed' : 'red'}>Enable at least one</Text>
                </Group>
                {COUNTER_ORDER.map(type => (
                  <CounterRow
                    key={type}
                    type={type}
                    config={form.values.counters[type]}
                    onChange={updates => form.setFieldValue(`counters.${type}`, { ...form.values.counters[type], ...updates })}
                  />
                ))}
              </Card>
            </div>

            <div>
              <Card withBorder>
                <Text fw={600} mb="md">Service preset</Text>
                <Group align="flex-end" mb="md" gap={10} wrap="nowrap">
                  <Select
                    label="Default priority"
                    data={PRIORITY_OPTIONS.map(p => ({ value: p, label: PRIORITY_LABELS[p] }))}
                    style={{ flex: 1 }}
                    {...form.getInputProps('defaultPriority')}
                  />
                  <Badge color={PRIORITY_COLORS[form.values.defaultPriority]} variant="outline" size="lg" radius="xl" style={{ marginBottom: 2 }}>
                    {PRIORITY_LABELS[form.values.defaultPriority]}
                  </Badge>
                </Group>
                <NumberInput
                  label="Days to complete"
                  placeholder="e.g. 7"
                  min={0}
                  description="Auto-calculates deadline when a service is created"
                  mb="md"
                  {...form.getInputProps('daysToComplete')}
                />
                <Textarea
                  label="Notes"
                  placeholder="Default notes for new services..."
                  minRows={4}
                  {...form.getInputProps('defaultNotes')}
                />
              </Card>
            </div>
          </SimpleGrid>
        ) : (
          <>
            <Card withBorder mb="md">
              <Group justify="space-between" mb="md">
                <Group gap={10}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--mantine-color-green-6)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconCar size={16} />
                  </div>
                  <Text fw={600}>Select vehicles</Text>
                </Group>
                <Badge color="green" variant="light" radius="xl">
                  {form.values.vehicleIds.length} selected
                </Badge>
              </Group>

              {form.values.vehicleIds.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={6}>Selected</Text>
                  <Group gap={6}>
                    {form.values.vehicleIds.map(id => {
                      const v = vehicles.find(x => x.id === id);
                      if (!v) return null;
                      return (
                        <Pill key={id} withRemoveButton onRemove={() => toggleVehicle(id)}>
                          {v.name}
                        </Pill>
                      );
                    })}
                  </Group>
                </div>
              )}

              <TextInput
                placeholder="Search vehicles by name or plate..."
                leftSection={<IconSearch size={14} />}
                rightSection={vehicleSearch ? (
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setVehicleSearch('')}>
                    <IconX size={13} />
                  </ActionIcon>
                ) : null}
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.currentTarget.value)}
                radius="md"
                mb={10}
                styles={{
                  input: {
                    background: 'var(--fv-bg-panel)',
                    border: '1px solid var(--fv-border)',
                    color: 'var(--fv-text-primary)',
                    height: 36,
                    fontSize: 13,
                  },
                  section: { color: 'var(--fv-text-muted)' },
                }}
              />

              <div style={{
                border: '1px solid var(--fv-border)',
                borderRadius: 'var(--fv-r-lg, 10px)',
                background: 'var(--fv-bg-panel)',
                overflow: 'hidden',
              }}>
                <ScrollArea.Autosize mah={280} type="auto" offsetScrollbars>
                  <div style={{ padding: 6 }}>
                    {visibleGroups.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center" py="md">No vehicles match "{vehicleSearch}".</Text>
                    ) : visibleGroups.map(({ group, vehicles: groupVehicles }) => {
                      const allGroupVehicles = vehiclesByGroup(group.id);
                      const selectedCount = allGroupVehicles.filter(v => form.values.vehicleIds.includes(v.id)).length;
                      const expanded = isSearchingVehicles || !!expandedGroups[group.id];
                      return (
                        <div key={group.id}>
                          <Group gap={8} py={6} px={6} wrap="nowrap" style={{ borderRadius: 6 }}>
                            <ActionIcon
                              variant="subtle" color="gray" size="sm"
                              onClick={() => setExpandedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                            >
                              {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                            </ActionIcon>
                            <Checkbox
                              checked={allGroupVehicles.length > 0 && selectedCount === allGroupVehicles.length}
                              indeterminate={selectedCount > 0 && selectedCount < allGroupVehicles.length}
                              onChange={() => toggleGroup(group.id)}
                            />
                            <IconFolder size={14} style={{ opacity: 0.6 }} />
                            <Text size="sm" fw={500}>{group.name}</Text>
                            <Text size="xs" c="dimmed">({allGroupVehicles.length})</Text>
                          </Group>
                          {expanded && groupVehicles.map(v => {
                            const checked = form.values.vehicleIds.includes(v.id);
                            return (
                              <Group
                                key={v.id} gap={8} py={4} px={6} pl={54} wrap="nowrap"
                                style={{
                                  borderRadius: 6,
                                  background: checked ? 'var(--mantine-color-green-light)' : undefined,
                                }}
                              >
                                <Checkbox checked={checked} onChange={() => toggleVehicle(v.id)} />
                                <IconCar size={13} style={{ opacity: 0.6 }} />
                                <Text size="sm">{v.name} — {v.plate}</Text>
                              </Group>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea.Autosize>
              </div>
            </Card>

            <Card withBorder>
              <Group gap={10} mb="md">
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'var(--mantine-color-green-6)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconCar size={16} />
                </div>
                <Text fw={600}>Assigned vehicles</Text>
                <Badge circle color="blue" variant="outline">{form.values.vehicleIds.length}</Badge>
              </Group>

              {form.values.vehicleIds.length === 0 ? (
                <Text size="sm" c="dimmed">No vehicles assigned yet.</Text>
              ) : (
                <Table
                  verticalSpacing="sm"
                  styles={{
                    th: {
                      background: 'var(--fv-bg-surface)',
                      color: 'var(--fv-text-secondary)',
                      fontSize: 12,
                      fontWeight: 600,
                      borderBottom: '1px solid var(--fv-border)',
                    },
                    td: {
                      borderBottom: '1px solid var(--fv-border)',
                    },
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Vehicle</Table.Th>
                      {VEHICLE_TABLE_ORDER.filter(t => form.values.counters[t].active).map(t => (
                        <Table.Th key={t}>
                          {t === 'days' ? 'Last service date' : t === 'mileage' ? 'Last mileage' : 'Last engine hours'}
                        </Table.Th>
                      ))}
                      <Table.Th>Next service</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.vehicleIds.map(id => {
                      const v = vehicles.find(x => x.id === id);
                      if (!v) return null;

                      const mileageCounter = form.values.counters.mileage;
                      const engineHoursCounter = form.values.counters.engineHours;
                      const daysCounter = form.values.counters.days;

                      const lastMileage = form.values.lastMileageByVehicle[id];
                      const lastEngineHours = form.values.lastEngineHoursByVehicle[id];
                      const lastServiceDate = form.values.lastServiceDateByVehicle[id];

                      const nextServiceSegments: { unit: string; left: number }[] = [];
                      if (daysCounter.active && daysCounter.frequency != null && lastServiceDate) {
                        const base = new Date(lastServiceDate);
                        if (!isNaN(base.getTime())) {
                          const elapsedDays = Math.floor((Date.now() - base.getTime()) / (1000 * 60 * 60 * 24));
                          nextServiceSegments.push({ unit: COUNTER_META.days.pillUnit, left: daysCounter.frequency - elapsedDays });
                        }
                      }
                      if (mileageCounter.active && mileageCounter.frequency != null && lastMileage != null) {
                        nextServiceSegments.push({ unit: COUNTER_META.mileage.pillUnit, left: mileageCounter.frequency - lastMileage });
                      }
                      if (engineHoursCounter.active && engineHoursCounter.frequency != null && lastEngineHours != null) {
                        nextServiceSegments.push({ unit: COUNTER_META.engineHours.pillUnit, left: engineHoursCounter.frequency - lastEngineHours });
                      }
                      const hasOverdue = nextServiceSegments.some(s => s.left < 0);

                      return (
                        <Table.Tr key={id}>
                          <Table.Td>
                            <Group gap={8} wrap="nowrap">
                              <div style={{
                                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                                background: 'var(--mantine-color-green-6)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <IconCar size={12} />
                              </div>
                              <Text size="sm">{v.name}</Text>
                            </Group>
                          </Table.Td>

                          {daysCounter.active && (
                            <Table.Td>
                              <DateInput
                                placeholder="Select date"
                                size="xs"
                                radius="md"
                                leftSection={<CounterIcon type="days" size={11} />}
                                style={{ width: 140 }}
                                styles={counterInputStyles('green')}
                                value={lastServiceDate ? new Date(lastServiceDate) : null}
                                onChange={val => {
                                  const updated = { ...form.values.lastServiceDateByVehicle };
                                  if (val) updated[id] = new Date(val as any).toISOString();
                                  else delete updated[id];
                                  form.setFieldValue('lastServiceDateByVehicle', updated);
                                }}
                              />
                            </Table.Td>
                          )}

                          {mileageCounter.active && (
                            <Table.Td>
                              <NumberInput
                                placeholder="0"
                                value={lastMileage ?? ''}
                                min={0}
                                size="xs"
                                radius="md"
                                leftSection={<CounterIcon type="mileage" size={11} />}
                                rightSection={<Text size="xs" c="dimmed" pr={2}>km</Text>}
                                rightSectionWidth={36}
                                style={{ width: 130 }}
                                styles={counterInputStyles('grape')}
                                onChange={val => {
                                  const updated = { ...form.values.lastMileageByVehicle };
                                  if (val === '') delete updated[id];
                                  else updated[id] = Number(val);
                                  form.setFieldValue('lastMileageByVehicle', updated);
                                }}
                              />
                            </Table.Td>
                          )}

                          {engineHoursCounter.active && (
                            <Table.Td>
                              <NumberInput
                                placeholder="0"
                                value={lastEngineHours ?? ''}
                                min={0}
                                size="xs"
                                radius="md"
                                leftSection={<CounterIcon type="engineHours" size={11} />}
                                rightSection={<Text size="xs" c="dimmed" pr={2}>h</Text>}
                                rightSectionWidth={30}
                                style={{ width: 120 }}
                                styles={counterInputStyles('orange')}
                                onChange={val => {
                                  const updated = { ...form.values.lastEngineHoursByVehicle };
                                  if (val === '') delete updated[id];
                                  else updated[id] = Number(val);
                                  form.setFieldValue('lastEngineHoursByVehicle', updated);
                                }}
                              />
                            </Table.Td>
                          )}

                          <Table.Td>
                            {nextServiceSegments.length > 0 ? (
                              <Badge
                                color={hasOverdue ? 'red' : 'green'}
                                variant="light"
                                radius="sm"
                                leftSection={hasOverdue ? <IconAlertTriangle size={11} /> : <IconCheck size={11} />}
                              >
                                {nextServiceSegments.map(s => `${s.left.toLocaleString()} ${s.unit} left`).join(' · ')}
                              </Badge>
                            ) : (
                              <Badge color="gray" variant="light">Insufficient data</Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon variant="subtle" color="red" onClick={() => toggleVehicle(id)}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}
            </Card>
          </>
        )}
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
