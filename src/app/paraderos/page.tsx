'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vehicleDriverService } from '@/services/vehicleDriver.service';
import { VehicleDriverAssignment } from '@/types';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Car, Phone, CreditCard, Calendar, Loader2, ArrowRight, MapPin, ArrowLeft, LogOut } from 'lucide-react';

type Paradero = 'CAMIARA' | 'TOQUEPALA';

interface MyDriverData {
  paradero: Paradero;
  name: string;
  plate: string;
  timestamp: number;
}

export default function Paraderos() {
  const router = useRouter();
  const [allAssignments, setAllAssignments] = useState<VehicleDriverAssignment[]>([]);
  const [displayedAssignments, setDisplayedAssignments] = useState<VehicleDriverAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<VehicleDriverAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParadero, setCurrentParadero] = useState<Paradero>('CAMIARA');
  
  // Estado para agregar mi registro
  const [myDriver, setMyDriver] = useState<MyDriverData | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    distributeDrivers();
  }, [allAssignments, currentParadero, myDriver]);

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
    if (allAssignments.length === 0 && !myDriver) {
      setDisplayedAssignments([]);
      return;
    }

    const camiaraDrivers = allAssignments.filter((_, index) => index % 2 === 0);
    const toquepalaDrivers = allAssignments.filter((_, index) => index % 2 !== 0);

    let driversToShow = currentParadero === 'CAMIARA' ? camiaraDrivers : toquepalaDrivers;

    setDisplayedAssignments(driversToShow);
  };

  const handleDriverClick = (assignment: VehicleDriverAssignment) => {
    setSelectedDriver(assignment);
    setIsModalOpen(true);
  };

  const toggleParadero = () => {
    setCurrentParadero(prev => prev === 'CAMIARA' ? 'TOQUEPALA' : 'CAMIARA');
  };

  const handleAddToQueue = () => {
    // Datos automáticos del usuario logueado
    const newDriver: MyDriverData = {
      paradero: currentParadero,
      name: 'Guillermo Pérez', 
      plate: 'AEF123', 
      timestamp: Date.now()
    };

    setMyDriver(newDriver);
  };

  const handleRemoveFromQueue = () => {
    setMyDriver(null);
  };

  const openAddModal = () => {
    handleAddToQueue();
  };

  const isInCurrentParadero = myDriver && myDriver.paradero === currentParadero;

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
      <div className="bg-linear-to-r from-green-600 to-green-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/menu')}
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/20 text-white shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Paraderos</h1>
              <p className="text-green-100 text-sm mt-1">Conductores disponibles</p>
            </div>
          </div>

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
        {displayedAssignments.length === 0 && !isInCurrentParadero ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay conductores en {currentParadero}</p>
          </div>
        ) : (
          <>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              {displayedAssignments.length + (isInCurrentParadero ? 1 : 0)} conductor{displayedAssignments.length + (isInCurrentParadero ? 1 : 0) !== 1 ? 'es' : ''} en {currentParadero}
            </div>

            {/* Mi registro si estoy en este paradero - AL FINAL DE LA COLA */}
            {displayedAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                onClick={() => handleDriverClick(assignment)}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-98 border-l-4 border-l-green-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {assignment.user?.firstName} {assignment.user?.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Car className="w-4 h-4" />
                      <span className="font-medium">{assignment.vehicle?.licensePlate}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{assignment.vehicle?.brand} {assignment.vehicle?.model}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))}

            {isInCurrentParadero && (
              <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50 shadow-md animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {displayedAssignments.length + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {myDriver.name}
                      </h3>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                        TÚ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span className="font-medium">{myDriver.plate}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      En espera • Posición {displayedAssignments.length + 1}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Botón Fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          {myDriver ? (
            <Button
              onClick={handleRemoveFromQueue}
              className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              RETIRAR DE LA COLA
            </Button>
          ) : (
            <Button
              onClick={openAddModal}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              INGRESAR A {currentParadero}
            </Button>
          )}
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
              <div className="text-center pb-4 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedDriver.user?.firstName} {selectedDriver.user?.lastName}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-900">{selectedDriver.user?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">DNI</p>
                    <p className="font-semibold text-gray-900">{selectedDriver.user?.idCard}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Vehículo</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDriver.vehicle?.licensePlate} - {selectedDriver.vehicle?.brand} {selectedDriver.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDriver.vehicle?.color} • {selectedDriver.vehicle?.year}
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