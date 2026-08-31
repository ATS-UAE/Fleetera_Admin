import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextInput, ActionIcon, Badge, Table, Text, Group, ScrollArea } from '@mantine/core';
import { IconSearch, IconX, IconPlus, IconTrash, IconTool, IconAlertTriangle } from '@tabler/icons-react';
import { deleteService, setMaintenanceFilter, setMaintenanceSearch } from '@/store/slices/maintenanceSlice';
import type { ServiceItem, ServicePlan, ServicePriority, ServiceStatus } from '@/store/slices/maintenanceSlice';
import type { Vehicle } from '@/types';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { DeleteConfirmItem } from '@/components/DeleteConfirmModal';
import ServiceFormPage from './ServiceFormPage';
import { useTableColumns } from '../hooks/useTableColumns';
import ColumnConfigButton from './ColumnConfigButton';
import SortableTh from './SortableTh';
import type { SortState } from './SortableTh';
import TableFilterButton from './TableFilterButton';
import styles from './MaintenancePage.module.css';

export const PRIORITY_LABELS: Record<ServicePriority, string> = { normal: 'Normal', high: 'High', critical: 'Critical' };
export const PRIORITY_COLORS: Record<ServicePriority, string> = { normal: 'cyan', high: 'orange', critical: 'red' };
export const STATUS_LABELS: Record<ServiceStatus, string> = { todo: 'To do', inprogress: 'In progress', done: 'Done', rejected: 'Rejected' };
export const STATUS_COLORS: Record<ServiceStatus, string> = { todo: 'blue', inprogress: 'grape', done: 'green', rejected: 'red' };

const COLUMNS = [
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'plan', label: 'Service plan' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'serviceDate', label: 'Service date' },
];

