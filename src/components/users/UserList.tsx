'use client';

import { User } from '@/types';
import { UserCard } from './UserCard';

interface UserListProps {
  users: User[];
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function UserList({ users, onToggleStatus, onRefresh }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No se encontraron resultados</p>
        <p className="text-sm mt-2">Intenta cambiar los filtros de búsqueda o agrega nuevos usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onToggleStatus={onToggleStatus}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
