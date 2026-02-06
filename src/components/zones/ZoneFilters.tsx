'use client';

import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface ZoneFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  resultsCount: number;
}

export function ZoneFilters({
  searchQuery,
  onSearchChange,
  isSearching,
  resultsCount,
}: ZoneFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre o dirección..."
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-200 focus:bg-white/20 h-11"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-200" />
        )}
      </div>

      {/* Contador de resultados */}
      <div className="text-emerald-100 text-sm">
        {resultsCount} zona{resultsCount !== 1 ? 's' : ''} encontrada
        {resultsCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
