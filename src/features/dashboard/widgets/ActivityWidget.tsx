/* ─── ActivityWidget — Live event feed ─────────────────────────────────── */
import React from 'react';
import { activityFeed } from '@/data';
import type { WidgetProps } from './types';
import styles from './ActivityWidget.module.css';

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
};

function describeEvent(a: any): string {
  if (a.type === 'geofence_enter') return `entered ${a.zone}`;
  if (a.type === 'geofence_exit') return `exited ${a.zone}`;
  if (a.type === 'speed_alert') return `speeding — ${a.detail}`;
  if (a.type === 'fuel_low') return `low fuel — ${a.detail}`;
  if (a.type === 'ignition_on') return 'ignition turned on';
  if (a.type === 'maintenance_due') return a.detail;
  return a.type;
}

export default function ActivityWidget({ instance }: WidgetProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {activityFeed.map(a => (
          <div key={a.id} className={styles.item}>
            <span className={styles.dot} style={{ background: SEVERITY_COLORS[a.severity] }} />
            <div className={styles.content}>
              <div className={styles.main}>
                <span className={styles.vehicle}>{a.vehicle}</span>
                <span className={styles.desc}>{describeEvent(a)}</span>
              </div>
              <span className={styles.time}>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
