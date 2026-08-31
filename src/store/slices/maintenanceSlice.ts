import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ServicePriority = 'normal' | 'high' | 'critical';
export type ServiceStatus = 'todo' | 'inprogress' | 'done' | 'rejected';

export interface ServiceParameterReading {
  initial: number | null;
  final: number | null;
}

export interface ServiceUsedItem {
  id: string;
  itemId: string;
  qty: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  vehicleId: string;
  servicePlanId: string | null;
  dateOfService: string | null;   // ISO date string
  priority: ServicePriority;
  status: ServiceStatus;
  deadline: string | null;   // ISO date string
  creationDate: string;      // ISO date string
  source: string;
  cost: string;
  notes: string;
  additionalProperties: string;
  parameters: Record<CounterType, ServiceParameterReading>;
  usedItems: ServiceUsedItem[];
  files: string[];           // file names (mock)
}

export type CounterType = 'mileage' | 'engineHours' | 'days';

export interface CounterConfig {
  active: boolean;
  frequency: number | null;      // e.g. every 1000 km
  autoCreation: number | null;   // auto-creates a service this many units before frequency is reached — must be < frequency
  notifyWhen: number | null;     // notify when this many units remain before the threshold
}

const EMPTY_COUNTER: CounterConfig = { active: false, frequency: null, autoCreation: null, notifyWhen: null };

function emptyParameters(): Record<CounterType, ServiceParameterReading> {
  return {
    mileage: { initial: null, final: null },
    engineHours: { initial: null, final: null },
    days: { initial: null, final: null },
  };
}

export interface ServicePlan {
  id: string;
  name: string;
  counters: Record<CounterType, CounterConfig>;
  defaultPriority: ServicePriority;
  daysToComplete: number | null;
  defaultNotes: string;
  vehicleIds: string[];
  lastMileageByVehicle: Record<string, number>;        // manually entered current mileage per assigned vehicle
  lastEngineHoursByVehicle: Record<string, number>;     // manually entered current engine hours per assigned vehicle
  lastServiceDateByVehicle: Record<string, string>;     // manually entered last service date (ISO) per assigned vehicle
  issueCount: number;   // mock/derived — vehicles currently overdue against this plan
  createdAt: string;
}

export type WorkshopType = 'internal' | 'external';

export interface Workshop {
  id: string;
  name: string;
  location: string;
  type: WorkshopType;
}

export interface StockEntry {
  id: string;
  date: string | null;   // ISO date string
  quantity: number;
}

// A single row in the "Service items" catalog (parts/stock), NOT the same
// thing as ServiceItem above (which is a maintenance job/ticket).
export interface ServiceItemEntry {
  id: string;
  name: string;
  type: string;               // e.g. 'Part'
  unit: string;                // e.g. 'pieces', 'number'
  cost: string;
  stockEntries: StockEntry[]; // "Available" is the sum of these
  workshopId: string | null;   // null = not stocked at any workshop
}

export function getAvailableQty(item: ServiceItemEntry): number {
  return item.stockEntries.reduce((sum, e) => sum + (e.quantity || 0), 0);
}

