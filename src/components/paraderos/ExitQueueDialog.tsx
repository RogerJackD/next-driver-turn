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
import { Input } from '@/components/ui/input';
import { AlertCircle, Clock, Loader2, LogOut } from 'lucide-react';
import { StopExitReason } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';

interface ExitQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (exitReasonId: number, scheduledExitTime?: string) => Promise<void>;
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
  const [timeInput, setTimeInput] = useState('');
  const [timeError, setTimeError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && stopId) {
      fetchReasons(stopId);
    } else {
      setReasons([]);
      setLoadError(null);
      setSelectedReason(null);
      setTimeInput('');
      setTimeError(null);
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
    setTimeInput('');
    setTimeError(null);
  };

  const validateAndBuildScheduledTime = (): string | null => {
    if (!selectedReason?.requiresTime) return undefined as unknown as null;

    if (!timeInput) {
      setTimeError('Ingresa la hora de salida');
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const scheduled = new Date(`${today}T${timeInput}:00.000Z`);

    if (isNaN(scheduled.getTime())) {
      setTimeError('Hora inválida');
      return null;
    }

    if (scheduled <= new Date()) {
      setTimeError('La hora debe ser posterior a la hora actual');
      return null;
    }

    return `${today}T${timeInput}:00.000Z`;
  };

  const handleConfirm = async () => {
    if (!selectedReason) return;

    if (selectedReason.requiresTime) {
      const scheduledTime = validateAndBuildScheduledTime();
      if (scheduledTime === null) return;

      setIsLoading(true);
      try {
        await onConfirm(selectedReason.id, scheduledTime);
        reset();
        onOpenChange(false);
      } catch {
        // error handled by parent
      } finally {
        setIsLoading(false);
      }
    } else {
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
    }
  };

  const reset = () => {
    setSelectedReason(null);
    setTimeInput('');
    setTimeError(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onOpenChange(false);
  };

  const canConfirm = selectedReason !== null && !loadingReasons;

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
            return (
              <button
                key={reason.id}
                onClick={() => handleSelectReason(reason)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-red-400 bg-red-50 ring-2 ring-offset-1 ring-red-300'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {reason.requiresTime && (
                  <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                )}
                <span className="font-semibold text-sm text-gray-900">{reason.name}</span>
              </button>
            );
          })}

          {/* Time picker for requiresTime reasons */}
          {selectedReason?.requiresTime && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Hora de salida programada
              </p>
              <Input
                type="time"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  setTimeError(null);
                }}
                className="h-9 text-sm bg-white"
                disabled={isLoading}
              />
              {timeError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {timeError}
                </p>
              )}
            </div>
          )}
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
