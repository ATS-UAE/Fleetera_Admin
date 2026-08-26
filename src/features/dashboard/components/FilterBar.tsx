/* ─── FilterBar — Global dashboard filters ───────────────────────────── */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconFilter, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { setFilters, clearFilters } from '@/store/slices/dashboardSlice';
import type { FilterState } from '../widgets/types';
import styles from './FilterBar.module.css';

const STATUS_OPTIONS = ['moving', 'idle', 'stopped', 'offline', 'maintenance'];

const STATUS_COLORS: Record<string, string> = {
  moving: '#10b981', idle: '#f59e0b', stopped: '#6b7280',
  offline: '#374151', maintenance: '#8b5cf6',
};

interface FilterBarProps {
  expanded?: boolean;
}

export default function FilterBar({ expanded = false }: FilterBarProps) {
  const dispatch = useDispatch();
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeId = useSelector((s: any) => s.dashboard.activeDashboardId);
  const dashboard = dashboards.find((d: any) => d.id === activeId);
  const filters: FilterState = dashboard?.filters || {} as FilterState;

  const hasActiveFilters = Boolean(
    filters.dateRange ||
    (filters.statuses && filters.statuses.length > 0) ||
    (filters.vehicles && filters.vehicles.length > 0) ||
    (filters.drivers && filters.drivers.length > 0) ||
    (filters.groups && filters.groups.length > 0)
  );

  const toggleStatus = (status: string) => {
    const current = filters.statuses || [];
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    dispatch(setFilters({ statuses: next }));
  };

  // If not expanded and no active filters, don't render an extra empty row
  if (!expanded && !hasActiveFilters) {
    return null;
  }

  return (
    <div className={styles.bar}>
      {hasActiveFilters && (
        <div className={styles.row}>
          {/* Active filter chips */}
          <div className={styles.chips}>
            {(filters.statuses || []).map(s => (
              <span key={s} className={styles.chip}>
                <span className={styles.chipDot} style={{ background: STATUS_COLORS[s] }} />
                {s}
                <button className={styles.chipX} onClick={() => toggleStatus(s)}>
                  <IconX size={10} />
                </button>
              </span>
            ))}
            {filters.dateRange && (
              <span className={styles.chip}>
                📅 {filters.dateRange.from} — {filters.dateRange.to}
                <button className={styles.chipX} onClick={() => dispatch(setFilters({ dateRange: null }))}>
                  <IconX size={10} />
                </button>
              </span>
            )}
          </div>

          <button className={styles.clearBtn} onClick={() => dispatch(clearFilters())}>
            Clear All
          </button>
        </div>
      )}

      {expanded && (
        <div className={styles.expandedArea}>
          {/* Status chips */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <div className={styles.statusChips}>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`${styles.statusChip} ${(filters.statuses || []).includes(s) ? styles.statusActive : ''}`}
                  style={{
                    '--chip-color': STATUS_COLORS[s],
                  } as React.CSSProperties}
                  onClick={() => toggleStatus(s)}
                >
                  <span className={styles.chipDot} style={{ background: STATUS_COLORS[s] }} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date range quick picks */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Time Range</label>
            <div className={styles.quickPicks}>
              {[
                { label: 'Last 1h', from: '1h' },
                { label: 'Last 24h', from: '24h' },
                { label: 'Last 7d', from: '7d' },
                { label: 'Last 30d', from: '30d' },
              ].map(p => (
                <button
                  key={p.from}
                  className={styles.quickPick}
                  onClick={() => dispatch(setFilters({ dateRange: { from: p.from, to: 'now' } }))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
