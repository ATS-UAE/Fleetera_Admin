/* ─── WidgetSettings — Right slide-over settings panel ────────────────── */
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconX, IconChartLine, IconChartBar, IconChartArea, IconChartPie, IconChartDonut, IconChartRadar } from '@tabler/icons-react';
import { setWidgetSettingsId, updateWidget } from '@/store/slices/dashboardSlice';
import { WidgetRegistry } from '../widgets';
import type { WidgetInstance } from '../widgets/types';
import styles from './WidgetSettings.module.css';

const CHART_TYPE_OPTIONS = [
  { value: 'line',     label: 'Line',     icon: IconChartLine },
  { value: 'area',     label: 'Area',     icon: IconChartArea },
  { value: 'bar',      label: 'Bar',      icon: IconChartBar },
  { value: 'pie',      label: 'Pie',      icon: IconChartPie },
  { value: 'doughnut', label: 'Doughnut', icon: IconChartDonut },
  { value: 'radar',    label: 'Radar',    icon: IconChartRadar },
];

const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg', 'glow'];
const THEME_OPTIONS = ['default', 'minimal', 'compact', 'glass'];
const NUMBER_FORMAT_OPTIONS = [
  { value: 'raw',     label: '1234' },
  { value: 'comma',   label: '1,234' },
  { value: 'compact', label: '1.2K' },
  { value: 'decimal', label: '1,234.00' },
];

