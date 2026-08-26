import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconSearch, IconTrash, IconRoute2, IconTruckDelivery,
  IconChevronRight, IconArrowLeft, IconPlayerPlay, IconCheck,
  IconX, IconClock, IconWeight, IconRuler2, IconCalendar,
  IconUser, IconTruck, IconMapPin,
} from '@tabler/icons-react';
import {
  setLogisticsSubTab, setLogisticsFilter, setLogisticsSearch,
  setLogisticsView, selectRoute, startRoute, completeRoute,
  cancelRoute, deleteRoute,
} from '@/store/slices/logisticsSlice';
import type {
  LogisticsRoute, Waypoint, RouteStatus, RoutePriority, WaypointType,
  TimelineEvent,
} from '@/store/slices/logisticsSlice';
import type { Vehicle, Driver } from '@/types';
import RouteCreationModal from './RouteCreationModal';
import styles from './LogisticsPage.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const STATUS_LABELS: Record<RouteStatus, string> = {
  planned: 'Planned',
  in_transit: 'In Transit',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_CSS: Record<RouteStatus, string> = {
  planned: styles.statusPlanned,
  in_transit: styles.statusIn_transit,
  completed: styles.statusCompleted,
  cancelled: styles.statusCancelled,
};

const PRIORITY_LABELS: Record<RoutePriority, string> = {
  low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent',
};

const PRIORITY_DOT: Record<RoutePriority, string> = {
  low: styles.priorityDotLow,
  normal: styles.priorityDotNormal,
  high: styles.priorityDotHigh,
  urgent: styles.priorityDotUrgent,
};

const WP_TYPE_LABELS: Record<WaypointType, string> = {
  delivery: 'Delivery', pickup: 'Pickup', service: 'Service', checkpoint: 'Checkpoint',
};

const WP_TYPE_CSS: Record<WaypointType, string> = {
  delivery: styles.wpTypeDelivery,
  pickup: styles.wpTypePickup,
  service: styles.wpTypeService,
  checkpoint: styles.wpTypeCheckpoint,
};

const WP_STATUS_CSS: Record<string, string> = {
  completed: styles.wpCompleted,
  arrived: styles.wpArrived,
  pending: styles.wpPending,
  skipped: styles.wpSkipped,
  failed: styles.wpFailed,
};

// ─── Route Detail Page ──────────────────────────────────────────────────────

