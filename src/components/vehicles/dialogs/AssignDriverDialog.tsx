'use client';

import { useState, useEffect } from 'react';
import { Vehicle, User, AssignDriverDto } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, User as UserIcon, Search } from 'lucide-react';
import { userService } from '@/services/users.service';
import { Input } from '@/components/ui/input';

interface AssignDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignDriverDto) => Promise<void>;
  vehicle?: Vehicle | null;
  loading?: boolean;
}

export function AssignDriverDialog({
  open,
  onClose,
  onSubmit,
  vehicle,
  loading = false,
}: AssignDriverDialogProps) {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [assignmentDate, setAssignmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      fetchDrivers();
      setSearchQuery('');
      setSelectedDriverId(null);
      setAssignmentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = drivers.filter(
        (driver) =>
          driver.firstName.toLowerCase().includes(query) ||
          driver.lastName.toLowerCase().includes(query) ||
          driver.email.toLowerCase().includes(query) ||
          driver.idCard.includes(query)
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(drivers);
    }
  }, [searchQuery, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      // Obtener solo conductores activos
      const activeDrivers = await userService.getActive();
      // Filtrar solo drivers (role 0)
      const onlyDrivers = activeDrivers.filter(user => user.role === 0);
      setDrivers(onlyDrivers);
      setFilteredDrivers(onlyDrivers);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriverId || !vehicle) return;

    const data: AssignDriverDto = {
      userId: selectedDriverId,
      vehicleId: vehicle.id,
      assignmentDate,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error al asignar conductor:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Asignar Conductor</DialogTitle>
            <DialogDescription>
              Selecciona un conductor para el vehículo {vehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Búsqueda de conductores */}
            <div className="grid gap-2">
              <Label>Buscar Conductor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email o DNI..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de conductores */}
            <div className="grid gap-2">
              <Label>
                Conductor <span className="text-red-500">*</span>
              </Label>
              {loadingDrivers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchQuery ? 'No se encontraron conductores' : 'No hay conductores disponibles'}
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedDriverId === driver.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {driver.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            DNI: {driver.idCard}
                          </p>
                        </div>
                        {selectedDriverId === driver.id && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fecha de asignación */}
            <div className="grid gap-2">
              <Label htmlFor="assignmentDate">
                Fecha de Asignación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="assignmentDate"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notas */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre la asignación..."
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedDriverId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asignando...
                </>
              ) : (
                'Asignar Conductor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}