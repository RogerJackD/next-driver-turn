import { z } from 'zod';

export const createVehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(6, 'La placa debe tener al menos 6 caracteres')
    .max(10, 'La placa no puede exceder 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones'),

  brand: z
    .string()
    .min(1, 'La marca es requerida')
    .max(50, 'La marca no puede exceder 50 caracteres')
    .trim(),

  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(50, 'El modelo no puede exceder 50 caracteres')
    .trim(),

  year: z
    .number()
    .min(1900, 'El año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 1, 'El año no puede ser mayor al próximo año'),

  color: z
    .string()
    .max(30, 'El color no puede exceder 30 caracteres')
    .optional()
    .or(z.literal('')),

  driverIds: z
    .array(z.number())
    .optional(),
});

export const updateVehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(6, 'La placa debe tener al menos 6 caracteres')
    .max(10, 'La placa no puede exceder 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones')
    .optional(),

  brand: z
    .string()
    .min(1, 'La marca es requerida')
    .max(50, 'La marca no puede exceder 50 caracteres')
    .trim()
    .optional(),

  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(50, 'El modelo no puede exceder 50 caracteres')
    .trim()
    .optional(),

  year: z
    .number()
    .min(1900, 'El año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 1, 'El año no puede ser mayor al próximo año')
    .optional(),

  color: z
    .string()
    .max(30, 'El color no puede exceder 30 caracteres')
    .optional()
    .or(z.literal('')),

  driverIds: z
    .array(z.number())
    .optional(),
});

export type CreateVehicleFormData = z.output<typeof createVehicleSchema>;
export type UpdateVehicleFormData = z.output<typeof updateVehicleSchema>;
