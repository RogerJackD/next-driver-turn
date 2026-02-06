import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';

interface VehicleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching?: boolean;
}

export function VehicleFilters({ searchQuery, onSearchChange, isSearching = false }: VehicleFiltersProps) {
  const hasSearchQuery = searchQuery.trim() !== '';

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar por placa, marca, modelo..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 h-11 bg-white text-gray-900 border-orange-200 focus:border-orange-400 placeholder:text-gray-500 rounded-xl"
      />
      {hasSearchQuery && !isSearching && (
        <button
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
        </div>
      )}
    </div>
  );
}
