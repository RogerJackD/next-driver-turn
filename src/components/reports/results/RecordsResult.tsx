'use client';

import type { RecordsReport } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecordsResultProps {
  data: RecordsReport;
  onPageChange: (page: number) => void;
}

const EXIT_REASON_LABELS: Record<string, string> = {
  service_taken: 'Servicio tomado',
  service_express: 'Servicio expreso',
  change_stop: 'Cambio de paradero',
  emergency: 'Emergencia',
  shift_end: 'Fin de turno',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  waiting: { label: 'En espera', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecordsResult({ data, onPageChange }: RecordsResultProps) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  const { data: records, meta } = data;

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const statusInfo = STATUS_LABELS[record.registerStatus] ?? {
          label: record.registerStatus,
          color: 'bg-gray-100 text-gray-700',
        };

        return (
          <Card key={record.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">
                    {record.driverName}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Placa:</span>{' '}
                    {record.vehiclePlate}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Paradero:</span>{' '}
                    {record.stopName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Entrada:</span>{' '}
                    {formatDateTime(record.entryTime)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Salida:</span>{' '}
                    {formatDateTime(record.exitTime)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Espera:</span>{' '}
                    {(record.waitTimeMinutes ?? 0).toFixed(1)} min
                  </div>
                  {record.exitReason && (
                    <div>
                      <span className="font-medium text-gray-700">Motivo:</span>{' '}
                      {EXIT_REASON_LABELS[record.exitReason] ?? record.exitReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <span className="text-sm text-gray-600">
          Pagina {meta.page} de {meta.totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
