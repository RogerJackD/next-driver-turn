'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { UserList } from '@/components/users/UserList';
import { UserFilters } from '@/components/users/UserFilters';
import { CreateUserDialog } from '@/components/users/dialogs/CreateUserDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { User, UserStatus, UserRole } from '@/types';
import { userAdminService } from '@/services/userAdmin.service';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [router]);

  useEffect(() => {
    if (!loading && users.length >= 0) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAdminService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);

      // Si no hay filtros activos, obtener todos
      if (!debouncedSearchQuery.trim() && statusFilter === 'all' && roleFilter === 'all') {
        const data = await userAdminService.getAll();
        setUsers(data);
        return;
      }

      // Construir parámetros de búsqueda
      const params: { q?: string; status?: UserStatus; role?: 0 | 1 } = {};

      if (debouncedSearchQuery.trim()) {
        params.q = debouncedSearchQuery.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const data = await userAdminService.search(params);
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await userAdminService.update(id, { status: newStatus === 'active' ? 2 : 1 });
      await handleSearch();
    } catch (error) {
      console.error('Error toggling status:', error);
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
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
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
              <h1 className="text-2xl font-bold">Usuarios</h1>
              <p className="text-blue-100 text-sm mt-1">
                Gestión de usuarios y roles
              </p>
            </div>
          </div>

          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            isSearching={isSearching}
            resultsCount={users.length}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <UserList
          users={users}
          onToggleStatus={handleToggleStatus}
          onRefresh={fetchUsers}
        />
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
