import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextInput, ActionIcon, Badge, Table, Text, Group, ScrollArea,
} from '@mantine/core';
import {
  IconSearch, IconX, IconPlus, IconTrash, IconListDetails,
  IconCar, IconCheck, IconAlertTriangle,
} from '@tabler/icons-react';
import { deleteServicePlan } from '@/store/slices/maintenanceSlice';
import type { ServicePlan, CounterType } from '@/store/slices/maintenanceSlice';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { DeleteConfirmItem } from '@/components/DeleteConfirmModal';
import ServicePlanFormPage from './ServicePlanFormPage';
import { useTableColumns } from '../hooks/useTableColumns';
import ColumnConfigButton from './ColumnConfigButton';
import SortableTh from './SortableTh';
import type { SortState } from './SortableTh';
import TableFilterButton from './TableFilterButton';
import type { FilterDef } from './TableFilterButton';
import styles from './MaintenancePage.module.css';

const COUNTER_ORDER: CounterType[] = ['mileage', 'engineHours', 'days'];
const COUNTER_UNIT: Record<CounterType, string> = { mileage: 'km', engineHours: 'h', days: 'd' };
const COUNTER_LABEL: Record<CounterType, string> = { mileage: 'Mileage', engineHours: 'Engine hours', days: 'Days' };

const COLUMNS = [
  { key: 'frequency', label: 'Frequency' },
  { key: 'autoCreation', label: 'Service auto-creation' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'issues', label: 'Issues' },
];

const FILTER_DEFS: FilterDef[] = [
  { key: 'counters', label: 'Counters', options: COUNTER_ORDER.map(t => ({ value: t, label: COUNTER_LABEL[t] })) },
  { key: 'issues', label: 'Issues', options: [{ value: 'none', label: 'None' }, { value: 'has', label: 'Has issues' }] },
];

function FrequencyCell({ plan }: { plan: ServicePlan }) {
  const active = COUNTER_ORDER.filter(t => plan.counters[t].active && plan.counters[t].frequency != null);
  if (active.length === 0) return <Text c="dimmed" size="sm">—</Text>;
  return (
    <Group gap={6} wrap="wrap">
      {active.map(t => (
        <Badge key={t} variant="light" color="blue" radius="sm">
          {plan.counters[t].frequency} {COUNTER_UNIT[t]}
        </Badge>
      ))}
    </Group>
  );
}

function AutoCreationCell({ plan }: { plan: ServicePlan }) {
  const active = COUNTER_ORDER.filter(t => plan.counters[t].active && plan.counters[t].autoCreation != null);
  if (active.length === 0) return null;
  return (
    <Group gap={6} wrap="wrap">
      {active.map(t => (
        <Badge key={t} color="green" variant="light" leftSection={<IconCheck size={11} />}>
          {plan.counters[t].autoCreation} {COUNTER_UNIT[t]} prior
        </Badge>
      ))}
    </Group>
  );
}

function IssuesCell({ count }: { count: number }) {
  if (count === 0) {
    return (
      <Group gap={6} wrap="nowrap">
        <IconCheck size={14} color="var(--mantine-color-green-6)" />
        <Text size="sm" c="dimmed">None</Text>
      </Group>
    );
  }
  return (
    <Group gap={6} wrap="nowrap">
      <IconAlertTriangle size={14} color="var(--mantine-color-red-6)" />
      <Badge color="red" variant="light" circle>{count}</Badge>
    </Group>
  );
}

