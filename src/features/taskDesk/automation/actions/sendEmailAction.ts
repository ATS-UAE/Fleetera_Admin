import { AutomationActionTemplate } from '../types';

export const sendEmailActionTemplate: AutomationActionTemplate = {
  id: 'action_send_email',
  label: 'Send Manager Email Report',
  description: 'Emails detailed trigger report with PDF attachment to management',
  icon: 'IconMail',
  category: 'notification',
  fields: [
    {
      name: 'emailTo',
      label: 'Recipient Email Addresses',
      type: 'text',
      defaultValue: 'fleet-alerts@fleeta.com',
      required: true,
    },
    {
      name: 'includeSnapshot',
      label: 'Attach Map Snapshot & Telemetry PDF',
      type: 'boolean',
      defaultValue: true,
    },
  ],
};
