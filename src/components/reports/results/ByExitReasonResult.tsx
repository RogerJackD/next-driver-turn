'use client';

import type { ByExitReasonEntry } from '@/types';
import { Card } from '@/components/ui/card';

interface ByExitReasonResultProps {
  data: ByExitReasonEntry[];
}

const REASON_LABELS: Record<string, string> = {
  service_taken: 'Servicio tomado',
  service_express: 'Servicio expreso',
  change_stop: 'Cambio de paradero',
  emergency: 'Emergencia',
  shift_end: 'Fin de turno',
};

const REASON_COLORS: Record<string, string> = {
  service_taken: 'bg-green-500',
  service_express: 'bg-blue-500',
  change_stop: 'bg-yellow-500',
  emergency: 'bg-red-500',
  shift_end: 'bg-purple-500',
};

export function ByExitReasonResult({ data }: ByExitReasonResultProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const label = REASON_LABELS[entry.reason] ?? entry.reason;
        const barColor = REASON_COLORS[entry.reason] ?? 'bg-gray-500';

        return (
          <Card key={entry.reason} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{label}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-gray-800">{entry.count ?? 0}</span>
                <span className="text-gray-500">
                  ({(entry.percentage ?? 0).toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(entry.percentage ?? 0, 100)}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
