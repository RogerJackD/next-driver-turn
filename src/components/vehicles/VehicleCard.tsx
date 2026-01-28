import { Vehicle } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Car, 
  User, 
  Calendar,
  Settings,
  Power,
  UserPlus
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
  onAssignDriver: (vehicle: Vehicle) => void;
  onUnassignDriver: (vehicle: Vehicle) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
}

export function VehicleCard({ 
  vehicle, 
  onEdit, 
  onAssignDriver,
  onUnassignDriver,
  onToggleStatus 
}: VehicleCardProps) {
  const currentDriver = vehiclesService.getCurrentDriverFromRelations(vehicle);
  const hasDriver = !!currentDriver;

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Activo' : 'Inactivo';
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 border border-gray-200">
      <div className="flex items-start justify-between gap-3">
        {/* Icono y contenido principal */}
        <div className="flex gap-3 flex-1 min-w-0">
          {/* Icono del vehículo */}
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0">
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
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </p>

            {/* Detalles adicionales */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Color: {vehicle.color}</span>
              </div>
              
              {vehicle.internalNumber && vehicle.internalNumber !== 'N/A' && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Nº Interno: {vehicle.internalNumber}</span>
                </div>
              )}

              {/* Conductor asignado */}
              {hasDriver && currentDriver?.user && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md mt-2">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {currentDriver.user.firstName} {currentDriver.user.lastName}
                  </span>
                </div>
              )}

              {!hasDriver && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md mt-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Sin conductor asignado</span>
                </div>
              )}
            </div>
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

            {hasDriver ? (
              <DropdownMenuItem 
                onClick={() => onUnassignDriver(vehicle)}
                className="text-orange-600"
              >
                <User className="w-4 h-4 mr-2" />
                Desasignar conductor
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onAssignDriver(vehicle)}
                disabled={vehicle.status !== 'active'}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Asignar conductor
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => onToggleStatus(vehicle.id, vehicle.status)}
              disabled={hasDriver}
              className={vehicle.status === 'active' ? 'text-red-600' : 'text-green-600'}
            >
              <Power className="w-4 h-4 mr-2" />
              {vehicle.status === 'active' ? 'Desactivar' : 'Reactivar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}