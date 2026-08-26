/* ─── FleetStatusWidget — Donut / Pie for vehicle status breakdown ────── */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DonutChart, PieChart } from '@mantine/charts';
import type { WidgetProps } from './types';
import styles from './FleetStatusWidget.module.css';

const STATUS_PALETTE: Record<string, string> = {
  moving: '#10b981',
  idle: '#f59e0b',
  stopped: '#6b7280',
  offline: '#374151',
  maintenance: '#8b5cf6',
};

export default function FleetStatusWidget({ instance }: WidgetProps) {
  const vehicles = useSelector((s: any) => s.vehicles.items);
  const chartType = instance.config.chartType || 'doughnut';

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    vehicles.forEach((v: any) => { map[v.status] = (map[v.status] || 0) + 1; });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_PALETTE[name] || '#6b7280',
      }));
  }, [vehicles]);

  return (
    <div className={styles.wrap}>
      <div className={styles.chartArea}>
        {chartType === 'pie' ? (
          <PieChart data={statusCounts} size={160} withLabels withTooltip />
        ) : (
          <DonutChart
            data={statusCounts}
            size={160}
            thickness={22}
            withLabelsLine
            withLabels
            paddingAngle={2}
          />
        )}
      </div>
      <div className={styles.legend}>
        {statusCounts.map(s => (
          <div key={s.name} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: s.color }} />
            <span className={styles.label}>{s.name}</span>
            <span className={styles.val}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
