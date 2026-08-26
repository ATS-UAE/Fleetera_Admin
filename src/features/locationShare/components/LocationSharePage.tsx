import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconSearch, IconPlus, IconDotsVertical, IconExternalLink,
  IconCopy, IconArchive, IconShare, IconLink, IconClock,
} from '@tabler/icons-react';
import {
  setView, setSearch, archiveLink, checkExpiration,
} from '@/store/slices/locationShareSlice';
import type { TrackingLink } from '@/store/slices/locationShareSlice';
import NewLinkForm from './NewLinkForm';
import styles from './LocationSharePage.module.css';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getRemainingTime(expirationTime: string): string {
  const now = Date.now();
  const exp = new Date(expirationTime).getTime();
  const diff = exp - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `Remaining: ${days} d ${hours} h`;
  if (hours > 0) return `Remaining: ${hours} h ${mins} m`;
  return `Remaining: ${mins} m`;
}

function LinkRow({ link, onAction }: { link: TrackingLink; onAction: (action: string, link: TrackingLink) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const vehicles = useSelector((s: any) => s.vehicles.items);
  const vehicleCount = link.vehicleIds.length;
  const isExpired = new Date(link.expirationTime).getTime() <= Date.now();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <tr>
      <td>{link.name}</td>
      <td>
        <span className={styles.vehicleBadge}>{vehicleCount}</span>
      </td>
      <td>{formatDateTime(link.activationTime)}</td>
      <td>
        <div>{formatDateTime(link.expirationTime)}</div>
        {!link.archived && (
          <div className={`${styles.expirationRemaining} ${isExpired ? styles.expired : ''}`}>
            {isExpired ? 'Expired' : getRemainingTime(link.expirationTime)}
          </div>
        )}
      </td>
      <td>{link.lastAccess ? formatDateTime(link.lastAccess) : '—'}</td>
      <td>
        <div>{formatDateTime(link.createdAt)}</div>
        <div style={{ fontSize: 11, color: 'var(--fv-text-muted)' }}>{link.createdBy}</div>
      </td>
      <td style={{ position: 'relative' }}>
        <button className={styles.actionsBtn} onClick={() => setMenuOpen(!menuOpen)}>
          <IconDotsVertical size={16} />
        </button>
        {menuOpen && (
          <div className={styles.contextMenu} ref={menuRef}>
            <button className={styles.contextMenuItem} onClick={() => { setMenuOpen(false); onAction('open', link); }}>
              <IconExternalLink size={16} /> Open link
            </button>
            <button className={styles.contextMenuItem} onClick={() => { setMenuOpen(false); onAction('copy', link); }}>
              <IconCopy size={16} /> Copy URL
            </button>
            {!link.archived && (
              <button className={styles.contextMenuItem} onClick={() => { setMenuOpen(false); onAction('archive', link); }}>
                <IconArchive size={16} /> Expire and archive
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function LocationSharePage() {
  const dispatch = useDispatch();
  const { links, search, view } = useSelector((s: any) => s.locationShare);
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'archive'>('tracking');
  const [copiedToast, setCopiedToast] = useState(false);

  // Auto-check expiration every 30s
  useEffect(() => {
    dispatch(checkExpiration());
    const interval = setInterval(() => dispatch(checkExpiration()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  if (view === 'new') {
    return <NewLinkForm />;
  }

  const filteredLinks = (links as TrackingLink[]).filter(l => {
    const matchesTab = activeSubTab === 'tracking' ? !l.archived : l.archived;
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const trackingCount = (links as TrackingLink[]).filter(l => !l.archived).length;
  const archiveCount = (links as TrackingLink[]).filter(l => l.archived).length;

  const getShareUrl = (token: string) => {
    return `${window.location.origin}${window.location.pathname}#/share/${token}`;
  };

  const handleAction = (action: string, link: TrackingLink) => {
    switch (action) {
      case 'open':
        window.open(getShareUrl(link.token), '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(getShareUrl(link.token)).then(() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2000);
        });
        break;
      case 'archive':
        dispatch(archiveLink(link.id));
        break;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>
            <IconShare size={18} />
          </span>
          Location share
        </h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeSubTab === 'tracking' ? styles.tabActive : ''}`}
            onClick={() => setActiveSubTab('tracking')}
          >
            Tracking links
            {trackingCount > 0 && <span className={styles.tabBadge}>{trackingCount}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'archive' ? styles.tabActive : ''}`}
            onClick={() => setActiveSubTab('archive')}
          >
            Archive
            {archiveCount > 0 && <span className={styles.tabBadge}>{archiveCount}</span>}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {activeSubTab === 'tracking' && (
          <button className={styles.newLinkBtn} onClick={() => dispatch(setView('new'))}>
            <IconPlus size={14} />
            New link
          </button>
        )}
        <div className={styles.searchBox}>
          <IconSearch size={16} />
          <input
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={e => dispatch(setSearch(e.target.value))}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {filteredLinks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeSubTab === 'tracking' ? <IconLink size={28} /> : <IconArchive size={28} />}
            </div>
            <div className={styles.emptyTitle}>
              {activeSubTab === 'tracking' ? 'No tracking links' : 'No archived links'}
            </div>
            <div className={styles.emptyDesc}>
              {activeSubTab === 'tracking'
                ? 'Create a new link to share vehicle locations with others.'
                : 'Expired links will appear here.'}
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name ↑</th>
                <th>Vehicle</th>
                <th>Activation time</th>
                <th>Expiration time</th>
                <th>Last access</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link: TrackingLink) => (
                <LinkRow key={link.id} link={link} onAction={handleAction} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Copied toast */}
      {copiedToast && (
        <div className={styles.copiedToast}>
          ✓ Link copied to clipboard
        </div>
      )}
    </div>
  );
}
