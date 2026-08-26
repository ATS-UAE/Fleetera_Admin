import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconClipboardList, IconLayoutKanban, IconList, IconBolt, IconChartBar,
  IconSearch, IconFilter, IconPlus, IconRefresh, IconInfoCircle
} from '@tabler/icons-react';
import { setActiveView, setFilter, resetFilters, seedSampleData } from '@/store/slices/taskDeskSlice';
import TaskBoardView from './TaskBoardView';
import TaskListView from './TaskListView';
import AutomationRulesView from './AutomationRulesView';
import TaskAnalyticsView from './TaskAnalyticsView';
import TaskDetailModal from './TaskDetailModal';
import TriggerSimulatorModal from './TriggerSimulatorModal';
import styles from './TaskDeskPage.module.css';

export default function TaskDeskPage() {
  const dispatch = useDispatch();
  const activeView = useSelector((s: any) => s.taskDesk.activeView);
  const filters = useSelector((s: any) => s.taskDesk.filters);
  const vehicles = useSelector((s: any) => s.vehicles.items);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [showSupervisorBanner, setShowSupervisorBanner] = useState<boolean>(true);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleIcon}>
            <IconClipboardList size={24} />
          </div>
          <div className={styles.titleText}>
            <h1>Task Desk</h1>
            <p>Automated task dispatch & operational trigger execution system</p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className={styles.navigationTabs}>
          <button
            className={`${styles.navTab} ${activeView === 'board' ? styles.navTabActive : ''}`}
            onClick={() => dispatch(setActiveView('board'))}
          >
            <IconLayoutKanban size={16} /> Kanban Board
          </button>
          <button
            className={`${styles.navTab} ${activeView === 'list' ? styles.navTabActive : ''}`}
            onClick={() => dispatch(setActiveView('list'))}
          >
            <IconList size={16} /> Task Table
          </button>
          <button
            className={`${styles.navTab} ${activeView === 'automations' ? styles.navTabActive : ''}`}
            onClick={() => dispatch(setActiveView('automations'))}
          >
            <IconBolt size={16} /> Automation Rules (Admin)
          </button>
          <button
            className={`${styles.navTab} ${activeView === 'analytics' ? styles.navTabActive : ''}`}
            onClick={() => dispatch(setActiveView('analytics'))}
          >
            <IconChartBar size={16} /> Analytics
          </button>
        </div>

        {/* Top actions */}
        <div className={styles.headerActions}>
          <button className={styles.btnSimulate} onClick={() => setIsSimulatorOpen(true)}>
            <IconBolt size={16} /> Fire Trigger (Simulate Task)
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => dispatch(seedSampleData())}
            title="Reset to initial sample tasks & rules"
          >
            <IconRefresh size={16} /> Reset Sample Data
          </button>
        </div>
      </div>

      {/* Supervisor Explanation Banner */}
      {showSupervisorBanner && (
        <div style={{ padding: '12px 24px 0 24px' }}>
          {/* <div className={styles.supervisorBanner}>
            <div className={styles.supervisorBannerIcon}>
              <IconInfoCircle size={22} />
            </div>
            <div className={styles.supervisorBannerText} style={{ flex: 1 }}>
              <h4>Why is Task Desk empty by default in Wialon & how does it work?</h4>
              <p>
                In Fleet management platforms, tasks are created automatically when automation triggers occur (such as vehicle over-speeding, geofence enter/exit, maintenance due, engine diagnostic trouble code, or scheduled timers). Tasks are not manually created like simple todo items. You can click <strong>"Fire Trigger (Simulate Task)"</strong> or go to <strong>"Automation Rules (Admin)"</strong> to see how triggers dynamically generate real tasks!
              </p>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => setShowSupervisorBanner(false)}
            >
              ✕
            </button>
          </div> */}
        </div>
      )}

      {/* Filter Bar (Visible for Board and List views) */}
      {(activeView === 'board' || activeView === 'list') && (
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div className={styles.searchInputWrap}>
              <IconSearch className={styles.searchIcon} size={15} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search tasks, rules, units..."
                value={filters.search}
                onChange={e => dispatch(setFilter({ search: e.target.value }))}
              />
            </div>

            <select
              className={styles.selectFilter}
              value={filters.status}
              onChange={e => dispatch(setFilter({ status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className={styles.selectFilter}
              value={filters.priority}
              onChange={e => dispatch(setFilter({ priority: e.target.value }))}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className={styles.selectFilter}
              value={filters.vehicleId}
              onChange={e => dispatch(setFilter({ vehicleId: e.target.value }))}
            >
              <option value="all">All Vehicle Units</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.btnSecondary} onClick={() => dispatch(resetFilters())}>
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className={styles.mainContent}>
        {activeView === 'board' && <TaskBoardView />}
        {activeView === 'list' && <TaskListView />}
        {activeView === 'automations' && <AutomationRulesView />}
        {activeView === 'analytics' && <TaskAnalyticsView />}
      </div>

      {/* Modals */}
      <TaskDetailModal />
      <TriggerSimulatorModal isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
    </div>
  );
}
