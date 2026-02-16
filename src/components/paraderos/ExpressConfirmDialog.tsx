'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';

interface ExpressConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  zoneName: string;
}

export function ExpressConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  zoneName,
}: ExpressConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Tomar servicio expreso</DialogTitle>
          <DialogDescription className="text-center">
            Saldrás de la cola en <span className="font-semibold">{zoneName}</span> para realizar un servicio expreso (dedicado).
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Confirmar expreso
              </>
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
