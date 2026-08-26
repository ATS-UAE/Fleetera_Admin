import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconArrowLeft, IconSearch, IconCheck, IconPlus, IconTruck,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  setView, updateEditingLink, createLink,
} from '@/store/slices/locationShareSlice';
import type { LifespanUnit } from '@/store/slices/locationShareSlice';
import type { Vehicle } from '@/types';
import styles from './NewLinkForm.module.css';

const STATUS_COLORS: Record<string, string> = {
  moving: '#10b981',
  idle: '#f59e0b',
  stopped: '#6b7280',
  offline: '#374151',
  maintenance: '#8b5cf6',
};

export default function NewLinkForm() {
  const dispatch = useDispatch();
  const editingLink = useSelector((s: any) => s.locationShare.editingLink);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const [vehicleSearch, setVehicleSearch] = useState('');

  if (!editingLink) return null;

  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.plate.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectedIds: string[] = editingLink.vehicleIds || [];

  const toggleVehicle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(vid => vid !== id)
      : selectedIds.length < 10
        ? [...selectedIds, id]
        : selectedIds;
    dispatch(updateEditingLink({ vehicleIds: next }));
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredVehicles.length) {
      dispatch(updateEditingLink({ vehicleIds: [] }));
    } else {
      dispatch(updateEditingLink({ vehicleIds: filteredVehicles.slice(0, 10).map(v => v.id) }));
    }
  };

  const handleSave = () => {
    if (!editingLink.name || selectedIds.length === 0) return;
    dispatch(createLink());
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => dispatch(setView('list'))}>
          Location share
        </button>
        <IconChevronRight size={12} />
        <span>New tracking link</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => dispatch(setView('list'))}>
          <IconArrowLeft size={20} />
        </button>
        <h2 className={styles.headerTitle}>New tracking link</h2>
      </div>

      {/* Content — two columns */}
      <div className={styles.content}>
        {/* Left: Form */}
        <div className={styles.formColumn}>
          <div className={styles.formSection}>
            {/* Name */}
            <div className={styles.formGroup}>
              <input
                className={styles.formInput}
                placeholder="Name *"
                value={editingLink.name || ''}
                onChange={e => dispatch(updateEditingLink({ name: e.target.value }))}
              />
              <span style={{ fontSize: 11, color: 'var(--fv-text-muted)' }}>
                Shown to the recipient as a heading
              </span>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <textarea
                className={styles.formTextarea}
                placeholder="Description"
                value={editingLink.description || ''}
                onChange={e => dispatch(updateEditingLink({ description: e.target.value }))}
              />
            </div>

            {/* Activation time */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Activation time</label>
              <input
                className={styles.formInput}
                type="datetime-local"
                value={editingLink.activationTime ? new Date(editingLink.activationTime).toISOString().slice(0, 16) : ''}
                onChange={e => dispatch(updateEditingLink({ activationTime: new Date(e.target.value).toISOString() }))}
              />
            </div>

            {/* Lifespan */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Life span</label>
              <div className={styles.lifespanRow}>
                <input
                  className={styles.lifespanInput}
                  type="number"
                  min="1"
                  value={editingLink.lifespanValue || 2}
                  onChange={e => dispatch(updateEditingLink({ lifespanValue: parseInt(e.target.value) || 1 }))}
                />
                <select
                  className={styles.lifespanSelect}
                  value={editingLink.lifespanUnit || 'hours'}
                  onChange={e => dispatch(updateEditingLink({ lifespanUnit: e.target.value as LifespanUnit }))}
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            </div>

            {/* Extra data */}
            <div className={styles.toggleGroup}>
              <div className={styles.toggleGroupTitle}>Extra data to display</div>

              <div className={styles.toggleItem}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={editingLink.showDriverName || false}
                    onChange={e => dispatch(updateEditingLink({ showDriverName: e.target.checked }))}
                  />
                  <span className={styles.toggleSlider} />
                </label>
                <span className={styles.toggleLabel}>Driver name</span>
              </div>

              <div className={styles.toggleItem}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={editingLink.showDriverPhone || false}
                    onChange={e => dispatch(updateEditingLink({ showDriverPhone: e.target.checked }))}
                  />
                  <span className={styles.toggleSlider} />
                </label>
                <span className={styles.toggleLabel}>Driver phone</span>
              </div>

              <div className={styles.toggleItem}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={editingLink.showTracks || false}
                    onChange={e => dispatch(updateEditingLink({ showTracks: e.target.checked }))}
                  />
                  <span className={styles.toggleSlider} />
                </label>
                <span className={styles.toggleLabel}>Tracks</span>
              </div>
            </div>

            {/* Additional properties dropdown */}
            <select className={styles.dropdown} disabled>
              <option>Additional properties (Vehicles)</option>
            </select>

            {/* Save / Cancel */}
            <div className={styles.formFooter}>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!editingLink.name || selectedIds.length === 0}
                style={{ opacity: (!editingLink.name || selectedIds.length === 0) ? 0.5 : 1 }}
              >
                Save
              </button>
              <button className={styles.cancelBtn} onClick={() => dispatch(setView('list'))}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Right: Vehicle selection */}
        <div className={styles.vehicleColumn}>
          <div className={styles.vehicleHeader}>
            <div>
              <span className={styles.vehicleTitle}>Vehicles</span>
              <span className={styles.vehicleTitleRequired}> *</span>
            </div>
            <button className={styles.addVehicleBtn}>
              <IconPlus size={13} />
              Add
            </button>
          </div>

          {/* Search */}
          <div className={styles.vehicleSearchBox}>
            <IconSearch size={16} />
            <input
              className={styles.vehicleSearchInput}
              placeholder="Search"
              value={vehicleSearch}
              onChange={e => setVehicleSearch(e.target.value)}
            />
          </div>

          {/* Hint */}
          <div className={styles.vehicleHint}>
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === Math.min(filteredVehicles.length, 10)}
              onChange={toggleAll}
              style={{ marginRight: 6, cursor: 'pointer' }}
            />
            You can select up to 10 devices.
          </div>

          {/* Vehicle list */}
          <div className={styles.vehicleList}>
            {filteredVehicles.map(v => {
              const isSelected = selectedIds.includes(v.id);
              return (
                <div
                  key={v.id}
                  className={styles.vehicleItem}
                  onClick={() => toggleVehicle(v.id)}
                >
                  <div className={`${styles.vehicleCheckbox} ${isSelected ? styles.vehicleCheckboxChecked : ''}`}>
                    {isSelected && <IconCheck size={11} />}
                  </div>
                  <div
                    className={styles.vehicleIcon}
                    style={{ background: `${STATUS_COLORS[v.status] || '#3b82f6'}22` }}
                  >
                    <IconTruck size={16} style={{ color: STATUS_COLORS[v.status] || '#3b82f6' }} />
                  </div>
                  <span className={styles.vehicleName}>{v.name}</span>
                </div>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--fv-accent)', fontWeight: 600 }}>
              {selectedIds.length} vehicle{selectedIds.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
