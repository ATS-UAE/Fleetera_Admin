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
import styles from './MaintenancePage.module.css';

export const PRIORITY_LABELS: Record<ServicePriority, string> = { normal: 'Normal', high: 'High', critical: 'Critical' };
export const PRIORITY_COLORS: Record<ServicePriority, string> = { normal: 'cyan', high: 'orange', critical: 'red' };
export const STATUS_LABELS: Record<ServiceStatus, string> = { todo: 'To do', inprogress: 'In progress', done: 'Done', rejected: 'Rejected' };
export const STATUS_COLORS: Record<ServiceStatus, string> = { todo: 'blue', inprogress: 'grape', done: 'green', rejected: 'red' };

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

  if (view === 'form') {
    return <ServiceFormPage service={editing} onBack={() => { setView('list'); setEditing(null); }} />;
  }

  const isOpenStatus = (s: ServiceItem) => s.status === 'todo' || s.status === 'inprogress';
  const isResolvedStatus = (s: ServiceItem) => s.status === 'done' || s.status === 'rejected';

  const filtered: ServiceItem[] = services.filter((s: ServiceItem) => {
    const matchesFilter = filter === 'open' ? isOpenStatus(s) : isResolvedStatus(s);
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        color="green"
        leftSection={<IconPlus size={14} />}
        onClick={() => { setEditing(null); setView('form'); }}
        mb="md"
      >
        New service
      </Button>

      <div className={styles.planCard} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--mantine-color-green-6)',
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
                <Table.Th>Service</Table.Th>
                <Table.Th>Vehicle</Table.Th>
                <Table.Th>Service plan</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Deadline</Table.Th>
                <Table.Th>Service date</Table.Th>
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
                    <Table.Td>{vehicle ? vehicle.name : '—'}</Table.Td>
                    <Table.Td>{plan ? plan.name : '—'}</Table.Td>
                    <Table.Td>
                      <Badge color={PRIORITY_COLORS[s.priority]} variant="light">{PRIORITY_LABELS[s.priority]}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLORS[s.status]} variant="light">{STATUS_LABELS[s.status]}</Badge>
                    </Table.Td>
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
                    <Table.Td>{formatDate(s.dateOfService)}</Table.Td>
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
