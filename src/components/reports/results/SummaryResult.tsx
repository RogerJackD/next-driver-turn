'use client';

import type { SummaryReport } from '@/types';
import { Card } from '@/components/ui/card';
import { ClipboardList, CheckCircle, XCircle, Clock, Timer, ArrowDown, ArrowUp } from 'lucide-react';

interface SummaryResultProps {
  data: SummaryReport;
}

const EXIT_REASON_LABELS: Record<string, string> = {
  service_taken: 'Servicio tomado',
  service_express: 'Servicio expreso',
  change_stop: 'Cambio de paradero',
  emergency: 'Emergencia',
  shift_end: 'Fin de turno',
};

export function SummaryResult({ data }: SummaryResultProps) {
  if (!data) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  const waitTime = data.waitTime ?? {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Registros</p>
              <p className="text-2xl font-bold text-blue-600">
                {(data.totalRecords ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {(data.completed ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">
                {(data.cancelled ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Espera</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(data.waiting ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Wait Time Stats */}
      <Card className="p-4 border-l-4 border-l-purple-500">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Timer className="w-5 h-5 text-purple-600" />
          Tiempos de Espera (minutos)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Promedio</p>
            <p className="text-xl font-bold text-purple-600">
              {(waitTime.avgMinutes ?? 0).toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">
              {(waitTime.totalMinutes ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <ArrowDown className="w-3 h-3" /> Min
            </p>
            <p className="text-xl font-bold text-green-600">
              {(waitTime.minMinutes ?? 0).toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <ArrowUp className="w-3 h-3" /> Max
            </p>
            <p className="text-xl font-bold text-red-600">
              {(waitTime.maxMinutes ?? 0).toFixed(1)}
            </p>
          </div>
        </div>
      </Card>

      {/* Exit Reasons Breakdown */}
      {data.byExitReason && data.byExitReason.length > 0 && (
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <h3 className="font-semibold text-gray-900 mb-3">Motivos de Salida</h3>
          <div className="space-y-2">
            {data.byExitReason.map((item) => (
              <div key={item.exitReason} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {EXIT_REASON_LABELS[item.exitReason] ?? item.exitReason}
                </span>
                <span className="font-bold text-gray-900">{item.count ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
