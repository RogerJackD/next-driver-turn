import { z } from 'zod';

export const createUserSchema = z.object({
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

  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim()
    .toLowerCase(),

  phone: z
    .string()
    .length(9, 'El teléfono debe tener exactamente 9 dígitos')
    .regex(/^9\d{8}$/, 'El teléfono debe empezar con 9 y tener 9 dígitos')
    .optional()
    .or(z.literal('')),

  idCard: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d{8}$/, 'El DNI debe contener solo números'),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;


export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .trim()
    .optional(),

  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim()
    .toLowerCase()
    .optional(),

  phone: z
    .string()
    .length(9, 'El teléfono debe tener exactamente 9 dígitos')
    .regex(/^9\d{8}$/, 'El teléfono debe empezar con 9 y tener 9 dígitos')
    .optional()
    .or(z.literal('')),

  idCard: z
    .string()
    .length(8, 'El DNI debe tener exactamente 8 dígitos')
    .regex(/^\d{8}$/, 'El DNI debe contener solo números')
    .optional(),

  status: z
    .enum(['active', 'inactive', 'suspended'], {
      message: 'Estado inválido'
    })
    .optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;