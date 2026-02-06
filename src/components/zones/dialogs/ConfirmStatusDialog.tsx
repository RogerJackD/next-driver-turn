'use client';

import { useState } from 'react';
import { VehicleStop } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Power,
  PowerOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type StatusAction = 'delete' | 'activate' | 'deactivate';

interface ConfirmStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: VehicleStop | null;
  action: StatusAction;
  onSuccess: () => void;
}

const ACTION_CONFIG: Record<
  StatusAction,
  {
    title: string;
    description: (name: string) => string;
    warning?: string;
    confirmText: string;
    loadingText: string;
    successText: string;
    buttonClass: string;
    icon: typeof Trash2;
    iconBgClass: string;
  }
> = {
  delete: {
    title: '¿Eliminar zona?',
    description: (name) => `La zona "${name}" será eliminada.`,
    warning: 'Esta acción no se puede deshacer.',
    confirmText: 'Confirmar eliminación',
    loadingText: 'Eliminando...',
    successText: 'Zona eliminada exitosamente',
    buttonClass: 'bg-red-600 hover:bg-red-700',
    icon: Trash2,
    iconBgClass: 'bg-red-100',
  },
  activate: {
    title: '¿Activar zona?',
    description: (name) => `La zona "${name}" será activada y estará disponible en el sistema.`,
    confirmText: 'Confirmar activación',
    loadingText: 'Activando...',
    successText: 'Zona activada exitosamente',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    icon: Power,
    iconBgClass: 'bg-emerald-100',
  },
  deactivate: {
    title: '¿Desactivar zona?',
    description: (name) => `La zona "${name}" será desactivada temporalmente.`,
    confirmText: 'Confirmar desactivación',
    loadingText: 'Desactivando...',
    successText: 'Zona desactivada exitosamente',
    buttonClass: 'bg-orange-600 hover:bg-orange-700',
    icon: PowerOff,
    iconBgClass: 'bg-orange-100',
  },
};

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  zone,
  action,
  onSuccess,
}: ConfirmStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  const iconColorClass =
    action === 'delete'
      ? 'text-red-600'
      : action === 'activate'
        ? 'text-emerald-600'
        : 'text-orange-600';

  const handleConfirm = async () => {
    if (!zone) return;

    setIsLoading(true);
    setResult(null);

    try {
      if (action === 'delete') {
        await vehicleStopsService.remove(zone.id);
      } else if (action === 'activate') {
        await vehicleStopsService.activate(zone.id);
      } else {
        await vehicleStopsService.inactivate(zone.id);
      }
      setResult({ success: true, message: config.successText });

      setTimeout(() => {
        setResult(null);
        onOpenChange(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al realizar la acción';
      setResult({ success: false, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${config.iconBgClass}`}
            >
              <Icon className={`w-6 h-6 ${iconColorClass}`} />
            </div>
          </div>
          <DialogTitle className="text-center">{config.title}</DialogTitle>
          <DialogDescription className="text-center">
            {zone && config.description(zone.name)}
            {config.warning && (
              <>
                <br />
                <span className="text-sm mt-2 block text-red-600 font-medium">
                  {config.warning}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {result && (
          <Alert
            className={`rounded-xl ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={result.success ? 'text-green-800' : 'text-red-800'}
            >
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {!result && (
            <>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`w-full ${config.buttonClass}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {config.loadingText}
                  </>
                ) : (
                  config.confirmText
                )}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                Cancelar
              </Button>
            </>
          )}
          {result && (
            <Button onClick={handleClose} variant="outline" className="w-full">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
