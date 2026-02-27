'use client';

import { Driver } from '@/types';
import { DriverStatus } from '@/constants/enums';
import { driverService } from '@/services/drivers.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Phone, CreditCard, Car, CircleSlash, MoreVertical, Pencil, Power, Trash2 } from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onToggleStatus?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}

export function DriverCard({ driver, onEdit, onToggleStatus, onDelete }: DriverCardProps) {
  const vehicle = driverService.getVehicle(driver);
  const hasVehicle = !!vehicle;
  const isActive = driver.status === DriverStatus.ACTIVE;

  return (
    <Card className={`p-4 border-l-4 ${
      !isActive
        ? 'border-l-gray-400 bg-gray-50 opacity-75'
        : hasVehicle
          ? 'border-l-green-500 bg-white'
          : 'border-l-gray-300 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
          !isActive
            ? 'bg-gray-400'
            : hasVehicle
              ? 'bg-gradient-to-br from-orange-500 to-orange-600'
              : 'bg-gray-400'
        }`}>
          {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {driver.firstName} {driver.lastName}
            </h3>
            {!isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 text-gray-600">
                Inactivo
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>{driver.idCard}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              <span>{driver.phone}</span>
            </div>
          </div>
        </div>

        {/* Actions & Vehicle status */}
        <div className="flex items-start gap-2 shrink-0">
          {/* Vehicle status */}
          {hasVehicle ? (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg">
              <Car className="w-4 h-4" />
              <span className="font-semibold text-sm">{vehicle.licensePlate}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-lg">
              <CircleSlash className="w-4 h-4" />
              <span className="text-xs">Sin auto</span>
            </div>
          )}

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onEdit(driver)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              {onToggleStatus && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onToggleStatus(driver)}
                    className={`cursor-pointer ${isActive ? 'text-red-600' : 'text-green-600'}`}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {isActive ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                </>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(driver)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
