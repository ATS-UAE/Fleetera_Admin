import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  IconX, IconWifi, IconUser, IconPhone,
  IconAlertTriangle, IconMenu2, IconChevronUp, IconChevronDown
} from '@tabler/icons-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';


import { recordAccess } from '@/store/slices/locationShareSlice';
import type { TrackingLink } from '@/store/slices/locationShareSlice';
import type { Vehicle, Driver } from '@/types';
import styles from './SharedLinkView.module.css';

const CAR_SVG = `
  <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="15" width="40" height="70" rx="8" fill="#e53935" />
    <rect x="35" y="25" width="30" height="15" rx="3" fill="#1e1e1e" />
    <rect x="35" y="60" width="30" height="15" rx="3" fill="#1e1e1e" />
    <rect x="27" y="20" width="4" height="12" rx="2" fill="#333" />
    <rect x="69" y="20" width="4" height="12" rx="2" fill="#333" />
    <rect x="27" y="65" width="4" height="12" rx="2" fill="#333" />
    <rect x="69" y="65" width="4" height="12" rx="2" fill="#333" />
  </svg>
`;

const STATUS_COLORS: Record<string, string> = {
  moving: '#10b981',
  idle: '#f59e0b',
  stopped: '#8b5cf6',
  offline: '#374151',
  maintenance: '#8b5cf6',
};

const STATUS_LABELS: Record<string, string> = {
  moving: 'Moving',
  idle: 'Idle',
  stopped: 'Parked',
  offline: 'Offline',
  maintenance: 'Maintenance',
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Simple reverse geocoding cache using Nominatim
const addressCache: Record<string, string> = {};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (addressCache[key]) return addressCache[key];
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await resp.json();
    const addr = data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    // Shorten: take first 3 parts
    const short = addr.split(',').slice(0, 3).join(',').trim();
    addressCache[key] = short;
    return short;
  } catch {
    const fallback = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    addressCache[key] = fallback;
    return fallback;
  }
}

function createVehicleIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 38 : 30;
  const borderW = isSelected ? 4 : 3;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: ${borderW}px solid #fff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35)${isSelected ? ', 0 0 0 4px ' + color + '55' : ''};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      ">
        <div style="width: 18px; height: 18px; display: flex;">
          ${CAR_SVG}
        </div>
      </div>
    `,
  });
}

// Map component that auto-fits bounds
function FitBounds({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  useEffect(() => {
    if (vehicles.length === 0) return;
    if (vehicles.length === 1) {
      map.setView([vehicles[0].lat, vehicles[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [vehicles, map]);
  return null;
}

// FlyTo selected vehicle
function FlyToVehicle({ vehicle }: { vehicle: Vehicle | null }) {
  const map = useMap();
  useEffect(() => {
    if (vehicle) {
      map.flyTo([vehicle.lat, vehicle.lng], 15, { duration: 0.8 });
    }
  }, [vehicle, map]);
  return null;
}

// VehicleCard with async address
function VehicleCard({ vehicle, link, isActive, onClick, driver }: {
  vehicle: Vehicle; link: TrackingLink; isActive: boolean;
  onClick: () => void; driver: Driver | null;
}) {
  const [address, setAddress] = useState<string>(`${vehicle.lat.toFixed(4)}°N, ${vehicle.lng.toFixed(4)}°E`);

  useEffect(() => {
    reverseGeocode(vehicle.lat, vehicle.lng).then(setAddress);
  }, [vehicle.lat, vehicle.lng]);

  const statusColor = STATUS_COLORS[vehicle.status] || '#6b7280';
  const statusLabel = STATUS_LABELS[vehicle.status] || vehicle.status;
  const isParkedLike = vehicle.status === 'stopped' || vehicle.status === 'idle';

  return (
    <div
      className={`${styles.vehicleCard} ${isActive ? styles.vehicleCardActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.vehicleCardHeader}>
        <div className={styles.vehicleCardIcon}>
          <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: CAR_SVG }} />
        </div>
        <span className={styles.vehicleCardName}>{vehicle.name}</span>
      </div>

      <div className={styles.vehicleCardAddress}>{address}</div>

      <div className={styles.vehicleCardMeta}>
        <span className={`${styles.statusBadge} ${isParkedLike ? styles.parkedBadge : ''}`} style={!isParkedLike ? {
          background: statusColor,
        } : undefined}>
          {isParkedLike ? null : (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#fff', display: 'inline-block',
            }} />
          )}
          {statusLabel}
        </span>
        <span className={styles.lastSeen}>
          <IconWifi size={12} />
          {timeAgo(vehicle.lastUpdate)}
        </span>
      </div>

      {/* Driver info */}
      {(link.showDriverName || link.showDriverPhone) && driver && (
        <div className={styles.driverInfo}>
          {link.showDriverName && (
            <span className={styles.driverLine}>
              <IconUser size={12} />
              {driver.name}
            </span>
          )}
          {link.showDriverPhone && (
            <span className={styles.driverLine}>
              <IconPhone size={12} />
              {driver.phone}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface SharedLinkViewProps {
  token: string;
  onClose?: () => void;
}

export default function SharedLinkView({ token, onClose }: SharedLinkViewProps) {
  const dispatch = useDispatch();
  const links: TrackingLink[] = useSelector((s: any) => s.locationShare.links);
  const allVehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const allDrivers: Driver[] = useSelector((s: any) => s.drivers.items);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const link = links.find(l => l.token === token);

  const recordedAccessRef = useRef<string | null>(null);

  useEffect(() => {
    if (link && recordedAccessRef.current !== token) {
      recordedAccessRef.current = token;
      dispatch(recordAccess(token));
    }
  }, [token, link, dispatch]);

  const isExpired = useMemo(() => {
    if (!link) return true;
    return new Date(link.expirationTime).getTime() <= Date.now();
  }, [link]);

  const linkedVehicles = useMemo(() => {
    if (!link) return [];
    return allVehicles.filter(v => link.vehicleIds.includes(v.id));
  }, [link, allVehicles]);

  const getDriverForVehicle = (vehicleId: string): Driver | null => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    if (!vehicle?.driverId) return null;
    return allDrivers.find(d => d.id === vehicle.driverId) || null;
  };

  const selectedVehicle = linkedVehicles.find(v => v.id === selectedVehicleId) || null;

  if (!link) {
    return (
      <div className={styles.container}>
        <div className={styles.expiredOverlay}>
          <div className={styles.expiredIcon}>
            <IconAlertTriangle size={32} />
          </div>
          <div className={styles.expiredTitle}>Link not found</div>
          <div className={styles.expiredDesc}>
            This tracking link does not exist or has been deleted.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Mobile toggle */}
      <button
        className={styles.toggleSidebarBtn}
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        <IconMenu2 size={18} />
      </button>

      {/* Left sidebar */}
      <div className={`${styles.sidebar} ${!sidebarVisible ? styles.sidebarHidden : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.linkName}>{link.name}</span>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
            </button>
            <button className={styles.iconBtn} onClick={onClose || (() => setSidebarVisible(false))}>
              <IconX size={16} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className={styles.vehicleList}>
            {linkedVehicles.map(v => {
              const driver = getDriverForVehicle(v.id);
              const isActive = selectedVehicleId === v.id;
              return (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  link={link}
                  isActive={isActive}
                  onClick={() => setSelectedVehicleId(isActive ? null : v.id)}
                  driver={driver}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Map */}
      <div className={styles.mapWrap}>
        <MapContainer
          center={linkedVehicles.length > 0 ? [linkedVehicles[0].lat, linkedVehicles[0].lng] : [7.29, 80.63]}
          zoom={12}
          className={styles.mapFull}
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <FitBounds vehicles={linkedVehicles} />
          <FlyToVehicle vehicle={selectedVehicle} />

          {linkedVehicles.map(v => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(STATUS_COLORS[v.status] || '#3b82f6', selectedVehicleId === v.id)}
              eventHandlers={{
                click: () => setSelectedVehicleId(v.id),
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                  <strong>{v.name}</strong><br />
                  <span style={{ color: '#666' }}>{v.plate}</span><br />
                  <span style={{ color: STATUS_COLORS[v.status] }}>{STATUS_LABELS[v.status] || v.status}</span>
                  {v.speed > 0 && <span> • {v.speed} km/h</span>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Show tracks if enabled */}
          {link.showTracks && linkedVehicles.map(v => {
            if (v.track && v.track.length > 1) {
              return (
                <Polyline
                  key={`track-${v.id}`}
                  positions={v.track.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: STATUS_COLORS[v.status] || '#3b82f6',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '6 4',
                  }}
                />
              );
            }
            return null;
          })}
        </MapContainer>

        {/* Expired overlay */}
        {isExpired && (
          <div className={styles.expiredOverlay}>
            <div className={styles.expiredIcon}>
              <IconAlertTriangle size={32} />
            </div>
            <div className={styles.expiredTitle}>This link has expired</div>
            <div className={styles.expiredDesc}>
              The tracking link "{link.name}" is no longer active.
              Contact the link creator to get a new one.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
