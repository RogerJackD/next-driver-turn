import { User } from '@/types';
import { ConductorCard } from './DriverCard';

interface ConductorListProps {
  conductores: User[];
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function ConductorList({ conductores, onToggleStatus, onRefresh }: ConductorListProps) {
  if (conductores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay conductores registrados</p>
        <p className="text-sm mt-2">Agrega tu primer conductor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conductores.map((conductor) => (
        <ConductorCard
          key={conductor.id}
          conductor={conductor}
          onToggleStatus={onToggleStatus}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}