export interface MaintenanceState {
  services: ServiceItem[];
  servicePlans: ServicePlan[];
  workshops: Workshop[];
  serviceItems: ServiceItemEntry[];
  activeSubTab: 'services' | 'servicePlans' | 'workshops' | 'serviceItems';
  filter: 'open' | 'resolved';
  search: string;
  workshopTypeFilter: 'all' | 'internal' | 'external';
  serviceItemWorkshopFilter: string[]; // workshop ids selected in "Filter by workshop"
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'svc-001',
    name: 'health',
    vehicleId: 'v-trk-001',
    servicePlanId: null,
    dateOfService: '2026-04-06T14:33:00.000Z',
    priority: 'normal',
    status: 'todo',
    deadline: null,
    creationDate: '2026-04-06T14:33:00.000Z',
    source: 'Unknown service plan',
    cost: '',
    notes: '',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
  {
    id: 'svc-002',
    name: 'test',
    vehicleId: 'v-van-023',
    servicePlanId: 'plan-002',
    dateOfService: '2026-03-26T00:00:00.000Z',
    priority: 'normal',
    status: 'inprogress',
    deadline: '2026-03-05T00:00:00.000Z',
    creationDate: '2026-03-26T00:00:00.000Z',
    source: 'Unknown user',
    cost: '',
    notes: '',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
  {
    id: 'svc-003',
    name: 'test',
    vehicleId: 'v-car-047',
    servicePlanId: null,
    dateOfService: '2026-04-06T00:00:00.000Z',
    priority: 'normal',
    status: 'todo',
    deadline: '2026-04-11T00:00:00.000Z',
    creationDate: '2026-04-06T00:00:00.000Z',
    source: 'test',
    cost: '',
    notes: '',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
  {
    id: 'svc-004',
    name: 'test',
    vehicleId: 'v-bus-012',
    servicePlanId: 'plan-001',
    dateOfService: '2026-03-31T00:00:00.000Z',
    priority: 'normal',
    status: 'todo',
    deadline: '2026-04-03T00:00:00.000Z',
    creationDate: '2026-03-31T00:00:00.000Z',
    source: 'Unknown user',
    cost: '',
    notes: '',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
  {
    id: 'svc-005',
    name: 'Oil Change',
    vehicleId: 'v-trk-001',
    servicePlanId: null,
    dateOfService: '2026-01-28T00:00:00.000Z',
    priority: 'high',
    status: 'done',
    deadline: '2026-02-15T00:00:00.000Z',
    creationDate: '2026-01-28T00:00:00.000Z',
    source: 'Scheduled',
    cost: '120',
    notes: 'Completed on time. Full synthetic oil used.',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
  {
    id: 'svc-006',
    name: 'Brake Inspection',
    vehicleId: 'v-pkp-088',
    servicePlanId: null,
    dateOfService: '2026-02-20T00:00:00.000Z',
    priority: 'critical',
    status: 'rejected',
    deadline: '2026-03-01T00:00:00.000Z',
    creationDate: '2026-02-20T00:00:00.000Z',
    source: 'Driver report',
    cost: '',
    notes: 'False alarm — pads were fine.',
    additionalProperties: '',
    parameters: emptyParameters(),
    usedItems: [],
    files: [],
  },
];

const ALL_VEHICLE_IDS = ['v-trk-001', 'v-van-023', 'v-car-047', 'v-bus-012', 'v-pkp-088', 'v-trk-055', 'v-trk-004'];

const SEED_PLANS: ServicePlan[] = [
  {
    id: 'plan-001',
    name: 'new plan',
    counters: {
      mileage: { active: true, frequency: 1000, autoCreation: null, notifyWhen: 100 },
      engineHours: { ...EMPTY_COUNTER },
      days: { ...EMPTY_COUNTER },
    },
    defaultPriority: 'normal',
    daysToComplete: 7,
    defaultNotes: '',
    vehicleIds: ALL_VEHICLE_IDS.slice(0, 5),
    lastMileageByVehicle: {},
    lastEngineHoursByVehicle: {},
    lastServiceDateByVehicle: {},
    issueCount: 0,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'plan-002',
    name: 'xyz',
    counters: {
      mileage: { active: true, frequency: 100, autoCreation: null, notifyWhen: 20 },
      engineHours: { active: true, frequency: 200, autoCreation: null, notifyWhen: 10 },
      days: { active: true, frequency: 500, autoCreation: null, notifyWhen: 14 },
    },
    defaultPriority: 'normal',
    daysToComplete: 7,
    defaultNotes: '',
    vehicleIds: ALL_VEHICLE_IDS.slice(0, 1),
    lastMileageByVehicle: {},
    lastEngineHoursByVehicle: {},
    lastServiceDateByVehicle: {},
    issueCount: 0,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'plan-003',
    name: 'lll_plan',
    counters: {
      mileage: { active: true, frequency: 1000, autoCreation: null, notifyWhen: 100 },
      engineHours: { ...EMPTY_COUNTER },
      days: { ...EMPTY_COUNTER },
    },
    defaultPriority: 'high',
    daysToComplete: 3,
    defaultNotes: '',
    vehicleIds: ALL_VEHICLE_IDS.slice(0, 3),
    lastMileageByVehicle: {},
    lastEngineHoursByVehicle: {},
    lastServiceDateByVehicle: {},
    issueCount: 2,
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'plan-004',
    name: 'newplan',
    counters: {
      mileage: { active: true, frequency: 1000, autoCreation: null, notifyWhen: 100 },
      engineHours: { ...EMPTY_COUNTER },
      days: { ...EMPTY_COUNTER },
    },
    defaultPriority: 'normal',
    daysToComplete: 7,
    defaultNotes: '',
    vehicleIds: ALL_VEHICLE_IDS.slice(0, 6),
    lastMileageByVehicle: {},
    lastEngineHoursByVehicle: {},
    lastServiceDateByVehicle: {},
    issueCount: 4,
    createdAt: '2026-01-22T00:00:00.000Z',
  },
  {
    id: 'plan-005',
    name: 'test plan',
    counters: {
      mileage: { active: true, frequency: 1000, autoCreation: null, notifyWhen: 100 },
      engineHours: { ...EMPTY_COUNTER },
      days: { ...EMPTY_COUNTER },
    },
    defaultPriority: 'normal',
    daysToComplete: 7,
    defaultNotes: '',
    vehicleIds: [...ALL_VEHICLE_IDS],
    lastMileageByVehicle: {},
    lastEngineHoursByVehicle: {},
    lastServiceDateByVehicle: {},
    issueCount: 5,
    createdAt: '2026-01-25T00:00:00.000Z',
  },
];

const SEED_WORKSHOPS: Workshop[] = [
  { id: 'ws-001', name: 'autostrand', location: 'Al Qouz 4, Al Qouz 4, Al Qouz Community, Dubai, United Arab Emirates', type: 'external' },
  { id: 'ws-002', name: 'auto tyyy', location: '45a Street, Al Barsha 2, Al Barsha, Dubai, United Arab Emirates', type: 'external' },
  { id: 'ws-003', name: 'abc', location: 'Al Qusais Industrial 3, Al Qusais Ind 3, Al Qusais Industrial Area, Dubai, United Arab Emirates', type: 'external' },
  { id: 'ws-004', name: 'workshop abc', location: 'Golf Grove, Golf Grove, Dubai Hills Estate, Dubai Hills, Hadaeq Sheikh Mohammed Bin Rashid, Dubai, United Arab Emirates', type: 'external' },
  { id: 'ws-005', name: 'xyz workshop', location: '', type: 'external' },
  { id: 'ws-006', name: 'fyyy', location: '', type: 'external' },
];

const SEED_SERVICE_ITEMS: ServiceItemEntry[] = [
  { id: 'si-001', name: 'fan', type: 'Part', unit: 'pieces', cost: '', stockEntries: [{ id: 'se-001', date: '2026-01-10T00:00:00.000Z', quantity: 100 }], workshopId: null },
  { id: 'si-002', name: 'filter', type: 'Part', unit: 'number', cost: '', stockEntries: [{ id: 'se-002', date: '2026-02-02T00:00:00.000Z', quantity: 25 }], workshopId: 'ws-004' },
  { id: 'si-003', name: 'filter', type: 'Part', unit: 'numbers', cost: '', stockEntries: [{ id: 'se-003', date: '2026-02-14T00:00:00.000Z', quantity: 34 }], workshopId: 'ws-005' },
  { id: 'si-004', name: 'tyre', type: 'Part', unit: 'pieces', cost: '', stockEntries: [{ id: 'se-004', date: '2026-03-01T00:00:00.000Z', quantity: 24 }], workshopId: 'ws-005' },
  { id: 'si-005', name: 'gear', type: 'Part', unit: '', cost: '', stockEntries: [{ id: 'se-005', date: '2026-03-20T00:00:00.000Z', quantity: 45 }], workshopId: 'ws-001' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

// Backfills service (job) records saved under an older shape, missing the
// service-plan link, parameters table, or used-items list added later.
function normalizeServices(items: any[] | undefined): ServiceItem[] | undefined {
  if (!Array.isArray(items)) return undefined;
  return items.map((item): ServiceItem => ({
    id: item.id,
    name: item.name,
    vehicleId: item.vehicleId,
    servicePlanId: item.servicePlanId ?? null,
    dateOfService: item.dateOfService ?? null,
    priority: item.priority,
    status: item.status,
    deadline: item.deadline ?? null,
    creationDate: item.creationDate,
    source: item.source,
    cost: item.cost ?? '',
    notes: item.notes ?? '',
    additionalProperties: item.additionalProperties ?? '',
    parameters: item.parameters || emptyParameters(),
    usedItems: Array.isArray(item.usedItems) ? item.usedItems : [],
    files: Array.isArray(item.files) ? item.files : [],
  }));
}

// Migrates service items saved under the old shape (a flat `availableQty`
// number) to the current `stockEntries` list, so stale localStorage data
// from before that change doesn't crash getAvailableQty().
function normalizeServiceItems(items: any[] | undefined): ServiceItemEntry[] | undefined {
  if (!Array.isArray(items)) return undefined;
  return items.map((item): ServiceItemEntry => ({
    id: item.id,
    name: item.name,
    type: item.type,
    unit: item.unit,
    cost: item.cost ?? '',
    workshopId: item.workshopId ?? null,
    stockEntries: Array.isArray(item.stockEntries)
      ? item.stockEntries
      : (typeof item.availableQty === 'number'
          ? [{ id: uuidv4(), date: null, quantity: item.availableQty }]
          : []),
  }));
}

// Discards service plans saved under an older shape (no `counters` object)
// so stale localStorage data from before that change falls back to the new
// seed instead of rendering broken rows. Also coerces `autoCreation` from
// its old boolean shape to the current numeric-threshold shape.
function normalizeServicePlans(plans: any[] | undefined): ServicePlan[] | undefined {
  if (!Array.isArray(plans)) return undefined;
  if (plans.length > 0 && (!plans[0].counters || typeof plans[0].counters !== 'object')) return undefined;
  return plans.map((plan): ServicePlan => ({
    ...plan,
    counters: Object.fromEntries(
      Object.entries(plan.counters).map(([type, counter]: [string, any]) => [
        type,
        { ...counter, autoCreation: typeof counter.autoCreation === 'number' ? counter.autoCreation : null },
      ])
    ) as Record<CounterType, CounterConfig>,
    lastMileageByVehicle: plan.lastMileageByVehicle || {},
    lastEngineHoursByVehicle: plan.lastEngineHoursByVehicle || {},
    lastServiceDateByVehicle: plan.lastServiceDateByVehicle || {},
  }));
}

function loadState(): Partial<MaintenanceState> {
  try {
    const raw = localStorage.getItem('fv-maintenance');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.services = normalizeServices(parsed.services);
      parsed.serviceItems = normalizeServiceItems(parsed.serviceItems);
      parsed.servicePlans = normalizeServicePlans(parsed.servicePlans);
      return parsed;
    }
  } catch { /* ignore */ }
  return {};
}

function saveState(state: MaintenanceState) {
  try {
    localStorage.setItem('fv-maintenance', JSON.stringify({
      services: state.services,
      servicePlans: state.servicePlans,
      workshops: state.workshops,
      serviceItems: state.serviceItems,
    }));
  } catch { /* ignore */ }
}

let nextId = 100;
function genId() {
  return `svc-${String(++nextId).padStart(3, '0')}`;
}

// ─── Slice ──────────────────────────────────────────────────────────────────

const persisted = loadState();

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    services: persisted.services || SEED_SERVICES,
    servicePlans: persisted.servicePlans || SEED_PLANS,
    workshops: persisted.workshops || SEED_WORKSHOPS,
    serviceItems: persisted.serviceItems || SEED_SERVICE_ITEMS,
    activeSubTab: 'services',
    filter: 'open',
    search: '',
    workshopTypeFilter: 'all',
    serviceItemWorkshopFilter: [],
  } as MaintenanceState,
  reducers: {
    setMaintenanceSubTab(state, action: PayloadAction<'services' | 'servicePlans' | 'workshops' | 'serviceItems'>) {
      state.activeSubTab = action.payload;
    },
    setMaintenanceFilter(state, action: PayloadAction<'open' | 'resolved'>) {
      state.filter = action.payload;
    },
    setMaintenanceSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    addService(state, action: PayloadAction<Omit<ServiceItem, 'id' | 'creationDate' | 'source'>>) {
      const svc: ServiceItem = {
        id: genId(),
        creationDate: new Date().toISOString(),
        source: 'Unknown user',
        ...action.payload,
      };
      state.services.unshift(svc);
      saveState(state);
    },
    updateService(state, action: PayloadAction<{ id: string; updates: Partial<ServiceItem> }>) {
      const idx = state.services.findIndex(s => s.id === action.payload.id);
      if (idx >= 0) {
        state.services[idx] = { ...state.services[idx], ...action.payload.updates };
        saveState(state);
      }
    },
    deleteService(state, action: PayloadAction<string>) {
      state.services = state.services.filter(s => s.id !== action.payload);
      saveState(state);
    },

    // ─── Workshops ────────────────────────────────────────────────────────
    setWorkshopTypeFilter(state, action: PayloadAction<'all' | 'internal' | 'external'>) {
      state.workshopTypeFilter = action.payload;
    },
    addWorkshop(state, action: PayloadAction<Omit<Workshop, 'id'>>) {
      state.workshops.unshift({ id: uuidv4(), ...action.payload });
      saveState(state);
    },
    updateWorkshop(state, action: PayloadAction<{ id: string; updates: Partial<Workshop> }>) {
      const idx = state.workshops.findIndex(w => w.id === action.payload.id);
      if (idx >= 0) {
        state.workshops[idx] = { ...state.workshops[idx], ...action.payload.updates };
        saveState(state);
      }
    },
    deleteWorkshop(state, action: PayloadAction<string>) {
      state.workshops = state.workshops.filter(w => w.id !== action.payload);
      // Any service items stocked at the deleted workshop become "not available"
      state.serviceItems.forEach(si => {
        if (si.workshopId === action.payload) si.workshopId = null;
      });
      saveState(state);
    },

    // ─── Service Items ────────────────────────────────────────────────────
    setServiceItemWorkshopFilter(state, action: PayloadAction<string[]>) {
      state.serviceItemWorkshopFilter = action.payload;
    },
    addServiceItem(state, action: PayloadAction<Omit<ServiceItemEntry, 'id'>>) {
      state.serviceItems.unshift({ id: uuidv4(), ...action.payload });
      saveState(state);
    },
    updateServiceItem(state, action: PayloadAction<{ id: string; updates: Partial<ServiceItemEntry> }>) {
      const idx = state.serviceItems.findIndex(si => si.id === action.payload.id);
      if (idx >= 0) {
        state.serviceItems[idx] = { ...state.serviceItems[idx], ...action.payload.updates };
        saveState(state);
      }
    },
    deleteServiceItem(state, action: PayloadAction<string>) {
      state.serviceItems = state.serviceItems.filter(si => si.id !== action.payload);
      saveState(state);
    },

    // ─── Service Plans ────────────────────────────────────────────────────
    addServicePlan(state, action: PayloadAction<Omit<ServicePlan, 'id' | 'createdAt'>>) {
      state.servicePlans.unshift({ id: uuidv4(), createdAt: new Date().toISOString(), ...action.payload });
      saveState(state);
    },
    updateServicePlan(state, action: PayloadAction<{ id: string; updates: Partial<ServicePlan> }>) {
      const idx = state.servicePlans.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) {
        state.servicePlans[idx] = { ...state.servicePlans[idx], ...action.payload.updates };
        saveState(state);
      }
    },
    deleteServicePlan(state, action: PayloadAction<string>) {
      state.servicePlans = state.servicePlans.filter(p => p.id !== action.payload);
      saveState(state);
    },
  },
});

export const {
  setMaintenanceSubTab,
  setMaintenanceFilter,
  setMaintenanceSearch,
  addService,
  updateService,
  deleteService,
  setWorkshopTypeFilter,
  addWorkshop,
  updateWorkshop,
  deleteWorkshop,
  setServiceItemWorkshopFilter,
  addServiceItem,
  updateServiceItem,
  deleteServiceItem,
  addServicePlan,
  updateServicePlan,
  deleteServicePlan,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
