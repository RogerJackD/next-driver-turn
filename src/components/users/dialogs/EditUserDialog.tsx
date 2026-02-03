'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserAdminSchema, UpdateUserAdminFormData } from '@/validators/userAdminSchema';
import { userAdminService } from '@/services/userAdmin.service';
import { User } from '@/types';
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
import { Loader2, Shield, Car } from 'lucide-react';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateUserAdminFormData>({
    resolver: zodResolver(updateUserAdminSchema),
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        idCard: user.idCard,
        role: user.role,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserAdminFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await userAdminService.update(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        idCard: data.idCard,
        role: data.role as 0 | 1,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Selector de Rol */}
          <div className="space-y-2">
            <Label>Tipo de Usuario *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedRole === 0 ? 'default' : 'outline'}
                className={`flex-1 h-12 ${
                  selectedRole === 0
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'hover:bg-green-50 hover:border-green-300'
                }`}
                onClick={() => setValue('role', 0)}
              >
                <Car className="w-4 h-4 mr-2" />
                Conductor
              </Button>
              <Button
                type="button"
                variant={selectedRole === 1 ? 'default' : 'outline'}
                className={`flex-1 h-12 ${
                  selectedRole === 1
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-blue-50 hover:border-blue-300'
                }`}
                onClick={() => setValue('role', 1)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Administrador
              </Button>
            </div>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="h-11"
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className="h-11"
              placeholder="Pérez"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="h-11"
              placeholder="juan.perez@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <Label htmlFor="idCard">DNI *</Label>
            <Input
              id="idCard"
              {...register('idCard')}
              className="h-11"
              placeholder="12345678"
              maxLength={8}
            />
            {errors.idCard && (
              <p className="text-sm text-red-600">{errors.idCard.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register('phone')}
              className="h-11"
              placeholder="912345678"
              maxLength={9}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
