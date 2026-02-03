import { Driver } from '@/types';
import { driverService } from '@/services/drivers.service';
import { Card } from '@/components/ui/card';
import { Phone, CreditCard, Car, CircleSlash } from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  const vehicle = driverService.getVehicle(driver);
  const hasVehicle = !!vehicle;

  return (
    <Card className={`p-4 border-l-4 ${hasVehicle ? 'border-l-green-500 bg-white' : 'border-l-gray-300 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${
          hasVehicle ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gray-400'
        }`}>
          {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {driver.firstName} {driver.lastName}
            </h3>
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

        {/* Vehicle status */}
        <div className="shrink-0">
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
        </div>
      </div>
    </Card>
  );
}
