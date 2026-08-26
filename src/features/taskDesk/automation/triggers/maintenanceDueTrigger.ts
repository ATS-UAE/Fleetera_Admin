import { AutomationTriggerTemplate } from '../types';

export const maintenanceDueTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_maintenance_due',
  label: 'Service / Maintenance Due',
  description: 'Triggers when vehicle odometer, engine hours, or time interval reaches service threshold',
  icon: 'IconTool',
  category: 'maintenance',
  fields: [
    {
      name: 'serviceType',
      label: 'Service Category',
      type: 'select',
      options: [
        { label: 'Routine Oil & Filter Change', value: 'oil_change' },
        { label: 'Brake System Inspection', value: 'brakes' },
        { label: 'Tire Rotation / Replacement', value: 'tires' },
        { label: 'Annual Safety Certification', value: 'safety' },
      ],
      defaultValue: 'oil_change',
      required: true,
    },
    {
      name: 'advanceNoticeKm',
      label: 'Advance Warning Distance (km)',
      type: 'number',
      defaultValue: 500,
      helpText: 'Trigger task X km before the actual service limit',
    },
  ],
};
