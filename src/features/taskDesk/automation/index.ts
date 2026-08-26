import { automationRegistry } from './registry';

// Import modular trigger templates
import { speedingTriggerTemplate } from './triggers/speedingTrigger';
import { geofenceTriggerTemplate } from './triggers/geofenceTrigger';
import { maintenanceDueTriggerTemplate } from './triggers/maintenanceDueTrigger';
import { engineFaultTriggerTemplate } from './triggers/engineFaultTrigger';
import { panicButtonTriggerTemplate } from './triggers/panicButtonTrigger';
import { scheduleTriggerTemplate } from './triggers/scheduleTrigger';

// Import modular action templates
import { createTaskActionTemplate } from './actions/createTaskAction';
import { sendNotificationActionTemplate } from './actions/sendNotificationAction';
import { sendEmailActionTemplate } from './actions/sendEmailAction';
import { logAuditActionTemplate } from './actions/logAuditAction';

let isInitialized = false;

/**
 * Initializes the Automation system by importing and registering modular triggers and actions.
 * To add a new trigger or action, simply register it here or anywhere in the app!
 */
export function initAutomationRegistry(): void {
  if (isInitialized) return;

  // Register Triggers
  automationRegistry.registerTrigger(speedingTriggerTemplate);
  automationRegistry.registerTrigger(geofenceTriggerTemplate);
  automationRegistry.registerTrigger(maintenanceDueTriggerTemplate);
  automationRegistry.registerTrigger(engineFaultTriggerTemplate);
  automationRegistry.registerTrigger(panicButtonTriggerTemplate);
  automationRegistry.registerTrigger(scheduleTriggerTemplate);

  // Register Actions
  automationRegistry.registerAction(createTaskActionTemplate);
  automationRegistry.registerAction(sendNotificationActionTemplate);
  automationRegistry.registerAction(sendEmailActionTemplate);
  automationRegistry.registerAction(logAuditActionTemplate);

  isInitialized = true;
  console.log('[AutomationRegistry] Successfully registered 6 dynamic triggers and 4 dynamic actions.');
}

export * from './types';
export * from './registry';
export * from './automationEngine';
