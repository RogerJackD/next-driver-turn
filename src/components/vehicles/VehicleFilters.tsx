import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VehicleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function VehicleFilters({ searchQuery, onSearchChange }: VehicleFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
      <Input
        type="text"
        placeholder="Buscar por placa, marca, modelo..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white/90 border-orange-200 focus:border-orange-300 focus:ring-orange-300 placeholder:text-gray-400"
      />
    </div>
  );
}