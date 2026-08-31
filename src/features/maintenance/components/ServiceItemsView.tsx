import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextInput, ActionIcon, Badge, Table, Text, Group, MultiSelect, ScrollArea,
} from '@mantine/core';
import {
  IconSearch, IconFilter, IconX,
  IconTrash, IconPlus, IconAlertTriangle, IconBuildingWarehouse,
} from '@tabler/icons-react';
import { deleteServiceItem, setServiceItemWorkshopFilter, getAvailableQty } from '@/store/slices/maintenanceSlice';
import type { ServiceItemEntry, Workshop } from '@/store/slices/maintenanceSlice';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { DeleteConfirmItem } from '@/components/DeleteConfirmModal';
import ServiceItemFormModal from './ServiceItemFormModal';
import styles from './MaintenancePage.module.css';

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

export default function ServiceItemsView({ workshopId, embedded }: ServiceItemsViewProps = {}) {
  const dispatch = useDispatch();
  const { serviceItems, workshops, serviceItemWorkshopFilter } = useSelector((s: any) => s.maintenance);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItemEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DeleteConfirmItem | null; id: string | null }>({ open: false, item: null, id: null });

  const workshopOptions = workshops.map((w: Workshop) => ({ value: w.id, label: w.name }));

  const filtered: ServiceItemEntry[] = serviceItems.filter((si: ServiceItemEntry) => {
    const matchesWorkshop = workshopId
      ? si.workshopId === workshopId
      : (serviceItemWorkshopFilter.length === 0 ||
          (si.workshopId && serviceItemWorkshopFilter.includes(si.workshopId)));
    const matchesSearch = !search || si.name.toLowerCase().includes(search.toLowerCase());
    return matchesWorkshop && matchesSearch;
  });

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
        color="green"
        leftSection={<IconPlus size={14} />}
        onClick={() => { setEditing(null); setFormOpen(true); }}
        mb="md"
      >
        New service item
      </Button>

      {!workshopId && (
        <div className={styles.planCard} style={{ marginBottom: 20, maxWidth: 420 }}>
          <Group mb={10} gap={8}>
            <ActionIcon variant="filled" color="green" radius="sm" size="sm">
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
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Available</Table.Th>
                {!workshopId && <Table.Th>Workshop</Table.Th>}
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
                    <Table.Td><Badge variant="light" color="gray">{item.type}</Badge></Table.Td>
                    <Table.Td>{item.unit || '—'}</Table.Td>
                    <Table.Td>{getAvailableQty(item)}</Table.Td>
                    {!workshopId && <Table.Td><WorkshopCell workshop={workshop} /></Table.Td>}
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
