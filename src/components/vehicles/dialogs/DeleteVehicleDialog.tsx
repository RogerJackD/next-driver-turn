'use client';

import { useState } from 'react';
import { Vehicle } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeleteVehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onConfirm,
  loading = false,
}: DeleteVehicleDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setApiError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar vehículo';
      setApiError(errorMessage);
    }
  };

  const handleClose = () => {
    setApiError(null);
    onOpenChange(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle>Eliminar Vehículo</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            ¿Estás seguro de que deseas eliminar este vehículo?
            <br /><br />
            <strong>Vehículo a eliminar:</strong>
            <br />
            {vehicle.brand} {vehicle.model} - <strong>{vehicle.licensePlate}</strong>
            <br /><br />
            <span className="text-red-600 font-semibold">
              ⚠️ Esta acción desactivará el vehículo. No podrá ser utilizado hasta que sea reactivado.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {apiError && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Vehículo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
