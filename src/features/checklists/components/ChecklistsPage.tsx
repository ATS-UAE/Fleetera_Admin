import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconClipboardCheck, IconSearch, IconX,
  IconCheck, IconAlertCircle, IconMinus,
  IconTruck, IconUser, IconCalendar, IconClipboardList,
  IconPhoto, IconPencil, IconSignature, IconHash, IconToggleLeft,
  IconInfoCircle, IconCheckbox, IconPlus, IconTrash, IconLayoutList,
} from '@tabler/icons-react';
import {
  setActiveSubTab, selectSubmitted, setSearch,
  setFilterType, setFilterResult,
  setFilterDateFrom, setFilterDateTo, clearFilters,
  createAssignment, deleteAssignment,
} from '@/store/slices/checklistsSlice';
import type {
  SubmittedChecklist, AssignedChecklist, SubmittedItemResult,
  ChecklistType, OverallResult, AssignedPriority, ChecklistTemplate,
} from '@/store/slices/checklistsSlice';
import styles from './ChecklistsPage.module.css';

// ─── Seed vehicle/driver data (mirrors other modules) ─────────────────────────
const VEHICLES = [
  { id: 'v1', name: 'TN-01-AB-1234 (Volvo FH)' },
  { id: 'v2', name: 'MH-12-CD-5678 (Tata Prima)' },
  { id: 'v3', name: 'KA-05-EF-9012 (Ashok Leyland)' },
  { id: 'v4', name: 'DL-01-GH-3456 (BharatBenz)' },
  { id: 'v5', name: 'GJ-06-IJ-7890 (Mahindra Furio)' },
];

