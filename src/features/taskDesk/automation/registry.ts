import { AutomationTriggerTemplate, AutomationActionTemplate } from './types';

class AutomationRegistry {
  private triggers: Map<string, AutomationTriggerTemplate> = new Map();
  private actions: Map<string, AutomationActionTemplate> = new Map();

  /**
   * Register a new modular trigger template.
   * Can be imported and registered from any external module.
   */
  public registerTrigger(template: AutomationTriggerTemplate): void {
    if (this.triggers.has(template.id)) {
      console.warn(`[AutomationRegistry] Overwriting trigger '${template.id}'`);
    }
    this.triggers.set(template.id, template);
  }

  /**
   * Register a new modular action template.
   * Can be imported and registered from any external module.
   */
  public registerAction(template: AutomationActionTemplate): void {
    if (this.actions.has(template.id)) {
      console.warn(`[AutomationRegistry] Overwriting action '${template.id}'`);
    }
    this.actions.set(template.id, template);
  }

  public getTriggers(): AutomationTriggerTemplate[] {
    return Array.from(this.triggers.values());
  }

  public getActions(): AutomationActionTemplate[] {
    return Array.from(this.actions.values());
  }

  public getTrigger(id: string): AutomationTriggerTemplate | undefined {
    return this.triggers.get(id);
  }

  public getAction(id: string): AutomationActionTemplate | undefined {
    return this.actions.get(id);
  }
}

export const automationRegistry = new AutomationRegistry();
