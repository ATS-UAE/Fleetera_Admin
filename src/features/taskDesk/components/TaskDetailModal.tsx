import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconX, IconMapPin, IconClock, IconUser, IconTruck, IconCheck,
  IconChecklist, IconMessage, IconPlus, IconAlertTriangle, IconSend, IconExternalLink
} from '@tabler/icons-react';
import {
  setSelectedTaskId, updateTaskStatus, toggleSubtask, addTaskNote, deleteTask
} from '@/store/slices/taskDeskSlice';
import styles from './TaskDeskPage.module.css';

export default function TaskDetailModal() {
  const dispatch = useDispatch();
  const selectedTaskId = useSelector((s: any) => s.taskDesk.selectedTaskId);
  const tasks = useSelector((s: any) => s.taskDesk.tasks);

  const [newNote, setNewNote] = useState<string>('');

  const task = tasks.find((t: any) => t.id === selectedTaskId);
  if (!selectedTaskId || !task) return null;

  const handleClose = () => dispatch(setSelectedTaskId(null));

  const handleStatusChange = (status: any) => {
    dispatch(updateTaskStatus({ id: task.id, status }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    dispatch(addTaskNote({ taskId: task.id, author: 'Fleet Supervisor', text: newNote.trim() }));
    setNewNote('');
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.p_critical;
      case 'high': return styles.p_high;
      case 'medium': return styles.p_medium;
      default: return styles.p_low;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow} style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`${styles.priorityBadge} ${getPriorityStyle(task.priority)}`}>
              {task.priority} Priority
            </span>
            <span className={styles.taskNumber}>{task.taskNumber}</span>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px 0', color: '#f8fafc' }}>
            {task.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
              <IconTruck size={15} /> {task.vehicleName}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
              <IconUser size={15} /> {task.assignedTo || 'Unassigned'}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
              <IconClock size={15} /> Created: {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Origin Automation Rule Banner */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AUTOMATION ORIGIN RULE & TRIGGER
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', marginTop: '4px' }}>
              Rule: "{task.originRuleName || 'Custom Automation Rule'}"
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              Trigger Event: <strong style={{ color: '#38bdf8' }}>{task.triggerLabel || task.triggerType}</strong>
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
            {task.description}
          </div>

          {/* Telemetry / Location Details */}
          {task.telemetryData && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
                TRIGGER TELEMETRY & LOCATION DETAILS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {task.location && (
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Location:</span> {task.location.name}
                  </div>
                )}
                {Object.entries(task.telemetryData).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                    <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{key}:</span> {String(val)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Subtask Checklist */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconChecklist size={18} color="#38bdf8" /> Action Items Checklist ({task.subtasks.filter((s: any) => s.completed).length} / {task.subtasks.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {task.subtasks.map((subtask: any) => (
                <label
                  key={subtask.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: subtask.completed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(30, 41, 59, 0.6)',
                    border: `1px solid ${subtask.completed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: subtask.completed ? '#4ade80' : '#e2e8f0',
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => dispatch(toggleSubtask({ taskId: task.id, subtaskId: subtask.id }))}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                  {subtask.title}
                </label>
              ))}
            </div>
          </div>

          {/* Activity Log / Notes */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconMessage size={18} color="#60a5fa" /> Activity Log & Inspector Notes
            </h3>

            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Add inspection note or update comment..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              <button type="submit" className={styles.btnPrimary} style={{ whiteSpace: 'nowrap' }}>
                <IconSend size={15} /> Add Note
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {task.notes.map((note: any) => (
                <div
                  key={note.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>{note.author}</span>
                    <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                    {note.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={styles.btnSecondary}
              style={{ color: '#ef4444' }}
              onClick={() => dispatch(deleteTask(task.id))}
            >
              Delete Task
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {task.status !== 'in_progress' && task.status !== 'completed' && (
              <button className={styles.btnSecondary} onClick={() => handleStatusChange('in_progress')}>
                Start Task
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                className={styles.btnPrimary}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                onClick={() => handleStatusChange('completed')}
              >
                <IconCheck size={16} /> Complete Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
