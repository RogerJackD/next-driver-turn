'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { ZoneList } from '@/components/zones/ZoneList';
import { ZoneFilters } from '@/components/zones/ZoneFilters';
import { CreateZoneDialog } from '@/components/zones/dialogs/CreateZoneDialog';
import { EditZoneDialog } from '@/components/zones/dialogs/EditZoneDialog';
import { ConfirmStatusDialog } from '@/components/zones/dialogs/ConfirmStatusDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { VehicleStop } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';

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

export default function ZonasPage() {
  const router = useRouter();
  const [zones, setZones] = useState<VehicleStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<VehicleStop | null>(null);
  const [statusAction, setStatusAction] = useState<'delete' | 'activate' | 'deactivate'>('delete');

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const user = authUtils.getUser();
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    // Solo administradores pueden acceder
    if (user?.role !== 1) {
      router.push('/menu');
      return;
    }
    fetchZones();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await vehicleStopsService.getAll();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true);

      if (!debouncedSearchQuery.trim()) {
        const data = await vehicleStopsService.getAll();
        setZones(data);
        return;
      }

      const data = await vehicleStopsService.search(debouncedSearchQuery.trim());
      setZones(data);
    } catch (error) {
      console.error('Error searching zones:', error);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  const refreshList = async () => {
    if (debouncedSearchQuery.trim()) {
      const data = await vehicleStopsService.search(debouncedSearchQuery.trim());
      setZones(data);
    } else {
      const data = await vehicleStopsService.getAll();
      setZones(data);
    }
  };

  // Handlers
  const handleEdit = (zone: VehicleStop) => {
    setSelectedZone(zone);
    setEditDialogOpen(true);
  };

  const handleDelete = (zone: VehicleStop) => {
    setSelectedZone(zone);
    setStatusAction('delete');
    setConfirmStatusDialogOpen(true);
  };

  const handleActivate = (zone: VehicleStop) => {
    setSelectedZone(zone);
    setStatusAction('activate');
    setConfirmStatusDialogOpen(true);
  };

  const handleDeactivate = (zone: VehicleStop) => {
    setSelectedZone(zone);
    setStatusAction('deactivate');
    setConfirmStatusDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
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
              <h1 className="text-2xl font-bold">Zonas</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Gestión de zonas y paraderos
              </p>
            </div>
          </div>

          <ZoneFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            resultsCount={zones.length}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <ZoneList
          zones={zones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
      </div>

      {/* Floating Create Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <CreateZoneDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refreshList}
      />

      <EditZoneDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        zone={selectedZone}
        onSuccess={refreshList}
      />

      <ConfirmStatusDialog
        open={confirmStatusDialogOpen}
        onOpenChange={setConfirmStatusDialogOpen}
        zone={selectedZone}
        action={statusAction}
        onSuccess={refreshList}
      />
    </div>
  );
}
