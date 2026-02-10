'use client';

import type { HourlyDistributionEntry } from '@/types';
import { Card } from '@/components/ui/card';

interface HourlyDistributionResultProps {
  data: HourlyDistributionEntry[];
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function HourlyDistributionResult({ data }: HourlyDistributionResultProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No se encontraron datos</p>
    );
  }

  const maxCount = Math.max(...data.map((entry) => entry.count), 1);

  return (
    <Card className="p-4">
      <div className="space-y-2">
        {data.map((entry) => {
          const widthPercent = (entry.count / maxCount) * 100;

          return (
            <div key={entry.hour} className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-600 w-14 shrink-0 text-right">
                {formatHour(entry.hour)}
              </span>

              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(widthPercent, 2)}%` }}
                >
                  {widthPercent > 15 && (
                    <span className="text-xs font-bold text-white">
                      {entry.count}
                    </span>
                  )}
                </div>
              </div>

              {widthPercent <= 15 && (
                <span className="text-sm font-bold text-gray-700 w-10 shrink-0">
                  {entry.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
