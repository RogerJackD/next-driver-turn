'use client';

import { VehicleStop } from '@/types';
import { VehicleStopStatus } from '@/constants/enums';
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
  MapPin,
  Navigation,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';

interface ZoneCardProps {
  zone: VehicleStop;
  onEdit: (zone: VehicleStop) => void;
  onDelete: (zone: VehicleStop) => void;
  onActivate: (zone: VehicleStop) => void;
  onDeactivate: (zone: VehicleStop) => void;
}

export function ZoneCard({
  zone,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: ZoneCardProps) {
  const isActive = zone.status === VehicleStopStatus.ACTIVE;
  const isInactive = zone.status === VehicleStopStatus.INACTIVE;

  const getStatusBadge = () => {
    switch (zone.status) {
      case VehicleStopStatus.ACTIVE:
        return { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' };
      case VehicleStopStatus.INACTIVE:
        return { label: 'Inactivo', className: 'bg-gray-100 text-gray-700' };
      default:
        return { label: 'Eliminado', className: 'bg-red-100 text-red-700' };
    }
  };

  const getBorderColor = () => {
    if (isActive) return 'border-l-emerald-500';
    if (isInactive) return 'border-l-gray-400';
    return 'border-l-red-400';
  };

  const statusBadge = getStatusBadge();

  return (
    <Card
      className={`p-4 border-l-4 ${getBorderColor()} ${isActive ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isActive
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gray-400'
          }`}
        >
          <MapPin className="w-6 h-6 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {zone.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${statusBadge.className}`}
            >
              {isInactive && <Clock className="w-3 h-3" />}
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Navigation className="w-4 h-4 shrink-0" />
            <span className="truncate">{zone.address}</span>
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
            {/* Editar */}
            <DropdownMenuItem
              onClick={() => onEdit(zone)}
              className="cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Activar (solo si está inactivo) */}
            {isInactive && (
              <DropdownMenuItem
                onClick={() => onActivate(zone)}
                className="cursor-pointer text-emerald-600"
              >
                <Power className="w-4 h-4 mr-2" />
                Activar
              </DropdownMenuItem>
            )}

            {/* Desactivar (solo si está activo) */}
            {isActive && (
              <DropdownMenuItem
                onClick={() => onDeactivate(zone)}
                className="cursor-pointer text-orange-600"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            )}

            {/* Eliminar */}
            <DropdownMenuItem
              onClick={() => onDelete(zone)}
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
