import { z } from 'zod';

export const profileSchema = z.object({
  phone: z
    .string()
    .length(9, 'El celular debe tener 9 dígitos')
    .regex(/^[0-9]+$/, 'El celular solo puede contener números')
    .optional()
    .or(z.literal('')),
  newPassword: z
    .string()
    .min(3, 'La contraseña debe tener al menos 3 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'La contraseña solo puede contener letras y números')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
);

export type ProfileFormData = z.infer<typeof profileSchema>;
