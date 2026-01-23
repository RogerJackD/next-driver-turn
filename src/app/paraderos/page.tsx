'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vehicleDriverService } from '@/services/vehicleDriverService';
import { VehicleDriverAssignment } from '@/types';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Car, Phone, CreditCard, Calendar, Loader2, ArrowRight, MapPin, ArrowLeft } from 'lucide-react';

type Paradero = 'CAMIARA' | 'TOQUEPALA';

export default function Paraderos() {
  const router = useRouter();
  const [allAssignments, setAllAssignments] = useState<VehicleDriverAssignment[]>([]);
  const [displayedAssignments, setDisplayedAssignments] = useState<VehicleDriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<VehicleDriverAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParadero, setCurrentParadero] = useState<Paradero>('CAMIARA');

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    // Distribuir conductores entre paraderos
    distributeDrivers();
  }, [allAssignments, currentParadero]);

  const fetchAssignments = async () => {
    try {
      const data = await vehicleDriverService.getAssignments();
      setAllAssignments(data);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributeDrivers = () => {
    if (allAssignments.length === 0) {
      setDisplayedAssignments([]);
      return;
    }

    // Dividir conductores entre los dos paraderos
    // Los índices pares van a CAMIARA, los impares a TOQUEPALA
    const camiaraDrivers = allAssignments.filter((_, index) => index % 2 === 0);
    const toquepalanDrivers = allAssignments.filter((_, index) => index % 2 !== 0);

    if (currentParadero === 'CAMIARA') {
      setDisplayedAssignments(camiaraDrivers);
    } else {
      setDisplayedAssignments(toquepalanDrivers);
    }
  };

  const handleDriverClick = (assignment: VehicleDriverAssignment) => {
    setSelectedDriver(assignment);
    setIsModalOpen(true);
  };

  const toggleParadero = () => {
    setCurrentParadero(prev => prev === 'CAMIARA' ? 'TOQUEPALA' : 'CAMIARA');
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto space-y-4">
          {/* Botón Volver y Título */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/menu')}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/20 text-white flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Paraderos</h1>
              <p className="text-green-100 text-sm mt-1">Conductores disponibles</p>
            </div>
          </div>

          {/* Selector de Paradero */}
          <Button
            onClick={toggleParadero}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            <span>{currentParadero}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Lista de Conductores */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {displayedAssignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay conductores en {currentParadero}</p>
          </div>
        ) : (
          <>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              {displayedAssignments.length} conductor{displayedAssignments.length !== 1 ? 'es' : ''} en {currentParadero}
            </div>
            {displayedAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                onClick={() => handleDriverClick(assignment)}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-98 border-l-4 border-l-green-500"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {assignment.user.firstName} {assignment.user.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Car className="w-4 h-4" />
                      <span className="font-medium">{assignment.vehicle.licensePlate}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{assignment.vehicle.brand} {assignment.vehicle.model}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Botón Ingresar Fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Button
            className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            INGRESAR A {currentParadero}
          </Button>
        </div>
      </div>

      {/* Modal de Información */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Información del Conductor
            </DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4 py-2">
              {/* Avatar y Nombre */}
              <div className="text-center pb-4 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedDriver.user.firstName} {selectedDriver.user.lastName}
                </h3>
              </div>

              {/* Información del Conductor */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-900">{selectedDriver.user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">DNI</p>
                    <p className="font-semibold text-gray-900">{selectedDriver.user.idCard}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Vehículo</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDriver.vehicle.licensePlate} - {selectedDriver.vehicle.brand} {selectedDriver.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDriver.vehicle.color} • {selectedDriver.vehicle.year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de asignación</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedDriver.assignmentDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}