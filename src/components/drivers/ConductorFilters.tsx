import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ConductorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ConductorFilters({ searchQuery, onSearchChange }: ConductorFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar por nombre, DNI o email..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-12 bg-white rounded-xl border-orange-200 focus:border-orange-400"
      />
    </div>
  );
}