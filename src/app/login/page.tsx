'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Truck, User, Lock } from 'lucide-react';
import { authUtils } from '@/utils/auth';
import { authService } from '@/services/auth.service';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al menú
    if (authUtils.isAuthenticated()) {
      router.push('/menu');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar al servicio de autenticación
      const response = await authService.login({ email, password });

      // Guardar token y usuario en localStorage
      authUtils.setToken(response.accessToken);
      authUtils.setUser(response.user);

      // Redirigir al menú
      router.push('/menu');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Usuario o contraseña incorrectos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blue-600 to-blue-800 px-4 py-8">
      <div className="w-full max-w-sm">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold">TransApp</CardTitle>
              <CardDescription>Sistema de Transporte</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-xl font-semibold shadow-lg text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm opacity-90">
            Sistema de Gestión de Transporte v1.0
          </p>
        </div>
      </div>
    </div>
  );
}