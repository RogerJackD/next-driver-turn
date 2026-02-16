'use client';

import type {
  ReportType,
  SummaryReport,
  RecordsReport,
  ByStopEntry,
  ByDriverEntry,
  ByExitReasonEntry,
  HourlyDistributionEntry,
  DailyTrendEntry,
} from '@/types';

import { SummaryResult } from '@/components/reports/results/SummaryResult';
import { RecordsResult } from '@/components/reports/results/RecordsResult';
import { ByStopResult } from '@/components/reports/results/ByStopResult';
import { ByDriverResult } from '@/components/reports/results/ByDriverResult';
import { ByExitReasonResult } from '@/components/reports/results/ByExitReasonResult';
import { HourlyDistributionResult } from '@/components/reports/results/HourlyDistributionResult';
import { DailyTrendResult } from '@/components/reports/results/DailyTrendResult';

interface ReportResultRendererProps {
  reportType: ReportType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onPageChange?: (page: number) => void;
}

export function ReportResultRenderer({
  reportType,
  data,
  onPageChange,
}: ReportResultRendererProps) {
  switch (reportType) {
    case 'summary':
      return <SummaryResult data={data as SummaryReport} />;

    case 'records':
      return (
        <RecordsResult
          data={data as RecordsReport}
          onPageChange={onPageChange ?? (() => {})}
        />
      );

    case 'by_stop':
      return <ByStopResult data={data as ByStopEntry[]} />;

    case 'by_driver':
      return <ByDriverResult data={data as ByDriverEntry[]} />;

    case 'by_exit_reason':
      return <ByExitReasonResult data={data as ByExitReasonEntry[]} />;

    case 'hourly_distribution':
      return (
        <HourlyDistributionResult data={data as HourlyDistributionEntry[]} />
      );

    case 'daily_trend':
      return <DailyTrendResult data={data as DailyTrendEntry[]} />;

    default:
      return (
        <p className="text-center text-gray-500 py-8">
          Tipo de reporte no soportado
        </p>
      );
  }
}
