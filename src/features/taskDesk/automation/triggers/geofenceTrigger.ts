import { AutomationTriggerTemplate } from '../types';

export const geofenceTriggerTemplate: AutomationTriggerTemplate = {
  id: 'trigger_geofence',
  label: 'Geofence Event (Enter/Exit)',
  description: 'Triggers when a unit enters or leaves a designated geofence zone',
  icon: 'IconShieldAlert',
  category: 'geofence',
  fields: [
    {
      name: 'eventType',
      label: 'Event Type',
      type: 'select',
      options: [
        { label: 'On Entry (Entered Zone)', value: 'entry' },
        { label: 'On Exit (Left Zone)', value: 'exit' },
        { label: 'Both Entry and Exit', value: 'both' },
      ],
      defaultValue: 'entry',
      required: true,
    },
    {
      name: 'geofenceZone',
      label: 'Target Geofence Zone',
      type: 'select',
      options: [
        { label: 'Central Logistics Hub', value: 'geo_hub' },
        { label: 'Port Container Terminal 2', value: 'geo_port' },
        { label: 'Restricted Security Area #4', value: 'geo_restricted' },
        { label: 'Warehouse B Unloading Depot', value: 'geo_depot' },
      ],
      defaultValue: 'geo_hub',
      required: true,
    },
  ],
};
