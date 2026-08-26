/* ─── TableWidget — Tabular data display ──────────────────────────────── */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { WidgetProps } from './types';
import styles from './TableWidget.module.css';

/* Status badge */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    moving: '#10b981', idle: '#f59e0b', stopped: '#6b7280', offline: '#374151',
    maintenance: '#8b5cf6', online: '#10b981', on_trip: '#3b82f6', break: '#f59e0b',
  };
  return (
    <span className={styles.badge} style={{ background: (colors[status] || '#6b7280') + '20', color: colors[status] || '#6b7280' }}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function TableWidget({ instance }: WidgetProps) {
  const vehicles = useSelector((s: any) => s.vehicles.items);
  const drivers = useSelector((s: any) => s.drivers.items);

  const { columns, rows } = useMemo(() => {
    switch (instance.type) {
      case 'table-vehicle-status':
        return {
          columns: ['Vehicle', 'Type', 'Status', 'Speed', 'Fuel'],
          rows: vehicles.map((v: any) => [
            v.name, v.type,
            { status: v.status },
            `${v.speed} km/h`, `${v.fuel}%`,
          ]),
        };
      case 'table-driver-status':
        return {
          columns: ['Driver', 'Code', 'Status', 'Trips', 'Rating'],
          rows: drivers.map((d: any) => [
            d.name, d.code,
            { status: d.status },
            d.totalTrips.toLocaleString(), `${d.rating}★`,
          ]),
        };
      case 'table-alerts':
        return {
          columns: ['Vehicle', 'Event', 'Severity', 'Time'],
          rows: [
            ['BUS-012', 'Speeding — 92 km/h', { status: 'idle' }, '8 min ago'],
            ['PKP-088', 'Fuel low — 15%', { status: 'maintenance' }, '15 min ago'],
            ['BUS-012', 'Service overdue 500km', { status: 'idle' }, '1 hr ago'],
          ],
        };
      case 'table-latest-trips':
        return {
          columns: ['Vehicle', 'Driver', 'Distance', 'Duration', 'Status'],
          rows: [
            ['TRK-001', 'Kasun Perera', '142 km', '2h 15m', { status: 'moving' }],
            ['BUS-012', 'Ruwan J.', '89 km', '1h 40m', { status: 'moving' }],
            ['VAN-023', 'Nimal Silva', '45 km', '55m', { status: 'idle' }],
            ['CAR-047', 'Amal F.', '23 km', '30m', { status: 'stopped' }],
          ],
        };
      case 'table-maintenance':
        return {
          columns: ['Vehicle', 'Service', 'Due Date', 'Priority'],
          rows: [
            ['TRK-055', 'Engine Oil Change', '2026-08-10', { status: 'maintenance' }],
            ['BUS-012', 'Brake Inspection', '2026-08-15', { status: 'idle' }],
            ['PKP-088', 'Tire Rotation', '2026-08-20', { status: 'stopped' }],
          ],
        };
      default:
        return { columns: ['Data'], rows: [['No data configured']] };
    }
  }, [instance.type, vehicles, drivers]);

  return (
    <div className={styles.wrap}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell: any, j: number) => (
                  <td key={j}>
                    {typeof cell === 'object' && cell?.status
                      ? <StatusBadge status={cell.status} />
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
