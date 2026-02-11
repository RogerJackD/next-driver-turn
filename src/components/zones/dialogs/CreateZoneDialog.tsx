'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import { zoneSchema, ZoneFormData } from '@/validators/zoneSchema';
import { useGeocoding } from '@/hooks/useGeocoding';
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
  MapPin,
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateZoneDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateZoneDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { geocode, isLoading: isGeocoding, error: geocodeError } = useGeocoding();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: '',
      address: '',
      latitude: '',
      longitude: '',
    },
  });

  const addressValue = watch('address');

  const handleSearchCoordinates = async () => {
    const address = addressValue?.trim();
    if (!address) {
      setApiError('Ingresa una dirección primero');
      return;
    }

    setApiError(null);
    try {
      const result = await geocode(address);
      setValue('latitude', result.latitude.toString());
      setValue('longitude', result.longitude.toString());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al buscar coordenadas';
      setApiError(errorMessage);
    }
  };

  const onSubmit = async (data: ZoneFormData) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      await vehicleStopsService.create({
        name: data.name,
        address: data.address,
        ...(data.latitude ? { latitude: Number(data.latitude) } : {}),
        ...(data.longitude ? { longitude: Number(data.longitude) } : {}),
      });
      setSuccessMessage('Zona creada exitosamente');

      setTimeout(() => {
        reset();
        setSuccessMessage(null);
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear zona';
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
            <MapPin className="h-5 w-5" />
            Nueva Zona
          </DialogTitle>
          <DialogDescription>
            Ingresa los datos de la nueva zona o paradero
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: TOQUEPALA"
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Dirección <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Ej: Av. Principal 123, Lima, Perú"
              className="h-11"
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Botón Buscar Coordenadas */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSearchCoordinates}
            disabled={!addressValue || isGeocoding || isLoading}
            className="w-full h-10"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Coordenadas
              </>
            )}
          </Button>

          {/* Latitud y Longitud en una fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud (opcional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="Ej: -17.634"
                className="h-11"
              />
              {errors.latitude && (
                <p className="text-sm text-red-600">{errors.latitude.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud (opcional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="Ej: -71.109"
                className="h-11"
              />
              {errors.longitude && (
                <p className="text-sm text-red-600">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          {/* Mensajes */}
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
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Zona'
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
