/* ─── WidgetWrapper — Card chrome for every dashboard widget ──────────── */
import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Menu } from '@mantine/core';
import {
  IconDotsVertical, IconRefresh, IconSettings, IconCopy,
  IconEdit, IconMaximize, IconPin, IconPinFilled, IconLock, IconLockOpen,
  IconEyeOff, IconTrash, IconGripVertical, IconPhoto,
  IconFileSpreadsheet, IconArrowsMaximize,
} from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import {
  removeWidget, duplicateWidget, toggleWidgetPin, toggleWidgetLock,
  toggleWidgetHidden, setWidgetSettingsId, setFullscreenWidget,
  resizeWidget,
} from '@/store/slices/dashboardSlice';
import type { WidgetInstance } from '../widgets/types';
import styles from './WidgetWrapper.module.css';

interface Props {
  widget: WidgetInstance;
  isEditMode: boolean;
  children: React.ReactNode;
}

function resolveIcon(name?: string) {
  if (!name) return null;
  return (TablerIcons as any)[name] || null;
}

export default function WidgetWrapper({ widget, isEditMode, children }: Props) {
  const dispatch = useDispatch();
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(widget.title);

  const isStatWidget = widget.type.startsWith('stat-');

  const handleRename = useCallback(() => {
    if (renameVal.trim()) {
      dispatch({ type: 'dashboard/updateWidget', payload: { id: widget.id, changes: { title: renameVal.trim() } } });
    }
    setRenaming(false);
  }, [dispatch, widget.id, renameVal]);

  const glassStyle = widget.style.widgetTheme === 'glass' ? styles.glass : '';
  const minimalStyle = widget.style.widgetTheme === 'minimal' ? styles.minimal : '';

  return (
    <div
      className={`${styles.card} ${isEditMode ? styles.editMode : ''} ${glassStyle} ${minimalStyle}`}
      style={{
        backgroundColor: widget.style.backgroundColor || undefined,
        borderRadius: widget.style.borderRadius != null ? `${widget.style.borderRadius}px` : undefined,
        boxShadow: widget.style.shadow === 'none' ? 'none'
          : widget.style.shadow === 'lg' ? 'var(--fv-shadow-lg)'
          : widget.style.shadow === 'glow' ? 'var(--fv-shadow-glow)'
          : undefined,
      }}
    >
      {/* Header (hidden for stat cards that don't need it) */}
      {!isStatWidget && (
        <div className={styles.header} style={{ background: widget.style.headerColor || undefined }}>
          {isEditMode && (
            <span className={`${styles.dragHandle} widget-drag-handle`}>
              <IconGripVertical size={14} />
            </span>
          )}

          {/* Badges */}
          {widget.pinned && <IconPinFilled size={12} className={styles.badge} />}
          {widget.locked && <IconLock size={12} className={styles.badge} />}

          {/* Title */}
          {renaming ? (
            <input
              className={styles.renameInput}
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
              autoFocus
            />
          ) : (
            <span className={styles.title}>{widget.title}</span>
          )}

          {/* Live dot for activity widgets */}
          {widget.type.startsWith('activity-') && (
            <span className={styles.liveDot}><span className="status-dot moving" /> Live</span>
          )}

          {/* Three‑dot menu */}
          <WidgetMenu
            widget={widget}
            isEditMode={isEditMode}
            onRename={() => { setRenameVal(widget.title); setRenaming(true); }}
            dispatch={dispatch}
          />
        </div>
      )}

      {/* Stat widgets: drag handle + menu overlaid */}
      {isStatWidget && (
        <div className={styles.statOverlay}>
          {isEditMode && (
            <span className={`${styles.dragHandle} widget-drag-handle`}>
              <IconGripVertical size={14} />
            </span>
          )}
          {widget.pinned && <IconPinFilled size={12} className={styles.badge} />}
          {widget.locked && <IconLock size={12} className={styles.badge} />}
          <div style={{ flex: 1 }} />
          <WidgetMenu
            widget={widget}
            isEditMode={isEditMode}
            onRename={() => { setRenameVal(widget.title); setRenaming(true); }}
            dispatch={dispatch}
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
}

/* ─── Widget Context Menu ─────────────────────────────────────────────── */
function WidgetMenu({ widget, isEditMode, onRename, dispatch }: {
  widget: WidgetInstance; isEditMode: boolean; onRename: () => void; dispatch: any;
}) {
  return (
    <Menu shadow="lg" width={200} position="bottom-end" withinPortal>
      <Menu.Target>
        <button className={styles.menuBtn}>
          <IconDotsVertical size={14} />
        </button>
      </Menu.Target>
      <Menu.Dropdown className={styles.menuDropdown}>
        <Menu.Item leftSection={<IconRefresh size={14} />}>Refresh</Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}
          onClick={() => dispatch(setWidgetSettingsId(widget.id))}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconCopy size={14} />}
          onClick={() => dispatch(duplicateWidget(widget.id))}>
          Duplicate
        </Menu.Item>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={onRename}>
          Rename
        </Menu.Item>

        {/* Resize presets */}
        <Menu.Label>Resize</Menu.Label>
        <Menu.Item onClick={() => dispatch(resizeWidget({ id: widget.id, w: 2, h: 2 }))}>Small (2×2)</Menu.Item>
        <Menu.Item onClick={() => dispatch(resizeWidget({ id: widget.id, w: 4, h: 3 }))}>Medium (4×3)</Menu.Item>
        <Menu.Item onClick={() => dispatch(resizeWidget({ id: widget.id, w: 6, h: 4 }))}>Large (6×4)</Menu.Item>
        <Menu.Item onClick={() => dispatch(resizeWidget({ id: widget.id, w: 12, h: 6 }))}>Extra Large (12×6)</Menu.Item>

        <Menu.Divider />
        <Menu.Item leftSection={<IconMaximize size={14} />}
          onClick={() => dispatch(setFullscreenWidget(widget.id))}>
          Fullscreen
        </Menu.Item>
        <Menu.Item leftSection={widget.pinned ? <IconPinFilled size={14} /> : <IconPin size={14} />}
          onClick={() => dispatch(toggleWidgetPin(widget.id))}>
          {widget.pinned ? 'Unpin' : 'Pin'}
        </Menu.Item>
        <Menu.Item leftSection={widget.locked ? <IconLockOpen size={14} /> : <IconLock size={14} />}
          onClick={() => dispatch(toggleWidgetLock(widget.id))}>
          {widget.locked ? 'Unlock' : 'Lock'}
        </Menu.Item>
        <Menu.Item leftSection={<IconEyeOff size={14} />}
          onClick={() => dispatch(toggleWidgetHidden(widget.id))}>
          Hide
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconTrash size={14} />} color="red"
          onClick={() => dispatch(removeWidget(widget.id))}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
