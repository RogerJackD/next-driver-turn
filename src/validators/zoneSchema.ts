import { z } from 'zod';

export const zoneSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  address: z
    .string()
    .min(1, 'La dirección es requerida')
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .trim(),

  latitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
      'Latitud debe estar entre -90 y 90',
    ),

  longitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
      'Longitud debe estar entre -180 y 180',
    ),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;