function RouteDetailPage({ routeId }: { routeId: string }) {
  const dispatch = useDispatch();
  const route: LogisticsRoute | undefined = useSelector((s: any) =>
    s.logistics.routes.find((r: LogisticsRoute) => r.id === routeId)
  );
  const timeline: TimelineEvent[] = useSelector((s: any) =>
    s.logistics.timeline.filter((t: TimelineEvent) => t.routeId === routeId)
  );
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const drivers: Driver[] = useSelector((s: any) => s.drivers.items);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  if (!route) {
    return (
      <div className={styles.detailContainer}>
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--fv-text-muted)' }}>
          Route not found.
        </div>
      </div>
    );
  }

  const vehicle = vehicles.find(v => v.id === route.vehicleId);
  const driver = drivers.find(d => d.id === route.driverId);
  const completedWps = route.waypoints.filter(w => w.status === 'completed').length;
  const totalWps = route.waypoints.length;
  const progress = totalWps > 0 ? Math.round((completedWps / totalWps) * 100) : 0;

  return (
    <div className={styles.detailContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => dispatch(setLogisticsView('list'))}>
          Logistics
        </button>
        <IconChevronRight size={12} />
        <button className={styles.breadcrumbLink} onClick={() => dispatch(setLogisticsView('list'))}>
          Routes
        </button>
        <IconChevronRight size={12} />
        <span>{route.name}</span>
      </div>

      {/* Header */}
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={() => dispatch(setLogisticsView('list'))}>
          <IconArrowLeft size={20} />
        </button>
        <h2 className={styles.detailTitle}>{route.name}</h2>
        <span className={`${styles.statusBadge} ${STATUS_CSS[route.status]}`}>
          {STATUS_LABELS[route.status]}
        </span>

        <div className={styles.headerActions}>
          {route.status === 'planned' && (
            <button
              className={`${styles.actionBtn} ${styles.actionBtnStart}`}
              onClick={() => dispatch(startRoute(route.id))}
            >
              <IconPlayerPlay size={14} />
              Start Route
            </button>
          )}
          {route.status === 'in_transit' && (
            <button
              className={`${styles.actionBtn} ${styles.actionBtnStart}`}
              onClick={() => dispatch(completeRoute(route.id))}
            >
              <IconCheck size={14} />
              Complete
            </button>
          )}
          {(route.status === 'planned' || route.status === 'in_transit') && (
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={() => dispatch(cancelRoute(route.id))}
            >
              <IconX size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.detailTabs}>
        <button
          className={`${styles.detailTab} ${activeTab === 'overview' ? styles.detailTabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.detailTab} ${activeTab === 'timeline' ? styles.detailTabActive : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Info cards */}
          <div className={styles.overviewGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Route Information</div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Vehicle</span>
                <span className={styles.infoValue}>{vehicle ? `${vehicle.name} (${vehicle.plate})` : '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Driver</span>
                <span className={styles.infoValue}>{driver ? driver.name : '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Priority</span>
                <span className={styles.infoValue}>
                  <span className={styles.priorityBadge}>
                    <span className={`${styles.priorityDot} ${PRIORITY_DOT[route.priority]}`} />
                    {PRIORITY_LABELS[route.priority]}
                  </span>
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Created</span>
                <span className={styles.infoValue}>{formatDateTime(route.createdAt)}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Schedule & Metrics</div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Departure</span>
                <span className={styles.infoValue}>{formatDateTime(route.departureTime)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ETA Return</span>
                <span className={styles.infoValue}>{formatDateTime(route.estimatedReturn)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Distance</span>
                <span className={styles.infoValue}>{route.totalDistance} km</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Est. Duration</span>
                <span className={styles.infoValue}>{formatDuration(route.estimatedDuration)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Progress</span>
                <span className={styles.infoValue}>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{completedWps}/{totalWps}</span>
                  </div>
                </span>
              </div>
            </div>
          </div>

          {/* Waypoint list */}
          <div className={styles.waypointList}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--fv-text-primary)', marginBottom: 12 }}>
              Waypoints ({route.waypoints.length})
            </h3>
            {route.waypoints.map((wp, i) => (
              <div key={wp.id} className={styles.waypointItem}>
                <div className={`${styles.wpSequence} ${WP_STATUS_CSS[wp.status] || styles.wpPending}`}>
                  {wp.status === 'completed' ? '✓' : i + 1}
                </div>
                <div className={styles.wpInfo}>
                  <div className={styles.wpName}>{wp.name}</div>
                  {wp.address && <div className={styles.wpAddress}>{wp.address}</div>}
                  <div className={styles.wpMeta}>
                    <span className={`${styles.wpTypeBadge} ${WP_TYPE_CSS[wp.type]}`}>
                      {WP_TYPE_LABELS[wp.type]}
                    </span>
                    {wp.timeWindowFrom && (
                      <span className={styles.wpMetaTag}>
                        <IconClock size={11} />
                        {wp.timeWindowFrom}{wp.timeWindowTo ? `–${wp.timeWindowTo}` : ''}
                      </span>
                    )}
                    {wp.weight > 0 && (
                      <span className={styles.wpMetaTag}>
                        <IconWeight size={11} />
                        {wp.weight} kg
                      </span>
                    )}
                    {wp.contactName && (
                      <span className={styles.wpMetaTag}>
                        <IconUser size={11} />
                        {wp.contactName}
                      </span>
                    )}
                    {wp.orderNumber && (
                      <span className={styles.wpMetaTag}>
                        #{wp.orderNumber}
                      </span>
                    )}
                  </div>
                  {wp.actualArrival && (
                    <div style={{ fontSize: 11, color: 'var(--fv-emerald)', marginTop: 4 }}>
                      Arrived: {formatDateTime(wp.actualArrival)}
                    </div>
                  )}
                </div>
                <span className={`${styles.wpStatus} ${WP_STATUS_CSS[wp.status] || ''}`} style={{
                  background: wp.status === 'completed' ? 'rgba(16,185,129,0.12)' : wp.status === 'arrived' ? 'rgba(59,130,246,0.12)' : wp.status === 'failed' ? 'rgba(239,68,68,0.12)' : 'var(--fv-bg-card)',
                  color: wp.status === 'completed' ? '#10b981' : wp.status === 'arrived' ? '#3b82f6' : wp.status === 'failed' ? '#ef4444' : 'var(--fv-text-muted)',
                }}>
                  {wp.status === 'completed' ? 'Completed' : wp.status === 'arrived' ? 'Arrived' : wp.status === 'failed' ? 'Failed' : wp.status === 'skipped' ? 'Skipped' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {route.notes && (
            <div style={{ padding: '0 32px 32px' }}>
              <div className={styles.infoCard}>
                <div className={styles.infoCardTitle}>Notes</div>
                <p style={{ fontSize: 13, color: 'var(--fv-text-primary)', lineHeight: 1.6 }}>{route.notes}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Timeline Tab */
        <div className={styles.timelineList}>
          {timeline.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--fv-text-muted)', padding: 40 }}>
              No events recorded yet.
            </div>
          ) : (
            timeline
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(evt => (
                <div key={evt.id} className={styles.tlItem}>
                  <span className={styles.tlTime}>{formatDateTime(evt.timestamp)}</span>
                  <span className={styles.tlDesc}>{evt.description}</span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders Sub-tab ─────────────────────────────────────────────────────────

function OrdersView() {
  const routes: LogisticsRoute[] = useSelector((s: any) => s.logistics.routes);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);

  const allOrders = routes.flatMap(route =>
    route.waypoints
      .filter(wp => wp.type !== 'checkpoint')
      .map(wp => ({ ...wp, routeId: route.id, routeName: route.name, routeStatus: route.status, vehicleId: route.vehicleId }))
  );

  return (
    <div className={styles.ordersTableWrap}>
      {allOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconTruckDelivery size={28} /></div>
          <div className={styles.emptyTitle}>No orders</div>
          <div className={styles.emptyDesc}>Orders from routes will appear here.</div>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Route</th>
              <th>Type</th>
              <th>Vehicle</th>
              <th>Time Window</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map(order => {
              const vehicle = vehicles.find(v => v.id === order.vehicleId);
              return (
                <tr key={`${order.routeId}-${order.id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconMapPin size={14} style={{ color: 'var(--fv-accent)' }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.name}</div>
                        {order.orderNumber && (
                          <div style={{ fontSize: 11, color: 'var(--fv-text-muted)' }}>#{order.orderNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--fv-text-secondary)' }}>{order.routeName}</td>
                  <td>
                    <span className={`${styles.statusBadge}`} style={{
                      fontSize: 11,
                      background: order.type === 'delivery' ? 'rgba(59,130,246,0.12)' : order.type === 'pickup' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
                      color: order.type === 'delivery' ? '#3b82f6' : order.type === 'pickup' ? '#f59e0b' : '#8b5cf6',
                      border: 'none',
                    }}>
                      {WP_TYPE_LABELS[order.type]}
                    </span>
                  </td>
                  <td>{vehicle ? vehicle.plate : '—'}</td>
                  <td>
                    {order.timeWindowFrom
                      ? `${order.timeWindowFrom}${order.timeWindowTo ? ` – ${order.timeWindowTo}` : ''}`
                      : '—'}
                  </td>
                  <td>{order.weight > 0 ? `${order.weight} kg` : '—'}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 10,
                      background: order.status === 'completed' ? 'rgba(16,185,129,0.12)' : order.status === 'arrived' ? 'rgba(59,130,246,0.12)' : 'var(--fv-bg-card)',
                      color: order.status === 'completed' ? '#10b981' : order.status === 'arrived' ? '#3b82f6' : 'var(--fv-text-muted)',
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function LogisticsPage() {
  const dispatch = useDispatch();
  const {
    routes, activeSubTab, filter, search, view, selectedRouteId,
  } = useSelector((s: any) => s.logistics);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const drivers: Driver[] = useSelector((s: any) => s.drivers.items);

  // Route creation modal
  if (view === 'creating') {
    return <RouteCreationModal />;
  }

  // Route detail view
  if (view === 'detail' && selectedRouteId) {
    return <RouteDetailPage routeId={selectedRouteId} />;
  }

  // Filter logic
  const filteredRoutes = (routes as LogisticsRoute[]).filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteRoute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteRoute(id));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>
            <IconRoute2 size={18} />
          </span>
          Logistics
        </h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeSubTab === 'routes' ? styles.tabActive : ''}`}
            onClick={() => dispatch(setLogisticsSubTab('routes'))}
          >
            Routes
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => dispatch(setLogisticsSubTab('orders'))}
          >
            Orders
          </button>
        </div>
      </div>

      {activeSubTab === 'orders' ? (
        <OrdersView />
      ) : (
        <>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button className={styles.newRouteBtn} onClick={() => dispatch(setLogisticsView('creating'))}>
              New route
            </button>

            <div className={styles.filterBtnGroup}>
              {(['all', 'planned', 'in_transit', 'completed'] as const).map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                  onClick={() => dispatch(setLogisticsFilter(f))}
                >
                  {f === 'all' ? 'All' : f === 'in_transit' ? 'In Transit' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.searchBox}>
              <IconSearch size={16} />
              <input
                className={styles.searchInput}
                placeholder="Search routes..."
                value={search}
                onChange={e => dispatch(setLogisticsSearch(e.target.value))}
              />
            </div>
          </div>

          {/* Routes Table */}
          <div className={styles.tableWrap}>
            {filteredRoutes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <IconRoute2 size={28} />
                </div>
                <div className={styles.emptyTitle}>No routes found</div>
                <div className={styles.emptyDesc}>
                  Create a new route to plan deliveries and track progress.
                </div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Waypoints</th>
                    <th>Status</th>
                    <th>Departure</th>
                    <th>Distance</th>
                    <th>Priority</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((route: LogisticsRoute) => {
                    const vehicle = vehicles.find(v => v.id === route.vehicleId);
                    const driver = drivers.find(d => d.id === route.driverId);
                    const completedWps = route.waypoints.filter(w => w.status === 'completed').length;
                    const totalWps = route.waypoints.length;
                    const progress = totalWps > 0 ? Math.round((completedWps / totalWps) * 100) : 0;

                    return (
                      <tr key={route.id} onClick={() => dispatch(selectRoute(route.id))}>
                        <td>
                          <div className={styles.routeNameCell}>
                            <div className={styles.routeIcon}>
                              <IconRoute2 size={14} />
                            </div>
                            <div className={styles.routeNameText}>
                              <span className={styles.routeName}>{route.name}</span>
                              <span className={styles.routeDate}>{formatDate(route.createdAt)}</span>
                            </div>
                          </div>
                        </td>
                        <td>{vehicle ? vehicle.plate : '—'}</td>
                        <td>{driver ? driver.name : '—'}</td>
                        <td>
                          <div className={styles.progressWrap}>
                            <div className={styles.progressBar}>
                              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                            </div>
                            <span className={styles.progressText}>{completedWps}/{totalWps}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${STATUS_CSS[route.status]}`}>
                            {STATUS_LABELS[route.status]}
                          </span>
                        </td>
                        <td>{formatDate(route.departureTime)}</td>
                        <td>{route.totalDistance} km</td>
                        <td>
                          <span className={styles.priorityBadge}>
                            <span className={`${styles.priorityDot} ${PRIORITY_DOT[route.priority]}`} />
                            {PRIORITY_LABELS[route.priority]}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={e => handleDeleteRoute(e, route.id)}
                            title="Delete route"
                          >
                            <IconTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
