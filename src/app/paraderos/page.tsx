'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/auth';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { ExitQueueDialog } from '@/components/paraderos/ExitQueueDialog';
import type { VehicleStop, QueueEntry, ExitReason } from '@/types';
import { VehicleStopStatus } from '@/constants/enums';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  User,
  Car,
  Phone,
  Loader2,
  ArrowRight,
  MapPin,
  ArrowLeft,
  LogOut,
  LogIn,
  ArrowRightLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Paraderos() {
  const router = useRouter();
  const user = authUtils.getUser();

  const [zones, setZones] = useState<VehicleStop[]>([]);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  // Socket
  const {
    isConnected,
    currentQueue,
    myPosition,
    positionLoaded,
    subscribeToStop,
    enterQueue,
    exitQueue,
    changeStop,
    refreshMyPosition,
  } = useQueueSocket();

  const currentZone = zones[currentZoneIndex] ?? null;
  const isInQueue = myPosition?.inQueue === true;
  const isInCurrentZone = isInQueue && myPosition?.stop?.id === currentZone?.id;
  const isInDifferentZone = isInQueue && myPosition?.stop?.id !== currentZone?.id;

  // Load zones on mount
  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadZones();
  }, [router]);

  // When socket connects, check my position
  useEffect(() => {
    if (isConnected) {
      refreshMyPosition();
    }
  }, [isConnected, refreshMyPosition]);

  // When zones load + my position is known, navigate to my zone
  useEffect(() => {
    if (zones.length > 0 && myPosition?.inQueue && myPosition.stop) {
      const myZoneIndex = zones.findIndex((z) => z.id === myPosition.stop!.id);
      if (myZoneIndex >= 0) {
        setCurrentZoneIndex(myZoneIndex);
      }
    }
  }, [zones, myPosition]);

  // Subscribe to current zone when it changes
  useEffect(() => {
    if (currentZone && isConnected) {
      subscribeToStop(currentZone.id);
    }
  }, [currentZone?.id, isConnected, subscribeToStop]);

  const loadZones = async () => {
    try {
      const data = await vehicleStopsService.getAll();
      const activeZones = data.filter(
        (z) => z.status === VehicleStopStatus.ACTIVE,
      );
      setZones(activeZones);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleParadero = () => {
    if (zones.length <= 1) return;
    setCurrentZoneIndex((prev) => (prev + 1) % zones.length);
  };

  const handleEntryClick = (entry: QueueEntry) => {
    setSelectedEntry(entry);
    setIsInfoModalOpen(true);
  };

  // Enter queue
  const handleEnterQueue = useCallback(async () => {
    if (!currentZone) return;
    setActionLoading(true);
    try {
      const response = await enterQueue(currentZone.id);
      if (!response.success) {
        alert(response.message || 'Error al ingresar a la cola');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  }, [currentZone, enterQueue]);

  // Exit queue via dialog
  const handleExitQueue = useCallback(async (reason: ExitReason) => {
    const response = await exitQueue(reason);
    if (!response.success) {
      alert(response.message || 'Error al salir de la cola');
      throw new Error(response.message);
    }
  }, [exitQueue]);

  // Change stop (atomic)
  const handleChangeStop = useCallback(async () => {
    if (!currentZone) return;
    setActionLoading(true);
    try {
      const response = await changeStop(currentZone.id);
      if (!response.success) {
        alert(response.message || 'Error al cambiar de paradero');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  }, [currentZone, changeStop]);

  // Identify if a queue entry is me
  const isMe = (entry: QueueEntry) => {
    return user?.driverId != null && entry.driver.id === user.driverId;
  };

  const vehicles = currentQueue?.vehicles ?? [];
  const totalVehicles = currentQueue?.totalVehicles ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-6 shadow-lg sticky top-0 z-10">
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
              <p className="text-green-100 text-sm mt-1">
                Cola en tiempo real
              </p>
            </div>
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-200" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-300" />
            )}
          </div>

          {/* Zone selector */}
          <Button
            onClick={toggleParadero}
            disabled={zones.length <= 1}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            <span>{currentZone?.name ?? 'Sin zonas'}</span>
            {zones.length > 1 && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>

          {/* My position banner */}
          {isInQueue && myPosition?.stop && (
            <div className="bg-white/15 rounded-xl px-4 py-2 text-sm">
              {isInCurrentZone ? (
                <span>
                  Estás en posición <span className="font-bold">{myPosition.position}</span> de{' '}
                  <span className="font-bold">{myPosition.totalInQueue}</span>
                </span>
              ) : (
                <span>
                  Estás en cola en <span className="font-bold">{myPosition.stop.name}</span>{' '}
                  (posición {myPosition.position})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {totalVehicles === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay conductores en {currentZone?.name ?? 'esta zona'}</p>
          </div>
        ) : (
          <>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              {totalVehicles} conductor{totalVehicles !== 1 ? 'es' : ''} en{' '}
              {currentZone?.name}
            </div>

            {vehicles.map((entry) => {
              const isMine = isMe(entry);
              return (
                <Card
                  key={entry.queueId}
                  onClick={() => handleEntryClick(entry)}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-98 border-l-4 ${
                    isMine
                      ? 'border-l-blue-500 bg-blue-50 shadow-md'
                      : 'border-l-green-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br ${
                          isMine
                            ? 'from-blue-500 to-blue-600'
                            : 'from-green-500 to-green-600'
                        }`}
                      >
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                          isMine ? 'bg-blue-600' : 'bg-green-600'
                        }`}
                      >
                        {entry.position}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                          {entry.driver.firstName} {entry.driver.lastName}
                        </h3>
                        {isMine && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                            TÚ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="w-4 h-4" />
                        <span className="font-medium">{entry.vehicle.licensePlate}</span>
                        <span className="text-gray-400">•</span>
                        <span className="truncate">
                          {entry.vehicle.brand} {entry.vehicle.model}
                        </span>
                      </div>
                      {isMine && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          En espera • Posición {entry.position}
                        </p>
                      )}
                    </div>

                    {!isMine && (
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-md mx-auto">
          {(!isConnected || !positionLoaded) && (
            <Button
              disabled
              className="w-full h-14 bg-gray-400 text-white font-bold text-lg rounded-xl"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Conectando...
            </Button>
          )}

          {isConnected && positionLoaded && !isInQueue && (
            <Button
              onClick={handleEnterQueue}
              disabled={actionLoading || !currentZone}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  INGRESAR A {currentZone?.name ?? ''}
                </>
              )}
            </Button>
          )}

          {isConnected && positionLoaded && isInCurrentZone && (
            <Button
              onClick={() => setIsExitDialogOpen(true)}
              disabled={actionLoading}
              className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              RETIRAR DE LA COLA
            </Button>
          )}

          {isConnected && positionLoaded && isInDifferentZone && (
            <Button
              onClick={handleChangeStop}
              disabled={actionLoading}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ArrowRightLeft className="w-5 h-5" />
                  CAMBIAR A {currentZone?.name ?? ''}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Exit Queue Dialog */}
      <ExitQueueDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onConfirm={handleExitQueue}
        zoneName={myPosition?.stop?.name ?? ''}
      />

      {/* Driver Info Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Información del Conductor
            </DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4 py-2">
              <div className="text-center pb-4 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedEntry.driver.firstName} {selectedEntry.driver.lastName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Posición {selectedEntry.position} en cola
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEntry.driver.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Vehículo</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEntry.vehicle.licensePlate} -{' '}
                      {selectedEntry.vehicle.brand} {selectedEntry.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedEntry.vehicle.color}
                      {selectedEntry.vehicle.internalNumber &&
                        ` • N° ${selectedEntry.vehicle.internalNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Ingresó a la cola</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEntry.entryTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {selectedEntry.waitTime > 0 && (
                      <p className="text-sm text-gray-600">
                        {selectedEntry.waitTime} min en espera
                      </p>
                    )}
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
