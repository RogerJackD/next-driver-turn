'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { ConductorFilters } from '@/components/drivers/DriverFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { User, UserStatus } from '@/types';
import { userService } from '@/services/users.service';
import { CreateConductorDialog } from '@/components/drivers/dialogs/CreateDriverDialog';
import { ConductorList } from '@/components/drivers/DriverList';

export default function ConductoresPage() {
  const router = useRouter();
  const [conductores, setConductores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Si solo hay filtro de estado sin búsqueda de texto, usar endpoints específicos
      if (!searchQuery.trim() && statusFilter !== 'all') {
        let data: User[];
        if (statusFilter === 'active') {
          data = await userService.getActive();
        } else {
          data = await userService.getInactive();
        }
        setConductores(data);
        return;
      }

      // Si hay búsqueda de texto, usar el endpoint de search
      const params: { q?: string; status?: UserStatus } = {};
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await userService.search(params);
      setConductores(data);
    } catch (error) {
      console.error('Error al buscar conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    fetchConductores();
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userService.update(id, { status: newStatus });
      // Re-ejecutar búsqueda actual
      if (searchQuery || statusFilter !== 'all') {
        await handleSearch();
      } else {
        await fetchConductores();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (loading && conductores.length === 0) {
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

          {/* Filtros y búsqueda */}
          <ConductorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Lista de conductores */}
      <div className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
          </div>
        ) : (
          <ConductorList
            conductores={conductores}
            onToggleStatus={handleToggleStatus}
            onRefresh={fetchConductores}
          />
        )}
      </div>

      {/* Botón agregar conductor */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Dialog de creación */}
      <CreateConductorDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchConductores}
      />
    </div>
  );
}