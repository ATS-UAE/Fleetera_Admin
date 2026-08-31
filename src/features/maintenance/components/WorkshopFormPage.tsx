import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Text, Button, Group, Card,
  TextInput, UnstyledButton,
} from '@mantine/core';
import {
  IconArrowLeft, IconChevronRight, IconInfoCircle, IconSettings2, IconHome2,
  IconBuildingStore, IconMapPin, IconAlertTriangle,
} from '@tabler/icons-react';
import { addWorkshop, updateWorkshop } from '@/store/slices/maintenanceSlice';
import type { Workshop, WorkshopType } from '@/store/slices/maintenanceSlice';
import LocationPickerModal from './LocationPickerModal';
import type { PickedLocation } from './LocationPickerModal';
import ServiceItemsView from './ServiceItemsView';
import UnsavedChangesModal from './UnsavedChangesModal';
import { useUnsavedChangesGuard } from './UnsavedChangesContext';
import pageStyles from './MaintenancePage.module.css';

function TypeCard({ selected, onClick, title, desc, icon, color }: {
  selected: boolean; onClick: () => void; title: string; desc: string; icon: React.ReactNode; color: string;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 8, flex: 1,
        border: `1px solid ${selected ? `var(--mantine-color-${color}-6)` : 'var(--fv-border)'}`,
        background: selected ? `var(--mantine-color-${color}-light)` : 'var(--fv-bg-panel)',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `var(--mantine-color-${color}-6)`, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <Text size="sm" fw={600} c={selected ? color : undefined}>{title}</Text>
        <Text size="xs" c="dimmed">{desc}</Text>
      </div>
    </UnstyledButton>
  );
}

interface WorkshopFormPageProps {
  workshop: Workshop | null;
  onBack: () => void;
}

