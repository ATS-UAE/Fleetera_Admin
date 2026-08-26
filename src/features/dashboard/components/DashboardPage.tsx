/* ─── DashboardPage — Customizable dashboard with all features ────────── */
import React, { useState } from 'react';
import '../widgets'; // triggers widget registration on import
import DashboardHeader from './DashboardHeader';
import FilterBar from './FilterBar';
import DashboardGrid from './DashboardGrid';
import WidgetLibrary from './WidgetLibrary';
import WidgetSettings from './WidgetSettings';
import ThemeCustomizer from './ThemeCustomizer';
import FullscreenWidget from './FullscreenWidget';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [filterExpanded, setFilterExpanded] = useState(false);

  return (
    <div className={styles.page}>
      {/* Unified 56px header bar — aligns with sidebar logo line */}
      <DashboardHeader
        filterExpanded={filterExpanded}
        onToggleFilter={() => setFilterExpanded(e => !e)}
      />

      {/* Filter panel (pops down below header when open or active) */}
      <FilterBar expanded={filterExpanded} />

      {/* Grid Canvas area with left & right breathing space */}
      <div className={styles.contentArea}>
        <DashboardGrid />
      </div>

      {/* Slide-over panels (portaled) */}
      <WidgetLibrary />
      <WidgetSettings />
      <ThemeCustomizer />
      <FullscreenWidget />
    </div>
  );
}
