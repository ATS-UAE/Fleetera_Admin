import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconClock, IconTruck, IconUser, IconBolt, IconCheck, IconEye } from '@tabler/icons-react';
import { setSelectedTaskId, updateTaskStatus } from '@/store/slices/taskDeskSlice';
import { TaskDeskItem } from '../automation/types';
import styles from './TaskDeskPage.module.css';

export default function TaskListView() {
  const dispatch = useDispatch();
  const tasks = useSelector((s: any) => s.taskDesk.tasks);
  const filters = useSelector((s: any) => s.taskDesk.filters);

  const filteredTasks = tasks.filter((t: TaskDeskItem) => {
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.vehicleId !== 'all' && t.vehicleId !== filters.vehicleId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNum = t.taskNumber.toLowerCase().includes(q);
      const matchVeh = t.vehicleName?.toLowerCase().includes(q);
      const matchRule = t.originRuleName?.toLowerCase().includes(q);
      if (!matchTitle && !matchNum && !matchVeh && !matchRule) return false;
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.p_critical;
      case 'high': return styles.p_high;
      case 'medium': return styles.p_medium;
      default: return styles.p_low;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Completed', bg: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' };
      case 'in_progress': return { label: 'In Progress', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      default: return { label: 'Pending', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
    }
  };

  return (
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            <th style={{ padding: '12px 16px' }}>Task ID</th>
            <th style={{ padding: '12px 16px' }}>Title & Description</th>
            <th style={{ padding: '12px 16px' }}>Priority</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Vehicle Unit</th>
            <th style={{ padding: '12px 16px' }}>Origin Rule</th>
            <th style={{ padding: '12px 16px' }}>Created</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                No tasks matching the selected filters.
              </td>
            </tr>
          ) : (
            filteredTasks.map((t: TaskDeskItem) => {
              const st = getStatusBadge(t.status);
              return (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => dispatch(setSelectedTaskId(t.id))}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#cbd5e1', fontWeight: 600 }}>
                    {t.taskNumber}
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.description}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`${styles.priorityBadge} ${getPriorityBadgeClass(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>
                    {t.vehicleName}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#38bdf8', fontSize: '0.8rem' }}>
                    {t.originRuleName || 'Custom'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.78rem' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      className={styles.btnSecondary}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedTaskId(t.id));
                      }}
                    >
                      <IconEye size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
