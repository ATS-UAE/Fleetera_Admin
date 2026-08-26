/* ─── WidgetLibrary — Slide-over panel to browse & add widgets ────────── */
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { IconX, IconSearch, IconPlus } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import { WidgetRegistry } from '../widgets';
import { addWidget, setWidgetLibraryOpen } from '@/store/slices/dashboardSlice';
import type { WidgetCategory, WidgetRegistration } from '../widgets/types';
import styles from './WidgetLibrary.module.css';

const CATEGORIES: { key: WidgetCategory | 'all'; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'statistics', label: 'Statistics' },
  { key: 'charts',     label: 'Charts' },
  { key: 'tables',     label: 'Tables' },
  { key: 'activity',   label: 'Activity' },
];

const CATEGORY_ICONS: Record<string, string> = {
  statistics: '📊',
  charts:     '📈',
  maps:       '🗺️',
  tables:     '📋',
  activity:   '🔔',
};

function resolveIcon(name?: string) {
  if (!name) return null;
  return (TablerIcons as any)[name] || null;
}

export default function WidgetLibrary() {
  const dispatch = useDispatch();
  const open = useSelector((s: any) => s.dashboard.widgetLibraryOpen);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<WidgetCategory | 'all'>('all');

  const filteredWidgets = useMemo(() => {
    let list: WidgetRegistration[] = category === 'all'
      ? WidgetRegistry.all()
      : WidgetRegistry.byCategory(category);

    if (search.trim()) {
      list = list.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return list;
  }, [category, search]);

  const handleAdd = (reg: WidgetRegistration) => {
    const id = uuidv4();
    dispatch(addWidget({
      widget: {
        id,
        type: reg.type,
        title: reg.name,
        icon: reg.icon,
        config: { ...reg.defaultConfig },
        style: {},
        pinned: false,
        locked: false,
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      layout: {
        i: id,
        x: 0,
        y: Infinity, // push to bottom
        w: reg.defaultSize.w,
        h: reg.defaultSize.h,
        minW: reg.minSize.w,
        minH: reg.minSize.h,
        maxW: reg.maxSize.w,
        maxH: reg.maxSize.h,
      },
    }));
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => dispatch(setWidgetLibraryOpen(false))} />
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Widget Library</h3>
          <button className={styles.closeBtn} onClick={() => dispatch(setWidgetLibraryOpen(false))}>
            <IconX size={16} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <IconSearch size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search widgets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className={styles.categories}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              className={`${styles.catBtn} ${category === c.key ? styles.catActive : ''}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Widget Grid */}
        <div className={styles.widgetGrid}>
          {filteredWidgets.map(reg => {
            const Icon = resolveIcon(reg.icon);
            return (
              <div key={reg.type} className={styles.widgetCard}>
                <div className={styles.widgetCardHeader}>
                  <div className={styles.widgetIcon}>
                    {Icon && <Icon size={18} />}
                  </div>
                  <span className={styles.catBadge}>
                    {CATEGORY_ICONS[reg.category] || '📊'} {reg.category}
                  </span>
                </div>
                <div className={styles.widgetName}>{reg.name}</div>
                <div className={styles.widgetDesc}>{reg.description}</div>
                <div className={styles.widgetMeta}>
                  {reg.defaultSize.w}×{reg.defaultSize.h} grid
                </div>
                <button className={styles.addBtn} onClick={() => handleAdd(reg)}>
                  <IconPlus size={13} /> Add
                </button>
              </div>
            );
          })}

          {filteredWidgets.length === 0 && (
            <div className={styles.noResults}>
              No widgets found for "{search}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}