const FILTER_DEFS = [
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function isOverdue(deadline: string | null): boolean {
  return !!deadline && new Date(deadline).getTime() < Date.now();
}

export default function ServicesView() {
  const dispatch = useDispatch();
  const { services, filter, search } = useSelector((s: any) => s.maintenance);
  const servicePlans: ServicePlan[] = useSelector((s: any) => s.maintenance.servicePlans);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DeleteConfirmItem | null; id: string | null }>({ open: false, item: null, id: null });
  const [sort, setSort] = useState<SortState | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const { isVisible, toggle } = useTableColumns('services');

  if (view === 'form') {
    return <ServiceFormPage service={editing} onBack={() => { setView('list'); setEditing(null); }} />;
  }

  const isOpenStatus = (s: ServiceItem) => s.status === 'todo' || s.status === 'inprogress';
  const isResolvedStatus = (s: ServiceItem) => s.status === 'done' || s.status === 'rejected';

  const getSortValue = (s: ServiceItem, key: string): string | number => {
    switch (key) {
      case 'name': return s.name.toLowerCase();
      case 'vehicle': { const v = vehicles.find(v => v.id === s.vehicleId); return v ? v.name.toLowerCase() : ''; }
      case 'plan': { const p = servicePlans.find(p => p.id === s.servicePlanId); return p ? p.name.toLowerCase() : ''; }
      case 'priority': return s.priority;
      case 'status': return s.status;
      case 'deadline': return s.deadline ? new Date(s.deadline).getTime() : Infinity;
      case 'serviceDate': return s.dateOfService ? new Date(s.dateOfService).getTime() : 0;
      default: return '';
    }
  };

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  let filtered: ServiceItem[] = services.filter((s: ServiceItem) => {
    const matchesFilter = filter === 'open' ? isOpenStatus(s) : isResolvedStatus(s);
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !filterValues.priority?.length || filterValues.priority.includes(s.priority);
    return matchesFilter && matchesSearch && matchesPriority;
  });

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const av = getSortValue(a, sort.key);
      const bv = getSortValue(b, sort.key);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const requestDelete = (s: ServiceItem) => {
    setDeleteConfirm({ open: true, item: { name: s.name, meta: STATUS_LABELS[s.status] }, id: s.id });
  };
  const confirmDelete = () => {
    if (deleteConfirm.id) dispatch(deleteService(deleteConfirm.id));
    setDeleteConfirm({ open: false, item: null, id: null });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px 32px' }}>
      <Button
        leftSection={<IconPlus size={14} />}
        onClick={() => { setEditing(null); setView('form'); }}
        mb="md"
      >
        New service
      </Button>

      <div className={styles.planCard} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--fv-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <IconTool size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Services</div>
          <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>Track and manage vehicle maintenance services</div>
        </div>
      </div>

      <div className={styles.filterBtnGroup} style={{ marginBottom: 16, width: 'fit-content' }}>
        <button
          className={`${styles.filterBtn} ${filter === 'open' ? styles.filterBtnActive : ''}`}
          onClick={() => dispatch(setMaintenanceFilter('open'))}
        >
          Open
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'resolved' ? styles.filterBtnActive : ''}`}
          onClick={() => dispatch(setMaintenanceFilter('resolved'))}
        >
          Resolved
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text fw={600}>Services</Text>
        <Group gap={8}>
          <TableFilterButton filters={FILTER_DEFS} values={filterValues} onChange={(k, v) => setFilterValues(prev => ({ ...prev, [k]: v }))} />
          <ColumnConfigButton columns={COLUMNS} isVisible={isVisible} onToggle={toggle} />
          <TextInput
            placeholder="Search services..."
            leftSection={<IconSearch size={14} />}
            rightSection={search ? (
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => dispatch(setMaintenanceSearch(''))}>
                <IconX size={13} />
              </ActionIcon>
            ) : null}
            value={search}
            onChange={e => dispatch(setMaintenanceSearch(e.currentTarget.value))}
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
                <SortableTh label="Service" sortKey="name" sort={sort} onSort={handleSort} />
                {isVisible('vehicle') && <SortableTh label="Vehicle" sortKey="vehicle" sort={sort} onSort={handleSort} />}
                {isVisible('plan') && <SortableTh label="Service plan" sortKey="plan" sort={sort} onSort={handleSort} />}
                {isVisible('priority') && <SortableTh label="Priority" sortKey="priority" sort={sort} onSort={handleSort} />}
                {isVisible('status') && <SortableTh label="Status" sortKey="status" sort={sort} onSort={handleSort} />}
                {isVisible('deadline') && <SortableTh label="Deadline" sortKey="deadline" sort={sort} onSort={handleSort} />}
                {isVisible('serviceDate') && <SortableTh label="Service date" sortKey="serviceDate" sort={sort} onSort={handleSort} />}
                <Table.Th style={{ width: 48 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(s => {
                const vehicle = vehicles.find(v => v.id === s.vehicleId);
                const plan = servicePlans.find(p => p.id === s.servicePlanId);
                const overdue = isOverdue(s.deadline);
                return (
                  <Table.Tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => { setEditing(s); setView('form'); }}>
                    <Table.Td>
                      <Group gap={10} wrap="nowrap">
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--mantine-color-blue-6)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <IconTool size={13} />
                        </div>
                        <span className={styles.serviceName}>{s.name}</span>
                      </Group>
                    </Table.Td>
                    {isVisible('vehicle') && <Table.Td>{vehicle ? vehicle.name : '—'}</Table.Td>}
                    {isVisible('plan') && <Table.Td>{plan ? plan.name : '—'}</Table.Td>}
                    {isVisible('priority') && (
                      <Table.Td>
                        <Badge color={PRIORITY_COLORS[s.priority]} variant="light">{PRIORITY_LABELS[s.priority]}</Badge>
                      </Table.Td>
                    )}
                    {isVisible('status') && (
                      <Table.Td>
                        <Badge color={STATUS_COLORS[s.status]} variant="light">{STATUS_LABELS[s.status]}</Badge>
                      </Table.Td>
                    )}
                    {isVisible('deadline') && (
                      <Table.Td>
                        {s.deadline ? (
                          <Group gap={4} wrap="nowrap">
                            {overdue && <IconAlertTriangle size={13} color="var(--mantine-color-red-6)" />}
                            <Text size="sm" c={overdue ? 'red' : undefined} fw={overdue ? 600 : undefined}>
                              {formatDate(s.deadline)}
                            </Text>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    )}
                    {isVisible('serviceDate') && <Table.Td>{formatDate(s.dateOfService)}</Table.Td>}
                    <Table.Td onClick={e => e.stopPropagation()}>
                      <ActionIcon variant="subtle" color="red" onClick={() => requestDelete(s)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
        {filtered.length === 0 && <Text ta="center" c="dimmed" py="xl">No services found.</Text>}
      </div>

      <DeleteConfirmModal
        opened={deleteConfirm.open}
        item={deleteConfirm.item}
        entityLabel="Service"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, item: null, id: null })}
      />
    </div>
    </div>
  );
}
