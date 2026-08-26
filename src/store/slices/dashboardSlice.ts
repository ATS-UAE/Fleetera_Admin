/* ─── Dashboard Slice — Multi-dashboard + widgets + layout state ──────── */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type {
  Dashboard, WidgetInstance, DashboardLayoutItem,
  FilterState, DashboardSnapshot, TrashedWidget,
} from '@/features/dashboard/widgets/types';
import { loadDashboards, saveDashboards, EMPTY_FILTERS, DASHBOARD_TEMPLATES } from '@/features/dashboard/utils/defaults';

/* ─── State ───────────────────────────────────────────────────────────── */
interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string;
  editMode: boolean;
  // Undo/redo
  undoStack: DashboardSnapshot[];
  redoStack: DashboardSnapshot[];
  // Panels
  widgetLibraryOpen: boolean;
  widgetSettingsId: string | null;   // widget instance id being edited
  themeCustomizerOpen: boolean;
  manageWidgetsOpen: boolean;
  // Trash
  trash: TrashedWidget[];
  // Fullscreen
  fullscreenWidgetId: string | null;
}

const loaded = loadDashboards();

const initialState: DashboardState = {
  dashboards: loaded,
  activeDashboardId: loaded[0]?.id || '',
  editMode: false,
  undoStack: [],
  redoStack: [],
  widgetLibraryOpen: false,
  widgetSettingsId: null,
  themeCustomizerOpen: false,
  manageWidgetsOpen: false,
  trash: JSON.parse(localStorage.getItem('fv-widget-trash') || '[]'),
  fullscreenWidgetId: null,
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function getActive(state: DashboardState): Dashboard | undefined {
  return state.dashboards.find(d => d.id === state.activeDashboardId);
}

function pushUndo(state: DashboardState) {
  const dash = getActive(state);
  if (!dash) return;
  state.undoStack.push({
    layout: JSON.parse(JSON.stringify(dash.layout)),
    widgets: JSON.parse(JSON.stringify(dash.widgets)),
    timestamp: Date.now(),
  });
  if (state.undoStack.length > 50) state.undoStack.shift();
  state.redoStack = [];
}

function persist(state: DashboardState) {
  saveDashboards(state.dashboards);
}

/* ─── Slice ───────────────────────────────────────────────────────────── */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /* ── Mode ─────────────────────────────────────────────────────────── */
    setEditMode(state, action: PayloadAction<boolean>) {
      state.editMode = action.payload;
      if (action.payload) {
        // Snapshot for cancel
        state.undoStack = [];
        state.redoStack = [];
        const dash = getActive(state);
        if (dash) {
          state.undoStack.push({
            layout: JSON.parse(JSON.stringify(dash.layout)),
            widgets: JSON.parse(JSON.stringify(dash.widgets)),
            timestamp: Date.now(),
          });
        }
      }
    },

    /* ── Dashboard CRUD ───────────────────────────────────────────────── */
    setActiveDashboard(state, action: PayloadAction<string>) {
      state.activeDashboardId = action.payload;
      state.editMode = false;
      state.widgetSettingsId = null;
      state.widgetLibraryOpen = false;
    },

    createDashboard(state, action: PayloadAction<{ name: string; templateId?: string }>) {
      const { name, templateId } = action.payload;
      let newDash: Dashboard;

      if (templateId) {
        const tpl = DASHBOARD_TEMPLATES.find(t => t.id === templateId);
        if (tpl) {
          newDash = tpl.build();
          newDash.id = uuidv4();
          newDash.name = name;
          newDash.isDefault = false;
        } else {
          return;
        }
      } else {
        newDash = {
          id: uuidv4(),
          name,
          icon: 'IconLayoutDashboard',
          layout: [],
          widgets: [],
          filters: { ...EMPTY_FILTERS },
          isDefault: false,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      state.dashboards.push(newDash);
      state.activeDashboardId = newDash.id;
      state.editMode = true;
      persist(state);
    },

    deleteDashboard(state, action: PayloadAction<string>) {
      state.dashboards = state.dashboards.filter(d => d.id !== action.payload);
      if (state.activeDashboardId === action.payload) {
        state.activeDashboardId = state.dashboards[0]?.id || '';
      }
      persist(state);
    },

    renameDashboard(state, action: PayloadAction<{ id: string; name: string }>) {
      const dash = state.dashboards.find(d => d.id === action.payload.id);
      if (dash) { dash.name = action.payload.name; dash.updatedAt = new Date().toISOString(); }
      persist(state);
    },

    duplicateDashboard(state, action: PayloadAction<string>) {
      const src = state.dashboards.find(d => d.id === action.payload);
      if (!src) return;
      const copy: Dashboard = JSON.parse(JSON.stringify(src));
      copy.id = uuidv4();
      copy.name = `${src.name} (Copy)`;
      copy.isDefault = false;
      // Regen widget IDs and layout references
      const idMap: Record<string, string> = {};
      copy.widgets.forEach(w => { const newId = uuidv4(); idMap[w.id] = newId; w.id = newId; });
      copy.layout.forEach(l => { if (idMap[l.i]) l.i = idMap[l.i]; });
      state.dashboards.push(copy);
      state.activeDashboardId = copy.id;
      persist(state);
    },

    toggleFavorite(state, action: PayloadAction<string>) {
      const dash = state.dashboards.find(d => d.id === action.payload);
      if (dash) dash.isFavorite = !dash.isFavorite;
      persist(state);
    },

    /* ── Layout ───────────────────────────────────────────────────────── */
    updateLayout(state, action: PayloadAction<DashboardLayoutItem[]>) {
      const dash = getActive(state);
      if (dash) {
        dash.layout = action.payload;
        dash.updatedAt = new Date().toISOString();
      }
    },

    saveLayout(state) {
      const dash = getActive(state);
      if (dash) dash.updatedAt = new Date().toISOString();
      state.editMode = false;
      persist(state);
    },

    cancelEdit(state) {
      // Revert to first snapshot
      const dash = getActive(state);
      if (dash && state.undoStack.length > 0) {
        const first = state.undoStack[0];
        dash.layout = first.layout;
        dash.widgets = first.widgets;
      }
      state.editMode = false;
      state.undoStack = [];
      state.redoStack = [];
    },

    /* ── Widget CRUD ──────────────────────────────────────────────────── */
    addWidget(state, action: PayloadAction<{ widget: WidgetInstance; layout: DashboardLayoutItem }>) {
      const dash = getActive(state);
      if (!dash) return;
      pushUndo(state);
      dash.widgets.push(action.payload.widget);
      dash.layout.push(action.payload.layout);
      dash.updatedAt = new Date().toISOString();
    },

    removeWidget(state, action: PayloadAction<string>) {
      const dash = getActive(state);
      if (!dash) return;
      pushUndo(state);
      const widget = dash.widgets.find(w => w.id === action.payload);
      const layout = dash.layout.find(l => l.i === action.payload);
      if (widget && layout) {
        state.trash.push({
          widget: JSON.parse(JSON.stringify(widget)),
          layout: JSON.parse(JSON.stringify(layout)),
          deletedAt: new Date().toISOString(),
          dashboardId: dash.id,
        });
        localStorage.setItem('fv-widget-trash', JSON.stringify(state.trash));
      }
      dash.widgets = dash.widgets.filter(w => w.id !== action.payload);
      dash.layout = dash.layout.filter(l => l.i !== action.payload);
      dash.updatedAt = new Date().toISOString();
    },

    duplicateWidget(state, action: PayloadAction<string>) {
      const dash = getActive(state);
      if (!dash) return;
      const src = dash.widgets.find(w => w.id === action.payload);
      const srcLayout = dash.layout.find(l => l.i === action.payload);
      if (!src || !srcLayout) return;
      pushUndo(state);
      const newWidget: WidgetInstance = {
        ...JSON.parse(JSON.stringify(src)),
        id: uuidv4(),
        title: `${src.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newLayout: DashboardLayoutItem = {
        ...srcLayout,
        i: newWidget.id,
        y: srcLayout.y + srcLayout.h,
      };
      dash.widgets.push(newWidget);
      dash.layout.push(newLayout);
      dash.updatedAt = new Date().toISOString();
    },

    updateWidget(state, action: PayloadAction<{ id: string; changes: Partial<WidgetInstance> }>) {
      const dash = getActive(state);
      if (!dash) return;
      const widget = dash.widgets.find(w => w.id === action.payload.id);
      if (widget) {
        Object.assign(widget, action.payload.changes);
        widget.updatedAt = new Date().toISOString();
      }
      dash.updatedAt = new Date().toISOString();
      persist(state);
    },

    toggleWidgetPin(state, action: PayloadAction<string>) {
      const dash = getActive(state);
      if (!dash) return;
      const widget = dash.widgets.find(w => w.id === action.payload);
      if (widget) widget.pinned = !widget.pinned;
    },

    toggleWidgetLock(state, action: PayloadAction<string>) {
      const dash = getActive(state);
      if (!dash) return;
      const widget = dash.widgets.find(w => w.id === action.payload);
      const layout = dash.layout.find(l => l.i === action.payload);
      if (widget) widget.locked = !widget.locked;
      if (layout) layout.static = widget?.locked;
    },

    toggleWidgetHidden(state, action: PayloadAction<string>) {
      const dash = getActive(state);
      if (!dash) return;
      const widget = dash.widgets.find(w => w.id === action.payload);
      if (widget) widget.hidden = !widget.hidden;
    },

    restoreWidget(state, action: PayloadAction<number>) {
      const idx = action.payload;
      if (idx < 0 || idx >= state.trash.length) return;
      const item = state.trash[idx];
      const dash = state.dashboards.find(d => d.id === item.dashboardId) || getActive(state);
      if (dash) {
        dash.widgets.push(item.widget);
        dash.layout.push(item.layout);
      }
      state.trash.splice(idx, 1);
      localStorage.setItem('fv-widget-trash', JSON.stringify(state.trash));
      persist(state);
    },

    /* ── Filters ──────────────────────────────────────────────────────── */
    setFilters(state, action: PayloadAction<Partial<FilterState>>) {
      const dash = getActive(state);
      if (dash) Object.assign(dash.filters, action.payload);
    },

    clearFilters(state) {
      const dash = getActive(state);
      if (dash) dash.filters = { ...EMPTY_FILTERS };
    },

    /* ── Undo / Redo ──────────────────────────────────────────────────── */
    undo(state) {
      const dash = getActive(state);
      if (!dash || state.undoStack.length <= 1) return;
      // Save current to redo
      state.redoStack.push({
        layout: JSON.parse(JSON.stringify(dash.layout)),
        widgets: JSON.parse(JSON.stringify(dash.widgets)),
        timestamp: Date.now(),
      });
      const snapshot = state.undoStack.pop()!;
      dash.layout = snapshot.layout;
      dash.widgets = snapshot.widgets;
    },

    redo(state) {
      const dash = getActive(state);
      if (!dash || state.redoStack.length === 0) return;
      state.undoStack.push({
        layout: JSON.parse(JSON.stringify(dash.layout)),
        widgets: JSON.parse(JSON.stringify(dash.widgets)),
        timestamp: Date.now(),
      });
      const snapshot = state.redoStack.pop()!;
      dash.layout = snapshot.layout;
      dash.widgets = snapshot.widgets;
    },

    /* ── Panels ───────────────────────────────────────────────────────── */
    setWidgetLibraryOpen(state, action: PayloadAction<boolean>) {
      state.widgetLibraryOpen = action.payload;
    },
    setWidgetSettingsId(state, action: PayloadAction<string | null>) {
      state.widgetSettingsId = action.payload;
    },
    setThemeCustomizerOpen(state, action: PayloadAction<boolean>) {
      state.themeCustomizerOpen = action.payload;
    },
    setManageWidgetsOpen(state, action: PayloadAction<boolean>) {
      state.manageWidgetsOpen = action.payload;
    },
    setFullscreenWidget(state, action: PayloadAction<string | null>) {
      state.fullscreenWidgetId = action.payload;
    },

    /* ── Resize presets ───────────────────────────────────────────────── */
    resizeWidget(state, action: PayloadAction<{ id: string; w: number; h: number }>) {
      const dash = getActive(state);
      if (!dash) return;
      pushUndo(state);
      const layout = dash.layout.find(l => l.i === action.payload.id);
      if (layout) {
        layout.w = action.payload.w;
        layout.h = action.payload.h;
      }
    },
  },
});

export const {
  setEditMode, setActiveDashboard, createDashboard, deleteDashboard,
  renameDashboard, duplicateDashboard, toggleFavorite,
  updateLayout, saveLayout, cancelEdit,
  addWidget, removeWidget, duplicateWidget, updateWidget,
  toggleWidgetPin, toggleWidgetLock, toggleWidgetHidden, restoreWidget,
  setFilters, clearFilters,
  undo, redo,
  setWidgetLibraryOpen, setWidgetSettingsId, setThemeCustomizerOpen,
  setManageWidgetsOpen, setFullscreenWidget, resizeWidget,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
