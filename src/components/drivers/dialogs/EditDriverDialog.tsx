import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateUserSchema, UpdateUserFormData } from '@/validators/userSchema';
import { userService } from '@/services/users.service';
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
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditConductorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor: User | null;
  onSuccess: () => void;
}

export function EditConductorDialog({
  open,
  onOpenChange,
  conductor,
  onSuccess,
}: EditConductorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (conductor) {
      reset({
        firstName: conductor.firstName,
        lastName: conductor.lastName,
        email: conductor.email,
        phone: conductor.phone || '',
        idCard: conductor.idCard,
      });
    }
  }, [conductor, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!conductor) return;

    setIsLoading(true);
    try {
      await userService.update(conductor.id, data);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
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
          <DialogTitle className="text-xl font-bold">Editar Conductor</DialogTitle>
          <DialogDescription>
            Modifica los datos del conductor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="w-full h-11 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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