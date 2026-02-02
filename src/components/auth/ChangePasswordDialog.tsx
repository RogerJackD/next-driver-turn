import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@/validators/userSchema';
import { userService } from '@/services/users.service';
import { UserStatus } from '@/constants/enums';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  isNewUser?: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  userId,
  isNewUser = false,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Enviar solo newPassword al endpoint
      await userService.changePassword(userId, { newPassword: data.newPassword });

      // Si es usuario nuevo, actualizar status a ACTIVE (2)
      if (isNewUser) {
        await userService.update(userId, { status: UserStatus.ACTIVE });
      }

      setSuccess(true);
      reset();

      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isNewUser) {
      reset();
      setError('');
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isNewUser) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isNewUser) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            {isNewUser ? '¡Bienvenido!' : 'Cambiar Contraseña'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isNewUser
              ? 'Como eres un usuario nuevo, debes establecer tu contraseña para continuar.'
              : 'Ingresa tu nueva contraseña.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className="h-11 pr-10"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-10"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Mínimo 3 caracteres, solo letras y números
            </p>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="h-11 pr-10"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-10"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="rounded-xl bg-green-50 text-green-800 border-green-200">
              <AlertDescription className="text-sm">
                ¡Contraseña establecida exitosamente!
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : success ? (
                '¡Listo!'
              ) : (
                'Guardar Contraseña'
              )}
            </Button>

            {!isNewUser && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || success}
                className="w-full h-11"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
