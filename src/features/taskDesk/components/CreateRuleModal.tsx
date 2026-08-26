import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconPlus, IconX, IconCheck, IconBolt, IconTarget, IconChecklist } from '@tabler/icons-react';
import { addRule } from '@/store/slices/taskDeskSlice';
import { automationRegistry, AutomationRule } from '../automation';
import styles from './TaskDeskPage.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRuleModal({ isOpen, onClose }: Props) {
  const dispatch = useDispatch();

  const availableTriggers = automationRegistry.getTriggers();
  const availableActions = automationRegistry.getActions();

  const [ruleName, setRuleName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>(availableTriggers[0]?.id || '');
  const [selectedActionId, setSelectedActionId] = useState<string>(availableActions[0]?.id || '');
  const [priority, setPriority] = useState<string>('high');

  if (!isOpen) return null;

  const currentTrigger = automationRegistry.getTrigger(selectedTriggerId);
  const currentAction = automationRegistry.getAction(selectedActionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name: ruleName,
      description: description || `Automated rule linking ${currentTrigger?.label} to ${currentAction?.label}`,
      enabled: true,
      triggerId: selectedTriggerId,
      triggerConfig: {
        configuredAt: new Date().toISOString(),
      },
      actionId: selectedActionId,
      actionConfig: {
        taskTitleTemplate: `${ruleName} - {{vehicleName}}`,
        priority,
        dueHours: 24,
      },
      createdAt: new Date().toISOString(),
      executionCount: 0,
    };

    dispatch(addRule(newRule));
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow} style={{ maxWidth: '680px' }}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBolt size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc' }}>
                Create Modular Automation Rule (Admin Side)
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Select imported dynamic Triggers and Actions to automatically build Task Desk tasks
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Rule Name</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Over-Speed Warning -> Create Vehicle Inspection Task"
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description & Purpose</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Describe when this trigger fires and what task action is expected"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Dynamic Modular Trigger Selection */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
              <IconBolt size={16} /> 1. Select Trigger Template (Imported Registry)
            </label>
            <select
              className={styles.formSelect}
              value={selectedTriggerId}
              onChange={e => setSelectedTriggerId(e.target.value)}
            >
              {availableTriggers.map(trig => (
                <option key={trig.id} value={trig.id}>
                  [{trig.category.toUpperCase()}] {trig.label} — {trig.description}
                </option>
              ))}
            </select>
            {currentTrigger && (
              <div className={styles.fieldHelp} style={{ color: '#38bdf8' }}>
                Template ID: `{currentTrigger.id}` | Configurable Fields:{' '}
                {currentTrigger.fields.map(f => f.label).join(', ')}
              </div>
            )}
          </div>

          {/* Dynamic Modular Action Selection */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa' }}>
              <IconTarget size={16} /> 2. Select Action Template (Imported Registry)
            </label>
            <select
              className={styles.formSelect}
              value={selectedActionId}
              onChange={e => setSelectedActionId(e.target.value)}
            >
              {availableActions.map(act => (
                <option key={act.id} value={act.id}>
                  [{act.category.toUpperCase()}] {act.label} — {act.description}
                </option>
              ))}
            </select>
            {currentAction && (
              <div className={styles.fieldHelp} style={{ color: '#60a5fa' }}>
                Template ID: `{currentAction.id}` | Configurable Fields:{' '}
                {currentAction.fields.map(f => f.label).join(', ')}
              </div>
            )}
          </div>

          {/* Default Task Priority */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconChecklist size={16} /> Default Created Task Priority
            </label>
            <select
              className={styles.formSelect}
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="low">Low - Routine Check</option>
              <option value="medium">Medium - Normal Operational Priority</option>
              <option value="high">High - Urgent Priority</option>
              <option value="critical">Critical - Emergency Immediate Action</option>
            </select>
          </div>

          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              <IconPlus size={16} /> Create Automation Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
