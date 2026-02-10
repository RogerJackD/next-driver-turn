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

export interface SummaryReport {
  totalRecords: number;
  completed: number;
  cancelled: number;
  waiting: number;
  avgWaitTimeMinutes: number;
  expressServices: number;
}

export interface RecordEntry {
  id: number;
  driverName: string;
  vehiclePlate: string;
  stopName: string;
  entryTime: string;
  exitTime: string | null;
  exitReason: ExitReason | null;
  waitTimeMinutes: number;
  registerStatus: string;
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
  totalEntries: number;
  completed: number;
  cancelled: number;
  avgWaitTimeMinutes: number;
}

export interface ByDriverEntry {
  driverId: number;
  driverName: string;
  totalServices: number;
  expressServices: number;
  avgWaitTimeMinutes: number;
}

export interface ByExitReasonEntry {
  reason: string;
  count: number;
  percentage: number;
}

export interface HourlyDistributionEntry {
  hour: number;
  count: number;
}

export interface DailyTrendEntry {
  date: string;
  count: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReportResponse = any;
