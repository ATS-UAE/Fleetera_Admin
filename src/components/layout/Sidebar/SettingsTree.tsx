import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Switch, Tooltip } from '@mantine/core';
import {
  IconSettings, IconChevronDown, IconChevronRight as IconCaretRight,
  IconUser, IconSun, IconMail, IconPhone, IconShieldCheck,
} from '@tabler/icons-react';
import {
  toggleSettingsTree, setSettingsSection, setTheme,
} from '@/store/slices/uiSlice';
import styles from './SettingsTree.module.css';

const SECTIONS = [
  { id: 'profile',    label: 'Profile',    icon: IconUser },
  { id: 'appearance', label: 'Appearance', icon: IconSun },
];

function ProfilePanel() {
  return (
    <div className={styles.sectionPanel}>
      <div className={styles.profileMeta}>
        <Avatar size={34} radius="xl" color="blue">AD</Avatar>
        <div className={styles.profileMetaInfo}>
          <span className={styles.profileMetaName}>Admin User</span>
          <span className={styles.profileMetaRole}>Fleet Manager</span>
        </div>
      </div>
      <div className={styles.profileField}>
        <IconMail size={12} />
        <span>admin@fleetvision.io</span>
      </div>
      <div className={styles.profileField}>
        <IconPhone size={12} />
        <span>+1 (555) 019-2834</span>
      </div>
      <div className={styles.profileField}>
        <IconShieldCheck size={12} />
        <span>Super Admin Access</span>
      </div>
    </div>
  );
}

function AppearancePanel() {
  const dispatch = useDispatch();
  const theme = useSelector((s: any) => s.ui.theme);
  return (
    <div className={styles.sectionPanel}>
      <div className={styles.themeToggleRow}>
        <span>Dark Mode</span>
        <Switch
          size="xs"
          checked={theme === 'dark'}
          onChange={e => dispatch(setTheme(e.currentTarget.checked ? 'dark' : 'light'))}
          color="blue"
        />
      </div>
    </div>
  );
}

const PANELS: Record<string, React.FC> = {
  profile: ProfilePanel,
  appearance: AppearancePanel,
};

interface SettingsTreeProps { isCollapsed: boolean; }
export default function SettingsTree({ isCollapsed }: SettingsTreeProps) {
  const dispatch = useDispatch();
  const { settingsTreeOpen, settingsActiveSection } = useSelector((s: any) => s.ui);

  // In collapsed-sidebar mode, just show the icon — expanding a tree doesn't
  // make sense in a 64px-wide rail, so clicking it auto-expands the sidebar
  // first (handled by the parent via the same toggleSidebar action elsewhere,
  // here we simply hide the tree body).
  if (isCollapsed) {
    return (
      <Tooltip label="Settings" position="right" offset={12}>
        <button className={styles.collapsedBtn} onClick={() => dispatch(toggleSettingsTree())}>
          <IconSettings size={16} />
        </button>
      </Tooltip>
    );
  }

  const ActivePanel = settingsActiveSection ? PANELS[settingsActiveSection] : null;

  return (
    <div className={styles.wrap}>
      {/* Root "Settings" toggle */}
      <button
        className={`${styles.rootBtn} ${settingsTreeOpen ? styles.rootBtnOpen : ''}`}
        onClick={() => dispatch(toggleSettingsTree())}
      >
        <span className={styles.rootLeft}>
          <IconSettings size={17} />
          <span>Settings</span>
        </span>
        {settingsTreeOpen
          ? <IconChevronDown size={14} className={styles.chevron} />
          : <IconCaretRight size={14} className={styles.chevron} />}
      </button>

      {/* Tree of sub-sections */}
      {settingsTreeOpen && (
        <div className={styles.tree}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = settingsActiveSection === s.id;
            return (
              <div key={s.id} className={styles.treeNode}>
                <button
                  className={`${styles.treeBtn} ${isActive ? styles.treeBtnActive : ''}`}
                  onClick={() => dispatch(setSettingsSection(s.id))}
                >
                  <span className={styles.treeLine} />
                  <Icon size={13} />
                  <span>{s.label}</span>
                  {isActive
                    ? <IconChevronDown size={11} className={styles.treeChevron} />
                    : <IconCaretRight size={11} className={styles.treeChevron} />}
                </button>

                {/* Inline expanded panel for the active section */}
                {isActive && ActivePanel && (
                  <div className={styles.panelWrap}>
                    <ActivePanel />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
