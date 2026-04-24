'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Loader2, LogOut } from 'lucide-react';
import { StopExitReason } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';

interface ExitQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (exitReasonId: number) => Promise<void>;
  zoneName: string;
  stopId: number | null;
}

export function ExitQueueDialog({
  open,
  onOpenChange,
  onConfirm,
  zoneName,
  stopId,
}: ExitQueueDialogProps) {
  const [reasons, setReasons] = useState<StopExitReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedReason, setSelectedReason] = useState<StopExitReason | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && stopId) {
      fetchReasons(stopId);
    } else {
      setReasons([]);
      setLoadError(null);
      setSelectedReason(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stopId]);

  const fetchReasons = async (id: number) => {
    setLoadingReasons(true);
    setLoadError(null);
    try {
      const data = await vehicleStopsService.getExitReasons(id);
      setReasons(data);
    } catch {
      setLoadError('No se pudieron cargar los motivos. Intenta de nuevo.');
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleSelectReason = (reason: StopExitReason) => {
    setSelectedReason(reason);
  };

  const handleConfirm = async () => {
    if (!selectedReason) return;
    setIsLoading(true);
    try {
      await onConfirm(selectedReason.id);
      reset();
      onOpenChange(false);
    } catch {
      // error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedReason(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onOpenChange(false);
  };

  const canConfirm = selectedReason !== null && !loadingReasons;

  const getTimeUntilExit = (autoExitHour: string): string | null => {
    const [hStr, mStr] = autoExitHour.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    const exitTime = new Date(now);
    exitTime.setHours(h, m, 0, 0);
    const diffMs = exitTime.getTime() - now.getTime();
    if (diffMs <= 0) {
      return `Sale a las ${autoExitHour}`;
    }
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `Sale en ${hours}h ${minutes}min`;
    if (hours > 0) return `Sale en ${hours}h`;
    return `Sale en ${minutes}min`;
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

        <div className="space-y-2 min-h-[80px]">
          {loadingReasons && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loadingReasons && loadError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loadError}
            </div>
          )}

          {!loadingReasons && !loadError && reasons.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 text-center">
              El administrador aún no configuró motivos de salida para este paradero.
            </div>
          )}

          {!loadingReasons && !loadError && reasons.map((reason) => {
            const isSelected = selectedReason?.id === reason.id;
            const timeLabel = reason.autoExitHour ? getTimeUntilExit(reason.autoExitHour) : null;
            return (
              <button
                key={reason.id}
                onClick={() => handleSelectReason(reason)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-red-400 bg-red-50 ring-2 ring-offset-1 ring-red-300'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="font-semibold text-sm text-gray-900">{reason.name}</span>
                {timeLabel && (
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
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
