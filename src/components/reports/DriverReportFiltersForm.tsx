'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportFiltersSchema, type ReportFiltersFormData } from '@/validators/reportSchema';
import type { ReportFilters, VehicleStop } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

const REPORT_TYPE_OPTIONS = [
  { value: 'summary', label: 'Resumen General' },
  { value: 'records', label: 'Registros Detallados' },
  { value: 'by_stop', label: 'Por Paradero' },
  { value: 'by_exit_reason', label: 'Por Motivo de Salida' },
  { value: 'hourly_distribution', label: 'Distribución por Hora' },
];

const EXIT_REASON_OPTIONS = [
  { value: 'service_taken', label: 'Servicio tomado' },
  { value: 'service_express', label: 'Servicio expreso' },
  { value: 'change_stop', label: 'Cambio de paradero' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'shift_end', label: 'Fin de turno' },
];

const REGISTER_STATUS_OPTIONS = [
  { value: 'waiting', label: 'En espera' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface DriverReportFiltersFormProps {
  onSubmit: (filters: ReportFilters) => void;
  isLoading: boolean;
  driverId: number;
}

export function DriverReportFiltersForm({ onSubmit, isLoading, driverId }: DriverReportFiltersFormProps) {
  const [stops, setStops] = useState<VehicleStop[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportFiltersFormData>({
    resolver: zodResolver(reportFiltersSchema),
  });

  const reportType = watch('reportType');

  useEffect(() => {
    vehicleStopsService.getAll().then(setStops).catch(() => {});
  }, []);

  const processSubmit = (data: ReportFiltersFormData) => {
    const filters: ReportFilters = {
      reportType: data.reportType,
      driverId,
      ...(data.vehicleStopId ? { vehicleStopId: Number(data.vehicleStopId) } : {}),
      ...(data.dateFrom ? { dateFrom: data.dateFrom } : {}),
      ...(data.dateTo ? { dateTo: data.dateTo } : {}),
      ...(data.exitReason ? { exitReason: data.exitReason as ReportFilters['exitReason'] } : {}),
      ...(data.registerStatus ? { registerStatus: data.registerStatus as ReportFilters['registerStatus'] } : {}),
      ...(data.page ? { page: Number(data.page) } : {}),
      ...(data.limit ? { limit: Number(data.limit) } : {}),
    };
    onSubmit(filters);
  };

  const selectClass =
    'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500';
  const inputClass =
    'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500';
  const labelClass = 'text-sm font-medium text-gray-700 mb-1 block';

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      {/* Report Type */}
      <div>
        <label className={labelClass}>Tipo de Reporte *</label>
        <select {...register('reportType')} className={selectClass}>
          <option value="">Seleccionar...</option>
          {REPORT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.reportType && (
          <p className="text-sm text-red-600 mt-1">{errors.reportType.message}</p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Desde</label>
          <input type="datetime-local" {...register('dateFrom')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hasta</label>
          <input type="datetime-local" {...register('dateTo')} className={inputClass} />
        </div>
      </div>

      {/* Vehicle Stop */}
      <div>
        <label className={labelClass}>Paradero</label>
        <select {...register('vehicleStopId')} className={selectClass}>
          <option value="">Todos</option>
          {stops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Exit Reason */}
      <div>
        <label className={labelClass}>Motivo de Salida</label>
        <select {...register('exitReason')} className={selectClass}>
          <option value="">Todos</option>
          {EXIT_REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Register Status */}
      <div>
        <label className={labelClass}>Estado del Registro</label>
        <select {...register('registerStatus')} className={selectClass}>
          <option value="">Todos</option>
          {REGISTER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination (only for records) */}
      {reportType === 'records' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Página</label>
            <input
              type="number"
              min={1}
              defaultValue={1}
              {...register('page')}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Límite</label>
            <input
              type="number"
              min={1}
              max={100}
              defaultValue={20}
              {...register('limit')}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Generando...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Generar Reporte
          </>
        )}
      </Button>
    </form>
  );
}
