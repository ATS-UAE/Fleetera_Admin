/* ─── DashboardHeader — Unified 56px header bar ─────────────────────── */
import React from 'react';
import { useSelector } from 'react-redux';
import { IconFilter, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import DashboardTabBar from './DashboardTabBar';
import DashboardToolbar from './DashboardToolbar';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  filterExpanded: boolean;
  onToggleFilter: () => void;
}

export default function DashboardHeader({ filterExpanded, onToggleFilter }: DashboardHeaderProps) {
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeId = useSelector((s: any) => s.dashboard.activeDashboardId);
  const dashboard = dashboards.find((d: any) => d.id === activeId);
  const filters = dashboard?.filters || {};

  const activeCount = [
    filters.dateRange ? 1 : 0,
    filters.statuses?.length || 0,
    filters.vehicles?.length || 0,
    filters.drivers?.length || 0,
    filters.groups?.length || 0,
  ].reduce((a: number, b: number) => a + b, 0);

  return (
    <header className={styles.header}>
      {/* Left: Dashboard tabs */}
      <div className={styles.tabSection}>
        <DashboardTabBar />
      </div>

      {/* Right: Actions — Filters button positioned directly to the left of Edit Dashboard */}
      <div className={styles.actionSection}>
        <button
          className={`${styles.filterBtn} ${filterExpanded || activeCount > 0 ? styles.filterActive : ''}`}
          onClick={onToggleFilter}
          title="Toggle Global Filters"
        >
          <IconFilter size={14} />
          <span>Filters</span>
          {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
          {filterExpanded ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
        </button>

        <div className={styles.divider} />

        <DashboardToolbar />
      </div>
    </header>
  );
}
