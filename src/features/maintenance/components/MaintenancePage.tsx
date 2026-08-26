import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconSearch, IconSettings, IconTrash, IconTool, IconCalendar,
  IconX, IconCheck, IconUpload, IconChevronDown, IconChevronRight,
  IconArrowLeft, IconToolsOff,
} from '@tabler/icons-react';
import {
  setMaintenanceSubTab, setMaintenanceFilter, setMaintenanceSearch,
  setMaintenanceView, selectService, updateEditingService,
  createService, deleteService, cancelNewService, updateService,
} from '@/store/slices/maintenanceSlice';
import type {
  ServiceItem, ServicePriority, ServiceStatus,
} from '@/store/slices/maintenanceSlice';
import type { Vehicle } from '@/types';
import styles from './MaintenancePage.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return 'None';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getOverdueDays(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = Date.now() - new Date(deadline).getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const PRIORITY_LABELS: Record<ServicePriority, string> = {
  low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent',
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
  todo: 'To do', inprogress: 'In progress', done: 'Done', rejected: 'Rejected',
};

const PRIORITY_DOT_CLASS: Record<ServicePriority, string> = {
  low: styles.priorityDotLow,
  normal: styles.priorityDotNormal,
  high: styles.priorityDotHigh,
  urgent: styles.priorityDotUrgent,
};

const STATUS_CLASS: Record<ServiceStatus, string> = {
  todo: styles.statusTodo,
  inprogress: styles.statusInprogress,
  done: styles.statusDone,
  rejected: styles.statusRejected,
};

// ─── Priority Dropdown ──────────────────────────────────────────────────────

