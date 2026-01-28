'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, AssignDriverDto, UnassignDriverDto } from '@/types';
import { vehiclesService } from '@/services/vehicles.service';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { VehicleFormDialog } from '@/components/vehicles/dialogs/VehicleFormDialog';
import { AssignDriverDialog } from '@/components/vehicles/dialogs/AssignDriverDialog';
import { UnassignDriverDialog } from '@/components/vehicles/dialogs/UnassignDriverDialog';
import { ConfirmStatusDialog } from '@/components/vehicles/dialogs/ConfirmStatusDialog';

export default function VehiculosPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para diálogos
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para confirmación de cambio de estado
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: string;
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
    // Filtrar vehículos localmente
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = vehicles.filter(
        (vehicle) =>
          vehicle.licensePlate.toLowerCase().includes(query) ||
          vehicle.brand.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.color.toLowerCase().includes(query) ||
          (vehicle.internalNumber && vehicle.internalNumber.toLowerCase().includes(query))
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchQuery, vehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesService.getAll();
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    } finally {
      setLoading(false);
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

  // Handlers para asignación de conductores
  const handleAssignDriverClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setAssignDialogOpen(true);
  };

  const handleAssignDriver = async (data: AssignDriverDto) => {
    try {
      setActionLoading(true);
      await vehiclesService.assignDriver(data);
      await fetchVehicles();
      setAssignDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error al asignar conductor:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassignDriverClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setUnassignDialogOpen(true);
  };

  const handleUnassignDriver = async (data: UnassignDriverDto) => {
    try {
      setActionLoading(true);
      await vehiclesService.unassignDriver(data);
      await fetchVehicles();
      setUnassignDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error al desasignar conductor:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // Handler para cambio de estado
  const handleToggleStatusClick = (id: number, currentStatus: string) => {
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
      if (statusChangeData.currentStatus === 'active') {
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
                {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? 's' : ''}
                {searchQuery && ` (filtrado${filteredVehicles.length !== 1 ? 's' : ''})`}
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <VehicleFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="max-w-md mx-auto px-4 py-6">
        <VehicleList
          vehicles={filteredVehicles}
          onEdit={handleEditClick}
          onAssignDriver={handleAssignDriverClick}
          onUnassignDriver={handleUnassignDriverClick}
          onToggleStatus={handleToggleStatusClick}
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

      <AssignDriverDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleAssignDriver}
        vehicle={selectedVehicle}
        loading={actionLoading}
      />

      <UnassignDriverDialog
        open={unassignDialogOpen}
        onClose={() => {
          setUnassignDialogOpen(false);
          setSelectedVehicle(null);
        }}
        onSubmit={handleUnassignDriver}
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
    </div>
  );
}