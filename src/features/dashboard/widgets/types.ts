/* ─── Dashboard Widget System — Types ─────────────────────────────────── */

import type { ComponentType } from 'react';

/* ─── Widget Instance (placed on dashboard) ───────────────────────────── */
export interface WidgetStyle {
  backgroundColor?: string;
  headerColor?: string;
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  fontSize?: number;
  fontColor?: string;
  valueSize?: number;
  numberFormat?: 'raw' | 'comma' | 'compact' | 'decimal';
  widgetTheme?: 'default' | 'minimal' | 'compact' | 'glass';
}

export interface WidgetInstance {
  id: string;
  type: string;
  title: string;
  icon?: string;
  config: Record<string, any>;
  style: WidgetStyle;
  pinned: boolean;
  locked: boolean;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Layout Item (grid position) ─────────────────────────────────────── */
export interface DashboardLayoutItem {
  i: string;      // widget instance ID
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

/* ─── Chart Configuration ─────────────────────────────────────────────── */
export type ChartType =
  | 'line' | 'area' | 'bar' | 'horizontal-bar'
  | 'pie' | 'doughnut' | 'polar' | 'radar'
  | 'scatter' | 'heatmap' | 'timeline' | 'calendar';

export interface ChartSeriesConfig {
  key: string;
  label: string;
  color: string;
  gradient?: { from: string; to: string };
}

export interface ChartConfig {
  chartType: ChartType;
  series: ChartSeriesConfig[];
  legend: { show: boolean; position: 'top' | 'bottom' | 'left' | 'right' };
  grid: { showX: boolean; showY: boolean };
  axis: { showXLabel: boolean; showYLabel: boolean; xLabel?: string; yLabel?: string };
  tooltips: boolean;
  animation: { enabled: boolean; duration: number };
  dataLabels: boolean;
  fillOpacity: number;
  strokeWidth: number;
  curveType: 'linear' | 'monotone' | 'step';
}

/* ─── Filter State ────────────────────────────────────────────────────── */
export interface FilterState {
  dateRange: { from: string; to: string } | null;
  vehicles: string[];
  drivers: string[];
  groups: string[];
  branches: string[];
  regions: string[];
  statuses: string[];
  tripType: string | null;
  fuelType: string | null;
}

/* ─── Dashboard Model ─────────────────────────────────────────────────── */
export interface Dashboard {
  id: string;
  name: string;
  icon: string;
  description?: string;
  layout: DashboardLayoutItem[];
  widgets: WidgetInstance[];
  filters: FilterState;
  themeOverride?: string;
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Widget Props (passed to renderer) ───────────────────────────────── */
export interface WidgetProps {
  instance: WidgetInstance;
  filters: FilterState;
  isEditMode: boolean;
  onUpdate: (config: Partial<WidgetInstance>) => void;
}

/* ─── Widget Type Registration ────────────────────────────────────────── */
export type WidgetCategory = 'statistics' | 'charts' | 'maps' | 'tables' | 'activity';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'slider' | 'toggle'
      | 'icon-picker' | 'checkbox-group' | 'radio' | 'chart-type';
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  group?: 'general' | 'appearance' | 'chart';
}

export interface WidgetRegistration {
  type: string;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string;
  tags: string[];
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
  defaultConfig: Record<string, any>;
  configFields: ConfigField[];
  renderer: ComponentType<WidgetProps>;
}

/* ─── Undo/Redo ───────────────────────────────────────────────────────── */
export interface DashboardSnapshot {
  layout: DashboardLayoutItem[];
  widgets: WidgetInstance[];
  timestamp: number;
}

/* ─── Trashed Widget ──────────────────────────────────────────────────── */
export interface TrashedWidget {
  widget: WidgetInstance;
  layout: DashboardLayoutItem;
  deletedAt: string;
  dashboardId: string;
}
