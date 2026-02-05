'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { UserList } from '@/components/users/UserList';
import { UserFilters } from '@/components/users/UserFilters';
import { CreateUserDialog } from '@/components/users/dialogs/CreateUserDialog';
import { EditUserDialog } from '@/components/users/dialogs/EditUserDialog';
import { ConfirmDeleteDialog } from '@/components/users/dialogs/ConfirmDeleteDialog';
import { ConfirmStatusDialog } from '@/components/users/dialogs/ConfirmStatusDialog';
import { ResetPasswordDialog } from '@/components/users/dialogs/ResetPasswordDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { UserStatus, UserRole } from '@/constants/enums';
import { userService } from '@/services/users.service';

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

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [router]);

  // Ejecutar búsqueda cuando cambian los filtros
  useEffect(() => {
    if (!loading) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true);

      // Si no hay filtros activos, obtener todos
      if (
        !debouncedSearchQuery.trim() &&
        statusFilter === 'all' &&
        roleFilter === 'all'
      ) {
        const data = await userService.getAll();
        setUsers(data);
        return;
      }

      // Construir parámetros de búsqueda
      const params: { q?: string; status?: UserStatus; role?: UserRole } = {};

      if (debouncedSearchQuery.trim()) {
        params.q = debouncedSearchQuery.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const data = await userService.search(params);
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, statusFilter, roleFilter]);

  // Handlers para las acciones
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const handleUnblockUser = (user: User) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  // Confirmar cambio de estado (bloquear/desbloquear)
  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;

    setIsStatusLoading(true);
    try {
      const newStatus =
        selectedUser.status === UserStatus.ACTIVE ||
        selectedUser.status === UserStatus.NEW
          ? UserStatus.BLOCKED
          : UserStatus.ACTIVE;

      await userService.update(selectedUser.id, { status: newStatus });
      setStatusDialogOpen(false);
      setSelectedUser(null);
      await handleSearch();
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsStatusLoading(false);
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
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
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onBlock={handleBlockUser}
          onUnblock={handleUnblockUser}
          onResetPassword={handleResetPassword}
        />
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Dialog para crear usuario */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSearch}
      />

      {/* Dialog para editar usuario */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onSuccess={handleSearch}
      />

      {/* Dialog para confirmar eliminación */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onSuccess={handleSearch}
      />

      {/* Dialog para confirmar bloqueo/desbloqueo */}
      {selectedUser && (
        <ConfirmStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          user={selectedUser}
          onConfirm={handleConfirmStatusChange}
          isLoading={isStatusLoading}
        />
      )}

      {/* Dialog para resetear contraseña */}
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        user={selectedUser}
        onSuccess={handleSearch}
      />
    </div>
  );
}