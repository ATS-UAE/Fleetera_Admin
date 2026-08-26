/* ─── DashboardTabBar — Multi-dashboard switcher ─────────────────────── */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Modal, TextInput, Select } from '@mantine/core';
import {
  IconPlus, IconDotsVertical, IconCopy, IconTrash,
  IconStar, IconStarFilled, IconEdit,
} from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import {
  setActiveDashboard, createDashboard, deleteDashboard,
  renameDashboard, duplicateDashboard, toggleFavorite,
} from '@/store/slices/dashboardSlice';
import { DASHBOARD_TEMPLATES } from '../utils/defaults';
import styles from './DashboardTabBar.module.css';

function resolveIcon(name?: string) {
  if (!name) return null;
  return (TablerIcons as any)[name] || null;
}

export default function DashboardTabBar() {
  const dispatch = useDispatch();
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeId = useSelector((s: any) => s.dashboard.activeDashboardId);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    dispatch(createDashboard({ name: newName.trim(), templateId: newTemplate || undefined }));
    setCreateOpen(false);
    setNewName('');
    setNewTemplate(null);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      dispatch(renameDashboard({ id, name: editName.trim() }));
    }
    setEditingId(null);
  };

  return (
    <>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {dashboards.map((dash: any) => {
            const Icon = resolveIcon(dash.icon);
            const isActive = dash.id === activeId;
            return (
              <div
                key={dash.id}
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                onClick={() => dispatch(setActiveDashboard(dash.id))}
              >
                {Icon && <Icon size={14} />}
                {editingId === dash.id ? (
                  <input
                    className={styles.tabInput}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleRename(dash.id)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(dash.id); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className={styles.tabLabel}>{dash.name}</span>
                )}
                {dash.isFavorite && <IconStarFilled size={10} className={styles.favStar} />}

                {/* Tab menu */}
                <Menu shadow="lg" width={160} position="bottom-end" withinPortal>
                  <Menu.Target>
                    <button className={styles.tabMenuBtn} onClick={e => e.stopPropagation()}>
                      <IconDotsVertical size={12} />
                    </button>
                  </Menu.Target>
                  <Menu.Dropdown className={styles.menuDropdown}>
                    <Menu.Item leftSection={<IconEdit size={14} />}
                      onClick={() => { setEditingId(dash.id); setEditName(dash.name); }}>
                      Rename
                    </Menu.Item>
                    <Menu.Item leftSection={<IconCopy size={14} />}
                      onClick={() => dispatch(duplicateDashboard(dash.id))}>
                      Duplicate
                    </Menu.Item>
                    <Menu.Item leftSection={dash.isFavorite ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                      onClick={() => dispatch(toggleFavorite(dash.id))}>
                      {dash.isFavorite ? 'Unfavorite' : 'Favorite'}
                    </Menu.Item>
                    {dashboards.length > 1 && (
                      <>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red"
                          onClick={() => dispatch(deleteDashboard(dash.id))}>
                          Delete
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </div>
            );
          })}
        </div>

        <button className={styles.addBtn} onClick={() => setCreateOpen(true)}>
          <IconPlus size={14} />
        </button>
      </div>

      {/* Create Dashboard Modal */}
      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Dashboard"
        centered
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextInput
            label="Dashboard Name"
            placeholder="e.g. Fleet Monitoring"
            value={newName}
            onChange={e => setNewName(e.currentTarget.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            autoFocus
          />
          <Select
            label="Template (optional)"
            placeholder="Start from scratch"
            data={[
              { value: '', label: 'Blank Dashboard' },
              ...DASHBOARD_TEMPLATES.map(t => ({ value: t.id, label: t.name })),
            ]}
            value={newTemplate || ''}
            onChange={v => setNewTemplate(v || null)}
            clearable
          />
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={!newName.trim()}
          >
            Create Dashboard
          </button>
        </div>
      </Modal>
    </>
  );
}
