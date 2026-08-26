import { AutomationTriggerTemplate } from '../types';

export const speedingTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_speeding',
  label: 'Vehicle Over-Speed Alert',
  description: 'Triggers when a vehicle speed exceeds configured limit for specified duration',
  icon: 'IconGauge',
  category: 'safety',
  fields: [
    {
      name: 'speedThreshold',
      label: 'Speed Threshold (km/h)',
      type: 'number',
      defaultValue: 100,
      required: true,
      helpText: 'Trigger alert when vehicle exceeds this speed',
    },
    {
      name: 'minDurationSeconds',
      label: 'Sustained Duration (seconds)',
      type: 'number',
      defaultValue: 15,
      required: true,
      helpText: 'Speed must be maintained above threshold for this duration',
    },
    {
      name: 'roadType',
      label: 'Applicable Road Zone',
      type: 'select',
      options: [
        { label: 'All Roads', value: 'all' },
        { label: 'Highways Only', value: 'highway' },
        { label: 'Urban / Residential', value: 'urban' },
      ],
      defaultValue: 'all',
    },
  ],
};
