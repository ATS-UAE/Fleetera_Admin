import { AutomationTriggerTemplate } from '../types';

export const scheduleTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_schedule',
  label: 'Scheduled Timer / Recurring Inspection',
  description: 'Triggers on a scheduled cron/time basis (e.g. Every Monday 07:00 AM)',
  icon: 'IconCalendarTime',
  category: 'schedule',
  fields: [
    {
      name: 'frequency',
      label: 'Recurrence Frequency',
      type: 'select',
      options: [
        { label: 'Daily Shift Start', value: 'daily_shift' },
        { label: 'Weekly Fleet Audit', value: 'weekly' },
        { label: 'Monthly Safety Checklist', value: 'monthly' },
      ],
      defaultValue: 'daily_shift',
      required: true,
    },
    {
      name: 'timeOfDay',
      label: 'Trigger Time (HH:MM)',
      type: 'text',
      defaultValue: '07:30',
      required: true,
    },
  ],
};
