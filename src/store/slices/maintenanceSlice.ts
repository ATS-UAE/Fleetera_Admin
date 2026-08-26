import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ServicePriority = 'low' | 'normal' | 'high' | 'urgent';
export type ServiceStatus = 'todo' | 'inprogress' | 'done' | 'rejected';

export interface ServiceItem {
  id: string;
  name: string;
  vehicleId: string;
  priority: ServicePriority;
  status: ServiceStatus;
  deadline: string | null;   // ISO date string
  creationDate: string;      // ISO date string
  source: string;
  cost: string;
  notes: string;
  files: string[];           // file names (mock)
}

export interface ServicePlan {
  id: string;
  name: string;
  description: string;
  interval: string;
  createdAt: string;
}

export interface MaintenanceState {
  services: ServiceItem[];
  servicePlans: ServicePlan[];
  activeSubTab: 'services' | 'servicePlans';
  filter: 'open' | 'resolved';
  search: string;
  view: 'list' | 'new' | 'detail';
  selectedServiceId: string | null;
  editingService: Partial<ServiceItem> | null;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'svc-001',
    name: 'health',
    vehicleId: 'v1',
    priority: 'normal',
    status: 'todo',
    deadline: null,
    creationDate: '2026-04-06T14:33:00.000Z',
    source: 'Unknown service plan',
    cost: '',
    notes: '',
    files: [],
  },
  {
    id: 'svc-002',
    name: 'test',
    vehicleId: 'v2',
    priority: 'low',
    status: 'inprogress',
    deadline: '2026-03-05T00:00:00.000Z',
    creationDate: '2026-03-26T00:00:00.000Z',
    source: 'Unknown user',
    cost: '',
    notes: '',
    files: [],
  },
  {
    id: 'svc-003',
    name: 'test',
    vehicleId: 'v3',
    priority: 'normal',
    status: 'todo',
    deadline: '2026-04-11T00:00:00.000Z',
    creationDate: '2026-04-06T00:00:00.000Z',
    source: 'test',
    cost: '',
    notes: '',
    files: [],
  },
  {
    id: 'svc-004',
    name: 'test',
    vehicleId: 'v4',
    priority: 'normal',
    status: 'todo',
    deadline: '2026-04-03T00:00:00.000Z',
    creationDate: '2026-03-31T00:00:00.000Z',
    source: 'Unknown user',
    cost: '',
    notes: '',
    files: [],
  },
  {
    id: 'svc-005',
    name: 'Oil Change',
    vehicleId: 'v1',
    priority: 'high',
    status: 'done',
    deadline: '2026-02-15T00:00:00.000Z',
    creationDate: '2026-01-28T00:00:00.000Z',
    source: 'Scheduled',
    cost: '120',
    notes: 'Completed on time. Full synthetic oil used.',
    files: [],
  },
  {
    id: 'svc-006',
    name: 'Brake Inspection',
    vehicleId: 'v5',
    priority: 'urgent',
    status: 'rejected',
    deadline: '2026-03-01T00:00:00.000Z',
    creationDate: '2026-02-20T00:00:00.000Z',
    source: 'Driver report',
    cost: '',
    notes: 'False alarm — pads were fine.',
    files: [],
  },
];

const SEED_PLANS: ServicePlan[] = [
  {
    id: 'plan-001',
    name: 'Monthly Inspection',
    description: 'Basic vehicle inspection every 30 days',
    interval: '30 days',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'plan-002',
    name: 'Quarterly Service',
    description: 'Full service every 90 days',
    interval: '90 days',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadState(): Partial<MaintenanceState> {
  try {
    const raw = localStorage.getItem('fv-maintenance');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveState(state: MaintenanceState) {
  try {
    localStorage.setItem('fv-maintenance', JSON.stringify({
      services: state.services,
      servicePlans: state.servicePlans,
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
    activeSubTab: 'services',
    filter: 'open',
    search: '',
    view: 'list',
    selectedServiceId: null,
    editingService: null,
  } as MaintenanceState,
  reducers: {
    setMaintenanceSubTab(state, action: PayloadAction<'services' | 'servicePlans'>) {
      state.activeSubTab = action.payload;
    },
    setMaintenanceFilter(state, action: PayloadAction<'open' | 'resolved'>) {
      state.filter = action.payload;
    },
    setMaintenanceSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setMaintenanceView(state, action: PayloadAction<'list' | 'new' | 'detail'>) {
      state.view = action.payload;
      if (action.payload === 'new') {
        state.editingService = {
          name: '',
          vehicleId: '',
          priority: 'normal',
          status: 'todo',
          cost: '',
          deadline: null,
          notes: '',
          files: [],
        };
      }
    },
    selectService(state, action: PayloadAction<string>) {
      state.selectedServiceId = action.payload;
      state.view = 'detail';
    },
    updateEditingService(state, action: PayloadAction<Partial<ServiceItem>>) {
      if (state.editingService) {
        state.editingService = { ...state.editingService, ...action.payload };
      }
    },
    createService(state) {
      if (!state.editingService) return;
      const svc: ServiceItem = {
        id: genId(),
        name: state.editingService.name || 'Untitled',
        vehicleId: state.editingService.vehicleId || '',
        priority: (state.editingService.priority as ServicePriority) || 'normal',
        status: (state.editingService.status as ServiceStatus) || 'todo',
        deadline: state.editingService.deadline || null,
        creationDate: new Date().toISOString(),
        source: 'Unknown user',
        cost: state.editingService.cost || '',
        notes: state.editingService.notes || '',
        files: state.editingService.files || [],
      };
      state.services.unshift(svc);
      state.view = 'list';
      state.editingService = null;
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
      if (state.selectedServiceId === action.payload) {
        state.selectedServiceId = null;
        state.view = 'list';
      }
      saveState(state);
    },
    cancelNewService(state) {
      state.editingService = null;
      state.view = 'list';
    },
  },
});

export const {
  setMaintenanceSubTab,
  setMaintenanceFilter,
  setMaintenanceSearch,
  setMaintenanceView,
  selectService,
  updateEditingService,
  createService,
  updateService,
  deleteService,
  cancelNewService,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
