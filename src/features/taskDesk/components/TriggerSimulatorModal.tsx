import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconBolt, IconX, IconCheck, IconTruck, IconUser, IconMapPin, IconGauge } from '@tabler/icons-react';
import { triggerAutomationRule } from '@/store/slices/taskDeskSlice';
import { automationRegistry } from '../automation';
import styles from './TaskDeskPage.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TriggerSimulatorModal({ isOpen, onClose }: Props) {
  const dispatch = useDispatch();
  const rules = useSelector((s: any) => s.taskDesk.rules);
  const vehicles = useSelector((s: any) => s.vehicles.items);
  const drivers = useSelector((s: any) => s.drivers.items);

  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'veh_104');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || 'drv_1');
  const [locationName, setLocationName] = useState<string>('Interstate Highway 80 - Exit 14');
  const [customValue, setCustomValue] = useState<string>('124 km/h');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRule = rules.find((r: any) => r.id === selectedRuleId);
  const triggerTemplate = currentRule ? automationRegistry.getTrigger(currentRule.triggerId) : null;
  const actionTemplate = currentRule ? automationRegistry.getAction(currentRule.actionId) : null;

  const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d: any) => d.id === selectedDriverId);

  const handleRunSimulation = () => {
    if (!selectedRuleId) return;

    const vehicleName = selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plate})` : 'Volvo FH16 (#104)';
    const driverName = selectedDriver ? selectedDriver.name : 'Alex Mercer';

    dispatch(
      triggerAutomationRule({
        ruleId: selectedRuleId,
        payload: {
          vehicleId: selectedVehicleId,
          vehicleName,
          driverId: selectedDriverId,
          driverName,
          locationName,
          eventDetails: {
            telemetryReading: customValue,
            simulatedAt: new Date().toLocaleTimeString(),
            status: 'Trigger Condition Breached',
          },
        },
      })
    );

    setSuccessMsg(`Automation executed successfully! New Task generated in Task Desk.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow} style={{ maxWidth: '640px' }}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBolt size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc' }}>
                Automation Trigger Simulator
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Simulate real-time vehicle triggers to automatically create tasks in Task Desk
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {successMsg && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <IconCheck size={18} />
              {successMsg}
            </div>
          )}

          {/* Select Automation Rule */}
          <div className={styles.formGroup}>
            <label>Select Automation Rule to Fire</label>
            <select
              className={styles.formSelect}
              value={selectedRuleId}
              onChange={e => setSelectedRuleId(e.target.value)}
            >
              {rules.map((rule: any) => (
                <option key={rule.id} value={rule.id}>
                  {rule.name} ({rule.enabled ? 'Active' : 'Disabled'})
                </option>
              ))}
            </select>
          </div>

          {currentRule && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                MODULAR PIPELINE EXPLANATION:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  ⚡ Trigger: {triggerTemplate?.label || currentRule.triggerId}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>➔</div>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  🎯 Action: {actionTemplate?.label || currentRule.actionId}
                </div>
              </div>
            </div>
          )}

          {/* Select Target Vehicle */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconTruck size={15} /> Target Vehicle Unit
            </label>
            <select
              className={styles.formSelect}
              value={selectedVehicleId}
              onChange={e => setSelectedVehicleId(e.target.value)}
            >
              {vehicles.length > 0 ? (
                vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plate}) - Status: {v.status}
                  </option>
                ))
              ) : (
                <option value="veh_104">Volvo FH16 (#104)</option>
              )}
            </select>
          </div>

          {/* Select Driver */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconUser size={15} /> Assigned Driver
            </label>
            <select
              className={styles.formSelect}
              value={selectedDriverId}
              onChange={e => setSelectedDriverId(e.target.value)}
            >
              {drivers.length > 0 ? (
                drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))
              ) : (
                <option value="drv_1">Alex Mercer (DRV-901)</option>
              )}
            </select>
          </div>

          {/* Location & Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconMapPin size={15} /> Event Location
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconGauge size={15} /> Telemetry Event Reading
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
                placeholder="e.g. 124 km/h or DTC P0300"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnSimulate} onClick={handleRunSimulation}>
            <IconBolt size={16} /> Fire Trigger & Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
