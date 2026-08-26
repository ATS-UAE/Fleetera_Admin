import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type LifespanUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface TrackingLink {
  id: string;
  token: string; // short shareable token
  name: string;
  description: string;
  vehicleIds: string[];
  activationTime: string; // ISO
  lifespanValue: number;
  lifespanUnit: LifespanUnit;
  expirationTime: string; // ISO
  showDriverName: boolean;
  showDriverPhone: boolean;
  showTracks: boolean;
  createdAt: string;
  createdBy: string;
  lastAccess: string | null;
  archived: boolean;
}

export interface LocationShareState {
  links: TrackingLink[];
  search: string;
  editingLink: Partial<TrackingLink> | null; // for the "new link" form
  view: 'list' | 'new' | 'edit';
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function computeExpiration(activationTime: string, value: number, unit: LifespanUnit): string {
  const d = new Date(activationTime);
  switch (unit) {
    case 'minutes': d.setMinutes(d.getMinutes() + value); break;
    case 'hours':   d.setHours(d.getHours() + value); break;
    case 'days':    d.setDate(d.getDate() + value); break;
    case 'weeks':   d.setDate(d.getDate() + value * 7); break;
  }
  return d.toISOString();
}

// Persist to localStorage
const STORAGE_KEY = 'fv-location-share-links';
function loadLinks(): TrackingLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveLinks(links: TrackingLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

const initialState: LocationShareState = {
  links: loadLinks(),
  search: '',
  editingLink: null,
  view: 'list',
};

const locationShareSlice = createSlice({
  name: 'locationShare',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<'list' | 'new' | 'edit'>) {
      state.view = action.payload;
      if (action.payload === 'new') {
        state.editingLink = {
          name: '',
          description: '',
          vehicleIds: [],
          activationTime: new Date().toISOString(),
          lifespanValue: 2,
          lifespanUnit: 'hours',
          showDriverName: false,
          showDriverPhone: false,
          showTracks: false,
        };
      }
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    updateEditingLink(state, action: PayloadAction<Partial<TrackingLink>>) {
      if (state.editingLink) {
        Object.assign(state.editingLink, action.payload);
      }
    },
    createLink(state) {
      if (!state.editingLink || !state.editingLink.name) return;
      const now = new Date().toISOString();
      const activationTime = state.editingLink.activationTime || now;
      const lifespanValue = state.editingLink.lifespanValue || 2;
      const lifespanUnit = state.editingLink.lifespanUnit || 'hours';
      const link: TrackingLink = {
        id: uuidv4(),
        token: generateToken(),
        name: state.editingLink.name || '',
        description: state.editingLink.description || '',
        vehicleIds: state.editingLink.vehicleIds || [],
        activationTime,
        lifespanValue,
        lifespanUnit,
        expirationTime: computeExpiration(activationTime, lifespanValue, lifespanUnit),
        showDriverName: state.editingLink.showDriverName || false,
        showDriverPhone: state.editingLink.showDriverPhone || false,
        showTracks: state.editingLink.showTracks || false,
        createdAt: now,
        createdBy: 'Unknown',
        lastAccess: null,
        archived: false,
      };
      state.links.unshift(link);
      state.view = 'list';
      state.editingLink = null;
      saveLinks(state.links);
    },
    archiveLink(state, action: PayloadAction<string>) {
      const link = state.links.find(l => l.id === action.payload);
      if (link) {
        link.archived = true;
        link.expirationTime = new Date().toISOString(); // force expire
        saveLinks(state.links);
      }
    },
    deleteLink(state, action: PayloadAction<string>) {
      state.links = state.links.filter(l => l.id !== action.payload);
      saveLinks(state.links);
    },
    recordAccess(state, action: PayloadAction<string>) {
      // action.payload = token
      const link = state.links.find(l => l.token === action.payload);
      if (link) {
        link.lastAccess = new Date().toISOString();
        saveLinks(state.links);
      }
    },
    // Auto-archive expired links
    checkExpiration(state) {
      const now = Date.now();
      let changed = false;
      state.links.forEach(l => {
        if (!l.archived && new Date(l.expirationTime).getTime() <= now) {
          l.archived = true;
          changed = true;
        }
      });
      if (changed) saveLinks(state.links);
    },
  },
});

export const {
  setView, setSearch, updateEditingLink, createLink,
  archiveLink, deleteLink, recordAccess, checkExpiration,
} = locationShareSlice.actions;
export default locationShareSlice.reducer;
