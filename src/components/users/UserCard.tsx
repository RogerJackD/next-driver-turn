'use client';

import { User } from '@/types';
import { UserStatus, UserRole } from '@/constants/enums';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Car,
  User as UserIcon,
  Clock,
} from 'lucide-react';
import { userService } from '@/services/users.service';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBlock: (user: User) => void;
  onUnblock: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  onResetPassword,
}: UserCardProps) {
  const isActive = user.status === UserStatus.ACTIVE;
  const isNew = user.status === UserStatus.NEW;
  const isBlocked = user.status === UserStatus.BLOCKED;
  const isAdmin = user.role === UserRole.ADMIN;

  // Nombre para mostrar: si tiene conductor, usar nombre del conductor, si no, el username
  const displayName = userService.getDisplayName(user);
  const hasDriver = !!user.driver;

  // Iniciales para el avatar
  const getInitials = () => {
    if (user.driver) {
      return `${user.driver.firstName.charAt(0)}${user.driver.lastName.charAt(0)}`;
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Color del badge de estado
  const getStatusBadge = () => {
    switch (user.status) {
      case UserStatus.ACTIVE:
        return { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' };
      case UserStatus.NEW:
        return { label: 'Nuevo', className: 'bg-amber-100 text-amber-700' };
      case UserStatus.BLOCKED:
        return { label: 'Bloqueado', className: 'bg-red-100 text-red-700' };
      default:
        return { label: 'Desconocido', className: 'bg-gray-100 text-gray-700' };
    }
  };

  // Color del avatar según estado y rol
  const getAvatarColor = () => {
    if (!isActive && !isNew) return 'bg-gray-400';
    if (isAdmin) return 'bg-gradient-to-br from-blue-500 to-blue-600';
    return 'bg-gradient-to-br from-green-500 to-green-600';
  };

  // Color del borde izquierdo
  const getBorderColor = () => {
    if (isBlocked) return 'border-l-red-500';
    if (isNew) return 'border-l-amber-500';
    if (!isActive) return 'border-l-gray-400';
    if (isAdmin) return 'border-l-blue-500';
    return 'border-l-green-500';
  };

  const statusBadge = getStatusBadge();

  return (
    <Card
      className={`p-4 border-l-4 ${getBorderColor()} ${isActive || isNew ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${getAvatarColor()}`}
        >
          {getInitials()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Nombre para mostrar */}
            <h3 className="font-semibold text-gray-900 truncate">
              {hasDriver ? displayName : `Usuario: ${user.name}`}
            </h3>

            {/* Badge de rol */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" />
                  Admin
                </>
              ) : (
                <>
                  <Car className="w-3 h-3" />
                  Conductor
                </>
              )}
            </span>

            {/* Badge de estado */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${statusBadge.className}`}
            >
              {isNew && <Clock className="w-3 h-3" />}
              {isBlocked && <Lock className="w-3 h-3" />}
              {statusBadge.label}
            </span>
          </div>

          {/* Info adicional */}
          <div className="space-y-1 text-sm text-gray-600">
            {/* Username siempre visible si tiene conductor */}
            {hasDriver && (
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Usuario: {user.name}</span>
              </div>
            )}

            {/* Info del conductor si existe */}
            {user.driver && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  DNI: {user.driver.idCard}
                </span>
                {user.driver.phone && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      Tel: {user.driver.phone}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu de opciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Editar - deshabilitado si está bloqueado */}
            <DropdownMenuItem
              onClick={() => onEdit(user)}
              disabled={isBlocked}
              className={`cursor-pointer ${isBlocked ? 'opacity-50' : ''}`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>

            {/* Resetear contraseña - deshabilitado si está bloqueado */}
            <DropdownMenuItem
              onClick={() => onResetPassword(user)}
              disabled={isBlocked}
              className={`cursor-pointer text-amber-600 ${isBlocked ? 'opacity-50' : ''}`}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Resetear clave
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Bloquear/Desbloquear */}
            {isBlocked ? (
              <DropdownMenuItem
                onClick={() => onUnblock(user)}
                className="cursor-pointer text-green-600"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onBlock(user)}
                className="cursor-pointer text-orange-600"
              >
                <Lock className="w-4 h-4 mr-2" />
                Bloquear
              </DropdownMenuItem>
            )}

            {/* Eliminar */}
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="cursor-pointer text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}