export default function ServicePlansView() {
  const dispatch = useDispatch();
  const plans: ServicePlan[] = useSelector((s: any) => s.maintenance.servicePlans);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<ServicePlan | null>(null);
  const [formTab, setFormTab] = useState<'settings' | 'vehicles'>('settings');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DeleteConfirmItem | null; id: string | null }>({ open: false, item: null, id: null });
  const [sort, setSort] = useState<SortState | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const { isVisible, toggle } = useTableColumns('servicePlans');

  const openPlan = (plan: ServicePlan | null, tab: 'settings' | 'vehicles' = 'settings') => {
    setEditing(plan);
    setFormTab(tab);
    setView('form');
  };

  if (view === 'form') {
    return <ServicePlanFormPage plan={editing} initialTab={formTab} onBack={() => { setView('list'); setEditing(null); }} />;
  }

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  let filtered = plans.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const counterFilter = filterValues.counters || [];
    const matchesCounters = counterFilter.length === 0 || counterFilter.some(t => p.counters[t as CounterType]?.active);
    const issuesFilter = filterValues.issues || [];
    const matchesIssues = issuesFilter.length === 0 || issuesFilter.some(v => (v === 'has' ? p.issueCount > 0 : p.issueCount === 0));
    return matchesSearch && matchesCounters && matchesIssues;
  });

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const getVal = (p: ServicePlan) => {
        if (sort.key === 'vehicles') return p.vehicleIds.length;
        if (sort.key === 'issues') return p.issueCount;
        return p.name.toLowerCase();
      };
      const av = getVal(a);
      const bv = getVal(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const requestDelete = (p: ServicePlan) => {
    setDeleteConfirm({ open: true, item: { name: p.name, meta: `${p.vehicleIds.length} vehicles` }, id: p.id });
  };
  const confirmDelete = () => {
    if (deleteConfirm.id) dispatch(deleteServicePlan(deleteConfirm.id));
    setDeleteConfirm({ open: false, item: null, id: null });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px 32px' }}>
      <Button
        leftSection={<IconPlus size={14} />}
        onClick={() => openPlan(null)}
        mb="md"
      >
        New plan
      </Button>

      <div className={styles.planCard} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--fv-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <IconListDetails size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Service plans</div>
          <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>Define maintenance schedules, trigger conditions and auto-creation rules</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text fw={600}>Service plans</Text>
        <Group gap={8}>
          <ColumnConfigButton columns={COLUMNS} isVisible={isVisible} onToggle={toggle} />
          <TableFilterButton
            filters={FILTER_DEFS}
            values={filterValues}
            onChange={(key, val) => setFilterValues(prev => ({ ...prev, [key]: val }))}
          />
          <TextInput
            placeholder="Search service plans..."
            leftSection={<IconSearch size={14} />}
            rightSection={search ? (
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setSearch('')}>
                <IconX size={13} />
              </ActionIcon>
            ) : null}
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            radius="md"
            styles={{
              root: { width: 260 },
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
        </Group>
      </div>

      <div style={{
        border: '1px solid var(--fv-border)',
        borderRadius: 'var(--fv-r-lg, 10px)',
        overflow: 'hidden',
        background: 'var(--fv-bg-panel)',
      }}>
        <ScrollArea.Autosize mah={440} type="auto" offsetScrollbars>
          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="lg"
            stickyHeader
            styles={{
              th: {
                background: 'var(--fv-bg-surface)',
                color: 'var(--fv-text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                borderBottom: '1px solid var(--fv-border)',
              },
              td: {
                fontSize: 13,
                color: 'var(--fv-text-primary)',
                borderBottom: '1px solid var(--fv-border)',
              },
              tr: { transition: 'background var(--fv-trans-fast)' },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <SortableTh label="Service plan" sortKey="name" sort={sort} onSort={handleSort} />
                {isVisible('frequency') && <Table.Th>Frequency</Table.Th>}
                {isVisible('autoCreation') && <Table.Th>Service auto-creation</Table.Th>}
                {isVisible('vehicles') && <SortableTh label="Vehicles" sortKey="vehicles" sort={sort} onSort={handleSort} />}
                {isVisible('issues') && <SortableTh label="Issues" sortKey="issues" sort={sort} onSort={handleSort} />}
                <Table.Th style={{ width: 48 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(plan => (
                <Table.Tr key={plan.id} style={{ cursor: 'pointer' }} onClick={() => openPlan(plan)}>
                  <Table.Td>
                    <Group gap={10} wrap="nowrap">
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--mantine-color-blue-6)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconListDetails size={14} />
                      </div>
                      <span className={styles.serviceName}>{plan.name}</span>
                    </Group>
                  </Table.Td>
                  {isVisible('frequency') && <Table.Td><FrequencyCell plan={plan} /></Table.Td>}
                  {isVisible('autoCreation') && <Table.Td><AutoCreationCell plan={plan} /></Table.Td>}
                  {isVisible('vehicles') && (
                    <Table.Td onClick={e => e.stopPropagation()}>
                      <Group
                        gap={6} wrap="nowrap"
                        style={{ cursor: 'pointer', width: 'fit-content' }}
                        onClick={() => openPlan(plan, 'vehicles')}
                      >
                        <IconCar size={14} color="var(--mantine-color-blue-6)" />
                        <Badge circle variant="outline" color="blue">{plan.vehicleIds.length}</Badge>
                      </Group>
                    </Table.Td>
                  )}
                  {isVisible('issues') && <Table.Td><IssuesCell count={plan.issueCount} /></Table.Td>}
                  <Table.Td onClick={e => e.stopPropagation()}>
                    <ActionIcon variant="subtle" color="red" onClick={() => requestDelete(plan)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
        {filtered.length === 0 && <Text ta="center" c="dimmed" py="xl">No service plans found.</Text>}
      </div>

      <DeleteConfirmModal
        opened={deleteConfirm.open}
        item={deleteConfirm.item}
        entityLabel="Service plan"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, item: null, id: null })}
      />
    </div>
    </div>
  );
}
