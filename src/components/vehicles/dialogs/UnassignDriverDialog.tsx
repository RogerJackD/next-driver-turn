'use client';

import { useState, useEffect } from 'react';
import { Vehicle, UnassignDriverDto } from '@/types';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { vehiclesService } from '@/services/vehicles.service';

interface UnassignDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UnassignDriverDto) => Promise<void>;
  vehicle?: Vehicle | null;
  loading?: boolean;
}

export function UnassignDriverDialog({
  open,
  onClose,
  onSubmit,
  vehicle,
  loading = false,
}: UnassignDriverDialogProps) {
  const [unassignmentDate, setUnassignmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [unassignmentReason, setUnassignmentReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const currentDriver = vehicle ? vehiclesService.getCurrentDriverFromRelations(vehicle) : null;

  useEffect(() => {
    if (open) {
      setUnassignmentDate(new Date().toISOString().split('T')[0]);
      setUnassignmentReason('');
      setNotes('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentDriver) {
      setError('No hay conductor asignado a este vehículo');
      return;
    }

    if (!unassignmentReason.trim()) {
      setError('Debe proporcionar una razón para la desasignación');
      return;
    }

    const data: UnassignDriverDto = {
      assignmentId: currentDriver.id,
      unassignmentDate,
      unassignmentReason: unassignmentReason.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error al desasignar conductor:', error);
      setError('Error al desasignar conductor. Por favor intente de nuevo.');
    }
  };

  if (!currentDriver) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Este vehículo no tiene un conductor asignado actualmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Desasignar Conductor</DialogTitle>
            <DialogDescription>
              Vas a desasignar al conductor del vehículo {vehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Información del conductor actual */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Conductor Actual:
                  </p>
                  <p className="text-sm text-gray-700">
                    {currentDriver.driver?.firstName} {currentDriver.driver?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Asignado desde: {new Date(currentDriver.assignmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha de desasignación */}
            <div className="grid gap-2">
              <Label htmlFor="unassignmentDate">
                Fecha de Desasignación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unassignmentDate"
                type="date"
                value={unassignmentDate}
                onChange={(e) => setUnassignmentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Razón de desasignación */}
            <div className="grid gap-2">
              <Label htmlFor="unassignmentReason">
                Razón de Desasignación <span className="text-red-500">*</span>
              </Label>
              <select
                id="unassignmentReason"
                value={unassignmentReason}
                onChange={(e) => {
                  setUnassignmentReason(e.target.value);
                  setError('');
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar razón...</option>
                <option value="Fin de turno">Fin de turno</option>
                <option value="Cambio de vehículo">Cambio de vehículo</option>
                <option value="Mantenimiento del vehículo">Mantenimiento del vehículo</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Descanso médico">Descanso médico</option>
                <option value="Renuncia">Renuncia</option>
                <option value="Despido">Despido</option>
                <option value="Otro">Otro</option>
              </select>
              {error && unassignmentReason === '' && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            {/* Notas adicionales */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar detalles adicionales sobre la desasignación..."
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            {error && unassignmentReason !== '' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
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
              disabled={loading || !unassignmentReason}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desasignando...
                </>
              ) : (
                'Desasignar Conductor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}