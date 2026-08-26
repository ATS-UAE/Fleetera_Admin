import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskDeskItem, AutomationRule, TaskStatus, TaskPriority, TriggerEventPayload } from '@/features/taskDesk/automation/types';
import { AutomationEngine } from '@/features/taskDesk/automation/automationEngine';
import { initAutomationRegistry } from '@/features/taskDesk/automation';

// Ensure dynamic registry is registered
initAutomationRegistry();

export interface TaskDeskState {
  tasks: TaskDeskItem[];
  rules: AutomationRule[];
  selectedTaskId: string | null;
  selectedRuleId: string | null;
  activeView: 'board' | 'list' | 'automations' | 'analytics';
  filters: {
    status: string; // 'all' | TaskStatus
    priority: string; // 'all' | TaskPriority
    search: string;
    vehicleId: string;
  };
}

const initialTasks: TaskDeskItem[] = [
  {
    id: 'task_sample_1',
    taskNumber: 'TSK-892104',
    title: 'Speeding Inspection - Volvo FH16 (#104)',
    description: 'Vehicle detected traveling at 118 km/h in 80 km/h speed zone for over 45 seconds. Perform driver debriefing and inspect speed governor system.',
    priority: 'critical',
    status: 'pending',
    originRuleId: 'rule_speed_alert',
    originRuleName: 'Over-Speed Alert -> Create Inspection Task',
    triggerType: 'trigger_speeding',
    triggerLabel: 'Vehicle Over-Speed Alert',
    vehicleId: 'veh_104',
    vehicleName: 'Volvo FH16 (#104)',
    driverId: 'drv_1',
    driverName: 'Alex Mercer',
    location: {
      name: 'Interstate Highway 80 - Mile Marker 42',
      lat: 37.7833,
      lng: -122.4167,
    },
    telemetryData: {
      speed: '118 km/h',
      limit: '80 km/h',
      duration: '45 seconds',
      governorStatus: 'Active Warning',
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    dueDate: new Date(Date.now() + 3600000 * 10).toISOString(),
    assignedTo: 'Alex Mercer',
    subtasks: [
      { id: 'st_1', title: 'Verify GPS speed telemetry timestamps', completed: true },
      { id: 'st_2', title: 'Conduct safety interview with driver Alex Mercer', completed: false },
      { id: 'st_3', title: 'Inspect electronic speed limiter box', completed: false },
    ],
    notes: [
      {
        id: 'n_1',
        author: 'Automation Engine',
        text: 'Task generated automatically via Rule "Over-Speed Alert -> Create Inspection Task" after speed threshold 100km/h was breached.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'task_sample_2',
    taskNumber: 'TSK-781932',
    title: 'Cargo Unloading Confirmation - Freightliner Cascadia (#88)',
    description: 'Unit entered Port Container Terminal 2 geofence zone. Confirm cargo arrival, inspect container seal #SL-88319, and initiate unloading.',
    priority: 'high',
    status: 'in_progress',
    originRuleId: 'rule_geofence_arrival',
    originRuleName: 'Port Geofence Arrival -> Create Cargo Task',
    triggerType: 'trigger_geofence',
    triggerLabel: 'Geofence Event (Enter/Exit)',
    vehicleId: 'veh_88',
    vehicleName: 'Freightliner Cascadia (#88)',
    driverId: 'drv_2',
    driverName: 'Elena Rostova',
    location: {
      name: 'Port Container Terminal 2 - Gate B',
      lat: 37.795,
      lng: -122.394,
    },
    telemetryData: {
      geofence: 'Port Container Terminal 2',
      event: 'Zone Entry',
      timestamp: '10:14 AM',
    },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 4).toISOString(),
    assignedTo: 'Elena Rostova',
    subtasks: [
      { id: 'st_4', title: 'Check manifest cargo seal #SL-88319', completed: true },
      { id: 'st_5', title: 'Sign electronic Bill of Lading (e-BOL)', completed: true },
      { id: 'st_6', title: 'Confirm bay unloading completion', completed: false },
    ],
    notes: [
      {
        id: 'n_2',
        author: 'Elena Rostova',
        text: 'Vehicle parked at Bay 14. Container seal intact. Unloading initiated.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 'task_sample_3',
    taskNumber: 'TSK-512039',
    title: 'Oil & Filter Replacement - Kenworth T680 (#12)',
    description: 'Odometer reached 150,240 km. Service threshold interval (150,000 km) breached. Schedule oil, fuel filter, and air filter maintenance.',
    priority: 'medium',
    status: 'pending',
    originRuleId: 'rule_maintenance_service',
    originRuleName: '500km Service Threshold -> Create Service Task',
    triggerType: 'trigger_maintenance_due',
    triggerLabel: 'Service / Maintenance Due',
    vehicleId: 'veh_12',
    vehicleName: 'Kenworth T680 (#12)',
    driverId: 'drv_3',
    driverName: 'Marcus Vance',
    location: {
      name: 'Central Depot Maintenance Workshop',
      lat: 37.76,
      lng: -122.43,
    },
    telemetryData: {
      odometer: '150,240 km',
      serviceInterval: '150,000 km',
      overdueKm: '240 km',
    },
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 48).toISOString(),
    assignedTo: 'Maintenance Workshop Team',
    subtasks: [
      { id: 'st_7', title: 'Drain engine oil & replace filter', completed: false },
      { id: 'st_8', title: 'Inspect fluid levels & brake pads', completed: false },
      { id: 'st_9', title: 'Reset maintenance odometer indicator', completed: false },
    ],
    notes: [],
  },
  {
    id: 'task_sample_4',
    taskNumber: 'TSK-403192',
    title: 'Investigate Engine Fault P0300 - Isuzu NPR (#55)',
    description: 'CAN-bus reported OBD-II fault code P0300 (Random/Multiple Cylinder Misfire Detected). Perform OBD diagnostic scan and spark plug/injector inspection.',
    priority: 'high',
    status: 'completed',
    originRuleId: 'rule_engine_fault',
    originRuleName: 'Diagnostic Trouble Code (DTC) -> Work Order Task',
    triggerType: 'trigger_engine_fault',
    triggerLabel: 'Engine Fault Code (DTC Alert)',
    vehicleId: 'veh_55',
    vehicleName: 'Isuzu NPR (#55)',
    driverId: 'drv_4',
    driverName: 'David Chen',
    location: {
      name: 'Service Depot Garage 3',
      lat: 37.75,
      lng: -122.41,
    },
    telemetryData: {
      faultCode: 'DTC P0300',
      description: 'Random Cylinder Misfire',
      severity: 'Amber Warning',
    },
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    dueDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    assignedTo: 'David Chen',
    subtasks: [
      { id: 'st_10', title: 'Connect OBD scanner & check live data stream', completed: true },
      { id: 'st_11', title: 'Replace ignition coil cylinder 3', completed: true },
      { id: 'st_12', title: 'Clear DTC codes & test drive 10 km', completed: true },
    ],
    notes: [
      {
        id: 'n_3',
        author: 'Lead Technician',
        text: 'Replaced faulty ignition coil on Cylinder 3. Fault cleared successfully and vehicle cleared for road operation.',
        timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
    ],
  },
  {
    id: 'task_sample_5',
    taskNumber: 'TSK-302194',
    title: 'Daily Pre-Trip Safety Audit - Mack Anthem (#03)',
    description: 'Automated daily 07:30 AM shift start task. Complete vehicle walkaround inspection, tire pressure check, and light verification.',
    priority: 'low',
    status: 'completed',
    originRuleId: 'rule_daily_shift',
    originRuleName: 'Daily Shift Start -> Pre-Trip Safety Task',
    triggerType: 'trigger_schedule',
    triggerLabel: 'Scheduled Timer / Recurring Inspection',
    vehicleId: 'veh_03',
    vehicleName: 'Mack Anthem (#03)',
    driverId: 'drv_5',
    driverName: 'Sarah Jenkins',
    location: {
      name: 'West Coast Logistics Terminal',
      lat: 37.77,
      lng: -122.40,
    },
    telemetryData: {
      scheduleTime: '07:30 AM',
      frequency: 'Daily Shift Start',
    },
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    dueDate: new Date(Date.now() - 3600000 * 20).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    assignedTo: 'Sarah Jenkins',
    subtasks: [
      { id: 'st_13', title: 'Walkaround light & signal check', completed: true },
      { id: 'st_14', title: 'Check tire pressure on all 10 wheels', completed: true },
      { id: 'st_15', title: 'Verify brake air pressure gauge buildup', completed: true },
    ],
    notes: [],
  },
];

const initialRules: AutomationRule[] = [
  {
    id: 'rule_speed_alert',
    name: 'Over-Speed Alert -> Create Inspection Task',
    description: 'Triggers when a unit exceeds 100 km/h for more than 15 seconds. Generates a Critical priority task in Task Desk.',
    enabled: true,
    triggerId: 'trigger_speeding',
    triggerConfig: {
      speedThreshold: 100,
      minDurationSeconds: 15,
      roadType: 'all',
    },
    actionId: 'action_create_task',
    actionConfig: {
      taskTitleTemplate: 'Speeding Violation Inspection - {{vehicleName}}',
      priority: 'critical',
      dueHours: 12,
      assigneeRole: 'driver',
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    executionCount: 14,
  },
  {
    id: 'rule_geofence_arrival',
    name: 'Port Geofence Arrival -> Create Cargo Task',
    description: 'Triggers when unit enters Port Container Terminal 2 geofence zone. Creates a High priority cargo unloading task.',
    enabled: true,
    triggerId: 'trigger_geofence',
    triggerConfig: {
      eventType: 'entry',
      geofenceZone: 'geo_port',
    },
    actionId: 'action_create_task',
    actionConfig: {
      taskTitleTemplate: 'Cargo Unloading Confirmation - {{vehicleName}}',
      priority: 'high',
      dueHours: 8,
      assigneeRole: 'driver',
    },
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    executionCount: 29,
  },
  {
    id: 'rule_maintenance_service',
    name: '500km Service Threshold -> Create Service Task',
    description: 'Triggers when vehicle maintenance interval reaches warning threshold. Creates Medium priority service task.',
    enabled: true,
    triggerId: 'trigger_maintenance_due',
    triggerConfig: {
      serviceType: 'oil_change',
      advanceNoticeKm: 500,
    },
    actionId: 'action_create_task',
    actionConfig: {
      taskTitleTemplate: 'Routine Oil & Service Task - {{vehicleName}}',
      priority: 'medium',
      dueHours: 48,
      assigneeRole: 'fleet_manager',
    },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    executionCount: 8,
  },
  {
    id: 'rule_engine_fault',
    name: 'Diagnostic Trouble Code (DTC) -> Work Order Task',
    description: 'Triggers on Amber or Red CAN-bus diagnostic fault code. Creates High priority diagnostic work order.',
    enabled: true,
    triggerId: 'trigger_engine_fault',
    triggerConfig: {
      severity: 'warning',
      dtcCategory: 'all',
    },
    actionId: 'action_create_task',
    actionConfig: {
      taskTitleTemplate: 'Investigate Engine Fault Code - {{vehicleName}}',
      priority: 'high',
      dueHours: 24,
      assigneeRole: 'driver',
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastTriggeredAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    executionCount: 5,
  },
  {
    id: 'rule_panic_sos',
    name: 'Driver Panic SOS -> Emergency Response Task',
    description: 'Triggers instantly on SOS hardware button press. Creates Critical emergency response task and notifies dispatchers.',
    enabled: true,
    triggerId: 'trigger_panic_button',
    triggerConfig: {
      autoDispatch: true,
    },
    actionId: 'action_create_task',
    actionConfig: {
      taskTitleTemplate: 'EMERGENCY SOS ALERT - Immediate Response: {{vehicleName}}',
      priority: 'critical',
      dueHours: 1,
      assigneeRole: 'safety_officer',
    },
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    executionCount: 2,
  },
];

const initialState: TaskDeskState = {
  tasks: initialTasks,
  rules: initialRules,
  selectedTaskId: null,
  selectedRuleId: null,
  activeView: 'board',
  filters: {
    status: 'all',
    priority: 'all',
    search: '',
    vehicleId: 'all',
  },
};

const taskDeskSlice = createSlice({
  name: 'taskDesk',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<'board' | 'list' | 'automations' | 'analytics'>) {
      state.activeView = action.payload;
    },
    setSelectedTaskId(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    setSelectedRuleId(state, action: PayloadAction<string | null>) {
      state.selectedRuleId = action.payload;
    },
    setFilter(state, action: PayloadAction<Partial<TaskDeskState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { status: 'all', priority: 'all', search: '', vehicleId: 'all' };
    },

    // Task actions
    addTask(state, action: PayloadAction<TaskDeskItem>) {
      state.tasks.unshift(action.payload);
    },
    updateTaskStatus(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        if (action.payload.status === 'completed') {
          task.completedAt = new Date().toISOString();
          task.subtasks.forEach(st => (st.completed = true));
        }
      }
    },
    toggleSubtask(state, action: PayloadAction<{ taskId: string; subtaskId: string }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        const st = task.subtasks.find(s => s.id === action.payload.subtaskId);
        if (st) {
          st.completed = !st.completed;
          // Auto complete task if all subtasks are finished
          if (task.subtasks.every(s => s.completed)) {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
          } else if (task.status === 'completed') {
            task.status = 'in_progress';
          }
        }
      }
    },
    addTaskNote(state, action: PayloadAction<{ taskId: string; author: string; text: string }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.notes.push({
          id: `note_${Date.now()}`,
          author: action.payload.author,
          text: action.payload.text,
          timestamp: new Date().toISOString(),
        });
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.selectedTaskId === action.payload) state.selectedTaskId = null;
    },

    // Automation rule actions
    addRule(state, action: PayloadAction<AutomationRule>) {
      state.rules.unshift(action.payload);
    },
    toggleRule(state, action: PayloadAction<string>) {
      const rule = state.rules.find(r => r.id === action.payload);
      if (rule) {
        rule.enabled = !rule.enabled;
      }
    },
    deleteRule(state, action: PayloadAction<string>) {
      state.rules = state.rules.filter(r => r.id !== action.payload);
      if (state.selectedRuleId === action.payload) state.selectedRuleId = null;
    },

    /**
     * Trigger Simulation Engine Action.
     * Takes an AutomationRule ID and dynamic TriggerEventPayload, passes it to `AutomationEngine.executeRule`,
     * updates execution metrics on the rule, and inserts the generated task into `tasks`!
     */
    triggerAutomationRule(
      state,
      action: PayloadAction<{ ruleId: string; payload?: Partial<TriggerEventPayload> }>
    ) {
      const rule = state.rules.find(r => r.id === action.payload.ruleId);
      if (!rule) return;

      const triggerPayload: TriggerEventPayload = {
        triggerId: rule.triggerId,
        vehicleId: action.payload.payload?.vehicleId || 'veh_104',
        vehicleName: action.payload.payload?.vehicleName || 'Volvo FH16 (#104)',
        driverId: action.payload.payload?.driverId || 'drv_1',
        driverName: action.payload.payload?.driverName || 'Alex Mercer',
        locationName: action.payload.payload?.locationName || 'Highway Route Alpha',
        lat: action.payload.payload?.lat || 37.7749,
        lng: action.payload.payload?.lng || -122.4194,
        eventDetails: action.payload.payload?.eventDetails,
        timestamp: new Date().toISOString(),
      };

      const newTask = AutomationEngine.executeRule(rule, triggerPayload);
      if (newTask) {
        state.tasks.unshift(newTask);
        rule.lastTriggeredAt = new Date().toISOString();
        rule.executionCount += 1;
        state.selectedTaskId = newTask.id;
      }
    },

    /**
     * Quick action to reset/seed demonstration tasks
     */
    seedSampleData(state) {
      state.tasks = initialTasks;
      state.rules = initialRules;
    },
  },
});

export const {
  setActiveView,
  setSelectedTaskId,
  setSelectedRuleId,
  setFilter,
  resetFilters,
  addTask,
  updateTaskStatus,
  toggleSubtask,
  addTaskNote,
  deleteTask,
  addRule,
  toggleRule,
  deleteRule,
  triggerAutomationRule,
  seedSampleData,
} = taskDeskSlice.actions;

export default taskDeskSlice.reducer;
