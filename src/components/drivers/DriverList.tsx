import { Driver } from '@/types';
import { DriverCard } from './DriverCard';

interface DriverListProps {
  drivers: Driver[];
}

export function DriverList({ drivers }: DriverListProps) {
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
        <DriverCard key={driver.id} driver={driver} />
      ))}
    </div>
  );
}