export default function WidgetSettings() {
  const dispatch = useDispatch();
  const widgetId = useSelector((s: any) => s.dashboard.widgetSettingsId);
  const dashboards = useSelector((s: any) => s.dashboard.dashboards);
  const activeId = useSelector((s: any) => s.dashboard.activeDashboardId);

  const widget: WidgetInstance | undefined = useMemo(() => {
    if (!widgetId) return undefined;
    const dash = dashboards.find((d: any) => d.id === activeId);
    return dash?.widgets.find((w: any) => w.id === widgetId);
  }, [widgetId, dashboards, activeId]);

  if (!widgetId || !widget) return null;

  const reg = WidgetRegistry.get(widget.type);
  const isChart = widget.type.startsWith('chart-');
  const isStat = widget.type.startsWith('stat-');

  const update = (changes: Partial<WidgetInstance>) => {
    dispatch(updateWidget({ id: widget.id, changes }));
  };

  const updateConfig = (key: string, value: any) => {
    update({ config: { ...widget.config, [key]: value } });
  };

  const updateStyle = (key: string, value: any) => {
    update({ style: { ...widget.style, [key]: value } });
  };

  return (
    <>
      <div className={styles.overlay} onClick={() => dispatch(setWidgetSettingsId(null))} />
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Widget Settings</h3>
          <button className={styles.closeBtn} onClick={() => dispatch(setWidgetSettingsId(null))}>
            <IconX size={16} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Widget name */}
          <div className={styles.widgetName}>{widget.title}</div>
          <div className={styles.widgetType}>{reg?.name || widget.type}</div>

          {/* ── General Tab ──────────────────────────────────────────── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>General</div>

            <label className={styles.fieldLabel}>Title</label>
            <input
              className={styles.input}
              value={widget.title}
              onChange={e => update({ title: e.target.value })}
            />

            {isStat && (
              <>
                <label className={styles.fieldLabel}>Number Format</label>
                <div className={styles.chipGroup}>
                  {NUMBER_FORMAT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`${styles.chip} ${(widget.style.numberFormat || 'comma') === o.value ? styles.chipActive : ''}`}
                      onClick={() => updateStyle('numberFormat', o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Chart Type (chart widgets only) ──────────────────────── */}
          {isChart && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Chart Type</div>
              <div className={styles.chartTypeGrid}>
                {CHART_TYPE_OPTIONS.map(ct => {
                  const Icon = ct.icon;
                  const active = widget.config.chartType === ct.value;
                  return (
                    <button
                      key={ct.value}
                      className={`${styles.chartTypeBtn} ${active ? styles.chartTypeActive : ''}`}
                      onClick={() => updateConfig('chartType', ct.value)}
                    >
                      <Icon size={18} />
                      <span>{ct.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chart sub-settings */}
              <div className={styles.toggleRow}>
                <span>Show Legend</span>
                <button
                  className={`${styles.toggle} ${widget.config.legend?.show !== false ? styles.toggleOn : ''}`}
                  onClick={() => updateConfig('legend', { ...widget.config.legend, show: !(widget.config.legend?.show !== false) })}
                />
              </div>

              <div className={styles.toggleRow}>
                <span>Tooltips</span>
                <button
                  className={`${styles.toggle} ${widget.config.tooltips !== false ? styles.toggleOn : ''}`}
                  onClick={() => updateConfig('tooltips', !(widget.config.tooltips !== false))}
                />
              </div>

              <div className={styles.toggleRow}>
                <span>Grid Lines</span>
                <button
                  className={`${styles.toggle} ${widget.config.grid?.showY !== false ? styles.toggleOn : ''}`}
                  onClick={() => updateConfig('grid', { ...widget.config.grid, showY: !(widget.config.grid?.showY !== false) })}
                />
              </div>

              <label className={styles.fieldLabel}>Stroke Width</label>
              <input
                type="range"
                className={styles.slider}
                min={1} max={6} step={1}
                value={widget.config.strokeWidth || 2}
                onChange={e => updateConfig('strokeWidth', Number(e.target.value))}
              />
              <span className={styles.sliderVal}>{widget.config.strokeWidth || 2}px</span>

              <label className={styles.fieldLabel}>Fill Opacity</label>
              <input
                type="range"
                className={styles.slider}
                min={0} max={1} step={0.05}
                value={widget.config.fillOpacity ?? 0.3}
                onChange={e => updateConfig('fillOpacity', Number(e.target.value))}
              />
              <span className={styles.sliderVal}>{(widget.config.fillOpacity ?? 0.3).toFixed(2)}</span>
            </div>
          )}

          {/* ── Appearance Tab ───────────────────────────────────────── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Appearance</div>

            <label className={styles.fieldLabel}>Widget Theme</label>
            <div className={styles.chipGroup}>
              {THEME_OPTIONS.map(t => (
                <button
                  key={t}
                  className={`${styles.chip} ${(widget.style.widgetTheme || 'default') === t ? styles.chipActive : ''}`}
                  onClick={() => updateStyle('widgetTheme', t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className={styles.fieldLabel}>Background Color</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={widget.style.backgroundColor || '#1a2540'}
                onChange={e => updateStyle('backgroundColor', e.target.value)}
              />
              <button className={styles.resetBtn} onClick={() => updateStyle('backgroundColor', undefined)}>Reset</button>
            </div>

            <label className={styles.fieldLabel}>Header Color</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={widget.style.headerColor || '#1a2540'}
                onChange={e => updateStyle('headerColor', e.target.value)}
              />
              <button className={styles.resetBtn} onClick={() => updateStyle('headerColor', undefined)}>Reset</button>
            </div>

            <label className={styles.fieldLabel}>Border Radius</label>
            <input
              type="range"
              className={styles.slider}
              min={0} max={24} step={1}
              value={widget.style.borderRadius ?? 14}
              onChange={e => updateStyle('borderRadius', Number(e.target.value))}
            />
            <span className={styles.sliderVal}>{widget.style.borderRadius ?? 14}px</span>

            <label className={styles.fieldLabel}>Shadow</label>
            <div className={styles.chipGroup}>
              {SHADOW_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`${styles.chip} ${(widget.style.shadow || 'sm') === s ? styles.chipActive : ''}`}
                  onClick={() => updateStyle('shadow', s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {isStat && (
              <>
                <label className={styles.fieldLabel}>Value Size</label>
                <input
                  type="range"
                  className={styles.slider}
                  min={16} max={48} step={1}
                  value={widget.style.valueSize ?? 22}
                  onChange={e => updateStyle('valueSize', Number(e.target.value))}
                />
                <span className={styles.sliderVal}>{widget.style.valueSize ?? 22}px</span>
              </>
            )}

            <label className={styles.fieldLabel}>Font Size</label>
            <input
              type="range"
              className={styles.slider}
              min={10} max={18} step={1}
              value={widget.style.fontSize ?? 13}
              onChange={e => updateStyle('fontSize', Number(e.target.value))}
            />
            <span className={styles.sliderVal}>{widget.style.fontSize ?? 13}px</span>
          </div>
        </div>
      </div>
    </>
  );
}
