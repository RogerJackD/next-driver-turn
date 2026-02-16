import { z } from 'zod';

export const reportFiltersSchema = z.object({
  reportType: z.enum(
    ['summary', 'records', 'by_stop', 'by_driver', 'by_exit_reason', 'hourly_distribution', 'daily_trend'],
    { message: 'Selecciona un tipo de reporte' },
  ),
  vehicleStopId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  exitReason: z.string().optional(),
  registerStatus: z.string().optional(),
  driverId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;
