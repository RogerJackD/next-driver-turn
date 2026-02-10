'use client';

import type { SummaryReport } from '@/types';
import { Card } from '@/components/ui/card';
import { ClipboardList, CheckCircle, XCircle, Clock, Zap, Users } from 'lucide-react';

interface SummaryResultProps {
  data: SummaryReport;
}

const summaryItems = [
  {
    key: 'totalRecords' as const,
    label: 'Total de Registros',
    icon: ClipboardList,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
  },
  {
    key: 'completed' as const,
    label: 'Completados',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-l-green-500',
  },
  {
    key: 'cancelled' as const,
    label: 'Cancelados',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
  },
  {
    key: 'waiting' as const,
    label: 'En Espera',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-l-yellow-500',
  },
  {
    key: 'avgWaitTimeMinutes' as const,
    label: 'Tiempo Promedio (min)',
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-l-purple-500',
  },
  {
    key: 'expressServices' as const,
    label: 'Servicios Express',
    icon: Users,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-l-orange-500',
  },
];

export function SummaryResult({ data }: SummaryResultProps) {
  if (!data) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        const rawValue = data[item.key];
        const value = rawValue ?? 0;

        return (
          <Card
            key={item.key}
            className={`p-4 border-l-4 ${item.border} ${item.bg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {typeof value === 'number'
                    ? item.key === 'avgWaitTimeMinutes'
                      ? value.toFixed(1)
                      : value.toLocaleString()
                    : value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
