'use client';

import { Vehicle } from '@/types';
import { VehicleStatus } from '@/constants/enums';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Car,
  User,
  Settings,
  Power,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { vehiclesService } from '@/services/vehicles.service';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onToggleStatus: (id: number, currentStatus: VehicleStatus) => void;
  onDelete?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  onEdit,
  onToggleStatus,
  onDelete,
}: VehicleCardProps) {
  const currentAssignment = vehiclesService.getCurrentDriverFromRelations(vehicle);
  const hasDriver = !!currentAssignment?.driver;
  const isActive = vehiclesService.isActive(vehicle);

  const getStatusColor = (status: VehicleStatus) => {
    return status === VehicleStatus.ACTIVE
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: VehicleStatus) => {
    return status === VehicleStatus.ACTIVE ? 'Activo' : 'Inactivo';
  };

  return (
    <Card className={`p-4 hover:shadow-lg transition-all duration-200 border ${
      isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Icono y contenido principal */}
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Icono del vehículo */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isActive
              ? 'bg-gradient-to-br from-orange-500 to-orange-600'
              : 'bg-gray-400'
          }`}>
            <Car className="w-6 h-6 text-white" />
          </div>

          {/* Información del vehículo */}
          <div className="flex-1 min-w-0">
            {/* Placa y estado */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-lg truncate">
                {vehicle.licensePlate}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>

            {/* Marca y modelo */}
            <p className="text-sm text-gray-600 mb-2">
              {vehicle.brand} {vehicle.model} ({vehicle.year}){vehicle.color ? ` - ${vehicle.color}` : ''}
            </p>

            {/* Conductor asignado */}
            {hasDriver && currentAssignment?.driver && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium truncate">
                  {currentAssignment.driver.lastName} - {currentAssignment.driver.idCard}
                </span>
              </div>
            )}

            {!hasDriver && (
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-2 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Sin conductor</span>
              </div>
            )}
          </div>
        </div>

        {/* Menú de acciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onEdit(vehicle)}>
              <Settings className="w-4 h-4 mr-2" />
              Editar vehículo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onToggleStatus(vehicle.id, vehicle.status)}
              className={isActive ? 'text-red-600' : 'text-green-600'}
            >
              <Power className="w-4 h-4 mr-2" />
              {isActive ? 'Desactivar' : 'Reactivar'}
            </DropdownMenuItem>

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(vehicle)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar vehículo
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
