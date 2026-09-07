import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconBell, IconX, IconTrash, IconInfoCircle, IconAlertTriangle,
  IconCheck, IconGasStation, IconBellOff, IconFilter
} from '@tabler/icons-react';
import {
  setNotificationsModalOpen, removeNotification, clearNotifications
} from '@/store/slices/uiSlice';
import { activityFeed as mockNotifications } from '@/data';
import styles from './NotificationModal.module.css';

const SEVERITY_META: Record<string, { color: string; bg: string; icon: any }> = {
  info:    { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: IconInfoCircle },
  warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: IconAlertTriangle },
  danger:  { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: IconGasStation },
  success: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: IconCheck },
};

export default function NotificationModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((s: any) => s.ui.notificationsModalOpen);
  const storeNotifs = useSelector((s: any) => s.ui.notifications);
  
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  if (!isOpen) return null;

  // Use store notifications if available, otherwise mock notifications
  const allNotifs = storeNotifs.length > 0 ? storeNotifs : mockNotifications;

  const filtered = allNotifs.filter((n: any) => {
    if (filterSeverity === 'all') return true;
    return n.severity === filterSeverity;
  });

  const handleClose = () => dispatch(setNotificationsModalOpen(false));

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.bellBadgeIcon}>
              <IconBell size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Notification Center</h2>
              <p className={styles.subtitle}>
                System alerts, geofence breaches, and maintenance events ({allNotifs.length} total)
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} title="Close">
            <IconX size={18} />
          </button>
        </div>

        {/* Toolbar with severity filter pills */}
        <div className={styles.toolbar}>
          <div className={styles.filterPills}>
            {['all', 'info', 'warning', 'danger', 'success'].map(sev => (
              <button
                key={sev}
                className={`${styles.pill} ${filterSeverity === sev ? styles.pillActive : ''}`}
                onClick={() => setFilterSeverity(sev)}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Body list */}
        <div className={styles.body}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <IconBellOff size={32} />
              <span>No notifications in this category.</span>
            </div>
          ) : (
            filtered.map((n: any) => {
              const meta = SEVERITY_META[n.severity] || SEVERITY_META.info;
              const NIcon = meta.icon;
              return (
                <div key={n.id} className={styles.notifCard}>
                  <div
                    className={styles.notifIcon}
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    <NIcon size={16} />
                  </div>
                  <div className={styles.notifContent}>
                    <div className={styles.notifHeader}>
                      <span className={styles.vehicleTag}>{n.vehicle}</span>
                      <span className={styles.timeTag}>{n.time || 'Just now'}</span>
                    </div>
                    <div className={styles.notifDetail}>
                      {n.zone ? `Geofence event: ${n.zone}` : n.detail || n.type}
                    </div>
                  </div>
                  <button
                    className={styles.dismissBtn}
                    onClick={() => dispatch(removeNotification(n.id))}
                    title="Dismiss"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
          {allNotifs.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={() => dispatch(clearNotifications())}
            >
              <IconTrash size={14} /> Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
