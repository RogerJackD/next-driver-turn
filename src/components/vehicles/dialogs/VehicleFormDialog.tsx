'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, Driver } from '@/types';
import { createVehicleSchema, CreateVehicleFormData } from '@/validators/vehicleSchema';
import { driverService } from '@/services/drivers.service';
import { vehiclesService } from '@/services/vehicles.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Search,
  X,
  User,
  Car,
  Plus,
  Crown,
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VehicleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehicleDto | UpdateVehicleDto) => Promise<void>;
  vehicle?: Vehicle | null;
  loading?: boolean;
}

interface SelectedDriver {
  id: number;
  idCard: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function VehicleFormDialog({
  open,
  onClose,
  onSubmit,
  vehicle,
  loading = false,
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle;

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateVehicleFormData>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
    },
  });

  // Driver search state
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [isSearchingDrivers, setIsSearchingDrivers] = useState(false);
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<SelectedDriver[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Confirmation dialogs
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showConfirmRemoveDriver, setShowConfirmRemoveDriver] = useState(false);
  const [driverToRemove, setDriverToRemove] = useState<SelectedDriver | null>(null);

  // API error
  const [apiError, setApiError] = useState<string | null>(null);

  // Load vehicle data and assignment history when editing
  useEffect(() => {
    if (open) {
      setApiError(null);
      setDriverSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);

      if (vehicle) {
        reset({
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color || '',
        });

        // Load assignment history from API
        loadAssignmentHistory(vehicle.id);
      } else {
        reset({
          licensePlate: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
        });
        setSelectedDrivers([]);
      }
    }
  }, [vehicle, open, reset]);

  // Load assignment history from API
  const loadAssignmentHistory = async (vehicleId: number) => {
    setIsLoadingHistory(true);
    try {
      const history = await vehiclesService.getAssignmentHistory(vehicleId);

      // Convert history to SelectedDriver format
      // Sort: inactive first (historical), active last
      const sortedHistory = [...history].sort((a, b) => {
        if (a.status === 1 && b.status !== 1) return 1; // Active goes last
        if (a.status !== 1 && b.status === 1) return -1;
        return 0;
      });

      // Remove duplicates (keep only unique driver IDs, preferring the active one)
      const uniqueDrivers = new Map<number, SelectedDriver>();

      sortedHistory.forEach(assignment => {
        if (assignment.driver) {
          // If driver not in map, or this is the active assignment, add/update
          if (!uniqueDrivers.has(assignment.driver.id) || assignment.status === 1) {
            uniqueDrivers.set(assignment.driver.id, {
              id: assignment.driver.id,
              idCard: assignment.driver.idCard,
              firstName: assignment.driver.firstName,
              lastName: assignment.driver.lastName,
              phone: assignment.driver.phone,
            });
          }
        }
      });

      // Convert map to array, ensuring active driver is last
      const drivers: SelectedDriver[] = [];
      let activeDriver: SelectedDriver | null = null;

      sortedHistory.forEach(assignment => {
        if (assignment.driver && uniqueDrivers.has(assignment.driver.id)) {
          const driver = uniqueDrivers.get(assignment.driver.id)!;
          if (assignment.status === 1) {
            activeDriver = driver;
          } else if (!drivers.some(d => d.id === driver.id)) {
            drivers.push(driver);
          }
          uniqueDrivers.delete(assignment.driver.id);
        }
      });

      // Add active driver at the end
      if (activeDriver) {
        drivers.push(activeDriver);
      }

      setSelectedDrivers(drivers);
    } catch (error) {
      console.error('Error loading assignment history:', error);
      setSelectedDrivers([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Debounced driver search
  const searchDrivers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearchingDrivers(true);
    try {
      const results = await driverService.search(query);
      // Filter out already selected drivers
      const filteredResults = results.filter(
        driver => !selectedDrivers.some(sd => sd.id === driver.id)
      );
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching drivers:', error);
      setSearchResults([]);
    } finally {
      setIsSearchingDrivers(false);
    }
  }, [selectedDrivers]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDrivers(driverSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [driverSearchQuery, searchDrivers]);

  // Add driver to selection
  const handleAddDriver = (driver: Driver) => {
    const newDriver: SelectedDriver = {
      id: driver.id,
      idCard: driver.idCard,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
    };
    setSelectedDrivers(prev => [...prev, newDriver]);
    setDriverSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Remove driver from selection
  const handleRemoveDriver = (driver: SelectedDriver) => {
    if (isEditing) {
      setDriverToRemove(driver);
      setShowConfirmRemoveDriver(true);
    } else {
      setSelectedDrivers(prev => prev.filter(d => d.id !== driver.id));
    }
  };

  // Confirm remove driver
  const confirmRemoveDriver = () => {
    if (driverToRemove) {
      setSelectedDrivers(prev => prev.filter(d => d.id !== driverToRemove.id));
      setDriverToRemove(null);
      setShowConfirmRemoveDriver(false);
    }
  };

  // Handle form submission
  const onFormSubmit = async (data: CreateVehicleFormData) => {
    if (isEditing) {
      setShowConfirmUpdate(true);
    } else {
      await submitForm(data);
    }
  };

  // Actual submit
  const submitForm = async (data: CreateVehicleFormData) => {
    setApiError(null);

    const submitData: CreateVehicleDto | UpdateVehicleDto = {
      ...data,
      licensePlate: data.licensePlate?.toUpperCase(),
      driverIds: selectedDrivers.length > 0 ? selectedDrivers.map(d => d.id) : undefined,
    };

    try {
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el vehículo';
      setApiError(errorMessage);
    }
  };

  // Confirm update
  const confirmUpdate = async () => {
    setShowConfirmUpdate(false);
    const formValues = watch();
    await submitForm(formValues as CreateVehicleFormData);
  };

  // Handle close
  const handleClose = () => {
    reset();
    setSelectedDrivers([]);
    setDriverSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setApiError(null);
    setShowConfirmUpdate(false);
    setShowConfirmRemoveDriver(false);
    setDriverToRemove(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open && !showConfirmUpdate && !showConfirmRemoveDriver} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl flex flex-col max-h-[90vh]">
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col min-h-0 flex-1">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Car className="h-5 w-5" />
                {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del vehículo y sus conductores asignados'
                  : 'Completa los datos del nuevo vehículo'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-4 pr-1">
              {/* Placa */}
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Placa *</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  className="h-11"
                  placeholder="ABC-123"
                  onChange={(e) => {
                    setValue('licensePlate', e.target.value.toUpperCase());
                  }}
                />
                {errors.licensePlate && (
                  <p className="text-sm text-red-600">{errors.licensePlate.message}</p>
                )}
              </div>

              {/* Marca y Modelo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    className="h-11"
                    placeholder="Toyota"
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    {...register('model')}
                    className="h-11"
                    placeholder="Corolla"
                  />
                  {errors.model && (
                    <p className="text-sm text-red-600">{errors.model.message}</p>
                  )}
                </div>
              </div>

              {/* Año y Color */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Año *</Label>
                  <Input
                    id="year"
                    type="number"
                    {...register('year', { valueAsNumber: true })}
                    className="h-11"
                    placeholder="2024"
                  />
                  {errors.year && (
                    <p className="text-sm text-red-600">{errors.year.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register('color')}
                    className="h-11"
                    placeholder="Blanco"
                  />
                  {errors.color && (
                    <p className="text-sm text-red-600">{errors.color.message}</p>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Conductores
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Busca y agrega conductores. El <strong>último conductor agregado</strong> será el conductor activo del vehículo.
                </p>
              </div>

              {/* Driver Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar conductor por nombre o DNI..."
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-11"
                  />
                  {isSearchingDrivers && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-500" />
                  )}
                  {driverSearchQuery && !isSearchingDrivers && (
                    <button
                      type="button"
                      onClick={() => {
                        setDriverSearchQuery('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((driver) => (
                      <button
                        key={driver.id}
                        type="button"
                        onClick={() => handleAddDriver(driver)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            DNI: {driver.idCard} - Tel: {driver.phone}
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-orange-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showSearchResults && searchResults.length === 0 && driverSearchQuery.length >= 2 && !isSearchingDrivers && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                    No se encontraron conductores
                  </div>
                )}
              </div>

              {/* Loading history indicator */}
              {isLoadingHistory && (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Cargando historial de conductores...</span>
                </div>
              )}

              {/* Selected Drivers List */}
              {!isLoadingHistory && selectedDrivers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {isEditing && <History className="w-4 h-4" />}
                    {isEditing ? 'Historial de conductores' : 'Conductores seleccionados'} ({selectedDrivers.length})
                  </p>
                  <div className="space-y-2">
                    {selectedDrivers.map((driver, index) => {
                      const isActive = index === selectedDrivers.length - 1;
                      return (
                        <div
                          key={`${driver.id}-${index}`}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-orange-500' : 'bg-gray-300'
                          }`}>
                            {isActive ? (
                              <Crown className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium truncate ${isActive ? 'text-orange-900' : 'text-gray-700'}`}>
                                {driver.firstName} {driver.lastName}
                              </p>
                              {isActive ? (
                                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                                  ACTIVO
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full font-medium shrink-0">
                                  Historial
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              DNI: {driver.idCard}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDriver(driver)}
                            className="p-1.5 hover:bg-red-100 rounded-full transition-colors shrink-0"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {selectedDrivers.length > 1 && (
                    <p className="text-xs text-gray-500 italic">
                      * Los conductores anteriores quedarán como historial (inactivos)
                    </p>
                  )}
                </div>
              )}

              {/* Empty state for drivers */}
              {!isLoadingHistory && selectedDrivers.length === 0 && (
                <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Sin conductores asignados
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Usa el buscador para agregar conductores
                  </p>
                </div>
              )}

              {/* API Error */}
              {apiError && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="shrink-0 gap-2 sm:gap-0 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || isLoadingHistory}
                className={`w-full sm:w-auto ${
                  isEditing
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>{isEditing ? 'Actualizar Vehículo' : 'Crear Vehículo'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Update Dialog */}
      <Dialog open={showConfirmUpdate} onOpenChange={setShowConfirmUpdate}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle>Confirmar Actualización</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              ¿Estás seguro de que deseas actualizar este vehículo?
              {selectedDrivers.length > 0 && (
                <>
                  <br /><br />
                  <strong>Cambios en conductores:</strong>
                  <br />
                  {selectedDrivers.length === 1 ? (
                    <>El conductor <strong>{selectedDrivers[0].firstName} {selectedDrivers[0].lastName}</strong> será el conductor activo.</>
                  ) : (
                    <>
                      <strong>{selectedDrivers[selectedDrivers.length - 1].firstName} {selectedDrivers[selectedDrivers.length - 1].lastName}</strong> será el nuevo conductor activo.
                      <br />
                      Los demás conductores ({selectedDrivers.length - 1}) quedarán como historial.
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmUpdate(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmUpdate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Actualización
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Driver Dialog */}
      <Dialog open={showConfirmRemoveDriver} onOpenChange={setShowConfirmRemoveDriver}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <DialogTitle>Retirar Conductor</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              {driverToRemove && (
                <>
                  ¿Estás seguro de que deseas retirar a <strong>{driverToRemove.firstName} {driverToRemove.lastName}</strong> de la lista de conductores?
                  <br /><br />
                  Al guardar los cambios, este conductor ya no estará asignado al vehículo.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmRemoveDriver(false);
                setDriverToRemove(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmRemoveDriver}
            >
              Retirar Conductor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
