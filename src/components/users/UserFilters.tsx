'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, X } from 'lucide-react';
import { UserStatus, UserRole } from '@/types';

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatus | 'all';
  onStatusFilterChange: (status: UserStatus | 'all') => void;
  roleFilter: UserRole | 'all';
  onRoleFilterChange: (role: UserRole | 'all') => void;
  isSearching: boolean;
  resultsCount: number;
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  isSearching,
  resultsCount,
}: UserFiltersProps) {
  const hasSearchQuery = searchQuery.trim() !== '';
  const hasActiveFilters = hasSearchQuery || statusFilter !== 'all' || roleFilter !== 'all';

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
          className="pl-10 pr-10 h-11 bg-white text-gray-900 placeholder:text-gray-500 rounded-xl border-blue-200 focus:border-blue-400"
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
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Role filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Badge
          variant={roleFilter === 'all' ? 'default' : 'outline'}
          className={`cursor-pointer whitespace-nowrap transition-all ${
            roleFilter === 'all'
              ? 'bg-white text-blue-700 hover:bg-white shadow-sm'
              : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
          }`}
          onClick={() => onRoleFilterChange('all')}
        >
          Todos los roles
        </Badge>
        <Badge
          variant={roleFilter === 1 ? 'default' : 'outline'}
          className={`cursor-pointer whitespace-nowrap transition-all ${
            roleFilter === 1
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
          }`}
          onClick={() => onRoleFilterChange(1)}
        >
          Administradores
        </Badge>
        <Badge
          variant={roleFilter === 0 ? 'default' : 'outline'}
          className={`cursor-pointer whitespace-nowrap transition-all ${
            roleFilter === 0
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
              : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
          }`}
          onClick={() => onRoleFilterChange(0)}
        >
          Conductores
        </Badge>
      </div>

      {/* Status filters and results count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          <Badge
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            className={`cursor-pointer whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-blue-700 hover:bg-white shadow-sm'
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
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
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
        {hasActiveFilters && (
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
