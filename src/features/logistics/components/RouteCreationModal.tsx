import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  IconArrowLeft, IconX, IconPlus, IconTrash, IconMap2,
  IconRoute2, IconClock, IconWeight, IconCrosshair, IconChevronDown, IconChevronUp,
} from '@tabler/icons-react';
import {
  updateEditingRoute, addWaypoint, removeWaypoint, createRoute, cancelCreation,
} from '@/store/slices/logisticsSlice';
import type { WaypointType, RoutePriority, Waypoint } from '@/store/slices/logisticsSlice';
import type { Vehicle, Driver } from '@/types';
import styles from './RouteCreationModal.module.css';

// ─── Map marker icons ───────────────────────────────────────────────────────

const COLORS: Record<WaypointType, string> = {
  delivery: '#3b82f6',
  pickup: '#f59e0b',
  service: '#8b5cf6',
  checkpoint: '#06b6d4',
};

function makeIcon(type: WaypointType, seq: number) {
  const color = COLORS[type];
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;font-family:Inter,sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid #fff;
    ">${seq}</div>`,
  });
}

// ─── Click handler component ────────────────────────────────────────────────

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Waypoint Type Labels ───────────────────────────────────────────────────

const TYPE_LABELS: Record<WaypointType, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  service: 'Service',
  checkpoint: 'Checkpoint',
};

const TYPE_CSS: Record<WaypointType, string> = {
  delivery: styles.wpCardTypeDelivery,
  pickup: styles.wpCardTypePickup,
  service: styles.wpCardTypeService,
  checkpoint: styles.wpCardTypeCheckpoint,
};

const PRIORITY_OPTIONS: RoutePriority[] = ['low', 'normal', 'high', 'urgent'];
const PRIORITY_LABELS: Record<RoutePriority, string> = {
  low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent',
};

// ─── Add Waypoint Sub-form ──────────────────────────────────────────────────

interface WpFormData {
  name: string;
  address: string;
  lat: string;
  lng: string;
  type: WaypointType;
  timeWindowFrom: string;
  timeWindowTo: string;
  contactName: string;
  contactPhone: string;
  weight: string;
  orderNumber: string;
  notes: string;
}

const EMPTY_WP: WpFormData = {
  name: '', address: '', lat: '', lng: '', type: 'delivery',
  timeWindowFrom: '', timeWindowTo: '', contactName: '', contactPhone: '',
  weight: '', orderNumber: '', notes: '',
};

