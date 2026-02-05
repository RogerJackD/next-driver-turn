'use client';

import { User } from '@/types';
import { UserStatus } from '@/constants/enums';
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
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading,
}: ConfirmStatusDialogProps) {
  const isActive = user.status === UserStatus.ACTIVE;
  const displayName = userService.getDisplayName(user);
  const roleName = userService.getRoleLabel(user.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isActive ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <AlertCircle className={`w-6 h-6 ${isActive ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
          <DialogTitle className="text-center">
            {isActive ? '¿Bloquear usuario?' : '¿Activar usuario?'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isActive ? (
              <>
                <strong>{displayName}</strong> ({roleName}) será bloqueado.
                <br />
                <span className="text-sm mt-2 block">
                  No se eliminará, podrás reactivarlo cuando desees.
                </span>
              </>
            ) : (
              <>
                <strong>{displayName}</strong> ({roleName}) será reactivado.
                <br />
                <span className="text-sm mt-2 block">
                  Podrá volver a usar el sistema normalmente.
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full ${
              isActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>Confirmar {isActive ? 'bloqueo' : 'activación'}</>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
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