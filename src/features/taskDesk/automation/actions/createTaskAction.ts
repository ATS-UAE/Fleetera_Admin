import { AutomationActionTemplate } from '../types';

export const createTaskActionTemplate: AutomationActionTemplate = {
  id: 'action_create_task',
  label: 'Create Task Desk Item',
  description: 'Generates a formal actionable work order item in the Task Desk module',
  icon: 'IconClipboardCheck',
  category: 'task',
  fields: [
    {
      name: 'taskTitleTemplate',
      label: 'Task Title Template',
      type: 'text',
      defaultValue: 'Inspect Vehicle {{vehicleName}} - Triggered by {{triggerLabel}}',
      required: true,
      helpText: 'Use dynamic tokens like {{vehicleName}}, {{driverName}}, {{triggerLabel}}',
    },
    {
      name: 'priority',
      label: 'Task Priority',
      type: 'select',
      options: [
        { label: 'Low - Routine Check', value: 'low' },
        { label: 'Medium - Normal Action', value: 'medium' },
        { label: 'High - Urgent Response', value: 'high' },
        { label: 'Critical - Immediate Emergency', value: 'critical' },
      ],
      defaultValue: 'high',
      required: true,
    },
    {
      name: 'dueHours',
      label: 'Time to Complete (Hours)',
      type: 'number',
      defaultValue: 24,
      required: true,
    },
    {
      name: 'assigneeRole',
      label: 'Assign To',
      type: 'select',
      options: [
        { label: 'Assigned Vehicle Driver', value: 'driver' },
        { label: 'Fleet Maintenance Supervisor', value: 'fleet_manager' },
        { label: 'Safety & Compliance Officer', value: 'safety_officer' },
        { label: 'Unassigned Queue', value: 'queue' },
      ],
      defaultValue: 'driver',
    },
    {
      name: 'defaultChecklist',
      label: 'Include Standard Inspection Checklist',
      type: 'boolean',
      defaultValue: true,
    },
  ],
};
