import { z } from 'zod';

export const createDriverSchema = z.object({
  idCard: z
    .string()
    .min(1, 'El DNI es requerido')
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d{8}$/, 'El DNI debe contener exactamente 8 dígitos numéricos'),

  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .trim(),

  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[0-9+\-\s()]+$/, 'El teléfono debe ser un número válido'),

  observation: z
    .string()
    .max(500, 'La observación no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),

  createUser: z
    .boolean()
    .optional()
    .default(false),
});

export const dniSearchSchema = z.object({
  dni: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 caracteres')
    .regex(/^\d{8}$/, 'El DNI debe contener exactamente 8 dígitos numéricos'),
});

export type CreateDriverFormData = z.infer<typeof createDriverSchema>;
export type DniSearchFormData = z.infer<typeof dniSearchSchema>;
