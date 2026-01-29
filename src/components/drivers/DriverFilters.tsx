import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, X } from 'lucide-react';
import { UserStatus } from '@/types';

interface DriverFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatus | 'all';
  onStatusFilterChange: (status: UserStatus | 'all') => void;
  isSearching: boolean;
  resultsCount: number;
}

export function DriverFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
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
          placeholder="Buscar por nombre, DNI o email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-white text-gray-900 placeholder:text-gray-500 rounded-xl border-orange-200 focus:border-orange-400"
        />
        {hasSearchQuery && (
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

      {/* Status filters and results count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          <Badge
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-orange-700 hover:bg-white shadow-sm'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => onStatusFilterChange('all')}
          >
            Todos
          </Badge>
          <Badge
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => onStatusFilterChange('active')}
          >
            Activos
          </Badge>
          <Badge
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'inactive'
                ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => onStatusFilterChange('inactive')}
          >
            Inactivos
          </Badge>
        </div>

        {/* Results indicator */}
        {(hasSearchQuery || statusFilter !== 'all') && (
          <div className="text-white text-sm font-medium whitespace-nowrap">
            {isSearching ? (
              <span className="opacity-70">Buscando...</span>
            ) : (
              <span>{resultsCount} resultado{resultsCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}