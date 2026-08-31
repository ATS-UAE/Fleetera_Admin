import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Modal, TextInput, ActionIcon, Group, Button, Text } from '@mantine/core';
import { IconSearch, IconArrowRight, IconMapPin, IconCheck } from '@tabler/icons-react';
import { searchAddress, reverseGeocode } from '@/lib/mapUtils/geocode';
import type { GeocodeResult } from '@/lib/mapUtils/geocode';
import styles from './MaintenancePage.module.css';

const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708]; // Dubai
const DEFAULT_ZOOM = 11;

const pinIcon = L.divIcon({
  className: '',
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  html: `<div style="
    width:26px;height:26px;border-radius:50% 50% 50% 0;
    background:#e53935;border:2px solid #fff;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.8 });
  }, [target]);
  return null;
}

export interface PickedLocation {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerModalProps {
  opened: boolean;
  onClose: () => void;
  initial?: { lat: number; lng: number } | null;
  onConfirm: (result: PickedLocation) => void;
}

export default function LocationPickerModal({ opened, onClose, initial, onConfirm }: LocationPickerModalProps) {
  const [pin, setPin] = useState<[number, number] | null>(initial ? [initial.lat, initial.lng] : null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (opened) {
      setPin(initial ? [initial.lat, initial.lng] : DEFAULT_CENTER);
      setFlyTarget(null);
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedAddress(null);
      skipNextSearchRef.current = false;
    }
  }, [opened]);

  // Keep the "Selected location" preview in sync with the pin, however it moved
  // (map click, search pick, etc.) — this is also what gets sent on Confirm.
  useEffect(() => {
    if (!pin) {
      setSelectedAddress(null);
      return;
    }
    let cancelled = false;
    setResolvingAddress(true);
    reverseGeocode(pin[0], pin[1])
      .then(addr => { if (!cancelled) setSelectedAddress(addr); })
      .finally(() => { if (!cancelled) setResolvingAddress(false); });
    return () => { cancelled = true; };
  }, [pin]);

  // Debounced live search-as-you-type — populates the suggestions dropdown.
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddress(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSuggestion = (r: GeocodeResult) => {
    skipNextSearchRef.current = true;
    const target: [number, number] = [r.lat, r.lng];
    setPin(target);
    setFlyTarget(target);
    setQuery(r.displayName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    if (searching) return;
    if (suggestions[0]) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchAddress(query);
      if (results[0]) handleSelectSuggestion(results[0]);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    if (!pin) return;
    setConfirming(true);
    try {
      const address = selectedAddress || await reverseGeocode(pin[0], pin[1]);
      onConfirm({ lat: pin[0], lng: pin[1], address });
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Pick location" size="xl" zIndex={2200}>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Group gap="xs" wrap="nowrap">
          <TextInput
            style={{ flex: 1 }}
            placeholder="Search for an address..."
            leftSection={<IconSearch size={14} />}
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
          />
          <ActionIcon size="lg" onClick={handleSearch} loading={searching}>
            <IconArrowRight size={16} />
          </ActionIcon>
        </Group>

        {showSuggestions && suggestions.length > 0 && (
          <div
            className={styles.dropdownPopup}
            style={{ width: '100%', maxHeight: 260, overflowY: 'auto' }}
            onMouseDown={e => e.preventDefault()}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                className={styles.dropdownOption}
                onClick={() => handleSelectSuggestion(s)}
                style={{ whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.4 }}
              >
                <IconMapPin size={13} style={{ flexShrink: 0, opacity: 0.6, marginTop: 2 }} />
                <span>{s.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
        {opened && (
          <MapContainer center={pin || DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={(lat, lng) => setPin([lat, lng])} />
            <FlyTo target={flyTarget} />
            {pin && (
              <Marker position={pin} icon={pinIcon}>
                <Tooltip permanent direction="top" offset={[0, -30]}>
                  Click anywhere to drop a pin
                </Tooltip>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {pin && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 8, marginTop: 12,
          border: '1px solid var(--fv-accent)',
          background: 'var(--mantine-color-blue-light)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fv-accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconMapPin size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600} truncate>
              {resolvingAddress ? 'Resolving address…' : (selectedAddress || 'Unknown location')}
            </Text>
            <Text size="xs" c="dimmed">{pin[0].toFixed(5)}, {pin[1].toFixed(5)}</Text>
          </div>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            <IconCheck size={14} color="var(--fv-accent)" />
            <Text size="xs" fw={600} c="blue">Selected</Text>
          </Group>
        </div>
      )}

      <Group justify="center" mt="sm" mb="md" gap={6}>
        <Text size="xs" c="dimmed">① Search for an address above</Text>
        <Text size="xs" c="dimmed">OR</Text>
        <Text size="xs" c="dimmed">② Click anywhere on the map</Text>
      </Group>

      <Group justify="center">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} loading={confirming} disabled={!pin}>
          Confirm location
        </Button>
      </Group>
    </Modal>
  );
}
