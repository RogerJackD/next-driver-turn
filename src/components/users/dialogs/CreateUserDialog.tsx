'use client';

import { useState, useEffect } from 'react';
import { Driver } from '@/types';
import { driverService } from '@/services/drivers.service';
import { userService } from '@/services/users.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Search,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  X,
  User as UserIcon,
  Shield,
  Car,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [username, setUsername] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDriverList, setShowDriverList] = useState(false);

  // Cargar conductores cuando se abre el dialog
  useEffect(() => {
    if (open) {
      fetchDrivers();
      resetForm();
    }
  }, [open]);

  // Filtrar conductores cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = drivers.filter(
        (driver) =>
          driver.firstName.toLowerCase().includes(query) ||
          driver.lastName.toLowerCase().includes(query) ||
          driver.idCard.includes(query) ||
          driver.phone.includes(query)
      );
      setFilteredDrivers(filtered);
      setShowDriverList(true);
    } else {
      setFilteredDrivers([]);
      setShowDriverList(false);
    }
  }, [searchQuery, drivers]);

  const fetchDrivers = async () => {
    try {
      setIsSearchingDriver(true);
      const allDrivers = await driverService.getAll();
      // Filtrar conductores que no tienen usuario asignado
      const driversWithoutUser = allDrivers.filter((driver) => !driver.user);
      setDrivers(driversWithoutUser);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setIsSearchingDriver(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedDriver(null);
    setUsername('');
    setApiError(null);
    setSuccessMessage(null);
    setShowDriverList(false);
    setFilteredDrivers([]);
  };

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setUsername(driver.idCard); // Auto-fill username with DNI
    setSearchQuery('');
    setShowDriverList(false);
  };

  const handleClearDriver = () => {
    setSelectedDriver(null);
    setUsername('');
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setApiError('El nombre de usuario es requerido');
      return;
    }

    if (username.trim().length < 3) {
      setApiError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Si hay conductor seleccionado: enviar driverId
      // Si no hay conductor: no enviar driverId (backend asigna el rol automáticamente)
      const createData: { name: string; driverId?: number } = {
        name: username.trim(),
      };

      if (selectedDriver) {
        createData.driverId = selectedDriver.id;
      }

      await userService.create(createData);

      const roleText = selectedDriver ? 'Conductor' : 'Administrador';
      setSuccessMessage(`Usuario ${roleText} creado exitosamente`);

      setTimeout(() => {
        resetForm();
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear usuario';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Usuario
          </DialogTitle>
          <DialogDescription>
            Busca un conductor para crear un usuario conductor, o ingresa un
            nombre para crear un administrador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Búsqueda de conductor */}
          <div className="space-y-2">
            <Label>Buscar Conductor (opcional)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, DNI o teléfono..."
                className="pl-10 h-11"
                disabled={!!selectedDriver || isSearchingDriver}
              />
              {isSearchingDriver && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Lista de conductores filtrados */}
            {showDriverList && filteredDrivers.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto bg-white shadow-lg">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver)}
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {driver.firstName} {driver.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          DNI: {driver.idCard}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDriverList && filteredDrivers.length === 0 && searchQuery && (
              <p className="text-sm text-gray-500 text-center py-2">
                No se encontraron conductores sin usuario asignado
              </p>
            )}
          </div>

          {/* Conductor seleccionado */}
          {selectedDriver && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">
                      {selectedDriver.firstName} {selectedDriver.lastName}
                    </p>
                    <p className="text-sm text-green-600">
                      DNI: {selectedDriver.idCard}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearDriver}
                  className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Nombre de usuario */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Nombre de Usuario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                selectedDriver
                  ? 'DNI del conductor (auto-rellenado)'
                  : 'Ingresa el nombre de usuario'
              }
              className="h-11"
              minLength={3}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {selectedDriver
                ? 'Se ha rellenado automáticamente con el DNI del conductor'
                : 'Mínimo 3 caracteres'}
            </p>
          </div>

          {/* Indicador de tipo de usuario */}
          <div
            className={`p-4 rounded-xl border ${
              selectedDriver
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedDriver ? (
                <>
                  <Car
                    className={`w-5 h-5 ${
                      selectedDriver ? 'text-green-600' : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-green-800">
                      Usuario Conductor
                    </p>
                    <p className="text-sm text-green-600">
                      Se creará vinculado al conductor seleccionado
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-800">
                      Usuario Administrador
                    </p>
                    <p className="text-sm text-blue-600">
                      Se creará sin conductor vinculado
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {apiError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="rounded-xl bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !!successMessage || !username.trim()}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full h-11"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}