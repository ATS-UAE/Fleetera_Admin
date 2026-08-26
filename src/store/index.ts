import { configureStore } from '@reduxjs/toolkit';
import vehiclesReducer from './slices/vehiclesSlice';
import driversReducer from './slices/driversSlice';
import geofencesReducer from './slices/geofencesSlice';
import trackPlayerReducer from './slices/trackPlayerSlice';
import uiReducer from './slices/uiSlice';
import columnVisibilityReducer from './slices/columnVisibilitySlice';
import locationShareReducer from './slices/locationShareSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import logisticsReducer from './slices/logisticsSlice';
import dashboardReducer from './slices/dashboardSlice';
import checklistsReducer from './slices/checklistsSlice';
import taskDeskReducer from './slices/taskDeskSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
    drivers: driversReducer,
    geofences: geofencesReducer,
    trackPlayer: trackPlayerReducer,
    ui: uiReducer,
    columnVisibility: columnVisibilityReducer,
    locationShare: locationShareReducer,
    maintenance: maintenanceReducer,
    logistics: logisticsReducer,
    dashboard: dashboardReducer,
    checklists: checklistsReducer,
    taskDesk: taskDeskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export default store;
