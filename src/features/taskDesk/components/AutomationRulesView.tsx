import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconBolt, IconPlus, IconTrash, IconPlayCard, IconCheck, IconX, IconToggleLeft, IconToggleRight,
  IconShield, IconTool, IconGauge, IconCalendarTime, IconMail, IconBell, IconFileText, IconClipboardCheck
} from '@tabler/icons-react';
import { toggleRule, deleteRule, triggerAutomationRule } from '@/store/slices/taskDeskSlice';
import { automationRegistry, AutomationRule } from '../automation';
import CreateRuleModal from './CreateRuleModal';
import styles from './TaskDeskPage.module.css';

export default function AutomationRulesView() {
  const dispatch = useDispatch();
  const rules = useSelector((s: any) => s.taskDesk.rules);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [lastFiredRuleId, setLastFiredRuleId] = useState<string | null>(null);

  const handleFireRule = (ruleId: string) => {
    dispatch(triggerAutomationRule({ ruleId }));
    setLastFiredRuleId(ruleId);
    setTimeout(() => setLastFiredRuleId(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Supervisor Architecture Context Banner */}
      {/* <div className={styles.supervisorBanner}>
        <div className={styles.supervisorBannerIcon}>
          <IconBolt size={24} />
        </div>
        <div className={styles.supervisorBannerText}>
          <h4>Modular Automation Engine Architecture (0 Hardcoded Triggers / 0 Hardcoded Actions)</h4>
          <p>
            As requested by supervisor: Task Desk does not rely on hardcoded task creation forms. Tasks are generated dynamically when rules trigger. Triggers & Actions are imported plug-and-play modules registered in the <code>AutomationRegistry</code>.
          </p>
        </div>
      </div> */}

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
          Configured Admin Automation Rules ({rules.length})
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsCreateOpen(true)}>
          <IconPlus size={16} /> Create Automation Rule
        </button>
      </div>

      {/* Rules list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {rules.map((rule: AutomationRule) => {
          const trigger = automationRegistry.getTrigger(rule.triggerId);
          const action = automationRegistry.getAction(rule.actionId);
          const isJustFired = lastFiredRuleId === rule.id;

          return (
            <div
              key={rule.id}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${isJustFired ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25 ease',
                boxShadow: isJustFired ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', flex: 1, paddingRight: '10px' }}>
                    {rule.name}
                  </h3>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: rule.enabled ? '#4ade80' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                    }}
                    onClick={() => dispatch(toggleRule(rule.id))}
                    title={rule.enabled ? 'Click to Disable' : 'Click to Enable'}
                  >
                    {rule.enabled ? <IconToggleRight size={28} /> : <IconToggleLeft size={28} />}
                  </button>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  {rule.description}
                </p>

                {/* Pipeline visual */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '14px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>⚡ TRIGGER:</span>
                    <span style={{ color: '#e2e8f0' }}>{trigger?.label || rule.triggerId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>🎯 ACTION:</span>
                    <span style={{ color: '#e2e8f0' }}>{action?.label || rule.actionId}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <div>
                  Executions: <strong style={{ color: '#cbd5e1' }}>{rule.executionCount}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={styles.btnSimulate}
                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    onClick={() => handleFireRule(rule.id)}
                  >
                    <IconBolt size={14} /> Test Fire
                  </button>
                  <button
                    className={styles.btnSecondary}
                    style={{ padding: '5px 8px', color: '#ef4444' }}
                    onClick={() => dispatch(deleteRule(rule.id))}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateRuleModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
