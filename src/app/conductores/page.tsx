'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { DriverList } from '@/components/drivers/DriverList';
import { DriverFilters } from '@/components/drivers/DriverFilters';
import { CreateDriverDialog } from '@/components/drivers/dialogs/CreateDriverDialog';
import { EditDriverDialog } from '@/components/drivers/dialogs/EditDriverDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Driver } from '@/types';
import { driverService } from '@/services/drivers.service';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDrivers();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);

      if (!debouncedSearchQuery.trim()) {
        const data = await driverService.getAll();
        setDrivers(data);
        return;
      }

      const data = await driverService.search(debouncedSearchQuery.trim());
      setDrivers(data);
    } catch (error) {
      console.error('Error searching drivers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => router.push('/menu')}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/20 text-white shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Conductores</h1>
              <p className="text-orange-100 text-sm mt-1">
                Listado de conductores
              </p>
            </div>
          </div>

          <DriverFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            resultsCount={drivers.length}
            onCreateClick={() => setCreateDialogOpen(true)}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <DriverList drivers={drivers} onEditDriver={handleEditDriver} />
      </div>

      {/* Dialog para crear conductor */}
      <CreateDriverDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchDrivers}
      />

      {/* Dialog para editar conductor */}
      <EditDriverDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        driver={selectedDriver}
        onSuccess={fetchDrivers}
      />
    </div>
  );
}
