export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface TaskDeskItem {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  originRuleId?: string;
  originRuleName?: string;
  triggerType?: string;
  triggerLabel?: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  telemetryData?: Record<string, any>;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  assignedTo?: string;
  subtasks: TaskSubtask[];
  notes: TaskNote[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'geofence' | 'vehicle';
  options?: { label: string; value: string }[];
  defaultValue?: any;
  required?: boolean;
  helpText?: string;
}

export interface AutomationTriggerTemplate {
  id: string;
  label: string;
  description: string;
  icon: string; // Tabler icon name
  category: 'safety' | 'geofence' | 'maintenance' | 'diagnostics' | 'schedule';
  fields: FieldDefinition[];
}

export interface AutomationActionTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'task' | 'notification' | 'integration' | 'logging';
  fields: FieldDefinition[];
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerId: string;
  triggerConfig: Record<string, any>;
  actionId: string;
  actionConfig: Record<string, any>;
  createdAt: string;
  lastTriggeredAt?: string;
  executionCount: number;
}

export interface TriggerEventPayload {
  triggerId: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  eventDetails?: Record<string, any>;
  timestamp?: string;
}
