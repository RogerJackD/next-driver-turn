'use client';

import { useState, useEffect } from 'react';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface VehicleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehicleDto | UpdateVehicleDto) => Promise<void>;
  vehicle?: Vehicle | null;
  loading?: boolean;
}

export function VehicleFormDialog({
  open,
  onClose,
  onSubmit,
  vehicle,
  loading = false,
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState<CreateVehicleDto | UpdateVehicleDto>({
    licensePlate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
      });
    } else {
      setFormData({
        licensePlate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
      });
    }
    setErrors({});
  }, [vehicle, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.licensePlate?.trim()) {
      newErrors.licensePlate = 'La placa es requerida';
    } else if (formData.licensePlate.length < 6 || formData.licensePlate.length > 10) {
      newErrors.licensePlate = 'La placa debe tener entre 6 y 10 caracteres';
    }

    if (!formData.brand?.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'El modelo es requerido';
    }

    if (!formData.year) {
      newErrors.year = 'El año es requerido';
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Año inválido';
    }

    if (!formData.color?.trim()) {
      newErrors.color = 'El color es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del vehículo'
                : 'Completa los datos del nuevo vehículo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Placa */}
            <div className="grid gap-2">
              <Label htmlFor="licensePlate">
                Placa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className={errors.licensePlate ? 'border-red-500' : ''}
              />
              {errors.licensePlate && (
                <p className="text-xs text-red-500">{errors.licensePlate}</p>
              )}
            </div>

            {/* Marca */}
            <div className="grid gap-2">
              <Label htmlFor="brand">
                Marca <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Toyota"
                className={errors.brand ? 'border-red-500' : ''}
              />
              {errors.brand && (
                <p className="text-xs text-red-500">{errors.brand}</p>
              )}
            </div>

            {/* Modelo */}
            <div className="grid gap-2">
              <Label htmlFor="model">
                Modelo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Corolla"
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-xs text-red-500">{errors.model}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Año */}
              <div className="grid gap-2">
                <Label htmlFor="year">
                  Año <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                  placeholder="2024"
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && (
                  <p className="text-xs text-red-500">{errors.year}</p>
                )}
              </div>

              {/* Color */}
              <div className="grid gap-2">
                <Label htmlFor="color">
                  Color <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="Blanco"
                  className={errors.color ? 'border-red-500' : ''}
                />
                {errors.color && (
                  <p className="text-xs text-red-500">{errors.color}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{isEditing ? 'Guardar Cambios' : 'Crear Vehículo'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}