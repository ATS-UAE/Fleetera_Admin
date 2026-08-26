import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconClock, IconTruck, IconUser, IconAlertTriangle, IconCheck, IconPlayerPlay, IconBolt } from '@tabler/icons-react';
import { setSelectedTaskId, updateTaskStatus } from '@/store/slices/taskDeskSlice';
import { TaskDeskItem, TaskStatus } from '../automation/types';
import styles from './TaskDeskPage.module.css';

export default function TaskBoardView() {
  const dispatch = useDispatch();
  const tasks = useSelector((s: any) => s.taskDesk.tasks);
  const filters = useSelector((s: any) => s.taskDesk.filters);

  // Filter tasks based on UI search, status, priority, and vehicle
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

  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'pending', title: 'Pending Tasks', color: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)' },
    { id: 'in_progress', title: 'In Progress', color: '#facc15', badgeBg: 'rgba(234, 179, 8, 0.15)' },
    { id: 'completed', title: 'Completed', color: '#4ade80', badgeBg: 'rgba(74, 222, 128, 0.15)' },
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.p_critical;
      case 'high': return styles.p_high;
      case 'medium': return styles.p_medium;
      default: return styles.p_low;
    }
  };

  return (
    <div className={styles.kanbanGrid}>
      {columns.map(col => {
        const colTasks = filteredTasks.filter((t: TaskDeskItem) => t.status === col.id);

        return (
          <div key={col.id} className={styles.kanbanColumn}>
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle} style={{ color: col.color }}>
                {col.title}
              </div>
              <div className={styles.columnBadge} style={{ background: col.badgeBg, color: col.color }}>
                {colTasks.length}
              </div>
            </div>

            <div className={styles.taskCardsList}>
              {colTasks.length === 0 ? (
                <div
                  style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontStyle: 'italic',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                  }}
                >
                  No tasks in this column
                </div>
              ) : (
                colTasks.map((t: TaskDeskItem) => (
                  <div
                    key={t.id}
                    className={styles.taskCard}
                    onClick={() => dispatch(setSelectedTaskId(t.id))}
                  >
                    <div className={`${styles.priorityIndicator} ${styles[`priority_${t.priority}`]}`} />

                    <div className={styles.cardHeader}>
                      <span className={styles.taskNumber}>{t.taskNumber}</span>
                      <span className={`${styles.priorityBadge} ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className={styles.cardTitle}>{t.title}</div>

                    {t.triggerLabel && (
                      <div className={styles.triggerMeta}>
                        <IconBolt size={12} /> {t.triggerLabel}
                      </div>
                    )}

                    <div className={styles.cardFooter}>
                      <div className={styles.unitTag}>
                        <IconTruck size={14} /> {t.vehicleName}
                      </div>

                      {t.status === 'pending' && (
                        <button
                          className={styles.statusActionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(updateTaskStatus({ id: t.id, status: 'in_progress' }));
                          }}
                        >
                          Start
                        </button>
                      )}

                      {t.status === 'in_progress' && (
                        <button
                          className={styles.statusActionBtn}
                          style={{ borderColor: '#4ade80', color: '#4ade80' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(updateTaskStatus({ id: t.id, status: 'completed' }));
                          }}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