function PriorityDropdown({ value, onChange }: { value: ServicePriority; onChange: (v: ServicePriority) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className={styles.priorityBadge}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={`${styles.priorityDot} ${PRIORITY_DOT_CLASS[value]}`} />
        {PRIORITY_LABELS[value]}
        <IconChevronDown size={12} />
      </button>
      {open && (
        <div className={styles.dropdownPopup}>
          {(['low', 'normal', 'high', 'urgent'] as ServicePriority[]).map(p => (
            <button
              key={p}
              className={styles.dropdownOption}
              onClick={() => { onChange(p); setOpen(false); }}
            >
              <span className={styles.dropdownCheck}>
                {p === value && <IconCheck size={14} />}
              </span>
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status Dropdown ────────────────────────────────────────────────────────

function StatusDropdown({ value, onChange }: { value: ServiceStatus; onChange: (v: ServiceStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className={`${styles.statusBadge} ${STATUS_CLASS[value]}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {STATUS_LABELS[value]}
        <IconChevronDown size={12} />
      </button>
      {open && (
        <div className={styles.dropdownPopup}>
          {(['todo', 'inprogress', 'done', 'rejected'] as ServiceStatus[]).map(s => (
            <button
              key={s}
              className={styles.dropdownOption}
              onClick={() => { onChange(s); setOpen(false); }}
            >
              <span className={styles.dropdownCheck}>
                {s === value && <IconCheck size={14} />}
              </span>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── New Service Panel ──────────────────────────────────────────────────────

function NewServicePanel() {
  const dispatch = useDispatch();
  const editingService = useSelector((s: any) => s.maintenance.editingService);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);

  if (!editingService) return null;

  const canSave = !!editingService.name;

  return (
    <div className={styles.newServicePanel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>New service</span>
        <button className={styles.panelClose} onClick={() => dispatch(cancelNewService())}>
          <IconX size={18} />
        </button>
      </div>

      {/* Name */}
      <div className={styles.formGroup}>
        <div className={styles.nameInputRow}>
          <div className={styles.nameIcon}>
            <IconTool size={16} />
          </div>
          <input
            className={styles.formInput}
            placeholder="Name *"
            value={editingService.name || ''}
            onChange={e => dispatch(updateEditingService({ name: e.target.value }))}
          />
        </div>
      </div>

      {/* Vehicle */}
      <div className={styles.formGroup}>
        <select
          className={styles.formSelect}
          value={editingService.vehicleId || ''}
          onChange={e => dispatch(updateEditingService({ vehicleId: e.target.value }))}
        >
          <option value="">Vehicles *</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name} — {v.plate}</option>
          ))}
        </select>
      </div>

      {/* Priority & Status */}
      <div className={styles.dropdownRow}>
        <PriorityDropdown
          value={(editingService.priority as ServicePriority) || 'normal'}
          onChange={p => dispatch(updateEditingService({ priority: p }))}
        />
        <StatusDropdown
          value={(editingService.status as ServiceStatus) || 'todo'}
          onChange={s => dispatch(updateEditingService({ status: s }))}
        />
      </div>

      {/* Cost */}
      <div className={styles.formGroup}>
        <input
          className={styles.formInput}
          placeholder="Cost"
          value={editingService.cost || ''}
          onChange={e => dispatch(updateEditingService({ cost: e.target.value }))}
        />
      </div>

      {/* Deadline */}
      <div className={styles.formGroup}>
        <input
          className={styles.formInput}
          type="date"
          placeholder="Deadline"
          value={editingService.deadline ? editingService.deadline.substring(0, 10) : ''}
          onChange={e => dispatch(updateEditingService({ deadline: e.target.value ? new Date(e.target.value).toISOString() : null }))}
        />
      </div>

      {/* Notes */}
      <div className={styles.formGroup}>
        <textarea
          className={styles.formTextarea}
          placeholder="Notes"
          value={editingService.notes || ''}
          onChange={e => dispatch(updateEditingService({ notes: e.target.value }))}
        />
      </div>

      {/* Upload file */}
      <button className={styles.uploadBtn} type="button">
        <IconUpload size={14} />
        Upload file
      </button>

      {/* Footer */}
      <div className={styles.formFooter}>
        <button
          className={styles.saveBtn}
          onClick={() => dispatch(createService())}
          disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.5 }}
        >
          Save
        </button>
        <button className={styles.cancelBtn} onClick={() => dispatch(cancelNewService())}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Service Detail Page ────────────────────────────────────────────────────

function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  const dispatch = useDispatch();
  const service = useSelector((s: any) =>
    s.maintenance.services.find((svc: ServiceItem) => svc.id === serviceId)
  );
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);
  const [activeDetailTab, setActiveDetailTab] = useState<'service' | 'log'>('service');
  const [localName, setLocalName] = useState('');
  const [localCost, setLocalCost] = useState('');
  const [localDeadline, setLocalDeadline] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [localPriority, setLocalPriority] = useState<ServicePriority>('normal');
  const [localStatus, setLocalStatus] = useState<ServiceStatus>('todo');

  useEffect(() => {
    if (service) {
      setLocalName(service.name);
      setLocalCost(service.cost || '');
      setLocalDeadline(service.deadline ? service.deadline.substring(0, 10) : '');
      setLocalNotes(service.notes || '');
      setLocalPriority(service.priority);
      setLocalStatus(service.status);
    }
  }, [service]);

  if (!service) {
    return (
      <div className={styles.detailContainer}>
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--fv-text-muted)' }}>
          Service not found.
        </div>
      </div>
    );
  }

  const vehicle = vehicles.find(v => v.id === service.vehicleId);
  const overdueDays = getOverdueDays(service.deadline);

  const handleSave = () => {
    dispatch(updateService({
      id: service.id,
      updates: {
        name: localName,
        cost: localCost,
        deadline: localDeadline ? new Date(localDeadline).toISOString() : null,
        notes: localNotes,
        priority: localPriority,
        status: localStatus,
      },
    }));
    dispatch(setMaintenanceView('list'));
  };

  return (
    <div className={styles.detailContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => dispatch(setMaintenanceView('list'))}>
          Maintenance
        </button>
        <IconChevronRight size={12} />
        <button className={styles.breadcrumbLink} onClick={() => dispatch(setMaintenanceView('list'))}>
          Services
        </button>
        <IconChevronRight size={12} />
        <span>{service.name}</span>
      </div>

      {/* Header */}
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={() => dispatch(setMaintenanceView('list'))}>
          <IconArrowLeft size={20} />
        </button>
        <h2 className={styles.detailTitle}>{service.name}</h2>
      </div>

      {/* Tabs */}
      <div className={styles.detailTabs}>
        <button
          className={`${styles.detailTab} ${activeDetailTab === 'service' ? styles.detailTabActive : ''}`}
          onClick={() => setActiveDetailTab('service')}
        >
          Service
        </button>
        <button
          className={`${styles.detailTab} ${activeDetailTab === 'log' ? styles.detailTabActive : ''}`}
          onClick={() => setActiveDetailTab('log')}
        >
          Log
        </button>
      </div>

      {activeDetailTab === 'service' ? (
        <>
          {/* Vehicle info bar */}
          <div className={styles.vehicleInfoBar}>
            <div>Vehicle: <span>{vehicle ? `${vehicle.name} (${vehicle.plate})` : service.vehicleId}</span></div>
            <div>Created: {formatDateTime(service.creationDate)}</div>
            <div>Source: <span>{service.source}</span></div>
            {overdueDays !== null && (
              <div>Remaining: <span className={styles.vehicleOverdue}>{overdueDays} d overdue</span></div>
            )}
          </div>

          {/* Edit form */}
          <div className={styles.detailForm}>
            {/* Name */}
            <div className={styles.detailFormGroup}>
              <div className={styles.nameInputRow}>
                <div className={styles.nameIcon}>
                  <IconTool size={16} />
                </div>
                <input
                  className={styles.formInput}
                  placeholder="Name *"
                  value={localName}
                  onChange={e => setLocalName(e.target.value)}
                />
              </div>
            </div>

            {/* Priority & Status */}
            <div className={styles.dropdownRow}>
              <PriorityDropdown value={localPriority} onChange={setLocalPriority} />
              <StatusDropdown value={localStatus} onChange={setLocalStatus} />
            </div>

            {/* Cost */}
            <div className={styles.detailFormGroup}>
              <input
                className={styles.formInput}
                placeholder="Cost"
                value={localCost}
                onChange={e => setLocalCost(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div className={styles.detailFormGroup}>
              <input
                className={styles.formInput}
                type="date"
                placeholder="Deadline"
                value={localDeadline}
                onChange={e => setLocalDeadline(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className={styles.detailFormGroup}>
              <textarea
                className={styles.formTextarea}
                placeholder="Notes"
                value={localNotes}
                onChange={e => setLocalNotes(e.target.value)}
              />
            </div>

            {/* Upload */}
            <button className={styles.uploadBtn} type="button">
              <IconUpload size={14} />
              Upload file
            </button>

            {/* Footer */}
            <div className={styles.formFooter}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Save
              </button>
              <button className={styles.cancelBtn} onClick={() => dispatch(setMaintenanceView('list'))}>
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: '32px', color: 'var(--fv-text-muted)', fontSize: 13 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--fv-bg-panel)', border: '1px solid var(--fv-border)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--fv-text-muted)' }}>{formatDateTime(service.creationDate)}</div>
              <div style={{ fontSize: 13, color: 'var(--fv-text-primary)', marginTop: 4 }}>
                Service created by <strong>{service.source}</strong>
              </div>
            </div>
            {service.status !== 'todo' && (
              <div style={{ background: 'var(--fv-bg-panel)', border: '1px solid var(--fv-border)', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--fv-text-muted)' }}>{formatDateTime(service.creationDate)}</div>
                <div style={{ fontSize: 13, color: 'var(--fv-text-primary)', marginTop: 4 }}>
                  Status changed to <strong>{STATUS_LABELS[service.status as ServiceStatus]}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Service Plans Tab ──────────────────────────────────────────────────────

function ServicePlansView() {
  const plans = useSelector((s: any) => s.maintenance.servicePlans);

  return (
    <div className={styles.plansContainer}>
      {plans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <IconTool size={28} />
          </div>
          <div className={styles.emptyTitle}>No service plans</div>
          <div className={styles.emptyDesc}>Create service plans to schedule recurring maintenance automatically.</div>
        </div>
      ) : (
        plans.map((plan: any) => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planDesc}>{plan.description}</div>
            <div className={styles.planInterval}>Interval: {plan.interval}</div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const {
    services, activeSubTab, filter, search, view, selectedServiceId, editingService,
  } = useSelector((s: any) => s.maintenance);
  const vehicles: Vehicle[] = useSelector((s: any) => s.vehicles.items);

  // Service detail view
  if (view === 'detail' && selectedServiceId) {
    return <ServiceDetailPage serviceId={selectedServiceId} />;
  }

  // Filter logic
  const isOpen = (svc: ServiceItem) => svc.status === 'todo' || svc.status === 'inprogress';
  const isResolved = (svc: ServiceItem) => svc.status === 'done' || svc.status === 'rejected';

  const filteredServices = services.filter((svc: ServiceItem) => {
    const matchesFilter = filter === 'open' ? isOpen(svc) : isResolved(svc);
    const matchesSearch = !search || svc.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteService = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteService(id));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>
            <IconTool size={18} />
          </span>
          Maintenance
        </h1>

        {/* Tabs: Services | Service plans */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeSubTab === 'services' ? styles.tabActive : ''}`}
            onClick={() => dispatch(setMaintenanceSubTab('services'))}
          >
            Services
          </button>
          <button
            className={`${styles.tab} ${activeSubTab === 'servicePlans' ? styles.tabActive : ''}`}
            onClick={() => dispatch(setMaintenanceSubTab('servicePlans'))}
          >
            Service plans
          </button>
        </div>
      </div>

      {activeSubTab === 'servicePlans' ? (
        <ServicePlansView />
      ) : (
        <>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button
              className={styles.newServiceBtn}
              onClick={() => dispatch(setMaintenanceView('new'))}
            >
              New service
            </button>

            <div className={styles.filterBtnGroup}>
              <button
                className={`${styles.filterBtn} ${filter === 'open' ? styles.filterBtnActive : ''}`}
                onClick={() => dispatch(setMaintenanceFilter('open'))}
              >
                Open
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'resolved' ? styles.filterBtnActive : ''}`}
                onClick={() => dispatch(setMaintenanceFilter('resolved'))}
              >
                Resolved
              </button>
            </div>

            <div className={styles.searchBox}>
              <IconSearch size={16} />
              <input
                className={styles.searchInput}
                placeholder="Search"
                value={search}
                onChange={e => dispatch(setMaintenanceSearch(e.target.value))}
              />
            </div>
          </div>

          {/* Content area: Panel + Table */}
          <div className={styles.contentArea}>
            {/* New Service Panel (slides in from left) */}
            {view === 'new' && editingService && <NewServicePanel />}

            {/* Table */}
            <div className={styles.tableArea}>
              {filteredServices.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <IconToolsOff size={28} />
                  </div>
                  <div className={styles.emptyTitle}>
                    {filter === 'open' ? 'No open services' : 'No resolved services'}
                  </div>
                  <div className={styles.emptyDesc}>
                    {filter === 'open'
                      ? 'Create a new service to track maintenance tasks.'
                      : 'Completed and rejected services will appear here.'}
                  </div>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Service ↑</th>
                        <th>Vehicles</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Creation date</th>
                        <th>Source</th>
                        <th>
                          <button className={styles.settingsBtn}>
                            <IconSettings size={16} />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((svc: ServiceItem) => {
                        const vehicle = vehicles.find(v => v.id === svc.vehicleId);
                        const overdueDays = getOverdueDays(svc.deadline);
                        return (
                          <tr
                            key={svc.id}
                            onClick={() => dispatch(selectService(svc.id))}
                          >
                            <td>
                              <div className={styles.serviceNameCell}>
                                <div className={styles.serviceIcon}>
                                  <IconTool size={14} />
                                </div>
                                <div className={styles.serviceNameText}>
                                  <span className={styles.serviceName}>{svc.name}</span>
                                  {overdueDays !== null && (
                                    <span className={styles.serviceOverdue}>
                                      {overdueDays} d overdue
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.vehicleBadge}>
                                <span className={styles.vehicleIcon}>
                                  <IconTool size={12} />
                                </span>
                                {vehicle ? vehicle.plate : svc.vehicleId}
                              </div>
                            </td>
                            <td>
                              <span className={styles.priorityCell}>
                                <span className={`${styles.priorityDot} ${PRIORITY_DOT_CLASS[svc.priority]}`} />
                                {PRIORITY_LABELS[svc.priority]}
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.statusCell} ${STATUS_CLASS[svc.status]}`}>
                                {STATUS_LABELS[svc.status]}
                              </span>
                            </td>
                            <td>
                              <div className={styles.deadlineCell}>
                                <IconCalendar size={14} className={styles.deadlineIcon} />
                                {formatDate(svc.deadline)}
                              </div>
                            </td>
                            <td>{formatDate(svc.creationDate)}</td>
                            <td>{svc.source}</td>
                            <td>
                              <button
                                className={styles.deleteBtn}
                                onClick={e => handleDeleteService(e, svc.id)}
                                title="Delete service"
                              >
                                <IconTrash size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
