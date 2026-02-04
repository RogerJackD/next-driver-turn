'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { VehicleStatus } from '@/types';

interface ConfirmStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vehiclePlate: string;
  currentStatus: VehicleStatus;
  loading?: boolean;
}

export function ConfirmStatusDialog({
  open,
  onClose,
  onConfirm,
  vehiclePlate,
  currentStatus,
  loading = false,
}: ConfirmStatusDialogProps) {
  const isActivating = currentStatus === VehicleStatus.INACTIVE;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isActivating ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                isActivating ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>
            <DialogTitle>
              {isActivating ? 'Reactivar' : 'Desactivar'} Vehículo
            </DialogTitle>
          </div>
          <DialogDescription>
            {isActivating ? (
              <>
                ¿Estás seguro de que deseas <strong>reactivar</strong> el vehículo <strong>{vehiclePlate}</strong>?
                <br />
                <br />
                El vehículo volverá a estar disponible para asignaciones.
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas <strong>desactivar</strong> el vehículo <strong>{vehiclePlate}</strong>?
                <br />
                <br />
                No podrás asignar conductores a este vehículo mientras esté desactivado.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isActivating ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>{isActivating ? 'Reactivar' : 'Desactivar'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}