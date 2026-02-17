import { Driver } from '@/types';
import { DriverCard } from './DriverCard';

interface DriverListProps {
  drivers: Driver[];
  onEditDriver: (driver: Driver) => void;
  onToggleStatus?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}

export function DriverList({ drivers, onEditDriver, onToggleStatus, onDelete }: DriverListProps) {
  if (drivers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No se encontraron conductores</p>
        <p className="text-sm mt-2">Intenta cambiar los términos de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          onEdit={onEditDriver}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
