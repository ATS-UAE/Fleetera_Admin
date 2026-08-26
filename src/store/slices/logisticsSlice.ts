import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ──────────────────────────────────────────────────────────────────

export type RouteStatus = 'planned' | 'in_transit' | 'completed' | 'cancelled';
export type WaypointStatus = 'pending' | 'arrived' | 'completed' | 'skipped' | 'failed';
export type WaypointType = 'delivery' | 'pickup' | 'service' | 'checkpoint';
export type RoutePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: WaypointType;
  status: WaypointStatus;
  timeWindowFrom: string | null;
  timeWindowTo: string | null;
  actualArrival: string | null;
  contactName: string;
  contactPhone: string;
  weight: number;
  orderNumber: string;
  notes: string;
  sequence: number;
}

export interface LogisticsRoute {
  id: string;
  name: string;
  status: RouteStatus;
  vehicleId: string;
  driverId: string;
  departureTime: string;
  estimatedReturn: string;
  actualDeparture: string | null;
  actualReturn: string | null;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedDuration: number;
  priority: RoutePriority;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface TimelineEvent {
  id: string;
  routeId: string;
  type: 'created' | 'started' | 'arrived' | 'departed' | 'completed' | 'cancelled' | 'skipped';
  waypointId?: string;
  waypointName?: string;
  timestamp: string;
  description: string;
}

export interface LogisticsState {
  routes: LogisticsRoute[];
  timeline: TimelineEvent[];
  activeSubTab: 'routes' | 'orders';
  filter: 'planned' | 'in_transit' | 'completed' | 'all';
  search: string;
  view: 'list' | 'detail' | 'creating';
  selectedRouteId: string | null;
  editingRoute: Partial<LogisticsRoute> | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

let nextId = 200;
function genId(prefix: string) {
  return `${prefix}-${String(++nextId).padStart(4, '0')}`;
}

function calcDistance(waypoints: Waypoint[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const dLat = (curr.lat - prev.lat) * 111.32;
    const dLng = (curr.lng - prev.lng) * 111.32 * Math.cos((prev.lat * Math.PI) / 180);
    total += Math.sqrt(dLat * dLat + dLng * dLng);
  }
  return Math.round(total * 10) / 10;
}

function calcDuration(distKm: number): number {
  return Math.round((distKm / 40) * 60);
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_ROUTES: LogisticsRoute[] = [
  {
    id: 'route-001',
    name: 'Morning Deliveries — Kandy',
    status: 'in_transit',
    vehicleId: 'v-trk-001',
    driverId: 'd-drv-001',
    departureTime: '2026-07-29T06:00:00.000Z',
    estimatedReturn: '2026-07-29T14:00:00.000Z',
    actualDeparture: '2026-07-29T06:05:00.000Z',
    actualReturn: null,
    waypoints: [
      {
        id: 'wp-001', name: 'Kandy Depot', address: 'Kandy Main Depot, DS Senanayake Veediya',
        lat: 7.2906, lng: 80.6337, type: 'checkpoint', status: 'completed',
        timeWindowFrom: '06:00', timeWindowTo: '06:30',
        actualArrival: '2026-07-29T06:05:00.000Z',
        contactName: 'Depot Manager', contactPhone: '+94771234567',
        weight: 0, orderNumber: '', notes: 'Loading bay 3', sequence: 1,
      },
      {
        id: 'wp-002', name: 'Peradeniya Warehouse', address: 'No.12, Peradeniya Road',
        lat: 7.2654, lng: 80.5920, type: 'delivery', status: 'completed',
        timeWindowFrom: '07:00', timeWindowTo: '08:00',
        actualArrival: '2026-07-29T07:12:00.000Z',
        contactName: 'Ravi Kumara', contactPhone: '+94779012345',
        weight: 250, orderNumber: 'ORD-2026-0147', notes: 'Heavy machinery parts', sequence: 2,
      },
      {
        id: 'wp-003', name: 'Katugastota Store', address: 'Main Street, Katugastota',
        lat: 7.3120, lng: 80.6210, type: 'delivery', status: 'arrived',
        timeWindowFrom: '08:30', timeWindowTo: '09:30',
        actualArrival: '2026-07-29T08:45:00.000Z',
        contactName: 'Sunil Fernando', contactPhone: '+94773456789',
        weight: 80, orderNumber: 'ORD-2026-0148', notes: 'Fragile electronics', sequence: 3,
      },
      {
        id: 'wp-004', name: 'Akurana Distributor', address: '57, Akurana Junction',
        lat: 7.3650, lng: 80.6150, type: 'delivery', status: 'pending',
        timeWindowFrom: '10:00', timeWindowTo: '11:00',
        actualArrival: null,
        contactName: 'Ahmed Khan', contactPhone: '+94774567890',
        weight: 150, orderNumber: 'ORD-2026-0149', notes: 'FMCG supplies — confirm quantity', sequence: 4,
      },
      {
        id: 'wp-005', name: 'Pilimathalawa Return Point', address: 'Airport Road, Pilimathalawa',
        lat: 7.2700, lng: 80.5600, type: 'pickup', status: 'pending',
        timeWindowFrom: '11:30', timeWindowTo: '12:30',
        actualArrival: null,
        contactName: 'Nimal Dias', contactPhone: '+94775678901',
        weight: 40, orderNumber: 'RET-2026-0032', notes: 'Return goods — customers', sequence: 5,
      },
    ],
    totalDistance: 47.3,
    estimatedDuration: 83,
    priority: 'high',
    notes: 'Priority route — time-sensitive electronic goods',
    createdAt: '2026-07-28T18:00:00.000Z',
    createdBy: 'Admin',
  },
  {
    id: 'route-002',
    name: 'Colombo Express Run',
    status: 'planned',
    vehicleId: 'v-van-023',
    driverId: 'd-drv-002',
    departureTime: '2026-07-30T05:00:00.000Z',
    estimatedReturn: '2026-07-30T18:00:00.000Z',
    actualDeparture: null,
    actualReturn: null,
    waypoints: [
      {
        id: 'wp-006', name: 'Kandy Depot', address: 'Kandy Main Depot',
        lat: 7.2906, lng: 80.6337, type: 'checkpoint', status: 'pending',
        timeWindowFrom: '05:00', timeWindowTo: '05:30',
        actualArrival: null,
        contactName: 'Depot Manager', contactPhone: '+94771234567',
        weight: 0, orderNumber: '', notes: 'Load cargo at bay 1', sequence: 1,
      },
      {
        id: 'wp-007', name: 'Colombo City Hub', address: 'Fort, Colombo 01',
        lat: 6.9271, lng: 79.8612, type: 'delivery', status: 'pending',
        timeWindowFrom: '08:00', timeWindowTo: '09:30',
        actualArrival: null,
        contactName: 'Lakmal Perera', contactPhone: '+94776789012',
        weight: 500, orderNumber: 'ORD-2026-0152', notes: 'Bulk textile delivery', sequence: 2,
      },
      {
        id: 'wp-008', name: 'Mount Lavinia Customer', address: 'Hotel Road, Mount Lavinia',
        lat: 6.8380, lng: 79.8650, type: 'delivery', status: 'pending',
        timeWindowFrom: '10:30', timeWindowTo: '11:30',
        actualArrival: null,
        contactName: 'Jennifer Cruz', contactPhone: '+94777890123',
        weight: 120, orderNumber: 'ORD-2026-0153', notes: '', sequence: 3,
      },
      {
        id: 'wp-009', name: 'Colombo Port Pickup', address: 'Colombo Port Gate 7',
        lat: 6.9445, lng: 79.8440, type: 'pickup', status: 'pending',
        timeWindowFrom: '13:00', timeWindowTo: '14:00',
        actualArrival: null,
        contactName: 'Port Authority', contactPhone: '+94778901234',
        weight: 800, orderNumber: 'IMP-2026-0088', notes: 'Import container — customs cleared', sequence: 4,
      },
    ],
    totalDistance: 152.7,
    estimatedDuration: 229,
    priority: 'normal',
    notes: 'Colombo round-trip. Return cargo from port.',
    createdAt: '2026-07-29T04:00:00.000Z',
    createdBy: 'Admin',
  },
  {
    id: 'route-003',
    name: 'Galle Service Run',
    status: 'completed',
    vehicleId: 'v-car-047',
    driverId: 'd-drv-003',
    departureTime: '2026-07-27T07:00:00.000Z',
    estimatedReturn: '2026-07-27T16:00:00.000Z',
    actualDeparture: '2026-07-27T07:10:00.000Z',
    actualReturn: '2026-07-27T15:45:00.000Z',
    waypoints: [
      {
        id: 'wp-010', name: 'Kandy Start', address: 'Main Office',
        lat: 7.2906, lng: 80.6337, type: 'checkpoint', status: 'completed',
        timeWindowFrom: '07:00', timeWindowTo: '07:15',
        actualArrival: '2026-07-27T07:10:00.000Z',
        contactName: '', contactPhone: '',
        weight: 0, orderNumber: '', notes: '', sequence: 1,
      },
      {
        id: 'wp-011', name: 'Galle Client Office', address: 'Church Street, Galle Fort',
        lat: 6.0322, lng: 80.2170, type: 'service', status: 'completed',
        timeWindowFrom: '10:00', timeWindowTo: '12:00',
        actualArrival: '2026-07-27T10:15:00.000Z',
        contactName: 'Sarah Wijesinghe', contactPhone: '+94779123456',
        weight: 15, orderNumber: 'SRV-2026-0019', notes: 'Equipment maintenance visit', sequence: 2,
      },
      {
        id: 'wp-012', name: 'Kandy Return', address: 'Main Office',
        lat: 7.2906, lng: 80.6337, type: 'checkpoint', status: 'completed',
        timeWindowFrom: '15:00', timeWindowTo: '16:00',
        actualArrival: '2026-07-27T15:45:00.000Z',
        contactName: '', contactPhone: '',
        weight: 0, orderNumber: '', notes: '', sequence: 3,
      },
    ],
    totalDistance: 282.0,
    estimatedDuration: 423,
    priority: 'low',
    notes: 'Service visit — completed successfully',
    createdAt: '2026-07-26T12:00:00.000Z',
    createdBy: 'Admin',
  },
];

const SEED_TIMELINE: TimelineEvent[] = [
  { id: 'tl-001', routeId: 'route-001', type: 'created', timestamp: '2026-07-28T18:00:00.000Z', description: 'Route created by Admin' },
  { id: 'tl-002', routeId: 'route-001', type: 'started', timestamp: '2026-07-29T06:05:00.000Z', description: 'Route started — departed Kandy Depot' },
  { id: 'tl-003', routeId: 'route-001', type: 'arrived', waypointId: 'wp-002', waypointName: 'Peradeniya Warehouse', timestamp: '2026-07-29T07:12:00.000Z', description: 'Arrived at Peradeniya Warehouse' },
  { id: 'tl-004', routeId: 'route-001', type: 'completed', waypointId: 'wp-002', waypointName: 'Peradeniya Warehouse', timestamp: '2026-07-29T07:35:00.000Z', description: 'Delivery completed at Peradeniya Warehouse' },
  { id: 'tl-005', routeId: 'route-001', type: 'arrived', waypointId: 'wp-003', waypointName: 'Katugastota Store', timestamp: '2026-07-29T08:45:00.000Z', description: 'Arrived at Katugastota Store' },
  { id: 'tl-006', routeId: 'route-003', type: 'created', timestamp: '2026-07-26T12:00:00.000Z', description: 'Route created by Admin' },
  { id: 'tl-007', routeId: 'route-003', type: 'started', timestamp: '2026-07-27T07:10:00.000Z', description: 'Route started' },
  { id: 'tl-008', routeId: 'route-003', type: 'completed', timestamp: '2026-07-27T15:45:00.000Z', description: 'Route completed — all stops delivered' },
];

// ─── Persistence ────────────────────────────────────────────────────────────

function loadState(): Partial<LogisticsState> {
  try {
    const raw = localStorage.getItem('fv-logistics');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveState(state: LogisticsState) {
  try {
    localStorage.setItem('fv-logistics', JSON.stringify({
      routes: state.routes,
      timeline: state.timeline,
    }));
  } catch { /* ignore */ }
}

// ─── Slice ──────────────────────────────────────────────────────────────────

const persisted = loadState();

const logisticsSlice = createSlice({
  name: 'logistics',
  initialState: {
    routes: persisted.routes || SEED_ROUTES,
    timeline: persisted.timeline || SEED_TIMELINE,
    activeSubTab: 'routes',
    filter: 'all',
    search: '',
    view: 'list',
    selectedRouteId: null,
    editingRoute: null,
  } as LogisticsState,
  reducers: {
    setLogisticsSubTab(state, action: PayloadAction<'routes' | 'orders'>) {
      state.activeSubTab = action.payload;
    },
    setLogisticsFilter(state, action: PayloadAction<'planned' | 'in_transit' | 'completed' | 'all'>) {
      state.filter = action.payload;
    },
    setLogisticsSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setLogisticsView(state, action: PayloadAction<'list' | 'detail' | 'creating'>) {
      state.view = action.payload;
      if (action.payload === 'creating') {
        const now = new Date();
        const dep = new Date(now.getTime() + 3600000);
        const ret = new Date(now.getTime() + 28800000);
        state.editingRoute = {
          name: '',
          vehicleId: '',
          driverId: '',
          departureTime: dep.toISOString(),
          estimatedReturn: ret.toISOString(),
          priority: 'normal',
          notes: '',
          waypoints: [],
          totalDistance: 0,
          estimatedDuration: 0,
        };
      }
    },
    selectRoute(state, action: PayloadAction<string>) {
      state.selectedRouteId = action.payload;
      state.view = 'detail';
    },
    updateEditingRoute(state, action: PayloadAction<Partial<LogisticsRoute>>) {
      if (state.editingRoute) {
        state.editingRoute = { ...state.editingRoute, ...action.payload };
      }
    },
    addWaypoint(state, action: PayloadAction<Partial<Waypoint>>) {
      if (!state.editingRoute) return;
      const wps = state.editingRoute.waypoints || [];
      const wp: Waypoint = {
        id: genId('wp'),
        name: action.payload.name || 'New Waypoint',
        address: action.payload.address || '',
        lat: action.payload.lat || 0,
        lng: action.payload.lng || 0,
        type: action.payload.type || 'delivery',
        status: 'pending',
        timeWindowFrom: action.payload.timeWindowFrom || null,
        timeWindowTo: action.payload.timeWindowTo || null,
        actualArrival: null,
        contactName: action.payload.contactName || '',
        contactPhone: action.payload.contactPhone || '',
        weight: action.payload.weight || 0,
        orderNumber: action.payload.orderNumber || '',
        notes: action.payload.notes || '',
        sequence: wps.length + 1,
      };
      state.editingRoute.waypoints = [...wps, wp];
      // Recalculate distance
      const dist = calcDistance(state.editingRoute.waypoints);
      state.editingRoute.totalDistance = dist;
      state.editingRoute.estimatedDuration = calcDuration(dist);
    },
    updateWaypoint(state, action: PayloadAction<{ id: string; updates: Partial<Waypoint> }>) {
      if (!state.editingRoute?.waypoints) return;
      const idx = state.editingRoute.waypoints.findIndex(w => w.id === action.payload.id);
      if (idx >= 0) {
        state.editingRoute.waypoints[idx] = { ...state.editingRoute.waypoints[idx], ...action.payload.updates };
      }
    },
    removeWaypoint(state, action: PayloadAction<string>) {
      if (!state.editingRoute?.waypoints) return;
      state.editingRoute.waypoints = state.editingRoute.waypoints
        .filter(w => w.id !== action.payload)
        .map((w, i) => ({ ...w, sequence: i + 1 }));
      const dist = calcDistance(state.editingRoute.waypoints);
      state.editingRoute.totalDistance = dist;
      state.editingRoute.estimatedDuration = calcDuration(dist);
    },
    reorderWaypoints(state, action: PayloadAction<string[]>) {
      if (!state.editingRoute?.waypoints) return;
      const wpMap = new Map(state.editingRoute.waypoints.map(w => [w.id, w]));
      state.editingRoute.waypoints = action.payload
        .map((id, i) => {
          const wp = wpMap.get(id);
          return wp ? { ...wp, sequence: i + 1 } : null;
        })
        .filter(Boolean) as Waypoint[];
      const dist = calcDistance(state.editingRoute.waypoints);
      state.editingRoute.totalDistance = dist;
      state.editingRoute.estimatedDuration = calcDuration(dist);
    },
    createRoute(state) {
      if (!state.editingRoute) return;
      const route: LogisticsRoute = {
        id: genId('route'),
        name: state.editingRoute.name || 'Untitled Route',
        status: 'planned',
        vehicleId: state.editingRoute.vehicleId || '',
        driverId: state.editingRoute.driverId || '',
        departureTime: state.editingRoute.departureTime || new Date().toISOString(),
        estimatedReturn: state.editingRoute.estimatedReturn || new Date().toISOString(),
        actualDeparture: null,
        actualReturn: null,
        waypoints: (state.editingRoute.waypoints || []) as Waypoint[],
        totalDistance: state.editingRoute.totalDistance || 0,
        estimatedDuration: state.editingRoute.estimatedDuration || 0,
        priority: (state.editingRoute.priority as RoutePriority) || 'normal',
        notes: state.editingRoute.notes || '',
        createdAt: new Date().toISOString(),
        createdBy: 'Admin',
      };
      state.routes.unshift(route);
      state.timeline.unshift({
        id: genId('tl'),
        routeId: route.id,
        type: 'created',
        timestamp: new Date().toISOString(),
        description: `Route "${route.name}" created by Admin`,
      });
      state.view = 'list';
      state.editingRoute = null;
      saveState(state);
    },
    startRoute(state, action: PayloadAction<string>) {
      const route = state.routes.find(r => r.id === action.payload);
      if (route && route.status === 'planned') {
        route.status = 'in_transit';
        route.actualDeparture = new Date().toISOString();
        if (route.waypoints[0]) route.waypoints[0].status = 'completed';
        state.timeline.unshift({
          id: genId('tl'),
          routeId: route.id,
          type: 'started',
          timestamp: new Date().toISOString(),
          description: `Route "${route.name}" started`,
        });
        saveState(state);
      }
    },
    completeRoute(state, action: PayloadAction<string>) {
      const route = state.routes.find(r => r.id === action.payload);
      if (route) {
        route.status = 'completed';
        route.actualReturn = new Date().toISOString();
        route.waypoints.forEach(wp => {
          if (wp.status === 'pending' || wp.status === 'arrived') wp.status = 'completed';
        });
        state.timeline.unshift({
          id: genId('tl'),
          routeId: route.id,
          type: 'completed',
          timestamp: new Date().toISOString(),
          description: `Route "${route.name}" completed`,
        });
        saveState(state);
      }
    },
    cancelRoute(state, action: PayloadAction<string>) {
      const route = state.routes.find(r => r.id === action.payload);
      if (route) {
        route.status = 'cancelled';
        state.timeline.unshift({
          id: genId('tl'),
          routeId: route.id,
          type: 'cancelled',
          timestamp: new Date().toISOString(),
          description: `Route "${route.name}" cancelled`,
        });
        saveState(state);
      }
    },
    deleteRoute(state, action: PayloadAction<string>) {
      state.routes = state.routes.filter(r => r.id !== action.payload);
      state.timeline = state.timeline.filter(t => t.routeId !== action.payload);
      if (state.selectedRouteId === action.payload) {
        state.selectedRouteId = null;
        state.view = 'list';
      }
      saveState(state);
    },
    cancelCreation(state) {
      state.editingRoute = null;
      state.view = 'list';
    },
  },
});

export const {
  setLogisticsSubTab, setLogisticsFilter, setLogisticsSearch,
  setLogisticsView, selectRoute, updateEditingRoute,
  addWaypoint, updateWaypoint, removeWaypoint, reorderWaypoints,
  createRoute, startRoute, completeRoute, cancelRoute, deleteRoute,
  cancelCreation,
} = logisticsSlice.actions;

export default logisticsSlice.reducer;