export default function WorkshopFormPage({ workshop, onBack }: WorkshopFormPageProps) {
  const dispatch = useDispatch();
  const isEdit = !!workshop;

  const [name, setName] = useState(workshop?.name || '');
  const [type, setType] = useState<WorkshopType>(workshop?.type || 'external');
  const [location, setLocation] = useState(workshop?.location || '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('details');

  const canSave = !!name.trim();
  const isDirty = name !== (workshop?.name || '')
    || type !== (workshop?.type || 'external')
    || location !== (workshop?.location || '');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const requestBack = () => {
    if (isDirty) setShowUnsavedModal(true);
    else onBack();
  };

  const persist = () => {
    if (!canSave) return;
    const payload = { name: name.trim(), location, type };
    if (isEdit && workshop) {
      dispatch(updateWorkshop({ id: workshop.id, updates: payload }));
    } else {
      dispatch(addWorkshop(payload));
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    persist();
    onBack();
  };

  // Registers this form with the shared unsaved-changes guard so switching the
  // top-level Maintenance tabs (owned by MaintenancePage, above this form) also
  // warns before discarding changes — re-registered every render so the guard
  // always calls back into the latest persist()/isDirty, not a stale closure.
  const { setGuard } = useUnsavedChangesGuard();
  React.useEffect(() => {
    setGuard({ isDirty, onSave: persist });
    return () => setGuard(null);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
      <div className={pageStyles.breadcrumb}>
        <button className={pageStyles.breadcrumbLink} onClick={requestBack}>Maintenance</button>
        <IconChevronRight size={12} />
        <button className={pageStyles.breadcrumbLink} onClick={requestBack}>Workshops</button>
        <IconChevronRight size={12} />
        <span>{isEdit ? workshop!.name : 'New workshop'}</span>
      </div>

      <div className={pageStyles.detailHeader}>
        <button className={pageStyles.backBtn} onClick={requestBack}>
          <IconArrowLeft size={20} />
        </button>
        <h2 className={pageStyles.detailTitle}>{isEdit ? workshop!.name : 'New workshop'}</h2>
      </div>

      <div className={pageStyles.detailTabs}>
        <button
          className={`${pageStyles.detailTab} ${activeTab === 'details' ? pageStyles.detailTabActive : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconInfoCircle size={14} />
            Details
          </span>
        </button>
        <button
          className={`${pageStyles.detailTab} ${activeTab === 'items' ? pageStyles.detailTabActive : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconSettings2 size={14} />
            Service items
          </span>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 32px 24px' }}>
        {activeTab === 'details' ? (
          <div style={{ maxWidth: 640 }}>
            <Card withBorder mb="md">
              <Text fw={600} mb="md">Workshop details</Text>
              <TextInput
                label="Name"
                placeholder="Workshop name (required)"
                required
                value={name}
                onChange={e => setName(e.currentTarget.value)}
                mb="md"
              />
              <Text size="sm" fw={500} mb={6}>Type</Text>
              <Group grow>
                <TypeCard
                  selected={type === 'internal'}
                  onClick={() => setType('internal')}
                  title="Internal"
                  desc="In-house facility"
                  icon={<IconHome2 size={16} />}
                  color="blue"
                />
                <TypeCard
                  selected={type === 'external'}
                  onClick={() => setType('external')}
                  title="External"
                  desc="Third-party location"
                  icon={<IconBuildingStore size={16} />}
                  color="orange"
                />
              </Group>
            </Card>

            <Card withBorder mb="md">
              <Text fw={600} mb="md">Location</Text>
              {location ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 8,
                  border: '1px solid var(--mantine-color-green-6)',
                  background: 'var(--mantine-color-green-light)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--mantine-color-green-6)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconMapPin size={16} />
                  </div>
                  <Text size="sm" fw={600} style={{ flex: 1 }}>{location}</Text>
                  <Button size="xs" variant="light" color="green" onClick={() => setPickerOpen(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '32px 0',
                  border: '1px dashed var(--fv-border)', borderRadius: 8,
                }}>
                  <IconMapPin size={28} style={{ opacity: 0.35 }} />
                  <Text size="sm" c="dimmed" mt={8} mb={12}>No location set.</Text>
                  <Button variant="outline" color="green" onClick={() => setPickerOpen(true)}>
                    Pick on map
                  </Button>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div>
            {!workshop ? (
              <Text size="sm" c="dimmed" mb="md">Save the workshop first to manage its service items.</Text>
            ) : (
              <ServiceItemsView workshopId={workshop.id} embedded />
            )}
          </div>
        )}
      </div>

      <div
        className={pageStyles.formFooter}
        style={{
          margin: 0, flexShrink: 0,
          padding: '14px 32px',
          borderTop: '1px solid var(--fv-border)',
          background: 'var(--fv-bg-base)',
        }}
      >
        <Button
          color="green"
          radius="md"
          disabled={!canSave}
          onClick={handleSave}
          style={{ minWidth: 110, fontWeight: 600 }}
        >
          Save
        </Button>
        <Button
          variant="default"
          radius="md"
          onClick={requestBack}
          styles={{
            root: {
              minWidth: 110,
              background: 'var(--fv-bg-panel)',
              border: '1px solid var(--fv-border)',
              color: 'var(--fv-text-secondary)',
            },
          }}
        >
          Cancel
        </Button>
        {isDirty && (
          <Group gap={4} ml={8}>
            <IconAlertTriangle size={13} color="var(--mantine-color-orange-6)" />
            <Text size="xs" c="orange">You have unsaved changes</Text>
          </Group>
        )}
      </div>

      <UnsavedChangesModal
        opened={showUnsavedModal}
        onSave={() => { handleSave(); setShowUnsavedModal(false); }}
        onDiscard={() => { setShowUnsavedModal(false); onBack(); }}
        onCancel={() => setShowUnsavedModal(false)}
      />

      <LocationPickerModal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(res: PickedLocation) => setLocation(res.address)}
      />
    </div>
  );
}
