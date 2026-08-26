/* ─── Default Dashboard Templates ─────────────────────────────────────── */
import { v4 as uuidv4 } from 'uuid';
import type { Dashboard, WidgetInstance, DashboardLayoutItem, FilterState } from '../widgets/types';

export const EMPTY_FILTERS: FilterState = {
  dateRange: null, vehicles: [], drivers: [], groups: [],
  branches: [], regions: [], statuses: [], tripType: null, fuelType: null,
};

/* Helper: create a widget instance */
function w(type: string, title: string, overrides?: Partial<WidgetInstance>): WidgetInstance {
  return {
    id: uuidv4(),
    type,
    title,
    config: {},
    style: {},
    pinned: false,
    locked: false,
    hidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/* ─── Operations Dashboard (default — matches current static layout) ─── */
function buildOperationsDashboard(): Dashboard {
  const widgets = [
    w('stat-total-vehicles',   'Total Vehicles'),
    w('stat-drivers-online',   'Drivers Online'),
    w('stat-total-distance',   'Distance Today'),
    w('stat-fuel-consumption', 'Fuel Consumed'),
    w('stat-alerts',           'Active Alerts'),
    w('stat-geofence-events',  'Geofence Events'),
    w('chart-weekly-distance', 'Weekly Distance & Trips', { config: { chartType: 'area', curveType: 'monotone', fillOpacity: 0.3, strokeWidth: 2, tooltips: true, legend: { show: true, position: 'top' }, grid: { showX: true, showY: true } } }),
    w('chart-fleet-status',    'Fleet Status', { config: { chartType: 'doughnut' } }),
    w('chart-trip-count',      'Trips Completed', { config: { chartType: 'bar', tooltips: true, legend: { show: false }, grid: { showX: false, showY: true } } }),
    w('activity-live-feed',    'Live Activity'),
  ];

  const layout: DashboardLayoutItem[] = [
    { i: widgets[0].id, x: 0,  y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[1].id, x: 2,  y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[2].id, x: 4,  y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[3].id, x: 6,  y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[4].id, x: 8,  y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[5].id, x: 10, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
    { i: widgets[6].id, x: 0,  y: 2, w: 8, h: 4, minW: 4, minH: 3 },
    { i: widgets[7].id, x: 8,  y: 2, w: 4, h: 4, minW: 3, minH: 3 },
    { i: widgets[8].id, x: 0,  y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { i: widgets[9].id, x: 6,  y: 6, w: 6, h: 4, minW: 3, minH: 3 },
  ];

  return {
    id: 'dash-operations',
    name: 'Operations',
    icon: 'IconLayoutDashboard',
    description: 'Main operations overview',
    layout,
    widgets,
    filters: { ...EMPTY_FILTERS },
    isDefault: true,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ─── Fleet Monitoring Dashboard ──────────────────────────────────────── */
function buildFleetDashboard(): Dashboard {
  const widgets = [
    w('stat-total-vehicles',   'Total Vehicles'),
    w('stat-drivers-online',   'Drivers Online'),
    w('stat-active-trips',     'Active Trips'),
    w('stat-avg-speed',        'Average Speed'),
    w('table-vehicle-status',  'Vehicle Status'),
    w('chart-fleet-status',    'Fleet Status', { config: { chartType: 'doughnut' } }),
    w('activity-live-feed',    'Live Activity'),
  ];

  const layout: DashboardLayoutItem[] = [
    { i: widgets[0].id, x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[1].id, x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[2].id, x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[3].id, x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[4].id, x: 0, y: 2, w: 8, h: 5, minW: 4, minH: 3 },
    { i: widgets[5].id, x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 3 },
    { i: widgets[6].id, x: 0, y: 7, w: 12, h: 4, minW: 4, minH: 3 },
  ];

  return {
    id: 'dash-fleet',
    name: 'Fleet Monitor',
    icon: 'IconTruck',
    description: 'Real-time fleet monitoring',
    layout,
    widgets,
    filters: { ...EMPTY_FILTERS },
    isDefault: false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ─── Fuel Dashboard ──────────────────────────────────────────────────── */
function buildFuelDashboard(): Dashboard {
  const widgets = [
    w('stat-fuel-consumption', 'Fuel Consumed'),
    w('stat-total-distance',   'Total Distance'),
    w('stat-avg-speed',        'Average Speed'),
    w('stat-total-vehicles',   'Fleet Size'),
    w('chart-weekly-distance', 'Weekly Distance & Fuel', { config: { chartType: 'area' } }),
    w('chart-fuel-trend',      'Fuel Trend', { config: { chartType: 'line' } }),
  ];

  const layout: DashboardLayoutItem[] = [
    { i: widgets[0].id, x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[1].id, x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[2].id, x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[3].id, x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: widgets[4].id, x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: widgets[5].id, x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  ];

  return {
    id: 'dash-fuel',
    name: 'Fuel',
    icon: 'IconGasStation',
    description: 'Fuel consumption analytics',
    layout,
    widgets,
    filters: { ...EMPTY_FILTERS },
    isDefault: false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ─── Maintenance Dashboard ───────────────────────────────────────────── */
function buildMaintenanceDashboard(): Dashboard {
  const widgets = [
    w('stat-maintenance-due', 'Maintenance Due'),
    w('stat-total-vehicles',  'Fleet Size'),
    w('stat-total-distance',  'Total Distance'),
    w('table-maintenance',    'Maintenance Schedule'),
    w('table-vehicle-status', 'Vehicle Status'),
  ];

  const layout: DashboardLayoutItem[] = [
    { i: widgets[0].id, x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[1].id, x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[2].id, x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[3].id, x: 0, y: 2, w: 6, h: 5, minW: 4, minH: 3 },
    { i: widgets[4].id, x: 6, y: 2, w: 6, h: 5, minW: 4, minH: 3 },
  ];

  return {
    id: 'dash-maintenance',
    name: 'Maintenance',
    icon: 'IconTool',
    description: 'Maintenance tracking and scheduling',
    layout,
    widgets,
    filters: { ...EMPTY_FILTERS },
    isDefault: false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ─── Driver Dashboard ────────────────────────────────────────────────── */
function buildDriverDashboard(): Dashboard {
  const widgets = [
    w('stat-drivers-online', 'Drivers Online'),
    w('stat-active-trips',   'Active Trips'),
    w('stat-avg-speed',      'Avg Speed'),
    w('table-driver-status', 'Driver Status'),
    w('activity-live-feed',  'Live Activity'),
  ];

  const layout: DashboardLayoutItem[] = [
    { i: widgets[0].id, x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[1].id, x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[2].id, x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: widgets[3].id, x: 0, y: 2, w: 7, h: 5, minW: 4, minH: 3 },
    { i: widgets[4].id, x: 7, y: 2, w: 5, h: 5, minW: 3, minH: 3 },
  ];

  return {
    id: 'dash-drivers',
    name: 'Drivers',
    icon: 'IconUsers',
    description: 'Driver management and performance',
    layout,
    widgets,
    filters: { ...EMPTY_FILTERS },
    isDefault: false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ─── All templates ───────────────────────────────────────────────────── */
export const DASHBOARD_TEMPLATES = [
  { id: 'tpl-operations',  name: 'Operations Dashboard',   icon: 'IconLayoutDashboard', build: buildOperationsDashboard },
  { id: 'tpl-fleet',       name: 'Fleet Monitoring',       icon: 'IconTruck',           build: buildFleetDashboard },
  { id: 'tpl-fuel',        name: 'Fuel Dashboard',         icon: 'IconGasStation',      build: buildFuelDashboard },
  { id: 'tpl-maintenance', name: 'Maintenance Dashboard',  icon: 'IconTool',            build: buildMaintenanceDashboard },
  { id: 'tpl-drivers',     name: 'Driver Dashboard',       icon: 'IconUsers',           build: buildDriverDashboard },
];

/* Build initial dashboards from localStorage or defaults */
export function loadDashboards(): Dashboard[] {
  const stored = localStorage.getItem('fv-dashboards');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  return [buildOperationsDashboard()];
}

export function saveDashboards(dashboards: Dashboard[]) {
  localStorage.setItem('fv-dashboards', JSON.stringify(dashboards));
}
