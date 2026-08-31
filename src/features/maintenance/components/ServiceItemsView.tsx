import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextInput, ActionIcon, Badge, Table, Text, Group, MultiSelect, ScrollArea,
} from '@mantine/core';
import {
  IconSearch, IconFilter, IconX,
  IconTrash, IconPlus, IconAlertTriangle, IconBuildingWarehouse, IconBoxSeam,
} from '@tabler/icons-react';
import { deleteServiceItem, setServiceItemWorkshopFilter, getAvailableQty } from '@/store/slices/maintenanceSlice';
import type { ServiceItemEntry, Workshop } from '@/store/slices/maintenanceSlice';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { DeleteConfirmItem } from '@/components/DeleteConfirmModal';
import ServiceItemFormModal from './ServiceItemFormModal';
import { useTableColumns } from '../hooks/useTableColumns';
import ColumnConfigButton from './ColumnConfigButton';
import SortableTh from './SortableTh';
import type { SortState } from './SortableTh';
import TableFilterButton from './TableFilterButton';
import type { FilterDef } from './TableFilterButton';
import styles from './MaintenancePage.module.css';

const TYPE_FILTER: FilterDef[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Part', label: 'Part' }, { value: 'Labour', label: 'Labour' }] },
];

function WorkshopCell({ workshop }: { workshop: Workshop | undefined }) {
  if (!workshop) {
    return (
      <Badge color="orange" variant="light" leftSection={<IconAlertTriangle size={11} />}>
        Not available
      </Badge>
    );
  }
  return (
    <Badge color="blue" variant="light" leftSection={<IconBuildingWarehouse size={11} />}>
      {workshop.name}
    </Badge>
  );
}

interface ServiceItemsViewProps {
  /** When set, scopes this view to one workshop's items and locks the
   * Workshop field on create/edit, instead of using the global Redux filter. */
  workshopId?: string | null;
  /** When true, drops this view's own outer padding — used when embedded
   * inside a page that already provides padding (e.g. WorkshopFormPage). */
  embedded?: boolean;
}

const COLUMNS_BASE = [
  { key: 'type', label: 'Type' },
  { key: 'unit', label: 'Unit' },
  { key: 'available', label: 'Available' },
];
const WORKSHOP_COLUMN = { key: 'workshop', label: 'Workshop' };