const DRIVERS = [
  { id: 'd1', name: 'Arjun Sharma' },
  { id: 'd2', name: 'Ravi Kumar' },
  { id: 'd3', name: 'Suresh Reddy' },
  { id: 'd4', name: 'Mohan Pillai' },
  { id: 'd5', name: 'Deepak Singh' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date();
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function scoreColor(pct: number): string {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function scoreRingClass(pct: number): string {
  if (pct >= 80) return styles.scoreRingGreen;
  if (pct >= 50) return styles.scoreRingAmber;
  return styles.scoreRingRed;
}

// ─── Type Tag ─────────────────────────────────────────────────────────────────

function TypeTag({ type }: { type: ChecklistType }) {
  const cls =
    type === 'pre-trip'  ? styles.typePreTrip  :
    type === 'post-trip' ? styles.typePostTrip :
    type === 'mid-trip'  ? styles.typeMidTrip  :
    styles.typeCustom;
  const label =
    type === 'pre-trip'  ? 'Pre-Trip'  :
    type === 'post-trip' ? 'Post-Trip' :
    type === 'mid-trip'  ? 'Mid-Trip'  : 'Custom';
  return <span className={`${styles.typeTag} ${cls}`}>{label}</span>;
}

// ─── Result Badge ─────────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: OverallResult }) {
  if (result === 'passed')  return <span className={`${styles.badge} ${styles.badgePassed}`}><IconCheck size={10}/> Passed</span>;
  if (result === 'failed')  return <span className={`${styles.badge} ${styles.badgeFailed}`}><IconAlertCircle size={10}/> Failed</span>;
  return <span className={`${styles.badge} ${styles.badgePartial}`}><IconMinus size={10}/> Partial</span>;
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'urgent' ? styles.badgeUrgent :
    priority === 'high'   ? styles.badgeHigh   :
    priority === 'low'    ? styles.badgeLow    : styles.badgeNormal;
  return <span className={`${styles.badge} ${cls}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const fillCls = pct >= 80 ? styles.scoreFillGreen : pct >= 50 ? styles.scoreFillAmber : styles.scoreFillRed;
  return (
    <div className={styles.scoreBar}>
      <div className={styles.scoreTrack}>
        <div className={`${styles.scoreFill} ${fillCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.scoreText} style={{ color: scoreColor(pct) }}>{passed}/{total}</span>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const R = 28;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;
  return (
    <div className={styles.scoreRingWrap}>
      <svg width={72} height={72} viewBox="0 0 72 72" className={styles.scoreRingSvg}>
        <circle cx={36} cy={36} r={R} className={styles.scoreRingBg} />
        <circle
          cx={36} cy={36} r={R}
          className={`${styles.scoreRingFill} ${scoreRingClass(pct)}`}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={0}
        />
      </svg>
      <div className={styles.scoreRingCenter}>
        <span className={styles.scoreRingPct}>{pct}%</span>
        <span className={styles.scoreRingLabel}>pass</span>
      </div>
    </div>
  );
}

// ─── Answer type icon ─────────────────────────────────────────────────────────

function AnswerTypeIcon({ type }: { type: string }) {
  if (type === 'yes_no')    return <IconToggleLeft size={11} />;
  if (type === 'number')    return <IconHash size={11} />;
  if (type === 'photo')     return <IconPhoto size={11} />;
  if (type === 'signature') return <IconSignature size={11} />;
  return <IconPencil size={11} />;
}

// ─── Signature Canvas Mock ────────────────────────────────────────────────────

function MockSignature({ name }: { name: string }) {
  return (
    <div className={styles.sigCanvas}>
      <svg width={80} height={44} viewBox="0 0 80 44">
        <path
          d={`M10,30 C12,20 16,15 20,22 C22,26 24,28 26,25 C30,18 34,12 38,20 C40,24 42,28 46,26 C50,24 52,18 56,20 C60,22 62,28 66,25 C68,23 70,21 72,22`}
          fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <text x="10" y="42" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">{name.split(' ')[0]}</text>
      </svg>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, idx }: { item: SubmittedItemResult; idx: number }) {
  const iconCls =
    item.result === 'pass'    ? styles.itemResultPass :
    item.result === 'fail'    ? styles.itemResultFail : styles.itemResultSkipped;
  const cardCls = item.result === 'fail' ? `${styles.itemCard} ${styles.itemCardFail}` : styles.itemCard;
  const answerDisplay =
    item.answerType === 'signature' ? '(Signed)' :
    item.answerType === 'photo'     ? item.hasPhoto ? '(Photo attached)' : '(No photo)' :
    item.answer ?? '—';

  return (
    <div className={cardCls} style={{ animationDelay: `${idx * 0.03}s` }}>
      <div className={`${styles.itemResultIcon} ${iconCls}`}>
        {item.result === 'pass'    && <IconCheck size={12} />}
        {item.result === 'fail'    && <IconX size={12} />}
        {item.result === 'skipped' && <IconMinus size={12} />}
      </div>
      <div className={styles.itemContent}>
        <div className={styles.itemQuestion}>{item.question}</div>
        <div className={styles.itemAnswer}>
          <span className={styles.answerTypeBadge}>
            <AnswerTypeIcon type={item.answerType} />
            {item.answerType.replace('_', '/')}
          </span>
          {item.answerType !== 'photo' && item.answerType !== 'signature' && (
            <span className={styles.itemAnswerValue}>{answerDisplay}</span>
          )}
        </div>
        {item.hasPhoto && (
          <div className={styles.itemPhotoThumb}>
            <IconPhoto size={11} /> Photo attached
          </div>
        )}
        {item.comment && (
          <div className={styles.itemComment}>
            <IconInfoCircle size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {item.comment}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ checklist, onClose }: { checklist: SubmittedChecklist; onClose: () => void }) {
  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.detailPanel} onClick={handleBackdrop}>
      <div className={styles.detailPanelInner}>
        <div className={styles.detailHeader}>
          <div className={styles.detailHeaderLeft}>
            <div className={styles.detailTitle}>{checklist.templateName}</div>
            <div className={styles.detailMeta}>
              <TypeTag type={checklist.type} />
              <ResultBadge result={checklist.overallResult} />
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><IconX size={14} /></button>
        </div>

        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { icon: <IconTruck size={12}/>, label: checklist.vehicleName },
            { icon: <IconUser size={12}/>,  label: checklist.driverName },
            { icon: <IconCalendar size={12}/>, label: `Submitted: ${fmtDateTime(checklist.submittedAt)}` },
          ].map((m, i) => (
            <div key={i} className={styles.detailMetaItem}>
              {m.icon}
              <span style={{ fontSize: 12 }}>{m.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.scoreSummary}>
          <ScoreRing passed={checklist.passedItems} total={checklist.totalItems} />
          <div className={styles.scoreCounts}>
            <div className={`${styles.scoreCountItem} ${styles.scoreCountTotal}`}>
              <span className={styles.scoreCountValue}>{checklist.totalItems}</span>
              <span className={styles.scoreCountLabel}>Total Items</span>
            </div>
            <div className={`${styles.scoreCountItem} ${styles.scoreCountPassed}`}>
              <span className={styles.scoreCountValue}>{checklist.passedItems}</span>
              <span className={styles.scoreCountLabel}>Passed</span>
            </div>
            <div className={`${styles.scoreCountItem} ${styles.scoreCountFailed}`}>
              <span className={styles.scoreCountValue}>{checklist.failedItems}</span>
              <span className={styles.scoreCountLabel}>Failed</span>
            </div>
            <div className={`${styles.scoreCountItem} ${styles.scoreCountSkipped}`}>
              <span className={styles.scoreCountValue}>{checklist.skippedItems}</span>
              <span className={styles.scoreCountLabel}>Skipped</span>
            </div>
          </div>
        </div>

        <div className={styles.detailBody}>
          {checklist.notes && (
            <>
              <div className={styles.sectionHeader}><IconPencil size={11} /> Driver Notes</div>
              <div className={styles.notesBlock}>{checklist.notes}</div>
            </>
          )}
          <div className={styles.sectionHeader}>
            <IconCheckbox size={11} /> Inspection Items ({checklist.totalItems})
          </div>
          <div className={styles.itemList}>
            {checklist.items.map((item, idx) => (
              <ItemRow key={item.itemId} item={item} idx={idx} />
            ))}
          </div>
          <div className={styles.sectionHeader}><IconSignature size={11} /> Driver Signature</div>
          {checklist.hasSig ? (
            <div className={styles.sigBlock}>
              <MockSignature name={checklist.driverName} />
              <div className={styles.sigInfo}>
                <div className={styles.sigLabel}>{checklist.driverName}</div>
                <div className={styles.sigSub}>Signed on {fmtDateTime(checklist.submittedAt)}</div>
              </div>
            </div>
          ) : (
            <div className={styles.noSigNote}>No signature captured for this inspection.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function StatsStrip({ submitted, assigned }: { submitted: SubmittedChecklist[]; assigned: AssignedChecklist[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = submitted.filter(s => s.submittedAt.startsWith(today)).length;
  const totalFailed = submitted.reduce((acc, s) => acc + s.failedItems, 0);
  const passRate = submitted.length > 0
    ? Math.round(submitted.filter(s => s.overallResult === 'passed').length / submitted.length * 100) : 0;
  const overdueCount = assigned.filter(a => a.status === 'overdue').length;

  return (
    <div className={styles.statsStrip}>
      {[
        { icon: <IconClipboardList size={16} />, cls: styles.statIconBlue,   value: submitted.length, label: 'Total Submitted' },
        { icon: <IconCalendar size={16} />,      cls: styles.statIconPurple, value: todayCount,        label: 'Submitted Today' },
        { icon: <IconCheck size={16} />,         cls: styles.statIconGreen,  value: `${passRate}%`,    label: 'Pass Rate' },
        { icon: <IconAlertCircle size={16} />,   cls: styles.statIconRed,    value: totalFailed,       label: 'Failed Items' },
        { icon: <IconClipboardCheck size={16}/>, cls: styles.statIconAmber,  value: assigned.length,   label: 'Pending Assigned' },
        { icon: <IconX size={16} />,             cls: styles.statIconRed,    value: overdueCount,      label: 'Overdue' },
      ].map((s, i) => (
        <div key={i} className={styles.statCard}>
          <div className={`${styles.statIcon} ${s.cls}`}>{s.icon}</div>
          <div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Submitted Table ──────────────────────────────────────────────────────────

function SubmittedTable({ rows, selectedId, onSelect }: {
  rows: SubmittedChecklist[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.tableArea}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.colName}>Checklist</th>
            <th className={styles.colVehicle}>Vehicle</th>
            <th className={styles.colDriver}>Driver</th>
            <th className={styles.colType}>Type</th>
            <th className={styles.colDate}>Submitted</th>
            <th className={styles.colScore}>Score</th>
            <th className={styles.colFailed}>Failed</th>
            <th className={styles.colResult}>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IconClipboardList size={28} /></div>
                  <div className={styles.emptyTitle}>No checklists found</div>
                  <div className={styles.emptyDesc}>Try adjusting the filters or search query.</div>
                </div>
              </td>
            </tr>
          ) : rows.map(row => (
            <tr
              key={row.id}
              className={`${styles.tableRow} ${selectedId === row.id ? styles.tableRowSelected : ''}`}
              onClick={() => onSelect(row.id)}
            >
              <td>
                <div className={styles.cellPrimary} style={{ fontSize: 12, whiteSpace: 'normal', lineHeight: 1.3 }}>
                  {row.templateName}
                </div>
              </td>
              <td>
                <div className={styles.cellPrimary} style={{ fontSize: 11 }}>{row.vehicleName.split('(')[0].trim()}</div>
                <div className={styles.cellSecondary}>{row.vehicleName.match(/\(([^)]+)\)/)?.[1]}</div>
              </td>
              <td>
                <div className={styles.driverAvatar}>
                  <div className={styles.avatarDot}>{initials(row.driverName)}</div>
                  <span style={{ fontSize: 12 }}>{row.driverName}</span>
                </div>
              </td>
              <td><TypeTag type={row.type} /></td>
              <td><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDateTime(row.submittedAt)}</div></td>
              <td><ScoreBar passed={row.passedItems} total={row.totalItems} /></td>
              <td>
                <span className={`${styles.failedCount} ${row.failedItems === 0 ? styles.failedCountZero : styles.failedCountNonZero}`}>
                  {row.failedItems}
                </span>
              </td>
              <td><ResultBadge result={row.overallResult} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Assigned Table ───────────────────────────────────────────────────────────

function AssignedTable({ rows, onDelete }: { rows: AssignedChecklist[]; onDelete: (id: string) => void }) {
  return (
    <div className={styles.tableArea}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.colAsgName}>Checklist</th>
            <th className={styles.colAsgVehicle}>Vehicle</th>
            <th className={styles.colAsgDriver}>Driver</th>
            <th className={styles.colAsgType}>Type</th>
            <th className={styles.colAsgDate}>Assigned</th>
            <th className={styles.colAsgDue}>Due Date</th>
            <th className={styles.colAsgPrio}>Priority</th>
            <th className={styles.colAsgStatus}>Status</th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IconClipboardCheck size={28} /></div>
                  <div className={styles.emptyTitle}>No assigned checklists</div>
                  <div className={styles.emptyDesc}>Click "+ New Checklist" to assign one to a driver.</div>
                </div>
              </td>
            </tr>
          ) : rows.map(row => (
            <tr key={row.id} className={styles.tableRow}>
              <td><div className={styles.cellPrimary} style={{ fontSize: 12 }}>{row.templateName}</div></td>
              <td>
                <div className={styles.cellPrimary} style={{ fontSize: 11 }}>{row.vehicleName.split('(')[0].trim()}</div>
                <div className={styles.cellSecondary}>{row.vehicleName.match(/\(([^)]+)\)/)?.[1]}</div>
              </td>
              <td>
                <div className={styles.driverAvatar}>
                  <div className={styles.avatarDot}>{initials(row.driverName)}</div>
                  <span style={{ fontSize: 12 }}>{row.driverName}</span>
                </div>
              </td>
              <td><TypeTag type={row.type} /></td>
              <td><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(row.assignedAt)}</span></td>
              <td>
                {row.dueDate ? (
                  <span className={isOverdue(row.dueDate) ? styles.dueDateOverdue : styles.dueDateOk} style={{ fontSize: 11 }}>
                    {isOverdue(row.dueDate) && <IconAlertCircle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                    {fmtDateTime(row.dueDate)}
                  </span>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
              </td>
              <td><PriorityBadge priority={row.priority} /></td>
              <td>
                {row.status === 'overdue'
                  ? <span className={`${styles.badge} ${styles.badgeOverdue}`}><IconAlertCircle size={10}/> Overdue</span>
                  : <span className={`${styles.badge} ${styles.badgePending}`}><IconClipboardCheck size={10}/> Pending</span>
                }
              </td>
              <td>
                <div className={styles.actionCell}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(row.id)}
                    title="Delete assignment"
                  >
                    <IconTrash size={11} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Priority Selector ────────────────────────────────────────────────────────

const PRIORITIES: { value: AssignedPriority; label: string; cls: string }[] = [
  { value: 'low',    label: 'Low',    cls: styles.priorityLow    },
  { value: 'normal', label: 'Normal', cls: styles.priorityNormal },
  { value: 'high',   label: 'High',   cls: styles.priorityHigh   },
  { value: 'urgent', label: 'Urgent', cls: styles.priorityUrgent },
];

// ─── Create New Checklist Modal ───────────────────────────────────────────────

interface CreateFormState {
  templateId: string;
  vehicleId: string;
  driverId: string;
  dueDate: string;
  dueTime: string;
  priority: AssignedPriority;
  notes: string;
}

interface FormErrors {
  templateId?: string;
  vehicleId?: string;
  driverId?: string;
}

function CreateChecklistPanel({
  templates,
  onClose,
  onSubmit,
}: {
  templates: ChecklistTemplate[];
  onClose: () => void;
  onSubmit: (form: CreateFormState) => void;
}) {
  const [form, setForm] = useState<CreateFormState>({
    templateId: '',
    vehicleId: '',
    driverId: '',
    dueDate: '',
    dueTime: '08:00',
    priority: 'normal',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function setField<K extends keyof CreateFormState>(key: K, val: CreateFormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key as keyof FormErrors]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.templateId) e.templateId = 'Please select a checklist template.';
    if (!form.vehicleId)  e.vehicleId  = 'Please select a vehicle.';
    if (!form.driverId)   e.driverId   = 'Please select a driver.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  const selectedTemplate = templates.find(t => t.id === form.templateId) ?? null;
  const PREVIEW_LIMIT = 5;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.createPanel} ref={panelRef}>
        {/* Header */}
        <div className={styles.createPanelHeader}>
          <div className={styles.createPanelTitle}>
            <div className={styles.createPanelTitleIcon}>
              <IconPlus size={16} />
            </div>
            <div>
              <div className={styles.createPanelTitleText}>New Checklist Assignment</div>
              <div className={styles.createPanelSubtitle}>Assign an inspection checklist to a driver & vehicle</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <IconX size={14} />
          </button>
        </div>

        {/* Form body */}
        <form className={styles.createPanelBody} onSubmit={handleSubmit} id="create-checklist-form">

          {/* Section 1: Template */}
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>
              <IconClipboardList size={12} /> Inspection Template
            </div>

            <div className={styles.formRow}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Checklist Template</label>
              <select
                id="create-template"
                className={styles.formSelect}
                value={form.templateId}
                onChange={e => setField('templateId', e.target.value)}
              >
                <option value="">— Select a template —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.items.length} items)
                  </option>
                ))}
              </select>
              {errors.templateId && <div className={styles.formError}>{errors.templateId}</div>}
            </div>

            {/* Template preview */}
            {selectedTemplate && (
              <div className={styles.templatePreview}>
                <div className={styles.templatePreviewHeader}>
                  <span className={styles.templatePreviewName}>{selectedTemplate.name}</span>
                  <TypeTag type={selectedTemplate.type} />
                </div>
                <div className={styles.templatePreviewItems}>
                  {selectedTemplate.items.slice(0, PREVIEW_LIMIT).map((item, i) => (
                    <div key={item.id} className={styles.templatePreviewItem}>
                      <div className={styles.templatePreviewDot} />
                      <span>{item.question}</span>
                    </div>
                  ))}
                  {selectedTemplate.items.length > PREVIEW_LIMIT && (
                    <div className={styles.templatePreviewMore}>
                      + {selectedTemplate.items.length - PREVIEW_LIMIT} more items…
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Vehicle & Driver */}
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>
              <IconTruck size={12} /> Vehicle & Driver
            </div>

            <div className={styles.formRow}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Vehicle</label>
              <select
                id="create-vehicle"
                className={styles.formSelect}
                value={form.vehicleId}
                onChange={e => setField('vehicleId', e.target.value)}
              >
                <option value="">— Select a vehicle —</option>
                {VEHICLES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {errors.vehicleId && <div className={styles.formError}>{errors.vehicleId}</div>}
            </div>

            <div className={styles.formRow}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Driver</label>
              <select
                id="create-driver"
                className={styles.formSelect}
                value={form.driverId}
                onChange={e => setField('driverId', e.target.value)}
              >
                <option value="">— Select a driver —</option>
                {DRIVERS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.driverId && <div className={styles.formError}>{errors.driverId}</div>}
            </div>
          </div>

          {/* Section 3: Schedule & Priority */}
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>
              <IconCalendar size={12} /> Schedule & Priority
            </div>

            <div className={styles.formRowHalf}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Due Date</label>
                <input
                  id="create-due-date"
                  type="date"
                  className={styles.formInput}
                  value={form.dueDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setField('dueDate', e.target.value)}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Due Time</label>
                <input
                  id="create-due-time"
                  type="time"
                  className={styles.formInput}
                  value={form.dueTime}
                  onChange={e => setField('dueTime', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formHint}>
              Leave due date empty to assign without a deadline.
            </div>

            <div className={styles.formRow}>
              <label className={styles.formLabel}>Priority</label>
              <div className={styles.prioritySelector}>
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    className={`${styles.priorityOption} ${p.cls} ${form.priority === p.value ? styles.priorityOptionSelected : ''}`}
                    onClick={() => setField('priority', p.value)}
                  >
                    <div className={styles.priorityDot} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Additional notes */}
          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>
              <IconPencil size={12} /> Additional Notes
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                id="create-notes"
                className={styles.formTextarea}
                placeholder="Special instructions or context for the driver…"
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.createPanelFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-checklist-form"
            className={styles.submitBtn}
            disabled={false}
          >
            <IconCheck size={14} />
            Assign Checklist
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={styles.successToast}>
      <IconCheck size={16} />
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChecklistsPage() {
  const dispatch = useDispatch();
  const {
    submitted, assigned, templates, activeSubTab, selectedSubmittedId,
    search, filterType, filterResult,
    filterDateFrom, filterDateTo,
  } = useSelector((s: any) => s.checklists);

  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState<string | null>(null);

  // Filtered submitted
  const filteredSubmitted = useMemo<SubmittedChecklist[]>(() => {
    let rows: SubmittedChecklist[] = submitted;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r: SubmittedChecklist) =>
        r.templateName.toLowerCase().includes(q) ||
        r.vehicleName.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all')   rows = rows.filter((r: SubmittedChecklist) => r.type === filterType);
    if (filterResult !== 'all') rows = rows.filter((r: SubmittedChecklist) => r.overallResult === filterResult);
    if (filterDateFrom)         rows = rows.filter((r: SubmittedChecklist) => r.submittedAt >= filterDateFrom);
    if (filterDateTo)           rows = rows.filter((r: SubmittedChecklist) => r.submittedAt <= filterDateTo + 'T23:59:59');
    return rows;
  }, [submitted, search, filterType, filterResult, filterDateFrom, filterDateTo]);

  // Filtered assigned
  const filteredAssigned = useMemo<AssignedChecklist[]>(() => {
    let rows: AssignedChecklist[] = assigned;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r: AssignedChecklist) =>
        r.templateName.toLowerCase().includes(q) ||
        r.vehicleName.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [assigned, search]);

  const selectedChecklist = useMemo<SubmittedChecklist | null>(
    () => submitted.find((s: SubmittedChecklist) => s.id === selectedSubmittedId) ?? null,
    [submitted, selectedSubmittedId]
  );

  const overdueCount = assigned.filter((a: AssignedChecklist) => a.status === 'overdue').length;
  const hasActiveFilters = search || filterType !== 'all' || filterResult !== 'all' || filterDateFrom || filterDateTo;

  function handleCreate(form: CreateFormState) {
    const vehicle = VEHICLES.find(v => v.id === form.vehicleId)!;
    const driver  = DRIVERS.find(d => d.id === form.driverId)!;
    let dueDate: string | null = null;
    if (form.dueDate) {
      dueDate = `${form.dueDate}T${form.dueTime || '08:00'}:00.000Z`;
    }
    dispatch(createAssignment({
      templateId: form.templateId,
      vehicleId:  vehicle.id,
      vehicleName: vehicle.name,
      driverId:   driver.id,
      driverName: driver.name,
      dueDate,
      priority: form.priority,
    }));
    setShowCreate(false);
    dispatch(setActiveSubTab('assigned'));
    setToast(`Checklist assigned to ${driver.name} successfully!`);
  }

  function handleDelete(id: string) {
    dispatch(deleteAssignment(id));
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <div className={styles.pageIcon}>
            <IconClipboardCheck size={18} />
          </div>
          <div>
            <div className={styles.pageTitle}>Checklists</div>
            <div className={styles.pageSubtitle}>Vehicle inspection management & compliance tracking</div>
          </div>
        </div>
        {/* New Checklist button */}
        <button
          id="btn-new-checklist"
          className={styles.newBtn}
          onClick={() => setShowCreate(true)}
        >
          <IconPlus size={15} />
          New Checklist
        </button>
      </div>

      {/* Stats strip */}
      <StatsStrip submitted={submitted} assigned={assigned} />

      {/* Sub-tabs */}
      <div className={styles.subTabs}>
        <button
          id="checklist-tab-submitted"
          className={`${styles.subTab} ${activeSubTab === 'submitted' ? styles.subTabActive : ''}`}
          onClick={() => dispatch(setActiveSubTab('submitted'))}
        >
          <IconClipboardList size={14} />
          Submitted Checklists
          <span className={styles.subTabBadge}>{submitted.length}</span>
        </button>
        <button
          id="checklist-tab-assigned"
          className={`${styles.subTab} ${activeSubTab === 'assigned' ? styles.subTabActive : ''}`}
          onClick={() => dispatch(setActiveSubTab('assigned'))}
        >
          <IconClipboardCheck size={14} />
          Assigned Checklists
          <span className={`${styles.subTabBadge} ${overdueCount > 0 ? styles.subTabBadgeRed : ''}`}>
            {assigned.length}
          </span>
          {overdueCount > 0 && (
            <span className={`${styles.subTabBadge} ${styles.subTabBadgeRed}`}>{overdueCount} overdue</span>
          )}
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <IconSearch size={13} className={styles.searchIcon} />
          <input
            id="checklist-search"
            type="text"
            className={styles.searchInput}
            placeholder="Search checklists, vehicles, drivers…"
            value={search}
            onChange={e => dispatch(setSearch(e.target.value))}
          />
        </div>

        {activeSubTab === 'submitted' && (
          <>
            <select
              id="checklist-filter-type"
              className={styles.filterSelect}
              value={filterType}
              onChange={e => dispatch(setFilterType(e.target.value as any))}
            >
              <option value="all">All Types</option>
              <option value="pre-trip">Pre-Trip</option>
              <option value="post-trip">Post-Trip</option>
              <option value="mid-trip">Mid-Trip</option>
              <option value="custom">Custom</option>
            </select>

            <select
              id="checklist-filter-result"
              className={styles.filterSelect}
              value={filterResult}
              onChange={e => dispatch(setFilterResult(e.target.value as any))}
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>

            <span className={styles.filterLabel}>From:</span>
            <input
              id="checklist-filter-date-from"
              type="date"
              className={styles.dateInput}
              value={filterDateFrom}
              onChange={e => dispatch(setFilterDateFrom(e.target.value))}
            />
            <span className={styles.filterLabel}>To:</span>
            <input
              id="checklist-filter-date-to"
              type="date"
              className={styles.dateInput}
              value={filterDateTo}
              onChange={e => dispatch(setFilterDateTo(e.target.value))}
            />
          </>
        )}

        {hasActiveFilters && (
          <button id="checklist-clear-filters" className={styles.clearBtn} onClick={() => dispatch(clearFilters())}>
            <IconX size={12} /> Clear
          </button>
        )}
      </div>

      {/* Count row */}
      <div className={styles.countRow}>
        {activeSubTab === 'submitted'
          ? `${filteredSubmitted.length} of ${submitted.length} submissions`
          : `${filteredAssigned.length} of ${assigned.length} assignments`
        }
      </div>

      {/* Body */}
      <div className={styles.body}>
        {activeSubTab === 'submitted' ? (
          <>
            <SubmittedTable
              rows={filteredSubmitted}
              selectedId={selectedSubmittedId}
              onSelect={id => dispatch(selectSubmitted(selectedSubmittedId === id ? null : id))}
            />
            {selectedChecklist && (
              <DetailPanel
                checklist={selectedChecklist}
                onClose={() => dispatch(selectSubmitted(null))}
              />
            )}
          </>
        ) : (
          <AssignedTable
            rows={filteredAssigned}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Create Panel Modal */}
      {showCreate && (
        <CreateChecklistPanel
          templates={templates}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Success toast */}
      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
