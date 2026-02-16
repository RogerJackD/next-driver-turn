'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleStatus } from '@/types';
import { vehiclesService } from '@/services/vehicles.service';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { VehicleFormDialog } from '@/components/vehicles/dialogs/VehicleFormDialog';
import { ConfirmStatusDialog } from '@/components/vehicles/dialogs/ConfirmStatusDialog';
import { DeleteVehicleDialog } from '@/components/vehicles/dialogs/DeleteVehicleDialog';

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

export default function VehiculosPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Estados para diálogos
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para confirmación de cambio de estado
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: VehicleStatus;
    plate: string;
  } | null>(null);

  useEffect(() => {
    // Verificar autenticación
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchVehicles();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);

      if (!debouncedSearchQuery.trim()) {
        const data = await vehiclesService.getAll();
        setVehicles(data);
        return;
      }

      const data = await vehiclesService.search(debouncedSearchQuery.trim());
      setVehicles(data);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handlers para formulario de vehículo
  const handleCreateVehicle = async (data: CreateVehicleDto) => {
    try {
      setActionLoading(true);
      await vehiclesService.create(data);
      await fetchVehicles();
      setFormDialogOpen(false);
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVehicle = async (data: UpdateVehicleDto) => {
    if (!selectedVehicle) return;

    try {
      setActionLoading(true);
      await vehiclesService.update(selectedVehicle.id, data);
      await fetchVehicles();
      setFormDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormDialogOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedVehicle(null);
    setFormDialogOpen(true);
  };

  // Handler para cambio de estado
  const handleToggleStatusClick = (id: number, currentStatus: VehicleStatus) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    setStatusChangeData({
      id,
      currentStatus,
      plate: vehicle.licensePlate,
    });
    setConfirmStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeData) return;

    try {
      setActionLoading(true);
      if (statusChangeData.currentStatus === VehicleStatus.ACTIVE) {
        await vehiclesService.remove(statusChangeData.id);
      } else {
        await vehiclesService.reactivate(statusChangeData.id);
      }
      await fetchVehicles();
      setConfirmStatusDialogOpen(false);
      setStatusChangeData(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler para eliminar vehículo
  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      setActionLoading(true);
      await vehiclesService.deletePermanent(vehicleToDelete.id);
      await fetchVehicles();
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handler unificado para formulario de vehículo
  const handleVehicleFormSubmit = async (data: CreateVehicleDto | UpdateVehicleDto) => {
    if (selectedVehicle) {
      await handleUpdateVehicle(data as UpdateVehicleDto);
    } else {
      await handleCreateVehicle(data as CreateVehicleDto);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
              <h1 className="text-2xl font-bold">Vehículos</h1>
              <p className="text-orange-100 text-sm mt-1">
                {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <VehicleFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
          />
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="max-w-md mx-auto px-4 py-6">
        <VehicleList
          vehicles={vehicles}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleStatusClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Botón agregar vehículo */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={handleCreateClick}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Diálogos */}
      <VehicleFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleVehicleFormSubmit}
        vehicle={selectedVehicle}
        loading={actionLoading}
      />

      {statusChangeData && (
        <ConfirmStatusDialog
          open={confirmStatusDialogOpen}
          onClose={() => {
            setConfirmStatusDialogOpen(false);
            setStatusChangeData(null);
          }}
          onConfirm={handleConfirmStatusChange}
          vehiclePlate={statusChangeData.plate}
          currentStatus={statusChangeData.currentStatus}
          loading={actionLoading}
        />
      )}

      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setVehicleToDelete(null);
        }}
        vehicle={vehicleToDelete}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
}
