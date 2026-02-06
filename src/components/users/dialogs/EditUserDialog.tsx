'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/types';
import { UserRole } from '@/constants/enums';
import { userService } from '@/services/users.service';
import { editUserSchema, EditUserFormData } from '@/validators/userSchema';
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
import {
  Loader2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Car,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
    },
  });

  // Cargar datos del usuario cuando se abre el dialog
  useEffect(() => {
    if (open && user) {
      setValue('name', user.name);
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [open, user, setValue]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await userService.update(user.id, { name: data.name });

      setSuccessMessage('Usuario actualizado exitosamente');

      setTimeout(() => {
        reset();
        setSuccessMessage(null);
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al actualizar usuario';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    setSuccessMessage(null);
    onOpenChange(false);
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const hasDriver = !!user?.driver;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Usuario
          </DialogTitle>
          <DialogDescription>Modifica el nombre de usuario</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información del conductor (solo lectura) */}
          <div className="space-y-2">
            <Label>Conductor</Label>
            <div
              className={`p-4 rounded-xl border ${
                hasDriver
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {hasDriver ? (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        {user?.driver?.firstName} {user?.driver?.lastName}
                      </p>
                      <p className="text-sm text-green-600">
                        DNI: {user?.driver?.idCard}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">
                        Sin conductor vinculado
                      </p>
                      <p className="text-sm text-gray-500">
                        Usuario administrador
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Indicador de rol */}
          <div
            className={`p-3 rounded-xl border ${
              isAdmin
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Rol: Administrador
                  </span>
                </>
              ) : (
                <>
                  <Car className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Rol: Conductor
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Nombre de usuario (editable) */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de Usuario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ingresa el nombre de usuario"
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Mensajes de error y éxito */}
          {apiError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="rounded-xl bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full h-11"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}