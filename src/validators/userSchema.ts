import { z } from 'zod';

// Schema para editar usuario (solo nombre de usuario)
export const editUserSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(100, 'El nombre de usuario no puede exceder 100 caracteres')
    .trim(),
});

export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(3, 'La contraseña debe tener al menos 3 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'La contraseña solo puede contener letras y números'),

  confirmPassword: z
    .string()
    .min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type EditUserFormData = z.infer<typeof editUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;