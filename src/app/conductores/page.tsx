'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { DriverList } from '@/components/drivers/DriverList';
import { DriverFilters } from '@/components/drivers/DriverFilters';
import { CreateDriverDialog } from '@/components/drivers/dialogs/CreateDriverDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { User, UserStatus } from '@/types';
import { userService } from '@/services/users.service';

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
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDrivers();
  }, [router]);

  useEffect(() => {
    if (!loading && drivers.length >= 0) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, statusFilter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await userService.getDrivers();
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
      
      if (!debouncedSearchQuery.trim() && statusFilter === 'all') {
        const data = await userService.getDrivers();
        setDrivers(data);
        return;
      }

      if (!debouncedSearchQuery.trim() && statusFilter !== 'all') {
        let data: User[];
        if (statusFilter === 'active') {
          data = await userService.getActive();
        } else {
          data = await userService.getInactive();
        }
        setDrivers(data);
        return;
      }

      const params: { q?: string; status?: UserStatus } = {};
      
      if (debouncedSearchQuery.trim()) {
        params.q = debouncedSearchQuery.trim();
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await userService.search(params);
      setDrivers(data);
    } catch (error) {
      console.error('Error searching drivers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userService.update(id, { status: newStatus });
      await handleSearch();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-linear-to-r from-orange-600 to-orange-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
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
                Gestión de conductores
              </p>
            </div>
          </div>

          <DriverFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            isSearching={isSearching}
            resultsCount={drivers.length}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <DriverList
          drivers={drivers}
          onToggleStatus={handleToggleStatus}
          onRefresh={fetchDrivers}
        />
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <CreateDriverDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchDrivers}
      />
    </div>
  );
}