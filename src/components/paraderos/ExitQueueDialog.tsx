'use client';

import { useState } from 'react';
import type { ExitReason } from '@/types';
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
  CheckCircle,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
  Loader2,
  LogOut,
} from 'lucide-react';

interface ExitQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: ExitReason) => Promise<void>;
  zoneName: string;
}

const EXIT_REASONS: {
  value: ExitReason;
  label: string;
  description: string;
  icon: typeof CheckCircle;
  className: string;
}[] = [
  {
    value: 'service_taken',
    label: 'Servicio tomado',
    description: 'Ya tomé pasajeros',
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800',
  },
  {
    value: 'shift_end',
    label: 'Fin de turno',
    description: 'Termino mi jornada',
    icon: Clock,
    className: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800',
  },
  {
    value: 'emergency',
    label: 'Emergencia',
    description: 'Debo retirarme por emergencia',
    icon: AlertTriangle,
    className: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800',
  },
  {
    value: 'change_stop',
    label: 'Cambio de paradero',
    description: 'Me moveré a otro paradero',
    icon: ArrowRightLeft,
    className: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800',
  },
];

export function ExitQueueDialog({
  open,
  onOpenChange,
  onConfirm,
  zoneName,
}: ExitQueueDialogProps) {
  const [selectedReason, setSelectedReason] = useState<ExitReason | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedReason) return;

    setIsLoading(true);
    try {
      await onConfirm(selectedReason);
      setSelectedReason(null);
      onOpenChange(false);
    } catch {
      // error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Salir de la cola</DialogTitle>
          <DialogDescription className="text-center">
            Estás en <span className="font-semibold">{zoneName}</span>. Selecciona el motivo de salida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {EXIT_REASONS.map((reason) => {
            const Icon = reason.icon;
            const isSelected = selectedReason === reason.value;
            return (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${reason.className} ring-2 ring-offset-1 ring-gray-400`
                    : `${reason.className} opacity-70`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm">{reason.label}</p>
                  <p className="text-xs opacity-75">{reason.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!selectedReason || isLoading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saliendo...
              </>
            ) : (
              'Confirmar salida'
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
