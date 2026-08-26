import { AutomationActionTemplate } from '../types';

export const logAuditActionTemplate: AutomationActionTemplate = {
  id: 'action_log_audit',
  label: 'Log System Audit Record',
  description: 'Records permanent telemetry event in immutable fleet audit log',
  icon: 'IconFileText',
  category: 'logging',
  fields: [
    {
      name: 'retentionDays',
      label: 'Log Retention (Days)',
      type: 'number',
      defaultValue: 365,
    },
  ],
};
