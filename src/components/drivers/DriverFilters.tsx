import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';

interface DriverFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  resultsCount: number;
}

export function DriverFilters({
  searchQuery,
  onSearchChange,
  isSearching,
  resultsCount,
}: DriverFiltersProps) {
  const hasSearchQuery = searchQuery.trim() !== '';

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, placa, marca..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-white text-gray-900 placeholder:text-gray-500 rounded-xl border-orange-200 focus:border-orange-400"
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm">
          {resultsCount} conductor{resultsCount !== 1 ? 'es' : ''}
        </span>
        {hasSearchQuery && (
          <span className="text-white/60 text-xs">
            Resultados para "{searchQuery}"
          </span>
        )}
      </div>
    </div>
  );
}
