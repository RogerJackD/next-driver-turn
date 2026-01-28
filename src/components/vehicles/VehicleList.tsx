import { Vehicle } from '@/types';
import { VehicleCard } from './VehicleCard';
import { Car } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onAssignDriver: (vehicle: Vehicle) => void;
  onUnassignDriver: (vehicle: Vehicle) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
}

export function VehicleList({ 
  vehicles, 
  onEdit, 
  onAssignDriver,
  onUnassignDriver,
  onToggleStatus 
}: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Car className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No hay vehículos
        </h3>
        <p className="text-sm text-gray-500">
          Agrega tu primer vehículo para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onEdit={onEdit}
          onAssignDriver={onAssignDriver}
          onUnassignDriver={onUnassignDriver}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}