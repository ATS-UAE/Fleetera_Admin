import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import DashboardPage from '@/features/dashboard/components/DashboardPage';
import VehiclesPage from '@/features/vehicles/components/VehiclesPage';
import DriversPage from '@/features/drivers/components/DriversPage';
import DriversOnlinePage from '@/features/driversOnline/components/DriversOnlinePage';
import TrackPlayerPage from '@/features/trackPlayer/components/TrackPlayerPage';
import GeofencesPage from '@/features/geofences/components/GeofencesPage';
import ReportsPage from '@/features/reports/components/ReportsPage';
import LocationSharePage from '@/features/locationShare/components/LocationSharePage';
import MaintenancePage from '@/features/maintenance/components/MaintenancePage';
import LogisticsPage from '@/features/logistics/components/LogisticsPage';
import ChecklistsPage from '@/features/checklists/components/ChecklistsPage';
import TaskDeskPage from '@/features/taskDesk/components/TaskDeskPage';
import SharedLinkView from '@/features/locationShare/components/SharedLinkView';

import NotificationModal from '@/components/NotificationModal';

const PAGES: Record<string, any> = {
  dashboard: DashboardPage,
  vehicles: VehiclesPage,
  drivers: DriversPage,
  driversOnline: DriversOnlinePage,
  trackPlayer: TrackPlayerPage,
  geofences: GeofencesPage,
  reports: ReportsPage,
  locationShare: LocationSharePage,
  maintenance: MaintenancePage,
  logistics: LogisticsPage,
  checklists: ChecklistsPage,
  taskDesk: TaskDeskPage,
};

export default function App() {
  const activeTab = useSelector((s: any) => s.ui.activeTab);
  const theme = useSelector((s: any) => s.ui.theme);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Sync theme to <html data-theme="..."> so CSS variable overrides fire.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for hash-based share URLs: #/share/{token}
  useEffect(() => {
    function checkHash() {
      const hash = window.location.hash;
      const match = hash.match(/^#\/share\/(.+)$/);
      if (match) {
        setShareToken(match[1]);
      } else {
        setShareToken(null);
      }
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // If we're in share mode, show only the shared link view (no sidebar)
  if (shareToken) {
    return (
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <SharedLinkView
          token={shareToken}
          onClose={() => {
            window.location.hash = '';
            setShareToken(null);
          }}
        />
      </div>
    );
  }

  const ActivePage = PAGES[activeTab] || DashboardPage;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative', minWidth: 0 }}>
        <ActivePage />
      </main>
      <NotificationModal />
    </div>
  );
}
