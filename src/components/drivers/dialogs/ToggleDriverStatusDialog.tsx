'use client';

import { useState } from 'react';
import { Driver } from '@/types';
import { DriverStatus } from '@/constants/enums';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Power, AlertTriangle } from 'lucide-react';

interface ToggleDriverStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function ToggleDriverStatusDialog({
  open,
  onOpenChange,
  driver,
  onConfirm,
  loading = false,
}: ToggleDriverStatusDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const isActive = driver?.status === DriverStatus.ACTIVE;
  const actionText = isActive ? 'Desactivar' : 'Activar';

  const handleConfirm = async () => {
    setApiError(null);
    try {
      await onConfirm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error al ${actionText.toLowerCase()} conductor`;
      setApiError(errorMessage);
    }
  };

  const handleClose = () => {
    setApiError(null);
    onOpenChange(false);
  };

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isActive ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Power className={`w-6 h-6 ${isActive ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <DialogTitle>{actionText} Conductor</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {isActive ? (
              <>
                ¿Estás seguro de que deseas <strong>desactivar</strong> a este conductor?
                El conductor no podrá ser asignado a vehículos ni hacer parqueo.
              </>
            ) : (
              <>
                ¿Deseas <strong>activar</strong> nuevamente a este conductor?
                Podrá ser asignado a vehículos y hacer parqueo.
              </>
            )}
            <br /><br />
            <strong>Conductor:</strong> {driver.firstName} {driver.lastName}
            <br />
            <strong>DNI:</strong> {driver.idCard}
          </DialogDescription>
        </DialogHeader>

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
            variant={isActive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
            className={!isActive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isActive ? 'Desactivando...' : 'Activando...'}
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                {actionText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
