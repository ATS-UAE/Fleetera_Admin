/* ─── DashboardToolbar — Edit mode controls ──────────────────────────── */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  IconPlus, IconArrowBackUp, IconArrowForwardUp,
  IconDeviceFloppy, IconX, IconEye, IconEdit, IconPalette,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import {
  setEditMode, saveLayout, cancelEdit, undo, redo,
  setWidgetLibraryOpen, setThemeCustomizerOpen, setManageWidgetsOpen,
} from '@/store/slices/dashboardSlice';
import styles from './DashboardToolbar.module.css';

export default function DashboardToolbar() {
  const dispatch = useDispatch();
  const editMode = useSelector((s: any) => s.dashboard.editMode);
  const undoLen = useSelector((s: any) => s.dashboard.undoStack.length);
  const redoLen = useSelector((s: any) => s.dashboard.redoStack.length);

  if (!editMode) {
    return (
      <div className={styles.viewBar}>
        <button className={styles.editBtn} onClick={() => dispatch(setEditMode(true))}>
          <IconEdit size={14} /> Edit Dashboard
        </button>
        <button className={styles.iconBtn} onClick={() => dispatch(setThemeCustomizerOpen(true))} title="Theme">
          <IconPalette size={15} />
        </button>
        <button className={styles.iconBtn} onClick={() => dispatch(setManageWidgetsOpen(true))} title="Manage Widgets">
          <IconLayoutDashboard size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.editBadge}>
        <IconEdit size={13} /> Editing
      </div>

      <div className={styles.separator} />

      <button className={styles.toolBtn} onClick={() => dispatch(setWidgetLibraryOpen(true))}>
        <IconPlus size={14} /> Add Widget
      </button>

      <div className={styles.separator} />

      <button className={styles.toolBtnIcon} disabled={undoLen <= 1} onClick={() => dispatch(undo())} title="Undo">
        <IconArrowBackUp size={15} />
      </button>
      <button className={styles.toolBtnIcon} disabled={redoLen === 0} onClick={() => dispatch(redo())} title="Redo">
        <IconArrowForwardUp size={15} />
      </button>

      <div className={styles.spacer} />

      <button className={styles.toolBtnSecondary} onClick={() => dispatch(cancelEdit())}>
        <IconX size={14} /> Cancel
      </button>
      <button className={styles.toolBtnPrimary} onClick={() => dispatch(saveLayout())}>
        <IconDeviceFloppy size={14} /> Save Layout
      </button>
    </div>
  );
}
