'use client';

import type { ByDriverEntry } from '@/types';
import { Card } from '@/components/ui/card';
import { User, Hash, Zap, Clock } from 'lucide-react';

interface ByDriverResultProps {
  data: ByDriverEntry[];
}

export function ByDriverResult({ data }: ByDriverResultProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry) => (
        <Card key={entry.driverId} className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 text-lg">
              {entry.driverName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500">Total Servicios</p>
                <p className="font-bold text-gray-900">{entry.totalServices ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-gray-500">Express</p>
                <p className="font-bold text-yellow-600">{entry.expressServices ?? 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-gray-500">Espera Prom.</p>
                <p className="font-bold text-purple-600">
                  {(entry.avgWaitTimeMinutes ?? 0).toFixed(1)} min
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
