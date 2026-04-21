'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleStop, StopExitReason } from '@/types';
import { vehicleStopsService } from '@/services/vehicleStops.service';
import {
  AlertCircle,
  Check,
  Clock,
  Edit2,
  Loader2,
  LogOut,
  Plus,
  Power,
  PowerOff,
  X,
} from 'lucide-react';

interface ExitReasonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: VehicleStop | null;
}

interface FormState {
  name: string;
  requiresTime: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = { name: '', requiresTime: false, sortOrder: '0' };

export function ExitReasonsDialog({
  open,
  onOpenChange,
  zone,
}: ExitReasonsDialogProps) {
  const [reasons, setReasons] = useState<StopExitReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (open && zone) {
      fetchReasons();
    } else {
      setReasons([]);
      setError(null);
      setShowCreateForm(false);
      setEditingId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, zone?.id]);

  const fetchReasons = async () => {
    if (!zone) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleStopsService.getAllExitReasons(zone.id);
      setReasons(data);
    } catch {
      setError('No se pudieron cargar los motivos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!zone || !createForm.name.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const newReason = await vehicleStopsService.createExitReason(zone.id, {
        name: createForm.name.trim(),
        requiresTime: createForm.requiresTime,
        sortOrder: Number(createForm.sortOrder) || 0,
      });
      setReasons((prev) => [...prev, newReason]);
      setCreateForm(EMPTY_FORM);
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el motivo');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditStart = (reason: StopExitReason) => {
    setEditingId(reason.id);
    setEditForm({
      name: reason.name,
      requiresTime: reason.requiresTime,
      sortOrder: String(reason.sortOrder),
    });
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!zone || editingId === null || !editForm.name.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await vehicleStopsService.updateExitReason(zone.id, editingId, {
        name: editForm.name.trim(),
        requiresTime: editForm.requiresTime,
        sortOrder: Number(editForm.sortOrder) || 0,
      });
      setReasons((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (reason: StopExitReason) => {
    if (!zone) return;
    setTogglingId(reason.id);
    try {
      const updated = await vehicleStopsService.updateExitReason(zone.id, reason.id, {
        status: reason.status === 1 ? 0 : 1,
      });
      setReasons((prev) => prev.map((r) => (r.id === reason.id ? updated : r)));
    } catch {
      // silently ignore
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = reasons.filter((r) => r.status === 1).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <LogOut className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Motivos de salida</DialogTitle>
          {zone && (
            <p className="text-center text-sm text-gray-500 mt-1">{zone.name}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-1 min-h-0">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
              <Button variant="outline" size="sm" onClick={fetchReasons} className="w-full h-8 text-xs">
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && reasons.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <LogOut className="w-10 h-10 mx-auto mb-2 opacity-40" />
              Sin motivos configurados para este paradero
            </div>
          )}

          {!loading && !error && reasons.length > 0 && (
            <>
              <p className="text-xs text-gray-500 px-1">
                {activeCount} activo{activeCount !== 1 ? 's' : ''} de {reasons.length}
              </p>

              {reasons.map((reason) => {
                const isActive = reason.status === 1;
                const isEditing = editingId === reason.id;
                const isToggling = togglingId === reason.id;

                return (
                  <div
                    key={reason.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Nombre del motivo"
                          className="h-9 text-sm"
                          disabled={editLoading}
                        />
                        <Input
                          type="number"
                          value={editForm.sortOrder}
                          onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: e.target.value }))}
                          placeholder="Orden"
                          className="h-9 text-sm"
                          disabled={editLoading}
                        />
                        {/* Toggle requiresTime */}
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, requiresTime: !f.requiresTime }))}
                          disabled={editLoading}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            editForm.requiresTime
                              ? 'border-blue-300 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                          }`}
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left font-medium">Requiere hora</span>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            editForm.requiresTime ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {editForm.requiresTime && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                        </button>
                        {editError && <p className="text-xs text-red-600">{editError}</p>}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleEditSave}
                            disabled={editLoading || !editForm.name.trim()}
                            className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-xs"
                          >
                            {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Guardar</>}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel} disabled={editLoading} className="h-8 text-xs px-3">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm text-gray-900 truncate">{reason.name}</p>
                            {reason.requiresTime && (
                              <span title="Requiere hora">
                                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">Orden: {reason.sortOrder}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          onClick={() => handleEditStart(reason)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(reason)}
                          disabled={isToggling}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors ${
                            isActive ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                          title={isActive ? 'Desactivar' : 'Activar'}
                        >
                          {isToggling
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Create form */}
          {showCreateForm && (
            <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-green-700">Nuevo motivo de salida</p>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del motivo"
                className="h-9 text-sm bg-white"
                disabled={createLoading}
                autoFocus
              />
              <Input
                type="number"
                value={createForm.sortOrder}
                onChange={(e) => setCreateForm((f) => ({ ...f, sortOrder: e.target.value }))}
                placeholder="Orden (0 = primero)"
                className="h-9 text-sm bg-white"
                disabled={createLoading}
              />
              {/* Toggle requiresTime */}
              <button
                type="button"
                onClick={() => setCreateForm((f) => ({ ...f, requiresTime: !f.requiresTime }))}
                disabled={createLoading}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors bg-white ${
                  createForm.requiresTime
                    ? 'border-blue-300 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left font-medium">Requiere hora de salida</span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  createForm.requiresTime ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {createForm.requiresTime && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
              </button>
              {createError && <p className="text-xs text-red-600">{createError}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={createLoading || !createForm.name.trim()}
                  className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Crear</>}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowCreateForm(false); setCreateError(null); setCreateForm(EMPTY_FORM); }}
                  disabled={createLoading}
                  className="h-8 text-xs px-3"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-3 space-y-2 border-t border-gray-100">
          {!showCreateForm && (
            <Button
              onClick={() => { setShowCreateForm(true); setEditingId(null); }}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar motivo
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-10 text-sm">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
