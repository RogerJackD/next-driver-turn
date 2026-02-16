'use client';

import type { ByStopEntry } from '@/types';
import { Card } from '@/components/ui/card';
import { MapPin, CheckCircle, XCircle, Clock, Hash } from 'lucide-react';

interface ByStopResultProps {
  data: ByStopEntry[];
}

export function ByStopResult({ data }: ByStopResultProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry) => (
        <Card key={entry.stopId} className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 text-lg">
              {entry.stopName}
            </h3>
          </div>
          {entry.stopAddress && (
            <p className="text-sm text-gray-500 mb-3 ml-7">{entry.stopAddress}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-bold text-gray-900">{entry.totalRecords ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-gray-500">Completados</p>
                <p className="font-bold text-green-600">{entry.completed ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-gray-500">Cancelados</p>
                <p className="font-bold text-red-600">{entry.cancelled ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-gray-500">Espera Prom.</p>
                <p className="font-bold text-purple-600">
                  {(entry.avgWaitMinutes ?? 0).toFixed(1)} min
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
