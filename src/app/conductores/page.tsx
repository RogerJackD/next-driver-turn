'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { userService } from '@/services/users.service';
import { ConductorFilters } from '@/components/drivers/ConductorFilters';
import { ConductorList } from '@/components/drivers/ConductorList';

export default function ConductoresPage() {
  const router = useRouter();
  const [conductores, setConductores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Verificar autenticación
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchConductores();
  }, [router]);

  const fetchConductores = async () => {
    try {
      setLoading(true);
      const data = await userService.getDrivers();
      setConductores(data);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userService.update(id, { status: newStatus });
      // Recargar lista
      await fetchConductores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-600 to-orange-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => router.push('/menu')}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/20 text-white shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Conductores</h1>
              <p className="text-orange-100 text-sm mt-1">
                {conductores.length} conductor{conductores.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <ConductorFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>
      </div>

      {/* Lista de conductores */}
      <div className="max-w-md mx-auto px-4 py-6">
        <ConductorList
          conductores={conductores}
          onToggleStatus={handleToggleStatus}
          onRefresh={fetchConductores}
        />
      </div>

      {/* Botón agregar conductor */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => console.log('Agregar conductor')}
          className="h-14 w-14 rounded-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}