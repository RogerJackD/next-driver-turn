'use client';

import { useState } from 'react';
import { User } from '@/types';
import { userService } from '@/services/users.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ConfirmDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const displayName = user ? userService.getDisplayName(user) : '';
  const roleName = user ? userService.getRoleLabel(user.role) : '';

  const handleConfirm = async () => {
    if (!user) return;

    setIsLoading(true);
    setResult(null);

    try {
      await userService.remove(user.id);
      setResult({
        success: true,
        message: `Usuario "${displayName}" eliminado exitosamente`,
      });

      setTimeout(() => {
        setResult(null);
        onOpenChange(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al eliminar usuario';
      setResult({
        success: false,
        message: errorMessage,
      });
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center">¿Eliminar usuario?</DialogTitle>
          <DialogDescription className="text-center">
            <strong>{displayName}</strong> ({roleName}) será eliminado
            permanentemente.
            <br />
            <span className="text-sm mt-2 block text-red-600">
              Esta acción no se puede deshacer.
            </span>
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
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Confirmar eliminación'
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