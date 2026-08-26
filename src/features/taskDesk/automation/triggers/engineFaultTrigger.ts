import { AutomationTriggerTemplate } from '../types';

export const engineFaultTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_engine_fault',
  label: 'Engine Fault Code (DTC Alert)',
  description: 'Triggers when vehicle CAN-bus reports diagnostic trouble codes (DTC)',
  icon: 'IconAlertCircle',
  category: 'diagnostics',
  fields: [
    {
      name: 'severity',
      label: 'Minimum Fault Severity',
      type: 'select',
      options: [
        { label: 'Critical / Red Stop Engine', value: 'critical' },
        { label: 'Warning / Amber Malfunction', value: 'warning' },
        { label: 'Information / Pending Code', value: 'info' },
      ],
      defaultValue: 'warning',
      required: true,
    },
    {
      name: 'dtcCategory',
      label: 'DTC Category Filter',
      type: 'select',
      options: [
        { label: 'All Fault Codes', value: 'all' },
        { label: 'Powertrain (P-Codes)', value: 'powertrain' },
        { label: 'Chassis / ABS (C-Codes)', value: 'chassis' },
        { label: 'Network & Telematics (U-Codes)', value: 'network' },
      ],
      defaultValue: 'all',
    },
  ],
};
