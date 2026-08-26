/* ─── FullscreenWidget — Modal overlay for widget fullscreen ──────────── */
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconX } from '@tabler/icons-react';
import { setFullscreenWidget } from '@/store/slices/dashboardSlice';
import { WidgetRegistry } from '../widgets';
import type { FilterState } from '../widgets/types';
import styles from './FullscreenWidget.module.css';

export default function FullscreenWidget() {
  const dispatch = useDispatch();
  const fullscreenId = useSelector((s: any) => s.dashboard.fullscreenWidgetId);
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeId = useSelector((s: any) => s.dashboard.activeDashboardId);

  const widget = useMemo(() => {
    if (!fullscreenId) return null;
    const dash = dashboards.find((d: any) => d.id === activeId);
    return dash?.widgets.find((w: any) => w.id === fullscreenId) || null;
  }, [fullscreenId, dashboards, activeId]);

  if (!widget) return null;

  const reg = WidgetRegistry.get(widget.type);
  if (!reg) return null;

  const Renderer = reg.renderer;
  const dash = dashboards.find((d: any) => d.id === activeId);
  const filters: FilterState = dash?.filters || {
    dateRange: null, vehicles: [], drivers: [], groups: [],
    branches: [], regions: [], statuses: [], tripType: null, fuelType: null,
  };

  return (
    <div className={styles.overlay} onClick={() => dispatch(setFullscreenWidget(null))}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{widget.title}</span>
          <button className={styles.closeBtn} onClick={() => dispatch(setFullscreenWidget(null))}>
            <IconX size={18} />
          </button>
        </div>
        <div className={styles.body}>
          <Renderer
            instance={widget}
            filters={filters}
            isEditMode={false}
            onUpdate={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
