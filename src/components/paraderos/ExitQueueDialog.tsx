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
  mode: 'immediate' | 'scheduled';
}

export function ExitQueueDialog({
  open,
  onOpenChange,
  onConfirm,
  zoneName,
  stopId,
  mode,
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
  }, [open, stopId, mode]);

  const fetchReasons = async (id: number) => {
    setLoadingReasons(true);
    setLoadError(null);
    try {
      const data = await vehicleStopsService.getExitReasons(id);
      setReasons(mode === 'immediate' ? (data.immediate ?? []) : (data.scheduled ?? []));
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

  const formatHour = (autoExitHour: string) => autoExitHour.slice(0, 5); // "09:00:00" → "09:00"

  const getTimeUntilExit = (autoExitHour: string): string | null => {
    const [hStr, mStr] = autoExitHour.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    const exitTime = new Date(now);
    exitTime.setHours(h, m, 0, 0);
    if (exitTime <= now) exitTime.setDate(exitTime.getDate() + 1);
    const totalMinutes = Math.floor((exitTime.getTime() - now.getTime()) / 60000);
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
            {mode === 'immediate' ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center">
            {mode === 'immediate' ? 'Salir de la cola' : 'Programar salida'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'immediate'
              ? <>Estás en <span className="font-semibold">{zoneName}</span>. Selecciona el motivo de salida.</>
              : <>Estás en <span className="font-semibold">{zoneName}</span>. Selecciona cuándo quieres salir.</>
            }
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
              {mode === 'immediate'
                ? 'El administrador aún no configuró motivos de salida para este paradero.'
                : 'El administrador aún no configuró motivos de salida programada para este paradero.'
              }
            </div>
          )}

          {!loadingReasons && !loadError && reasons.map((reason) => {
            const isSelected = selectedReason?.id === reason.id;
            const timeLabel = reason.autoExitHour ? getTimeUntilExit(reason.autoExitHour) : null;
            const selectedStyle = mode === 'immediate'
              ? 'border-red-400 bg-red-50 ring-2 ring-offset-1 ring-red-300'
              : 'border-blue-400 bg-blue-50 ring-2 ring-offset-1 ring-blue-300';
            return (
              <button
                key={reason.id}
                onClick={() => handleSelectReason(reason)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected ? selectedStyle : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
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

          {/* Preview de hora para scheduled */}
          {mode === 'scheduled' && selectedReason?.autoExitHour && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Permanecerás en la cola y saldrás automáticamente a las <strong>{formatHour(selectedReason.autoExitHour)}</strong></span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={`w-full ${mode === 'immediate' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'immediate' ? 'Saliendo...' : 'Programando...'}
              </>
            ) : (
              mode === 'immediate' ? 'Confirmar salida' : 'Confirmar programación'
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
