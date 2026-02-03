'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Power, PowerOff, Mail, Phone, CreditCard, Shield, Car } from 'lucide-react';
import { ConfirmStatusDialog } from './dialogs/ConfirmStatusDialog';
import { EditUserDialog } from './dialogs/EditUserDialog';
import { userAdminService } from '@/services/userAdmin.service';

interface UserCardProps {
  user: User;
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function UserCard({ user, onToggleStatus, onRefresh }: UserCardProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = user.status === 'active';
  const isAdmin = userAdminService.isAdmin(user);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    setIsLoading(true);
    try {
      await onToggleStatus(user.id, user.status);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={`p-4 border-l-4 ${isActive ? 'border-l-blue-500 bg-white' : 'border-l-gray-400 bg-gray-50'}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
            isActive
              ? isAdmin
                ? 'bg-linear-to-br from-blue-500 to-blue-600'
                : 'bg-linear-to-br from-green-500 to-green-600'
              : 'bg-gray-400'
          }`}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              {/* Badge de rol */}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                isAdmin
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
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
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>{user.idCard}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
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
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleStatusChange}
                className={`cursor-pointer ${isActive ? 'text-red-600' : 'text-green-600'}`}
              >
                {isActive ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Dialog de confirmación de estado */}
      <ConfirmStatusDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        user={user}
        onConfirm={confirmStatusChange}
        isLoading={isLoading}
      />

      {/* Dialog de edición */}
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onSuccess={onRefresh}
      />
    </>
  );
}
