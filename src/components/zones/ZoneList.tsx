'use client';

import { VehicleStop } from '@/types';
import { ZoneCard } from './ZoneCard';
import { MapPin } from 'lucide-react';

interface ZoneListProps {
  zones: VehicleStop[];
  onEdit: (zone: VehicleStop) => void;
  onDelete: (zone: VehicleStop) => void;
  onActivate: (zone: VehicleStop) => void;
  onDeactivate: (zone: VehicleStop) => void;
}

export function ZoneList({ zones, onEdit, onDelete, onActivate, onDeactivate }: ZoneListProps) {
  if (zones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No se encontraron zonas</p>
        <p className="text-sm mt-2">
          Intenta cambiar la búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {zones.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
        />
      ))}
    </div>
  );
}
