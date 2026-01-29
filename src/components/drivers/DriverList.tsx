import { User } from '@/types';
import { DriverCard } from './DriverCard';

interface DriverListProps {
  drivers: User[];
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function DriverList({ drivers, onToggleStatus, onRefresh }: DriverListProps) {
  if (drivers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No se encontraron resultados</p>
        <p className="text-sm mt-2">Intenta cambiar los filtros de búsqueda o agrega nuevos conductores</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          onToggleStatus={onToggleStatus}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}