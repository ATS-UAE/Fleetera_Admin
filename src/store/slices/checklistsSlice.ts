import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChecklistType = 'pre-trip' | 'post-trip' | 'mid-trip' | 'custom';
export type AnswerType = 'yes_no' | 'number' | 'text' | 'photo' | 'signature';
export type ItemResult = 'pass' | 'fail' | 'skipped';
export type OverallResult = 'passed' | 'failed' | 'partial';
export type AssignedStatus = 'pending' | 'overdue';
export type AssignedPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ChecklistItemDef {
  id: string;
  question: string;
  answerType: AnswerType;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistType;
  items: ChecklistItemDef[];
}

export interface SubmittedItemResult {
  itemId: string;
  question: string;
  answerType: AnswerType;
  answer: string | null;
  result: ItemResult;
  comment?: string;
  hasPhoto?: boolean;
}

export interface SubmittedChecklist {
  id: string;
  templateId: string;
  templateName: string;
  type: ChecklistType;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  submittedAt: string;         // ISO
  totalItems: number;
  passedItems: number;
  failedItems: number;
  skippedItems: number;
  overallResult: OverallResult;
  items: SubmittedItemResult[];
  hasSig: boolean;
  notes?: string;
}

export interface AssignedChecklist {
  id: string;
  templateId: string;
  templateName: string;
  type: ChecklistType;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  assignedAt: string;
  dueDate: string | null;
  priority: AssignedPriority;
  status: AssignedStatus;
}

