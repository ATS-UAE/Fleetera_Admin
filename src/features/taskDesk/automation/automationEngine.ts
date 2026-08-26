import { automationRegistry } from './registry';
import { AutomationRule, TriggerEventPayload, TaskDeskItem, TaskPriority } from './types';

/**
 * Modular Automation Engine.
 * Note: Core engine has ZERO built-in triggers or actions!
 * It relies completely on registered trigger & action templates in `automationRegistry`.
 */
export class AutomationEngine {
  /**
   * Executes an automation rule given a trigger event payload.
   * Produces a new TaskDeskItem if the rule's action is 'action_create_task'.
   */
  public static executeRule(rule: AutomationRule, payload: TriggerEventPayload): TaskDeskItem | null {
    if (!rule.enabled) return null;

    const triggerTemplate = automationRegistry.getTrigger(rule.triggerId);
    const actionTemplate = automationRegistry.getAction(rule.actionId);

    if (!triggerTemplate) {
      console.warn(`[AutomationEngine] Trigger ID '${rule.triggerId}' not found in registry!`);
      return null;
    }

    if (!actionTemplate) {
      console.warn(`[AutomationEngine] Action ID '${rule.actionId}' not found in registry!`);
      return null;
    }

    // Process 'action_create_task'
    if (rule.actionId === 'action_create_task') {
      const now = new Date();
      const dueHours = Number(rule.actionConfig.dueHours || 24);
      const dueDate = new Date(now.getTime() + dueHours * 3600 * 1000);

      const vehicleName = payload.vehicleName || 'Unit #104';
      const triggerLabel = triggerTemplate.label;

      let title = rule.actionConfig.taskTitleTemplate || `Inspect ${vehicleName} - ${triggerLabel}`;
      title = title
        .replace('{{vehicleName}}', vehicleName)
        .replace('{{driverName}}', payload.driverName || 'Assigned Driver')
        .replace('{{triggerLabel}}', triggerLabel);

      const priority: TaskPriority = (rule.actionConfig.priority as TaskPriority) || 'high';

      // Default subtasks based on category
      const subtasks = [
        { id: 'st_1', title: `Perform physical inspection on ${vehicleName}`, completed: false },
        { id: 'st_2', title: `Verify telemetry diagnostic data for trigger: ${triggerLabel}`, completed: false },
        { id: 'st_3', title: 'Document supervisor resolution notes and close task', completed: false },
      ];

      const newTask: TaskDeskItem = {
        id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        taskNumber: `TSK-${Math.floor(100000 + Math.random() * 900000)}`,
        title,
        description: `Task created via Automation Rule "${rule.name}". Trigger condition fired: ${triggerTemplate.description}`,
        priority,
        status: 'pending',
        originRuleId: rule.id,
        originRuleName: rule.name,
        triggerType: triggerTemplate.id,
        triggerLabel: triggerTemplate.label,
        vehicleId: payload.vehicleId || 'veh_104',
        vehicleName,
        driverId: payload.driverId || 'drv_1',
        driverName: payload.driverName || 'Alex Mercer',
        location: payload.locationName ? {
          name: payload.locationName,
          lat: payload.lat || 37.7749,
          lng: payload.lng || -122.4194,
        } : {
          name: 'Main Route Sector 4',
          lat: 37.7749,
          lng: -122.4194,
        },
        telemetryData: payload.eventDetails || { event: triggerLabel, timestamp: now.toISOString() },
        createdAt: now.toISOString(),
        dueDate: dueDate.toISOString(),
        assignedTo: payload.driverName || 'Alex Mercer',
        subtasks,
        notes: [
          {
            id: `note_${Date.now()}`,
            author: 'Automation System',
            text: `System automatically generated task based on Trigger: "${triggerTemplate.label}" in Rule "${rule.name}".`,
            timestamp: now.toISOString(),
          },
        ],
      };

      return newTask;
    }

    return null;
  }
}
