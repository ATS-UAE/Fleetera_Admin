import { AutomationTriggerTemplate } from '../types';

export const panicButtonTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_panic_button',
  label: 'Driver SOS / Panic Button',
  description: 'Triggers immediately when driver presses hardware SOS button or mobile app emergency button',
  icon: 'IconBellRinging',
  category: 'safety',
  fields: [
    {
      name: 'autoDispatch',
      label: 'Require Emergency Officer Confirmation',
      type: 'boolean',
      defaultValue: true,
    },
  ],
};
