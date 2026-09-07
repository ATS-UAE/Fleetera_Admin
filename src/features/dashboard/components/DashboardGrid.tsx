/* ─── DashboardGrid — react-grid-layout wrapper ──────────────────────── */
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { updateLayout } from '@/store/slices/dashboardSlice';
import { WidgetRegistry } from '../widgets';
import WidgetWrapper from './WidgetWrapper';
import type { FilterState } from '../widgets/types';
import styles from './DashboardGrid.module.css';

export default function DashboardGrid() {
  const dispatch = useDispatch();
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeDashboardId = useSelector((s: any) => s.dashboard.activeDashboardId);
  const editMode = useSelector((s: any) => s.dashboard.editMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState<number>(0);

  // ResizeObserver tracks the real pixel width of the container at all times.
  // This means collapsing / expanding the sidebar automatically triggers a
  // re-render with the correct width — no stale measurement from WidthProvider.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setGridWidth(w);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dashboard = useMemo(
    () => dashboards.find((d: any) => d.id === activeDashboardId),
    [dashboards, activeDashboardId]
  );

  const visibleWidgets = useMemo(
    () => (dashboard?.widgets || []).filter((w: any) => !w.hidden),
    [dashboard?.widgets]
  );

  const layout = useMemo(
    () => (dashboard?.layout || []).filter((l: any) =>
      visibleWidgets.some((w: any) => w.id === l.i)
    ),
    [dashboard?.layout, visibleWidgets]
  );

  const filters: FilterState = dashboard?.filters || {
    dateRange: null, vehicles: [], drivers: [], groups: [],
    branches: [], regions: [], statuses: [], tripType: null, fuelType: null,
  };

  const handleLayoutChange = useCallback((newLayout: readonly any[]) => {
    if (!editMode) return;
    const mapped = [...newLayout].map((l: any) => ({
      i: l.i, x: l.x, y: l.y, w: l.w, h: l.h,
      minW: l.minW, minH: l.minH, maxW: l.maxW, maxH: l.maxH, static: l.static,
    }));
    dispatch(updateLayout(mapped));
  }, [dispatch, editMode]);

  const handleUpdate = useCallback((id: string) => (changes: any) => {
    dispatch({ type: 'dashboard/updateWidget', payload: { id, changes } });
  }, [dispatch]);

  if (!dashboard) {
    return (
      <div className={styles.empty}>
        <p>No dashboard selected. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer} ref={containerRef}>
      {gridWidth > 0 && (
        <Responsive
          className={`${styles.grid} ${editMode ? styles.editGrid : ''}`}
          width={gridWidth}
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1400, md: 1200, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          compactType="vertical"
          isDraggable={editMode}
          isResizable={editMode}
          draggableHandle=".widget-drag-handle"
          onLayoutChange={handleLayoutChange}
          useCSSTransforms
        >
          {visibleWidgets.map((widget: any) => {
            const reg = WidgetRegistry.get(widget.type);
            if (!reg) return null;
            const Renderer = reg.renderer;
            return (
              <div key={widget.id} className={styles.gridItem}>
                <WidgetWrapper widget={widget} isEditMode={editMode}>
                  <Renderer
                    instance={widget}
                    filters={filters}
                    isEditMode={editMode}
                    onUpdate={handleUpdate(widget.id)}
                  />
                </WidgetWrapper>
              </div>
            );
          })}
        </Responsive>
      )}
    </div>
  );
}