export default function ServiceItemsView({ workshopId, embedded }: ServiceItemsViewProps = {}) {
  const dispatch = useDispatch();
  const { serviceItems, workshops, serviceItemWorkshopFilter } = useSelector((s: any) => s.maintenance);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItemEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DeleteConfirmItem | null; id: string | null }>({ open: false, item: null, id: null });
  const [sort, setSort] = useState<SortState | null>(null);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const { isVisible, toggle } = useTableColumns('serviceItems');

  const COLUMNS = workshopId ? COLUMNS_BASE : [...COLUMNS_BASE, WORKSHOP_COLUMN];

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const workshopOptions = workshops.map((w: Workshop) => ({ value: w.id, label: w.name }));

  let filtered: ServiceItemEntry[] = serviceItems.filter((si: ServiceItemEntry) => {
    const matchesWorkshop = workshopId
      ? si.workshopId === workshopId
      : (serviceItemWorkshopFilter.length === 0 ||
          (si.workshopId && serviceItemWorkshopFilter.includes(si.workshopId)));
    const matchesSearch = !search || si.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter.length === 0 || typeFilter.includes(si.type);
    return matchesWorkshop && matchesSearch && matchesType;
  });

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const getVal = (si: ServiceItemEntry) => {
        if (sort.key === 'available') return getAvailableQty(si);
        if (sort.key === 'workshop') return workshops.find((w: Workshop) => w.id === si.workshopId)?.name || '';
        return (si as any)[sort.key] ?? '';
      };
      const av = getVal(a);
      const bv = getVal(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      const as = av.toString().toLowerCase();
      const bs = bv.toString().toLowerCase();
      if (as < bs) return sort.dir === 'asc' ? -1 : 1;
      if (as > bs) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const requestDelete = (item: ServiceItemEntry) => {
    setDeleteConfirm({ open: true, item: { name: item.name, meta: `${item.type} · ${getAvailableQty(item)} ${item.unit}` }, id: item.id });
  };
  const confirmDelete = () => {
    if (deleteConfirm.id) dispatch(deleteServiceItem(deleteConfirm.id));
    setDeleteConfirm({ open: false, item: null, id: null });
  };

  return (
    <div style={embedded ? undefined : { display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
    <div style={embedded ? undefined : { flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px 32px' }}>
      <Button
        leftSection={<IconPlus size={14} />}
        onClick={() => { setEditing(null); setFormOpen(true); }}
        mb="md"
      >
        New service item
      </Button>

      {!workshopId && (
        <div className={styles.planCard} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'var(--fv-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <IconBoxSeam size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Service items</div>
            <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>Track parts and stock available across your workshops</div>
          </div>
        </div>
      )}

      {!workshopId && (
        <div className={styles.planCard} style={{ marginBottom: 20, maxWidth: 420 }}>
          <Group mb={10} gap={8}>
            <ActionIcon variant="filled" radius="sm" size="sm">
              <IconFilter size={12} />
            </ActionIcon>
            <Text fw={600} size="sm">Filter by workshop</Text>
          </Group>
          <MultiSelect
            placeholder="All workshops"
            data={workshopOptions}
            value={serviceItemWorkshopFilter}
            onChange={val => dispatch(setServiceItemWorkshopFilter(val))}
            searchable
            clearable
            size="sm"
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text fw={600}>Service items</Text>
        <Group gap={8}>
          <ColumnConfigButton columns={COLUMNS} isVisible={isVisible} onToggle={toggle} />
          <TableFilterButton
            filters={TYPE_FILTER}
            values={{ type: typeFilter }}
            onChange={(_key, val) => setTypeFilter(val)}
          />
          <TextInput
            placeholder="Search service items..."
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
                <SortableTh label="Name" sortKey="name" sort={sort} onSort={handleSort} />
                {isVisible('type') && <SortableTh label="Type" sortKey="type" sort={sort} onSort={handleSort} />}
                {isVisible('unit') && <SortableTh label="Unit" sortKey="unit" sort={sort} onSort={handleSort} />}
                {isVisible('available') && <SortableTh label="Available" sortKey="available" sort={sort} onSort={handleSort} />}
                {!workshopId && isVisible('workshop') && <SortableTh label="Workshop" sortKey="workshop" sort={sort} onSort={handleSort} />}
                <Table.Th style={{ width: 48 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(item => {
                const workshop = workshops.find((w: Workshop) => w.id === item.workshopId);
                return (
                  <Table.Tr
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setEditing(item); setFormOpen(true); }}
                  >
                    <Table.Td>{item.name}</Table.Td>
                    {isVisible('type') && <Table.Td><Badge variant="light" color="gray">{item.type}</Badge></Table.Td>}
                    {isVisible('unit') && <Table.Td>{item.unit || '—'}</Table.Td>}
                    {isVisible('available') && <Table.Td>{getAvailableQty(item)}</Table.Td>}
                    {!workshopId && isVisible('workshop') && <Table.Td><WorkshopCell workshop={workshop} /></Table.Td>}
                    <Table.Td onClick={e => e.stopPropagation()}>
                      <ActionIcon variant="subtle" color="red" onClick={() => requestDelete(item)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
        {filtered.length === 0 && <Text ta="center" c="dimmed" py="xl">No service items found.</Text>}
      </div>

      <ServiceItemFormModal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
        lockedWorkshopId={workshopId}
        workshops={workshops}
      />

      <DeleteConfirmModal
        opened={deleteConfirm.open}
        item={deleteConfirm.item}
        entityLabel="Service item"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, item: null, id: null })}
      />
    </div>
    </div>
  );
}
