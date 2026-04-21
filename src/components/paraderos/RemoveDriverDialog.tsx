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
import { AlertCircle, AlertTriangle, ChevronRight, Loader2, UserMinus } from 'lucide-react';
import { StopExpulsionReason } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import { currentQueueService } from '@/services/currentQueue.service';

interface RemoveDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName: string;
  queueId: number | null;
  onSuccess: () => void;
}

export function RemoveDriverDialog({
  open,
  onOpenChange,
  driverName,
  queueId,
  onSuccess,
}: RemoveDriverDialogProps) {
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<StopExpulsionReason | null>(null);

  const [reasons, setReasons] = useState<StopExpulsionReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchReasons();
    } else {
      setReasons([]);
      setLoadError(null);
      setStep('reason');
      setSelectedReason(null);
      setSubmitError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchReasons = async () => {
    setLoadingReasons(true);
    setLoadError(null);
    try {
      const all = await vehicleStopsService.getAllExpulsionReasons();
      setReasons(all.filter((r) => r.status === 1));
    } catch {
      setLoadError('No se pudieron cargar los motivos. Intenta de nuevo.');
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setStep('reason');
    setSelectedReason(null);
    setSubmitError(null);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (!selectedReason) return;
    setSubmitError(null);
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('reason');
    setSubmitError(null);
  };

  const handleConfirm = async () => {
    if (!queueId || !selectedReason) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await currentQueueService.peerExit(queueId, {
        expulsionReasonId: selectedReason.id,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al expulsar al conductor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl">
        {step === 'reason' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                  <UserMinus className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <DialogTitle className="text-center">Retirar conductor</DialogTitle>
              <DialogDescription className="text-center">
                Estás a punto de retirar a{' '}
                <span className="font-semibold text-gray-900">{driverName}</span> de la cola.
                <br />
                Selecciona el motivo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 min-h-[80px]">
              {loadingReasons && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}

              {!loadingReasons && loadError && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {loadError}
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchReasons} className="w-full h-8 text-xs">
                    Reintentar
                  </Button>
                </div>
              )}

              {!loadingReasons && !loadError && reasons.length === 0 && (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 text-center">
                    El administrador aún no configuró motivos de expulsión.
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchReasons} className="w-full h-8 text-xs">
                    Recargar
                  </Button>
                </div>
              )}

              {!loadingReasons && !loadError && reasons.map((reason) => {
                const isSelected = selectedReason?.id === reason.id;
                return (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-red-400 bg-red-50 ring-2 ring-offset-1 ring-red-300'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{reason.name}</p>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 shrink-0 text-red-500" />}
                  </button>
                );
              })}
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedReason || loadingReasons}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Continuar
              </Button>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Cancelar
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <DialogTitle className="text-center">¿Confirmar retiro?</DialogTitle>
              <DialogDescription className="text-center">
                Se retirará a{' '}
                <span className="font-semibold text-gray-900">{driverName}</span> de la cola.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Conductor</span>
                <span className="font-semibold text-gray-900">{driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Motivo</span>
                <span className="font-semibold text-gray-900">{selectedReason?.name}</span>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              Esta acción no se puede deshacer.
            </p>

            <DialogFooter className="flex-col sm:flex-col gap-2 pt-1">
              <Button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retirando...
                  </>
                ) : (
                  'Sí, retirar conductor'
                )}
              </Button>
              <Button onClick={handleBack} variant="outline" className="w-full" disabled={submitting}>
                Volver
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
