/* ─── Register all built-in widgets ───────────────────────────────────── */
import { WidgetRegistry } from './registry';
import StatWidget from './StatWidget';
import ChartWidget from './ChartWidget';
import FleetStatusWidget from './FleetStatusWidget';
import ActivityWidget from './ActivityWidget';
import TableWidget from './TableWidget';
import type { WidgetRegistration } from './types';

/* ── Statistics ────────────────────────────────────────────────────────── */
const statWidgets: Omit<WidgetRegistration, 'renderer' | 'configFields'>[] = [
  { type: 'stat-total-vehicles',   name: 'Total Vehicles',   description: 'Total fleet count with trend',         category: 'statistics', icon: 'IconTruck',          tags: ['vehicle','fleet','count'],     defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#3b82f6' } },
  { type: 'stat-drivers-online',   name: 'Drivers Online',   description: 'Active drivers with total count',      category: 'statistics', icon: 'IconUsers',          tags: ['driver','online','active'],    defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#10b981' } },
  { type: 'stat-fuel-consumption', name: 'Fuel Consumption', description: 'Weekly fuel usage',                     category: 'statistics', icon: 'IconGasStation',     tags: ['fuel','consumption'],          defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#f59e0b' } },
  { type: 'stat-active-trips',     name: 'Active Trips',     description: 'Currently on-trip count',               category: 'statistics', icon: 'IconRoute',          tags: ['trip','active'],               defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#06b6d4' } },
  { type: 'stat-alerts',           name: 'Active Alerts',    description: 'Unresolved alerts count',               category: 'statistics', icon: 'IconAlertTriangle',  tags: ['alert','warning'],             defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#ef4444' } },
  { type: 'stat-geofence-events',  name: 'Geofence Events',  description: 'Events in time window',                 category: 'statistics', icon: 'IconShieldCheck',    tags: ['geofence','event'],            defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#8b5cf6' } },
  { type: 'stat-avg-speed',        name: 'Average Speed',    description: 'Fleet average speed',                   category: 'statistics', icon: 'IconGauge',          tags: ['speed','average'],             defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#f97316' } },
  { type: 'stat-total-distance',   name: 'Total Distance',   description: 'Total distance covered today',          category: 'statistics', icon: 'IconRoute',          tags: ['distance','total'],            defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#06b6d4' } },
  { type: 'stat-idle-time',        name: 'Idle Time',        description: 'Total idle hours',                      category: 'statistics', icon: 'IconClock',          tags: ['idle','time'],                 defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#6b7280' } },
  { type: 'stat-revenue',          name: 'Revenue',          description: 'Revenue estimate this month',           category: 'statistics', icon: 'IconCurrencyDollar', tags: ['revenue','money','income'],    defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#10b981' } },
  { type: 'stat-maintenance-due',  name: 'Maintenance Due',  description: 'Upcoming services count',               category: 'statistics', icon: 'IconTool',           tags: ['maintenance','service'],       defaultSize: { w: 2, h: 2 }, minSize: { w: 2, h: 2 }, maxSize: { w: 4, h: 3 }, defaultConfig: { color: '#8b5cf6' } },
];

statWidgets.forEach(w => WidgetRegistry.register({ ...w, renderer: StatWidget, configFields: [] }));

/* ── Charts ────────────────────────────────────────────────────────────── */
const chartTypeField = {
  key: 'chartType', label: 'Chart Type', type: 'chart-type' as const,
  defaultValue: 'area',
  options: [
    { label: 'Line',      value: 'line' },
    { label: 'Area',      value: 'area' },
    { label: 'Bar',       value: 'bar' },
    { label: 'Pie',       value: 'pie' },
    { label: 'Doughnut',  value: 'doughnut' },
    { label: 'Radar',     value: 'radar' },
  ],
  group: 'chart' as const,
};

const chartWidgets: Omit<WidgetRegistration, 'renderer'>[] = [
  { type: 'chart-weekly-distance', name: 'Weekly Distance & Trips', description: 'Distance and fuel trends over the week', category: 'charts', icon: 'IconChartAreaLine', tags: ['distance','fuel','weekly','trend'],
    defaultSize: { w: 8, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 },
    defaultConfig: { chartType: 'area', curveType: 'monotone', fillOpacity: 0.3, strokeWidth: 2, tooltips: true, legend: { show: true, position: 'top' }, grid: { showX: true, showY: true } },
    configFields: [chartTypeField],
  },
  { type: 'chart-fuel-trend', name: 'Fuel Trend', description: 'Fuel consumption over time', category: 'charts', icon: 'IconChartLine', tags: ['fuel','trend'],
    defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 },
    defaultConfig: { chartType: 'line', curveType: 'monotone', strokeWidth: 2, tooltips: true, legend: { show: true, position: 'top' }, grid: { showX: true, showY: true } },
    configFields: [chartTypeField],
  },
  { type: 'chart-trip-count', name: 'Trips Completed', description: 'Trip count per day', category: 'charts', icon: 'IconChartBar', tags: ['trip','count','bar'],
    defaultSize: { w: 6, h: 4 }, minSize: { w: 3, h: 3 }, maxSize: { w: 12, h: 8 },
    defaultConfig: { chartType: 'bar', tooltips: true, legend: { show: false }, grid: { showX: false, showY: true } },
    configFields: [chartTypeField],
  },
  { type: 'chart-speed-distribution', name: 'Speed Distribution', description: 'Speed patterns across fleet', category: 'charts', icon: 'IconChartDots', tags: ['speed','distribution'],
    defaultSize: { w: 6, h: 4 }, minSize: { w: 3, h: 3 }, maxSize: { w: 12, h: 8 },
    defaultConfig: { chartType: 'bar', tooltips: true, legend: { show: false }, grid: { showX: false, showY: true } },
    configFields: [chartTypeField],
  },
];

chartWidgets.forEach(w => WidgetRegistry.register({ ...w, renderer: ChartWidget }));

/* ── Fleet status (special) ────────────────────────────────────────────── */
WidgetRegistry.register({
  type: 'chart-fleet-status', name: 'Fleet Status', description: 'Vehicle status breakdown donut', category: 'charts', icon: 'IconChartDonut3', tags: ['fleet','status','donut','pie'],
  defaultSize: { w: 4, h: 4 }, minSize: { w: 3, h: 3 }, maxSize: { w: 6, h: 8 },
  defaultConfig: { chartType: 'doughnut' },
  configFields: [{
    key: 'chartType', label: 'Chart Type', type: 'chart-type',
    defaultValue: 'doughnut',
    options: [{ label: 'Doughnut', value: 'doughnut' }, { label: 'Pie', value: 'pie' }],
    group: 'chart',
  }],
  renderer: FleetStatusWidget,
});

/* ── Tables ────────────────────────────────────────────────────────────── */
const tableWidgets: Omit<WidgetRegistration, 'renderer' | 'configFields'>[] = [
  { type: 'table-latest-trips',    name: 'Latest Trips',        description: 'Recent trips with distance & driver', category: 'tables', icon: 'IconRoute',          tags: ['trip','recent','latest'], defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 }, defaultConfig: {} },
  { type: 'table-driver-status',   name: 'Driver Status',       description: 'All drivers with current status',     category: 'tables', icon: 'IconUsers',          tags: ['driver','status','table'], defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 }, defaultConfig: {} },
  { type: 'table-vehicle-status',  name: 'Vehicle Status',      description: 'All vehicles with status & speed',    category: 'tables', icon: 'IconTruck',          tags: ['vehicle','status','table'], defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 }, defaultConfig: {} },
  { type: 'table-alerts',          name: 'Alerts Table',        description: 'Active alerts with severity',         category: 'tables', icon: 'IconAlertTriangle',  tags: ['alert','table'],           defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 }, defaultConfig: {} },
  { type: 'table-maintenance',     name: 'Maintenance Schedule', description: 'Upcoming maintenance schedule',      category: 'tables', icon: 'IconTool',           tags: ['maintenance','schedule'],   defaultSize: { w: 6, h: 4 }, minSize: { w: 4, h: 3 }, maxSize: { w: 12, h: 8 }, defaultConfig: {} },
];

tableWidgets.forEach(w => WidgetRegistry.register({ ...w, renderer: TableWidget, configFields: [] }));

/* ── Activity ──────────────────────────────────────────────────────────── */
WidgetRegistry.register({
  type: 'activity-live-feed', name: 'Live Activity', description: 'Real-time event stream', category: 'activity', icon: 'IconActivity', tags: ['live','activity','feed','event'],
  defaultSize: { w: 4, h: 5 }, minSize: { w: 3, h: 3 }, maxSize: { w: 6, h: 10 },
  defaultConfig: {},
  configFields: [],
  renderer: ActivityWidget,
});

WidgetRegistry.register({
  type: 'activity-notifications', name: 'Notifications', description: 'System notifications', category: 'activity', icon: 'IconBell', tags: ['notification','system'],
  defaultSize: { w: 4, h: 4 }, minSize: { w: 3, h: 3 }, maxSize: { w: 6, h: 8 },
  defaultConfig: {},
  configFields: [],
  renderer: ActivityWidget,
});

export { WidgetRegistry };
