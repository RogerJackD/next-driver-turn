'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save, IdCard, User, Phone, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authUtils } from '@/utils/auth';
import { userService } from '@/services/users.service';
import { profileSchema, type ProfileFormData } from '@/validators/profileSchema';
import type { UserProfile, UpdateProfileDto } from '@/types';

export default function MiPerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await userService.getMyProfile();
        setProfile(data);
        if (data.driver?.phone) {
          reset({ phone: data.driver.phone });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setErrorMessage('Error al cargar el perfil');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [router, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updateData: UpdateProfileDto = {};

      if (data.newPassword) {
        updateData.newPassword = data.newPassword;
      }

      if (profile?.isDriver && data.phone) {
        updateData.phone = data.phone;
      }

      if (!updateData.newPassword && !updateData.phone) {
        setErrorMessage('No hay cambios para guardar');
        setIsSaving(false);
        return;
      }

      await userService.updateMyProfile(updateData);
      setSuccessMessage('Perfil actualizado correctamente');

      // Limpiar campos de contraseña
      reset({
        phone: data.phone || profile?.driver?.phone || '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const inputClass =
    'h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500';
  const readOnlyClass =
    'h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600';
  const labelClass = 'text-sm font-medium text-gray-700 mb-1 flex items-center gap-2';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-6 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Button
            onClick={() => router.push('/menu')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Mi Perfil</h1>
            <p className="text-purple-100 text-sm">Información personal</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Info del conductor (solo si es conductor) */}
          {profile?.isDriver && profile.driver && (
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base">Datos del Conductor</h2>

              {/* DNI */}
              <div>
                <label className={labelClass}>
                  <IdCard className="w-4 h-4 text-gray-500" />
                  DNI
                </label>
                <input
                  type="text"
                  value={profile.driver.idCard}
                  readOnly
                  className={readOnlyClass}
                />
              </div>

              {/* Nombre completo */}
              <div>
                <label className={labelClass}>
                  <User className="w-4 h-4 text-gray-500" />
                  Conductor
                </label>
                <input
                  type="text"
                  value={`${profile.driver.firstName} ${profile.driver.lastName}`}
                  readOnly
                  className={readOnlyClass}
                />
              </div>

              {/* Celular (editable) */}
              <div>
                <label className={labelClass}>
                  <Phone className="w-4 h-4 text-gray-500" />
                  Celular
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="987654321"
                  className={inputClass}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </Card>
          )}

          {/* Info del usuario (solo si NO es conductor) */}
          {!profile?.isDriver && (
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base">Datos del Usuario</h2>

              <div>
                <label className={labelClass}>
                  <User className="w-4 h-4 text-gray-500" />
                  Usuario
                </label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  readOnly
                  className={readOnlyClass}
                />
              </div>
            </Card>
          )}

          {/* Cambiar contraseña */}
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-base">Cambiar Contraseña</h2>

            <div>
              <label className={labelClass}>
                <Lock className="w-4 h-4 text-gray-500" />
                Nueva contraseña
              </label>
              <input
                type="password"
                {...register('newPassword')}
                placeholder="Mínimo 3 caracteres"
                className={inputClass}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <Lock className="w-4 h-4 text-gray-500" />
                Repetir contraseña
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Repetir contraseña"
                className={inputClass}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </Card>

          {/* Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
