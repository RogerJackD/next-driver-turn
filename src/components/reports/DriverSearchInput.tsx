'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { driverService } from '@/services/drivers.service';
import type { Driver } from '@/types';

interface DriverSearchInputProps {
  onChange: (driverId: string) => void;
  disabled?: boolean;
}

export function DriverSearchInput({
  onChange,
  disabled,
}: DriverSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [suggestions, setSuggestions] = useState<Driver[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await driverService.search(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching drivers:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear selection if user modifies input
    if (selectedDriver) {
      setSelectedDriver(null);
      onChange('');
    }
  };

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setSearchQuery(`${driver.firstName} ${driver.lastName} - ${driver.idCard}`);
    onChange(String(driver.id));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedDriver(null);
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const inputClass =
    'h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <div ref={wrapperRef} className="relative">
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        placeholder="Buscar conductor (nombre, DNI, teléfono...)"
        className={inputClass}
        disabled={disabled}
      />

      {/* Loading/Clear Icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((driver) => (
            <button
              key={driver.id}
              type="button"
              onClick={() => handleSelectDriver(driver)}
              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {driver.firstName} {driver.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>RUT: {driver.idCard}</span>
                    {driver.phone && <span>• {driver.phone}</span>}
                    {driver.vehicleDrivers.length > 0 && (
                      <span>• {driver.vehicleDrivers[0].vehicle?.licensePlate}</span>
                    )}
                  </div>
                </div>
                {driver.user && driver.user.status !== 2 && (
                  <span className="text-xs font-medium text-red-600 px-2 py-0.5 bg-red-50 rounded">
                    Inactivo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && !isSearching && searchQuery.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500 text-center">
            No se encontraron conductores
          </p>
        </div>
      )}
    </div>
  );
}
