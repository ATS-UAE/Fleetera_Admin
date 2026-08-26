import { AutomationActionTemplate } from '../types';

export const sendNotificationActionTemplate: AutomationActionTemplate = {
  id: 'action_send_notification',
  label: 'Dispatch Push Notification',
  description: 'Sends real-time banner/sound push alert to operator or driver mobile app',
  icon: 'IconBell',
  category: 'notification',
  fields: [
    {
      name: 'soundAlert',
      label: 'Enable Audible Warning Alarm',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'recipientGroup',
      label: 'Recipient Target',
      type: 'select',
      options: [
        { label: 'Driver App', value: 'driver' },
        { label: 'Dispatch Center Operators', value: 'dispatchers' },
        { label: 'All Fleet Supervisors', value: 'supervisors' },
      ],
      defaultValue: 'driver',
    },
  ],
};
