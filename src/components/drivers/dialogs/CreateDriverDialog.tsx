'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDriverSchema, CreateDriverFormData } from '@/validators/driverSchema';
import { driverService } from '@/services/drivers.service';
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
import { Loader2, Search, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateDriverDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDriverDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [dniSearched, setDniSearched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<CreateDriverFormData>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      idCard: '',
      firstName: '',
      lastName: '',
      phone: '',
      observation: '',
      createUser: false,
    },
  });

  const idCardValue = watch('idCard');
  const createUserValue = watch('createUser');

  const isValidDni = (dni: string): boolean => {
    return /^\d{8}$/.test(dni);
  };

  const handleSearchDni = async () => {
    const isValid = await trigger('idCard');
    if (!isValid) return;

    setIsSearchingDni(true);
    setApiError(null);
    setDniSearched(false);

    try {
      const person = await driverService.getPersonByDni(idCardValue);

      // Apellidos: apellidoPaterno + apellidoMaterno
      const fullLastName = `${person.apellidoPaterno} ${person.apellidoMaterno}`.trim();

      setValue('firstName', person.nombres, { shouldValidate: true });
      setValue('lastName', fullLastName, { shouldValidate: true });
      setDniSearched(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al consultar DNI';
      setApiError(errorMessage);
    } finally {
      setIsSearchingDni(false);
    }
  };

  const onSubmit = async (data: CreateDriverFormData) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await driverService.create({
        idCard: data.idCard,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        observation: data.observation || undefined,
        createUser: data.createUser,
      });

      // Mensaje de éxito
      let message = 'Conductor creado exitosamente';
      if (data.createUser && result.user) {
        message += `. Usuario: ${result.user.name} / Contraseña: 123`;
      }
      setSuccessMessage(message);

      // Esperar un momento para mostrar el mensaje y luego cerrar
      setTimeout(() => {
        reset();
        setDniSearched(false);
        setSuccessMessage(null);
        onOpenChange(false);
        onSuccess();
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear conductor';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setDniSearched(false);
    setApiError(null);
    setSuccessMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nuevo Conductor
          </DialogTitle>
          <DialogDescription>
            Ingresa el DNI para buscar los datos del conductor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* DNI con botón de búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="idCard">DNI *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="idCard"
                  {...register('idCard')}
                  className="h-11"
                  placeholder="12345678"
                  maxLength={8}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, '');
                    setValue('idCard', value);
                    setDniSearched(false);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4"
                onClick={handleSearchDni}
                disabled={isSearchingDni || !isValidDni(idCardValue)}
              >
                {isSearchingDni ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.idCard && (
              <p className="text-sm text-red-600">{errors.idCard.message}</p>
            )}
            {dniSearched && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Datos encontrados
              </p>
            )}
          </div>

          {/* Nombre */}
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

          {/* Apellido */}
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

          {/* Checkbox crear usuario */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="createUser"
              {...register('createUser')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1">
              <Label htmlFor="createUser" className="font-medium cursor-pointer">
                Crear usuario del sistema
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Se creará un usuario con el DNI como nombre de usuario y contraseña "123"
              </p>
            </div>
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

          {/* Info adicional si se marca crear usuario */}
          {createUserValue && !successMessage && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Credenciales del usuario:</strong>
                <br />
                Usuario: {idCardValue || '[DNI]'}
                <br />
                Contraseña: 123
              </p>
            </div>
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
                  Creando...
                </>
              ) : (
                'Crear Conductor'
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