export interface ChecklistsState {
  submitted: SubmittedChecklist[];
  assigned: AssignedChecklist[];
  templates: ChecklistTemplate[];
  activeSubTab: 'submitted' | 'assigned';
  selectedSubmittedId: string | null;
  search: string;
  filterType: ChecklistType | 'all';
  filterResult: OverallResult | 'all';
  filterVehicle: string;
  filterDateFrom: string;
  filterDateTo: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Pre-Trip Inspection',
    type: 'pre-trip',
    items: [
      { id: 'i-01', question: 'Are all exterior lights functional (headlights, brake lights, indicators)?', answerType: 'yes_no', required: true },
      { id: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', required: true },
      { id: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', required: true },
      { id: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', required: true },
      { id: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', required: true },
      { id: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', required: true },
      { id: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', required: true },
      { id: 'i-08', question: 'Any visible exterior damage? (attach photo)', answerType: 'photo', required: false },
      { id: 'i-09', question: 'Additional notes from driver', answerType: 'text', required: false },
      { id: 'i-10', question: 'Driver signature', answerType: 'signature', required: true },
    ],
  },
  {
    id: 'tpl-002',
    name: 'Post-Trip Inspection',
    type: 'post-trip',
    items: [
      { id: 'j-01', question: 'Was the vehicle involved in any incident during the trip?', answerType: 'yes_no', required: true },
      { id: 'j-02', question: 'Are all exterior lights still functional?', answerType: 'yes_no', required: true },
      { id: 'j-03', question: 'Is the vehicle interior clean?', answerType: 'yes_no', required: true },
      { id: 'j-04', question: 'Fuel level at end of trip (%)', answerType: 'number', required: true },
      { id: 'j-05', question: 'Final odometer reading (km)', answerType: 'number', required: true },
      { id: 'j-06', question: 'Any new damage found? (attach photo)', answerType: 'photo', required: false },
      { id: 'j-07', question: 'Were all cargo items delivered correctly?', answerType: 'yes_no', required: true },
      { id: 'j-08', question: 'Driver post-trip notes', answerType: 'text', required: false },
    ],
  },
  {
    id: 'tpl-003',
    name: 'Fluid Levels Check',
    type: 'custom',
    items: [
      { id: 'k-01', question: 'Is engine oil level within the normal range?', answerType: 'yes_no', required: true },
      { id: 'k-02', question: 'Is coolant level adequate?', answerType: 'yes_no', required: true },
      { id: 'k-03', question: 'Is brake fluid level adequate?', answerType: 'yes_no', required: true },
      { id: 'k-04', question: 'Is windshield washer fluid adequate?', answerType: 'yes_no', required: true },
      { id: 'k-05', question: 'Photo of engine bay', answerType: 'photo', required: false },
    ],
  },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SUBMITTED: SubmittedChecklist[] = [
  {
    id: 'sub-001',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v1',
    vehicleName: 'TN-01-AB-1234 (Volvo FH)',
    driverId: 'd1',
    driverName: 'Arjun Sharma',
    submittedAt: '2026-08-06T06:45:00.000Z',
    totalItems: 10,
    passedItems: 9,
    failedItems: 1,
    skippedItems: 0,
    overallResult: 'partial',
    hasSig: true,
    notes: 'Minor scratch on rear bumper noted.',
    items: [
      { itemId: 'i-01', question: 'Are all exterior lights functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Slight spongy feel in rear brakes, needs inspection.' },
      { itemId: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', answer: '84,320', result: 'pass' },
      { itemId: 'i-08', question: 'Any visible exterior damage?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: true },
      { itemId: 'i-09', question: 'Additional notes from driver', answerType: 'text', answer: 'Minor scratch on rear bumper.', result: 'pass' },
      { itemId: 'i-10', question: 'Driver signature', answerType: 'signature', answer: 'signed', result: 'pass' },
    ],
  },
  {
    id: 'sub-002',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v2',
    vehicleName: 'MH-12-CD-5678 (Tata Prima)',
    driverId: 'd2',
    driverName: 'Ravi Kumar',
    submittedAt: '2026-08-06T05:30:00.000Z',
    totalItems: 10,
    passedItems: 10,
    failedItems: 0,
    skippedItems: 0,
    overallResult: 'passed',
    hasSig: true,
    items: [
      { itemId: 'i-01', question: 'Are all exterior lights functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', answer: '62,150', result: 'pass' },
      { itemId: 'i-08', question: 'Any visible exterior damage?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: false },
      { itemId: 'i-09', question: 'Additional notes from driver', answerType: 'text', answer: 'All good.', result: 'pass' },
      { itemId: 'i-10', question: 'Driver signature', answerType: 'signature', answer: 'signed', result: 'pass' },
    ],
  },
  {
    id: 'sub-003',
    templateId: 'tpl-002',
    templateName: 'Post-Trip Inspection',
    type: 'post-trip',
    vehicleId: 'v3',
    vehicleName: 'KA-05-EF-9012 (Ashok Leyland)',
    driverId: 'd3',
    driverName: 'Suresh Reddy',
    submittedAt: '2026-08-05T18:20:00.000Z',
    totalItems: 8,
    passedItems: 5,
    failedItems: 3,
    skippedItems: 0,
    overallResult: 'failed',
    hasSig: false,
    notes: 'Vehicle involved in minor collision at delivery point.',
    items: [
      { itemId: 'j-01', question: 'Was the vehicle involved in any incident during the trip?', answerType: 'yes_no', answer: 'Yes', result: 'fail', comment: 'Minor rear-end collision at depot gate. Bumper cracked.' },
      { itemId: 'j-02', question: 'Are all exterior lights still functional?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Left tail light broken in collision.' },
      { itemId: 'j-03', question: 'Is the vehicle interior clean?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-04', question: 'Fuel level at end of trip (%)', answerType: 'number', answer: '28', result: 'pass' },
      { itemId: 'j-05', question: 'Final odometer reading (km)', answerType: 'number', answer: '1,12,440', result: 'pass' },
      { itemId: 'j-06', question: 'Any new damage found?', answerType: 'photo', answer: null, result: 'fail', hasPhoto: true, comment: 'Photo of cracked bumper and broken tail light attached.' },
      { itemId: 'j-07', question: 'Were all cargo items delivered correctly?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-08', question: 'Driver post-trip notes', answerType: 'text', answer: 'Reported incident to supervisor immediately.', result: 'pass' },
    ],
  },
  {
    id: 'sub-004',
    templateId: 'tpl-003',
    templateName: 'Fluid Levels Check',
    type: 'custom',
    vehicleId: 'v4',
    vehicleName: 'DL-01-GH-3456 (BharatBenz)',
    driverId: 'd4',
    driverName: 'Mohan Pillai',
    submittedAt: '2026-08-05T09:10:00.000Z',
    totalItems: 5,
    passedItems: 4,
    failedItems: 1,
    skippedItems: 0,
    overallResult: 'partial',
    hasSig: false,
    items: [
      { itemId: 'k-01', question: 'Is engine oil level within the normal range?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'k-02', question: 'Is coolant level adequate?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Coolant slightly below minimum. Topped up.' },
      { itemId: 'k-03', question: 'Is brake fluid level adequate?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'k-04', question: 'Is windshield washer fluid adequate?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'k-05', question: 'Photo of engine bay', answerType: 'photo', answer: null, result: 'pass', hasPhoto: true },
    ],
  },
  {
    id: 'sub-005',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v5',
    vehicleName: 'GJ-06-IJ-7890 (Mahindra Furio)',
    driverId: 'd5',
    driverName: 'Deepak Singh',
    submittedAt: '2026-08-04T07:00:00.000Z',
    totalItems: 10,
    passedItems: 10,
    failedItems: 0,
    skippedItems: 0,
    overallResult: 'passed',
    hasSig: true,
    items: [
      { itemId: 'i-01', question: 'Are all exterior lights functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', answer: '44,880', result: 'pass' },
      { itemId: 'i-08', question: 'Any visible exterior damage?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: false },
      { itemId: 'i-09', question: 'Additional notes from driver', answerType: 'text', answer: 'Tyres look slightly worn — recommend check next service.', result: 'pass' },
      { itemId: 'i-10', question: 'Driver signature', answerType: 'signature', answer: 'signed', result: 'pass' },
    ],
  },
  {
    id: 'sub-006',
    templateId: 'tpl-002',
    templateName: 'Post-Trip Inspection',
    type: 'post-trip',
    vehicleId: 'v1',
    vehicleName: 'TN-01-AB-1234 (Volvo FH)',
    driverId: 'd1',
    driverName: 'Arjun Sharma',
    submittedAt: '2026-08-03T19:55:00.000Z',
    totalItems: 8,
    passedItems: 8,
    failedItems: 0,
    skippedItems: 0,
    overallResult: 'passed',
    hasSig: true,
    items: [
      { itemId: 'j-01', question: 'Was the vehicle involved in any incident during the trip?', answerType: 'yes_no', answer: 'No', result: 'pass' },
      { itemId: 'j-02', question: 'Are all exterior lights still functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-03', question: 'Is the vehicle interior clean?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-04', question: 'Fuel level at end of trip (%)', answerType: 'number', answer: '45', result: 'pass' },
      { itemId: 'j-05', question: 'Final odometer reading (km)', answerType: 'number', answer: '84,150', result: 'pass' },
      { itemId: 'j-06', question: 'Any new damage found?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: false },
      { itemId: 'j-07', question: 'Were all cargo items delivered correctly?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-08', question: 'Driver post-trip notes', answerType: 'text', answer: 'Smooth delivery. No issues.', result: 'pass' },
    ],
  },
  {
    id: 'sub-007',
    templateId: 'tpl-003',
    templateName: 'Fluid Levels Check',
    type: 'custom',
    vehicleId: 'v2',
    vehicleName: 'MH-12-CD-5678 (Tata Prima)',
    driverId: 'd2',
    driverName: 'Ravi Kumar',
    submittedAt: '2026-08-02T08:30:00.000Z',
    totalItems: 5,
    passedItems: 3,
    failedItems: 2,
    skippedItems: 0,
    overallResult: 'failed',
    hasSig: false,
    items: [
      { itemId: 'k-01', question: 'Is engine oil level within the normal range?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Oil level critically low. Topped up with 2L synthetic oil.' },
      { itemId: 'k-02', question: 'Is coolant level adequate?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Coolant reservoir empty. Refilled and leak suspected.' },
      { itemId: 'k-03', question: 'Is brake fluid level adequate?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'k-04', question: 'Is windshield washer fluid adequate?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'k-05', question: 'Photo of engine bay', answerType: 'photo', answer: null, result: 'pass', hasPhoto: true },
    ],
  },
  {
    id: 'sub-008',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v3',
    vehicleName: 'KA-05-EF-9012 (Ashok Leyland)',
    driverId: 'd3',
    driverName: 'Suresh Reddy',
    submittedAt: '2026-08-01T06:15:00.000Z',
    totalItems: 10,
    passedItems: 8,
    failedItems: 1,
    skippedItems: 1,
    overallResult: 'partial',
    hasSig: true,
    items: [
      { itemId: 'i-01', question: 'Are all exterior lights functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Small crack on passenger side, low severity.' },
      { itemId: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', answer: '1,12,000', result: 'pass' },
      { itemId: 'i-08', question: 'Any visible exterior damage?', answerType: 'photo', answer: null, result: 'skipped' },
      { itemId: 'i-09', question: 'Additional notes from driver', answerType: 'text', answer: 'Minor crack reported to workshop.', result: 'pass' },
      { itemId: 'i-10', question: 'Driver signature', answerType: 'signature', answer: 'signed', result: 'pass' },
    ],
  },
  {
    id: 'sub-009',
    templateId: 'tpl-002',
    templateName: 'Post-Trip Inspection',
    type: 'post-trip',
    vehicleId: 'v4',
    vehicleName: 'DL-01-GH-3456 (BharatBenz)',
    driverId: 'd4',
    driverName: 'Mohan Pillai',
    submittedAt: '2026-07-31T20:00:00.000Z',
    totalItems: 8,
    passedItems: 8,
    failedItems: 0,
    skippedItems: 0,
    overallResult: 'passed',
    hasSig: true,
    items: [
      { itemId: 'j-01', question: 'Was the vehicle involved in any incident during the trip?', answerType: 'yes_no', answer: 'No', result: 'pass' },
      { itemId: 'j-02', question: 'Are all exterior lights still functional?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-03', question: 'Is the vehicle interior clean?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-04', question: 'Fuel level at end of trip (%)', answerType: 'number', answer: '60', result: 'pass' },
      { itemId: 'j-05', question: 'Final odometer reading (km)', answerType: 'number', answer: '77,910', result: 'pass' },
      { itemId: 'j-06', question: 'Any new damage found?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: false },
      { itemId: 'j-07', question: 'Were all cargo items delivered correctly?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'j-08', question: 'Driver post-trip notes', answerType: 'text', answer: 'Excellent trip, on-time delivery.', result: 'pass' },
    ],
  },
  {
    id: 'sub-010',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v5',
    vehicleName: 'GJ-06-IJ-7890 (Mahindra Furio)',
    driverId: 'd5',
    driverName: 'Deepak Singh',
    submittedAt: '2026-07-30T05:55:00.000Z',
    totalItems: 10,
    passedItems: 7,
    failedItems: 3,
    skippedItems: 0,
    overallResult: 'failed',
    hasSig: true,
    notes: 'Multiple issues — vehicle grounded for repairs.',
    items: [
      { itemId: 'i-01', question: 'Are all exterior lights functional?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Headlight (right) not working.' },
      { itemId: 'i-02', question: 'Are tyre pressures within acceptable range?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Front left tyre flat — puncture detected.' },
      { itemId: 'i-03', question: 'Are all mirrors clean and properly adjusted?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-04', question: 'Is the fuel level sufficient for the route?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-05', question: 'Are brakes responding normally?', answerType: 'yes_no', answer: 'No', result: 'fail', comment: 'Brakes grinding — requires immediate service.' },
      { itemId: 'i-06', question: 'Is the windshield free of cracks or obstructions?', answerType: 'yes_no', answer: 'Yes', result: 'pass' },
      { itemId: 'i-07', question: 'Current odometer reading (km)', answerType: 'number', answer: '44,770', result: 'pass' },
      { itemId: 'i-08', question: 'Any visible exterior damage?', answerType: 'photo', answer: null, result: 'pass', hasPhoto: true },
      { itemId: 'i-09', question: 'Additional notes from driver', answerType: 'text', answer: 'Vehicle grounded. Supervisor notified.', result: 'pass' },
      { itemId: 'i-10', question: 'Driver signature', answerType: 'signature', answer: 'signed', result: 'pass' },
    ],
  },
];

// ─── Assigned Seed Data ───────────────────────────────────────────────────────

const ASSIGNED: AssignedChecklist[] = [
  {
    id: 'asgn-001',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v1',
    vehicleName: 'TN-01-AB-1234 (Volvo FH)',
    driverId: 'd1',
    driverName: 'Arjun Sharma',
    assignedAt: '2026-08-06T04:00:00.000Z',
    dueDate: '2026-08-06T08:00:00.000Z',
    priority: 'high',
    status: 'overdue',
  },
  {
    id: 'asgn-002',
    templateId: 'tpl-002',
    templateName: 'Post-Trip Inspection',
    type: 'post-trip',
    vehicleId: 'v2',
    vehicleName: 'MH-12-CD-5678 (Tata Prima)',
    driverId: 'd2',
    driverName: 'Ravi Kumar',
    assignedAt: '2026-08-06T10:00:00.000Z',
    dueDate: '2026-08-06T20:00:00.000Z',
    priority: 'normal',
    status: 'pending',
  },
  {
    id: 'asgn-003',
    templateId: 'tpl-003',
    templateName: 'Fluid Levels Check',
    type: 'custom',
    vehicleId: 'v4',
    vehicleName: 'DL-01-GH-3456 (BharatBenz)',
    driverId: 'd4',
    driverName: 'Mohan Pillai',
    assignedAt: '2026-08-06T07:30:00.000Z',
    dueDate: '2026-08-06T12:00:00.000Z',
    priority: 'urgent',
    status: 'overdue',
  },
  {
    id: 'asgn-004',
    templateId: 'tpl-001',
    templateName: 'Pre-Trip Inspection',
    type: 'pre-trip',
    vehicleId: 'v5',
    vehicleName: 'GJ-06-IJ-7890 (Mahindra Furio)',
    driverId: 'd5',
    driverName: 'Deepak Singh',
    assignedAt: '2026-08-06T05:00:00.000Z',
    dueDate: '2026-08-07T06:00:00.000Z',
    priority: 'low',
    status: 'pending',
  },
  {
    id: 'asgn-005',
    templateId: 'tpl-002',
    templateName: 'Post-Trip Inspection',
    type: 'post-trip',
    vehicleId: 'v3',
    vehicleName: 'KA-05-EF-9012 (Ashok Leyland)',
    driverId: 'd3',
    driverName: 'Suresh Reddy',
    assignedAt: '2026-08-06T09:00:00.000Z',
    dueDate: '2026-08-06T22:00:00.000Z',
    priority: 'normal',
    status: 'pending',
  },
];

// ─── Slice ────────────────────────────────────────────────────────────────────

const checklistsSlice = createSlice({
  name: 'checklists',
  initialState: {
    submitted: SUBMITTED,
    assigned: ASSIGNED,
    templates: TEMPLATES,
    activeSubTab: 'submitted',
    selectedSubmittedId: null,
    search: '',
    filterType: 'all',
    filterResult: 'all',
    filterVehicle: '',
    filterDateFrom: '',
    filterDateTo: '',
  } as ChecklistsState,
  reducers: {
    setActiveSubTab(state, action: PayloadAction<'submitted' | 'assigned'>) {
      state.activeSubTab = action.payload;
      state.selectedSubmittedId = null;
    },
    selectSubmitted(state, action: PayloadAction<string | null>) {
      state.selectedSubmittedId = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilterType(state, action: PayloadAction<ChecklistType | 'all'>) {
      state.filterType = action.payload;
    },
    setFilterResult(state, action: PayloadAction<OverallResult | 'all'>) {
      state.filterResult = action.payload;
    },
    setFilterVehicle(state, action: PayloadAction<string>) {
      state.filterVehicle = action.payload;
    },
    setFilterDateFrom(state, action: PayloadAction<string>) {
      state.filterDateFrom = action.payload;
    },
    setFilterDateTo(state, action: PayloadAction<string>) {
      state.filterDateTo = action.payload;
    },
    clearFilters(state) {
      state.search = '';
      state.filterType = 'all';
      state.filterResult = 'all';
      state.filterVehicle = '';
      state.filterDateFrom = '';
      state.filterDateTo = '';
    },
    createAssignment(state, action: PayloadAction<{
      templateId: string;
      vehicleId: string;
      vehicleName: string;
      driverId: string;
      driverName: string;
      dueDate: string | null;
      priority: AssignedPriority;
    }>) {
      const tpl = state.templates.find(t => t.id === action.payload.templateId);
      if (!tpl) return;
      const now = new Date().toISOString();
      const id = `asgn-${Date.now()}`;
      const due = action.payload.dueDate;
      const overdue = due ? new Date(due) < new Date() : false;
      state.assigned.unshift({
        id,
        templateId: tpl.id,
        templateName: tpl.name,
        type: tpl.type,
        vehicleId: action.payload.vehicleId,
        vehicleName: action.payload.vehicleName,
        driverId: action.payload.driverId,
        driverName: action.payload.driverName,
        assignedAt: now,
        dueDate: due,
        priority: action.payload.priority,
        status: overdue ? 'overdue' : 'pending',
      });
    },
    deleteAssignment(state, action: PayloadAction<string>) {
      state.assigned = state.assigned.filter(a => a.id !== action.payload);
    },
  },
});

export const {
  setActiveSubTab,
  selectSubmitted,
  setSearch,
  setFilterType,
  setFilterResult,
  setFilterVehicle,
  setFilterDateFrom,
  setFilterDateTo,
  clearFilters,
  createAssignment,
  deleteAssignment,
} = checklistsSlice.actions;

export default checklistsSlice.reducer;
