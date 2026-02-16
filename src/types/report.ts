import type { ExitReason } from './queue';

// ==================== REPORT TYPES ====================

export type ReportType =
  | 'summary'
  | 'records'
  | 'by_stop'
  | 'by_driver'
  | 'by_exit_reason'
  | 'hourly_distribution'
  | 'daily_trend';

export type RegisterStatus = 'waiting' | 'completed' | 'cancelled';

// ==================== FILTER PARAMS ====================

export interface ReportFilters {
  reportType: ReportType;
  vehicleStopId?: number;
  dateFrom?: string;
  dateTo?: string;
  exitReason?: ExitReason;
  registerStatus?: RegisterStatus;
  driverId?: number;
  page?: number;
  limit?: number;
}

// ==================== RESPONSE SHAPES ====================

export interface SummaryWaitTime {
  avgMinutes: number;
  totalMinutes: number;
  minMinutes: number;
  maxMinutes: number;
}

export interface SummaryExitReasonEntry {
  exitReason: string;
  count: number;
}

export interface SummaryReport {
  totalRecords: number;
  completed: number;
  cancelled: number;
  waiting: number;
  waitTime: SummaryWaitTime;
  byExitReason: SummaryExitReasonEntry[];
}

export interface RecordStop {
  id: number;
  name: string;
  address: string;
}

export interface RecordDriver {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface RecordVehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  internalNumber: string;
}

export interface RecordEntry {
  id: number;
  assignedPosition: number;
  entryTime: string;
  exitTime: string | null;
  waitTimeMinutes: number;
  registerStatus: string;
  exitReason: ExitReason | null;
  observations: string | null;
  stop: RecordStop;
  driver: RecordDriver;
  vehicle: RecordVehicle;
}

export interface RecordsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecordsReport {
  data: RecordEntry[];
  meta: RecordsMeta;
}

export interface ByStopEntry {
  stopId: number;
  stopName: string;
  stopAddress: string;
  totalRecords: number;
  completed: number;
  cancelled: number;
  avgWaitMinutes: number;
}

export interface ByDriverEntry {
  driverId: number;
  firstName: string;
  lastName: string;
  phone: string;
  licensePlate: string;
  internalNumber: string;
  totalRecords: number;
  completed: number;
  cancelled: number;
  avgWaitMinutes: number;
}

export interface ByExitReasonEntry {
  exitReason: string;
  count: number;
  avgWaitMinutes: number;
}

export interface HourlyDistributionEntry {
  hour: number;
  totalEntries: number;
  completed: number;
  avgWaitMinutes: number;
}

export interface DailyTrendEntry {
  date: string;
  totalEntries: number;
  completed: number;
  cancelled: number;
  waiting: number;
  avgWaitMinutes: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReportResponse = any;
