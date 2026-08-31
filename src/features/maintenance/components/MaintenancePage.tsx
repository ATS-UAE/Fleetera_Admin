import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconTool } from '@tabler/icons-react';
import { setMaintenanceSubTab } from '@/store/slices/maintenanceSlice';
import type { MaintenanceState } from '@/store/slices/maintenanceSlice';
import ServicesView from './ServicesView';
import ServicePlansView from './ServicePlansView';
import WorkshopsView from './WorkshopsView';
import ServiceItemsView from './ServiceItemsView';
import { UnsavedChangesProvider, useUnsavedChangesGuard } from './UnsavedChangesContext';
import styles from './MaintenancePage.module.css';

function MaintenanceTabs() {
  const dispatch = useDispatch();
  const { activeSubTab } = useSelector((s: any) => s.maintenance);
  const { guardedNavigate } = useUnsavedChangesGuard();

  const goToTab = (tab: MaintenanceState['activeSubTab']) => {
    guardedNavigate(() => dispatch(setMaintenanceSubTab(tab)));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>
            <IconTool size={18} />
          </span>
          Maintenance
        </h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeSubTab === 'services' ? styles.tabActive : ''}`}
            onClick={() => goToTab('services')}
          >
            Services
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'servicePlans' ? styles.tabActive : ''}`}
            onClick={() => goToTab('servicePlans')}
          >
            Service plans
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'workshops' ? styles.tabActive : ''}`}
            onClick={() => goToTab('workshops')}
          >
            Workshops
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'serviceItems' ? styles.tabActive : ''}`}
            onClick={() => goToTab('serviceItems')}
          >
            Service items
          </button>
        </div>
      </div>

      {activeSubTab === 'servicePlans' ? (
        <ServicePlansView />
      ) : activeSubTab === 'workshops' ? (
        <WorkshopsView />
      ) : activeSubTab === 'serviceItems' ? (
        <ServiceItemsView />
      ) : (
        <ServicesView />
      )}
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <UnsavedChangesProvider>
      <MaintenanceTabs />
    </UnsavedChangesProvider>
  );
}
