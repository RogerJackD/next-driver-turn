import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, Plus } from 'lucide-react';

interface DriverFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  resultsCount: number;
  onCreateClick: () => void;
}

export function DriverFilters({
  searchQuery,
  onSearchChange,
  isSearching,
  resultsCount,
  onCreateClick,
}: DriverFiltersProps) {
  const hasSearchQuery = searchQuery.trim() !== '';

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-3">
      {/* Search bar with create button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
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
        <Button
          onClick={onCreateClick}
          className="h-11 px-4 bg-white text-orange-600 hover:bg-orange-50 rounded-xl shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
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
