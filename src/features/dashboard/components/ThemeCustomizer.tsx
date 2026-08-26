/* ─── ThemeCustomizer — Dashboard theming panel ──────────────────────── */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconX, IconCheck } from '@tabler/icons-react';
import { setTheme } from '@/store/slices/uiSlice';
import { setThemeCustomizerOpen } from '@/store/slices/dashboardSlice';
import styles from './ThemeCustomizer.module.css';

const THEMES = [
  { id: 'dark',         name: 'Dark',           description: 'Deep navy dark mode',       preview: { bg: '#0a0e1a', card: '#1a2540', accent: '#3b82f6' } },
  { id: 'light',        name: 'Light',          description: 'Clean white mode',           preview: { bg: '#f0f4ff', card: '#f8faff', accent: '#2563eb' } },
  { id: 'blue',         name: 'Blue',           description: 'Ocean blue dark',            preview: { bg: '#0c1929', card: '#132236', accent: '#60a5fa' } },
  { id: 'purple',       name: 'Purple',         description: 'Royal purple dark',          preview: { bg: '#13082a', card: '#1e1040', accent: '#a78bfa' } },
  { id: 'green',        name: 'Green',          description: 'Forest green dark',          preview: { bg: '#071a12', card: '#0d2a1e', accent: '#34d399' } },
  { id: 'corporate',    name: 'Corporate',      description: 'Professional light grey',    preview: { bg: '#f8fafc', card: '#ffffff', accent: '#1e40af' } },
  { id: 'highContrast', name: 'High Contrast',  description: 'WCAG AAA accessible',        preview: { bg: '#000000', card: '#1a1a1a', accent: '#fbbf24' } },
];

export default function ThemeCustomizer() {
  const dispatch = useDispatch();
  const open = useSelector((s: any) => s.dashboard.themeCustomizerOpen);
  const currentTheme = useSelector((s: any) => s.ui.theme);

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => dispatch(setThemeCustomizerOpen(false))} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Theme</h3>
          <button className={styles.closeBtn} onClick={() => dispatch(setThemeCustomizerOpen(false))}>
            <IconX size={16} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sectionLabel}>Choose a Theme</div>

          <div className={styles.themeGrid}>
            {THEMES.map(t => {
              const isActive = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  className={`${styles.themeCard} ${isActive ? styles.themeActive : ''}`}
                  onClick={() => dispatch(setTheme(t.id))}
                >
                  {/* Preview swatch */}
                  <div className={styles.preview} style={{ background: t.preview.bg }}>
                    <div className={styles.previewCard} style={{ background: t.preview.card, borderColor: t.preview.accent + '40' }}>
                      <div className={styles.previewLine} style={{ background: t.preview.accent }} />
                      <div className={styles.previewLine2} style={{ background: t.preview.accent + '40' }} />
                    </div>
                    {isActive && (
                      <div className={styles.checkBadge} style={{ background: t.preview.accent }}>
                        <IconCheck size={10} color="white" />
                      </div>
                    )}
                  </div>
                  <div className={styles.themeName}>{t.name}</div>
                  <div className={styles.themeDesc}>{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
