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
import { MoreVertical, Edit, Power, PowerOff, Mail, Phone, CreditCard } from 'lucide-react';
import { ConfirmStatusDialog } from './dialogs/ConfirmStatusDialog';

interface ConductorCardProps {
  conductor: User;
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function ConductorCard({ conductor, onToggleStatus, onRefresh }: ConductorCardProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = conductor.status === 'active';

  const handleEdit = () => {
    console.log('Editar conductor:', conductor.id);
  };

  const handleStatusChange = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    setIsLoading(true);
    try {
      await onToggleStatus(conductor.id, conductor.status);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={`p-4 border-l-4 ${isActive ? 'border-l-green-500 bg-white' : 'border-l-gray-400 bg-gray-50'}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
            isActive ? 'bg-linear-to-br from-orange-500 to-orange-600' : 'bg-gray-400'
          }`}>
            {conductor.firstName.charAt(0)}{conductor.lastName.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {conductor.firstName} {conductor.lastName}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>{conductor.idCard}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{conductor.phone}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4" />
                <span className="truncate">{conductor.email}</span>
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

      {/* Dialog de confirmación */}
      <ConfirmStatusDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        conductor={conductor}
        onConfirm={confirmStatusChange}
        isLoading={isLoading}
      />
    </>
  );
}