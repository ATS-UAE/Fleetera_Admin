import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextInput, ActionIcon, Badge, Table, Text, Tooltip, ScrollArea, Group } from '@mantine/core';
import {
  IconSearch, IconBuildingWarehouse, IconMapPin,
  IconTrash, IconPlus, IconX,
} from '@tabler/icons-react';
import { setWorkshopTypeFilter, deleteWorkshop } from '@/store/slices/maintenanceSlice';
import type { Workshop } from '@/store/slices/maintenanceSlice';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { DeleteConfirmItem } from '@/components/DeleteConfirmModal';
import WorkshopFormPage from './WorkshopFormPage';
import { useTableColumns } from '../hooks/useTableColumns';
import ColumnConfigButton from './ColumnConfigButton';
import SortableTh from './SortableTh';
import type { SortState } from './SortableTh';
import styles from './MaintenancePage.module.css';

const TYPE_OPTIONS = ['all', 'internal', 'external'] as const;
const TYPE_LABELS: Record<string, string> = { all: 'All', internal: 'Internal', external: 'External' };

const COLUMNS = [
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
];

export default function WorkshopsView() {
  const dispatch = useDispatch();
  const { workshops, workshopTypeFilter } = useSelector((s: any) => s.maintenance);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: DeleteConfirmItem | null; id: string | null }>({ open: false, item: null, id: null });
  const [sort, setSort] = useState<SortState | null>(null);
  const { isVisible, toggle } = useTableColumns('workshops');

  if (view === 'form') {
    return <WorkshopFormPage workshop={editing} onBack={() => { setView('list'); setEditing(null); }} />;
  }

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  let filtered: Workshop[] = workshops.filter((w: Workshop) => {
    const matchesType = workshopTypeFilter === 'all' || w.type === workshopTypeFilter;
    const matchesSearch = !search || w.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const av = (a as any)[sort.key === 'name' ? 'name' : sort.key]?.toString().toLowerCase() || '';
      const bv = (b as any)[sort.key === 'name' ? 'name' : sort.key]?.toString().toLowerCase() || '';
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const requestDelete = (w: Workshop) => {
    setDeleteConfirm({ open: true, item: { name: w.name, meta: w.location || undefined }, id: w.id });
  };
  const confirmDelete = () => {
    if (deleteConfirm.id) dispatch(deleteWorkshop(deleteConfirm.id));
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
        New workshop
      </Button>

      <div className={styles.planCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--fv-accent), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <IconBuildingWarehouse size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>All workshops</div>
            <div style={{ fontSize: 12, color: 'var(--fv-text-muted)' }}>Internal and external service locations</div>
          </div>
        </div>
        <div className={styles.filterBtnGroup}>
          {TYPE_OPTIONS.map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${workshopTypeFilter === t ? styles.filterBtnActive : ''}`}
              onClick={() => dispatch(setWorkshopTypeFilter(t))}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text fw={600}>Workshops</Text>
        <Group gap={8}>
        <ColumnConfigButton columns={COLUMNS} isVisible={isVisible} onToggle={toggle} />
        <TextInput
          placeholder="Search workshops..."
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
                {isVisible('location') && <SortableTh label="Location" sortKey="location" sort={sort} onSort={handleSort} />}
                {isVisible('type') && <SortableTh label="Type" sortKey="type" sort={sort} onSort={handleSort} />}
                <Table.Th style={{ width: 48 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map(w => (
                <Table.Tr key={w.id} style={{ cursor: 'pointer' }} onClick={() => { setEditing(w); setView('form'); }}>
                  <Table.Td>
                    <span className={styles.serviceName}>{w.name}</span>
                  </Table.Td>
                  {isVisible('location') && (
                    <Table.Td>
                      {w.location ? (
                        <Tooltip label={w.location} openDelay={300} multiline w={280} disabled={w.location.length < 45}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            color: 'var(--fv-text-secondary)', maxWidth: 360,
                          }}>
                            <IconMapPin size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {w.location}
                            </span>
                          </div>
                        </Tooltip>
                      ) : (
                        <Text c="dimmed" size="sm">—</Text>
                      )}
                    </Table.Td>
                  )}
                  {isVisible('type') && (
                    <Table.Td>
                      <Badge color={w.type === 'internal' ? 'blue' : 'orange'} variant="light" radius="sm">
                        {TYPE_LABELS[w.type]}
                      </Badge>
                    </Table.Td>
                  )}
                  <Table.Td onClick={e => e.stopPropagation()}>
                    <ActionIcon variant="subtle" color="red" onClick={() => requestDelete(w)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
        {filtered.length === 0 && <Text ta="center" c="dimmed" py="xl">No workshops found.</Text>}
      </div>

      <DeleteConfirmModal
        opened={deleteConfirm.open}
        item={deleteConfirm.item}
        entityLabel="Workshop"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, item: null, id: null })}
      />
    </div>
    </div>
  );
}
