/* ─── StatWidget — Generic statistic card ─────────────────────────────── */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import type { WidgetProps } from './types';
import styles from './StatWidget.module.css';

/* Resolve a tabler icon name string like 'IconTruck' to the actual component */
function resolveIcon(name?: string) {
  if (!name) return null;
  return (TablerIcons as any)[name] || null;
}

/* Formatting */
function formatNumber(n: number, fmt: string = 'comma'): string {
  if (fmt === 'compact') {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }
  if (fmt === 'decimal') return n.toLocaleString(undefined, { minimumFractionDigits: 2 });
  if (fmt === 'comma') return n.toLocaleString();
  return String(n);
}

/* ─── Stat computation per widget type ────────────────────────────────── */
function computeStat(type: string, vehicles: any[], drivers: any[], config: any) {
  switch (type) {
    case 'stat-total-vehicles':
      return { value: vehicles.length, sub: `${vehicles.filter(v => v.status === 'moving').length} active now`, trend: 4.2 };
    case 'stat-drivers-online':
      return { value: drivers.filter(d => d.status !== 'offline').length, sub: `of ${drivers.length} total`, trend: 2.1 };
    case 'stat-fuel-consumption':
      return { value: 1247, suffix: ' L', sub: 'this week', trend: 3.7 };
    case 'stat-active-trips':
      return { value: drivers.filter(d => d.status === 'on_trip').length, sub: 'currently on trip', trend: 1.5 };
    case 'stat-alerts':
      return { value: 14, sub: 'needs attention', trend: -2.3 };
    case 'stat-geofence-events':
      return { value: 38, sub: 'last 24 hours', trend: 5.1 };
    case 'stat-avg-speed':
      const movingV = vehicles.filter(v => v.speed > 0);
      const avg = movingV.length ? Math.round(movingV.reduce((s, v) => s + v.speed, 0) / movingV.length) : 0;
      return { value: avg, suffix: ' km/h', sub: 'fleet average', trend: 0.8 };
    case 'stat-total-distance':
      return { value: 8432, suffix: ' km', sub: 'across all vehicles', trend: -1.4 };
    case 'stat-idle-time':
      return { value: vehicles.filter(v => v.status === 'idle').length, suffix: ' hrs', sub: 'total idle time', trend: -3.2 };
    case 'stat-revenue':
      return { value: 42850, prefix: '$', sub: 'this month', trend: 6.4 };
    case 'stat-maintenance-due':
      return { value: vehicles.filter(v => v.status === 'maintenance').length, sub: 'upcoming services', trend: 0 };
    default:
      return { value: 0, sub: '' };
  }
}

/* ─── Default icon + color per stat type ──────────────────────────────── */
const STAT_DEFAULTS: Record<string, { icon: string; color: string }> = {
  'stat-total-vehicles':   { icon: 'IconTruck',          color: '#3b82f6' },
  'stat-drivers-online':   { icon: 'IconUsers',          color: '#10b981' },
  'stat-fuel-consumption': { icon: 'IconGasStation',     color: '#f59e0b' },
  'stat-active-trips':     { icon: 'IconRoute',          color: '#06b6d4' },
  'stat-alerts':           { icon: 'IconAlertTriangle',  color: '#ef4444' },
  'stat-geofence-events':  { icon: 'IconShieldCheck',    color: '#8b5cf6' },
  'stat-avg-speed':        { icon: 'IconGauge',          color: '#f97316' },
  'stat-total-distance':   { icon: 'IconRoute',          color: '#06b6d4' },
  'stat-idle-time':        { icon: 'IconClock',          color: '#6b7280' },
  'stat-revenue':          { icon: 'IconCurrencyDollar', color: '#10b981' },
  'stat-maintenance-due':  { icon: 'IconTool',           color: '#8b5cf6' },
};

export default function StatWidget({ instance, filters, isEditMode }: WidgetProps) {
  const vehicles = useSelector((s: any) => s.vehicles.items);
  const drivers = useSelector((s: any) => s.drivers.items);

  const defaults = STAT_DEFAULTS[instance.type] || { icon: 'IconChartBar', color: '#3b82f6' };
  const iconColor = instance.config.color || defaults.color;
  const IconComp = resolveIcon(instance.icon || instance.config.icon || defaults.icon);
  const fmt = instance.style.numberFormat || 'comma';

  const stat = useMemo(
    () => computeStat(instance.type, vehicles, drivers, instance.config),
    [instance.type, vehicles, drivers, instance.config]
  );

  const valueStr = (stat as any).prefix
    ? `${(stat as any).prefix}${formatNumber(stat.value, fmt)}`
    : `${formatNumber(stat.value, fmt)}${(stat as any).suffix || ''}`;

  return (
    <div className={styles.stat}
      style={{
        fontSize: instance.style.fontSize ? `${instance.style.fontSize}px` : undefined,
        color: instance.style.fontColor || undefined,
      }}
    >
      <div className={styles.top}>
        <div className={styles.icon} style={{ background: iconColor + '15', borderColor: iconColor + '40' }}>
          {IconComp && <IconComp size={18} style={{ color: iconColor }} />}
        </div>
        {stat.trend && stat.trend !== 0 && (
          <div className={`${styles.trend} ${stat.trend > 0 ? styles.trendUp : styles.trendDown}`}>
            {stat.trend > 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
            {Math.abs(stat.trend)}%
          </div>
        )}
      </div>
      <div className={styles.value} style={{ fontSize: instance.style.valueSize ? `${instance.style.valueSize}px` : undefined }}>
        {valueStr}
      </div>
      {stat.sub && <div className={styles.sub}>{stat.sub}</div>}
    </div>
  );
}
