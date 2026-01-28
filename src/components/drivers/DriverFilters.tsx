import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { UserStatus } from '@/types';

interface ConductorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatus | 'all';
  onStatusFilterChange: (status: UserStatus | 'all') => void;
  onSearch: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

export function ConductorFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSearch,
  onClearFilters,
  isLoading,
}: ConductorFiltersProps) {
  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, DNI o email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-11 bg-white text-gray-900 placeholder:text-gray-500 rounded-xl border-orange-200 focus:border-orange-400"
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={isLoading}
          className="h-11 px-4 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-xl"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Filtros de estado */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-white opacity-80" />
        <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
          <Badge
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-orange-700 hover:bg-white'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => {
              onStatusFilterChange('all');
              if (statusFilter !== 'all') onSearch();
            }}
          >
            Todos
          </Badge>
          <Badge
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => {
              onStatusFilterChange('active');
              if (statusFilter !== 'active') onSearch();
            }}
          >
            Activos
          </Badge>
          <Badge
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
            }`}
            onClick={() => {
              onStatusFilterChange('inactive');
              if (statusFilter !== 'inactive') onSearch();
            }}
          >
            Inactivos
          </Badge>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}