function WaypointSubform({
  initial,
  onSave,
  onCancel,
}: {
  initial: WpFormData;
  onSave: (data: WpFormData) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<WpFormData>(initial);
  const [showExtra, setShowExtra] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof WpFormData, v: string) => setData(prev => ({ ...prev, [k]: v }));

  // Sync coordinates when user clicks a new map location
  useEffect(() => {
    if (initial.lat && initial.lng) {
      setData(prev => ({ ...prev, lat: initial.lat, lng: initial.lng }));
    }
  }, [initial.lat, initial.lng]);

  // Auto-scroll into view when mounted
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const canAdd = !!(data.name && data.lat && data.lng);

  return (
    <div className={styles.wpSubform} ref={formRef}>
      <div className={styles.wpSubformTitle}>
        <IconCrosshair size={14} />
        Add Waypoint
      </div>

      <div className={styles.mapHint}>
        <IconMap2 size={12} />
        Click on the map to set coordinates
      </div>

      {/* Type selector */}
      <div className={styles.wpTypeRow}>
        {(['delivery', 'pickup', 'service', 'checkpoint'] as WaypointType[]).map(t => (
          <button
            key={t}
            type="button"
            className={`${styles.wpTypeOption} ${data.type === t ? styles.wpTypeActive : ''}`}
            onClick={() => set('type', t)}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Name — always visible */}
      <div className={styles.formGroup}>
        <input
          className={styles.formInput}
          placeholder="Name *"
          value={data.name}
          onChange={e => set('name', e.target.value)}
          autoFocus
        />
      </div>

      {/* Lat/Lng — always visible (read-only style showing map selection) */}
      <div className={styles.wpSubformRow}>
        <input className={styles.formInput} placeholder="Latitude" type="number" step="0.0001" value={data.lat} onChange={e => set('lat', e.target.value)} />
        <input className={styles.formInput} placeholder="Longitude" type="number" step="0.0001" value={data.lng} onChange={e => set('lng', e.target.value)} />
      </div>

      {/* Toggle for extra fields */}
      <button
        type="button"
        className={styles.wpSubformToggle}
        onClick={() => setShowExtra(!showExtra)}
      >
        {showExtra ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
        {showExtra ? 'Hide details' : 'More details (address, time, contact, weight...)'}
      </button>

      {/* Collapsible extra fields */}
      {showExtra && (
        <div className={styles.wpSubformExtra}>
          <div className={styles.formGroup}>
            <input className={styles.formInput} placeholder="Address" value={data.address} onChange={e => set('address', e.target.value)} />
          </div>

          {/* Time window */}
          <div className={styles.wpSubformRow}>
            <div>
              <label className={styles.formLabel}>From</label>
              <input className={styles.formInput} type="time" value={data.timeWindowFrom} onChange={e => set('timeWindowFrom', e.target.value)} />
            </div>
            <div>
              <label className={styles.formLabel}>To</label>
              <input className={styles.formInput} type="time" value={data.timeWindowTo} onChange={e => set('timeWindowTo', e.target.value)} />
            </div>
          </div>

          {/* Contact */}
          <div className={styles.wpSubformRow}>
            <input className={styles.formInput} placeholder="Contact name" value={data.contactName} onChange={e => set('contactName', e.target.value)} />
            <input className={styles.formInput} placeholder="Contact phone" value={data.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
          </div>

          {/* Weight / Order */}
          <div className={styles.wpSubformRow}>
            <input className={styles.formInput} placeholder="Weight (kg)" type="number" value={data.weight} onChange={e => set('weight', e.target.value)} />
            <input className={styles.formInput} placeholder="Order number" value={data.orderNumber} onChange={e => set('orderNumber', e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <textarea className={styles.formTextarea} placeholder="Notes" value={data.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: 40 }} />
          </div>
        </div>
      )}

      {/* Validation hints — only show before user starts filling */}
      {!data.name && !data.lat && (
        <div className={styles.validationError}>Name and coordinates are required</div>
      )}

      {/* Action buttons — always visible */}
      <div className={styles.wpSubformActions}>
        <button
          className={styles.wpSubformSave}
          onClick={() => canAdd && onSave(data)}
          disabled={!canAdd}
        >
          Add waypoint
        </button>
        <button className={styles.wpSubformCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export default function RouteCreationModal() {
  const dispatch = useDispatch();
  const editingRoute = useSelector((s: any) => s.logistics.editingRoute);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const drivers: Driver[] = useSelector((s: any) => s.drivers.items);
  const [showWpForm, setShowWpForm] = useState(false);
  const [wpFormData, setWpFormData] = useState<WpFormData>(EMPTY_WP);
  const formBodyRef = useRef<HTMLDivElement>(null);

  const waypoints: Waypoint[] = editingRoute?.waypoints || [];
  const mapCenter: [number, number] = waypoints.length > 0
    ? [waypoints[0].lat, waypoints[0].lng]
    : [7.2906, 80.6337]; // Default: Kandy

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const coords = { lat: lat.toFixed(4), lng: lng.toFixed(4) };
    if (showWpForm) {
      // Update coordinates in the existing form
      setWpFormData(prev => ({ ...prev, ...coords }));
    } else {
      // Open a new form with coordinates pre-filled
      setWpFormData({ ...EMPTY_WP, ...coords });
      setShowWpForm(true);
    }
    // Scroll left panel to bottom so the form is visible
    setTimeout(() => {
      formBodyRef.current?.scrollTo({
        top: formBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);
  }, [showWpForm]);

  const handleSaveWaypoint = (data: WpFormData) => {
    dispatch(addWaypoint({
      name: data.name,
      address: data.address,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng),
      type: data.type as WaypointType,
      timeWindowFrom: data.timeWindowFrom || null,
      timeWindowTo: data.timeWindowTo || null,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      weight: parseFloat(data.weight) || 0,
      orderNumber: data.orderNumber,
      notes: data.notes,
    }));
    setShowWpForm(false);
    setWpFormData(EMPTY_WP);
  };

  const canSave = !!(editingRoute?.name && editingRoute?.vehicleId && waypoints.length >= 2);

  const totalWeight = waypoints.reduce((sum, wp) => sum + (wp.weight || 0), 0);

  if (!editingRoute) return null;

  return (
    <div className={styles.overlay}>
      {/* ── Left: Form ─────────────────────────────────────────────── */}
      <div className={styles.leftPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <button className={styles.backBtn} onClick={() => dispatch(cancelCreation())}>
              <IconArrowLeft size={18} />
            </button>
            <span className={styles.panelTitle}>New Route</span>
          </div>
          <button className={styles.closeBtn} onClick={() => dispatch(cancelCreation())}>
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.formBody} ref={formBodyRef}>
          {/* Route name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Route Name *</label>
            <input
              className={styles.formInput}
              placeholder="e.g. Morning Deliveries — Kandy"
              value={editingRoute.name || ''}
              onChange={e => dispatch(updateEditingRoute({ name: e.target.value }))}
            />
          </div>

          {/* Vehicle & Driver */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vehicle *</label>
              <select
                className={styles.formSelect}
                value={editingRoute.vehicleId || ''}
                onChange={e => dispatch(updateEditingRoute({ vehicleId: e.target.value }))}
              >
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} — {v.plate}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Driver</label>
              <select
                className={styles.formSelect}
                value={editingRoute.driverId || ''}
                onChange={e => dispatch(updateEditingRoute({ driverId: e.target.value }))}
              >
                <option value="">Select driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Departure */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Departure Time *</label>
            <input
              className={styles.formInput}
              type="datetime-local"
              value={editingRoute.departureTime ? new Date(editingRoute.departureTime).toISOString().slice(0, 16) : ''}
              onChange={e => dispatch(updateEditingRoute({ departureTime: new Date(e.target.value).toISOString() }))}
            />
          </div>

          {/* Priority */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Priority</label>
            <div className={styles.priorityRow}>
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.priorityOption} ${editingRoute.priority === p ? styles.priorityOptionActive : ''}`}
                  onClick={() => dispatch(updateEditingRoute({ priority: p }))}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notes</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Route notes or special instructions..."
              value={editingRoute.notes || ''}
              onChange={e => dispatch(updateEditingRoute({ notes: e.target.value }))}
            />
          </div>

          {/* ── Waypoints ──────────────────────────────────────────── */}
          <div className={styles.wpSectionHeader}>
            <span className={styles.wpSectionTitle}>Waypoints</span>
            <span className={styles.wpCount}>{waypoints.length}</span>
          </div>

          {waypoints.length > 0 && (
            <div className={styles.wpList}>
              {waypoints.map((wp, i) => (
                <div key={wp.id} className={styles.wpCard}>
                  <div className={styles.wpCardSeq}>{i + 1}</div>
                  <div className={styles.wpCardContent}>
                    <div className={styles.wpCardName}>{wp.name}</div>
                    <div className={styles.wpCardMeta}>
                      <span className={`${styles.wpCardTypeBadge} ${TYPE_CSS[wp.type]}`}>
                        {TYPE_LABELS[wp.type]}
                      </span>
                      {wp.timeWindowFrom && (
                        <span className={styles.wpCardTag}>
                          <IconClock size={10} />
                          {wp.timeWindowFrom}{wp.timeWindowTo ? `–${wp.timeWindowTo}` : ''}
                        </span>
                      )}
                      {wp.weight > 0 && (
                        <span className={styles.wpCardTag}>
                          <IconWeight size={10} />
                          {wp.weight}kg
                        </span>
                      )}
                    </div>
                  </div>
                  <button className={styles.wpCardRemove} onClick={() => dispatch(removeWaypoint(wp.id))}>
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add waypoint subform */}
          {showWpForm ? (
            <WaypointSubform
              initial={wpFormData}
              onSave={handleSaveWaypoint}
              onCancel={() => { setShowWpForm(false); setWpFormData(EMPTY_WP); }}
            />
          ) : (
            <button className={styles.addWpBtn} onClick={() => { setShowWpForm(true); setTimeout(() => formBodyRef.current?.scrollTo({ top: formBodyRef.current.scrollHeight, behavior: 'smooth' }), 50); }}>
              <IconPlus size={14} />
              Add waypoint
            </button>
          )}

          {/* Route summary */}
          {waypoints.length > 0 && (
            <div className={styles.routeSummary}>
              <div className={styles.summaryTitle}>Route Summary</div>
              <div className={styles.summaryStats}>
                <span className={styles.summaryStat}>
                  <IconRoute2 size={14} />
                  {editingRoute.totalDistance || 0} km
                </span>
                <span className={styles.summaryStat}>
                  <IconClock size={14} />
                  ~{editingRoute.estimatedDuration || 0} min
                </span>
                <span className={styles.summaryStat}>
                  <IconWeight size={14} />
                  {totalWeight} kg
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.panelFooter}>
          <button
            className={styles.saveBtn}
            disabled={!canSave}
            onClick={() => dispatch(createRoute())}
          >
            <IconRoute2 size={16} />
            Save Route
          </button>
          <button className={styles.cancelFormBtn} onClick={() => dispatch(cancelCreation())}>
            Cancel
          </button>
        </div>
      </div>

      {/* ── Right: Map ─────────────────────────────────────────────── */}
      <div className={styles.rightPanel}>
        <div className={styles.mapContainer}>
          <div className={styles.mapOverlay}>
            <IconMap2 size={14} />
            Click on the map to add waypoints
          </div>
          <MapContainer
            center={mapCenter}
            zoom={waypoints.length > 0 ? 11 : 10}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Waypoint markers */}
            {waypoints.map((wp, i) => (
              <Marker
                key={wp.id}
                position={[wp.lat, wp.lng]}
                icon={makeIcon(wp.type, i + 1)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                    <strong>{wp.name}</strong>
                    {wp.address && <div style={{ fontSize: 11, color: '#64748b' }}>{wp.address}</div>}
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      {TYPE_LABELS[wp.type]}
                      {wp.weight > 0 && ` · ${wp.weight}kg`}
                      {wp.timeWindowFrom && ` · ${wp.timeWindowFrom}-${wp.timeWindowTo}`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route polyline */}
            {waypoints.length >= 2 && (
              <Polyline
                positions={waypoints.map(wp => [wp.lat, wp.lng] as [number, number])}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '8,6',
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
