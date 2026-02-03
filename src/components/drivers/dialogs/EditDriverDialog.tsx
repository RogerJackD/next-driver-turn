'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDriverSchema, UpdateDriverFormData } from '@/validators/driverSchema';
import { driverService } from '@/services/drivers.service';
import { Driver } from '@/types';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Pencil, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';

interface EditDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  onSuccess: () => void;
}

export function EditDriverDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: EditDriverDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDriverFormData>({
    resolver: zodResolver(updateDriverSchema),
  });

  useEffect(() => {
    if (driver) {
      reset({
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone || '',
        observation: driver.observation || '',
      });
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [driver, reset]);

  const onSubmit = async (data: UpdateDriverFormData) => {
    if (!driver) return;

    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await driverService.update(driver.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        observation: data.observation || undefined,
      });

      setSuccessMessage('Conductor actualizado exitosamente');

      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar conductor';
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Conductor
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del conductor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* DNI - Solo lectura */}
          <div className="space-y-2">
            <Label htmlFor="idCard">DNI</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="idCard"
                value={driver?.idCard || ''}
                className="h-11 pl-10 bg-gray-100 text-gray-600 cursor-not-allowed"
                disabled
                readOnly
              />
            </div>
            <p className="text-xs text-gray-500">El DNI no puede ser modificado</p>
          </div>

          {/* Nombres */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="h-11"
              placeholder="Juan Carlos"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className="h-11"
              placeholder="Pérez García"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              {...register('phone')}
              className="h-11"
              placeholder="987654321"
              maxLength={20}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <Label htmlFor="observation">Observación (opcional)</Label>
            <Input
              id="observation"
              {...register('observation')}
              className="h-11"
              placeholder="Alguna nota adicional..."
            />
            {errors.observation && (
              <p className="text-sm text-red-600">{errors.observation.message}</p>
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
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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
