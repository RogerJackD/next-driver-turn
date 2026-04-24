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
  autoExitHour: string;
}

const EMPTY_FORM: FormState = { name: '', autoExitHour: '09:00' };

export function ExitReasonsDialog({ open, onOpenChange, zone }: ExitReasonsDialogProps) {
  const [immediate, setImmediate] = useState<StopExitReason[]>([]);
  const [scheduled, setScheduled] = useState<StopExitReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 'immediate' | 'scheduled' | null — which create form is open
  const [createType, setCreateType] = useState<'immediate' | 'scheduled' | null>(null);
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
      setImmediate([]);
      setScheduled([]);
      setError(null);
      setCreateType(null);
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
      setImmediate(data.filter((r) => r.autoExitHour === null));
      setScheduled(data.filter((r) => r.autoExitHour !== null));
    } catch {
      setError('No se pudieron cargar los motivos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!zone || !createForm.name.trim() || !createType) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const isScheduled = createType === 'scheduled';
      const newReason = await vehicleStopsService.createExitReason(zone.id, {
        name: createForm.name.trim(),
        autoExitHour: isScheduled ? createForm.autoExitHour : null,
        sortOrder: isScheduled ? scheduled.length : immediate.length,
      });
      if (isScheduled) {
        setScheduled((prev) => [...prev, newReason]);
      } else {
        setImmediate((prev) => [...prev, newReason]);
      }
      setCreateForm(EMPTY_FORM);
      setCreateType(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el motivo');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditStart = (reason: StopExitReason) => {
    setCreateType(null);
    setEditingId(reason.id);
    setEditForm({
      name: reason.name,
      autoExitHour: reason.autoExitHour ?? '09:00',
    });
    setEditError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!zone || editingId === null || !editForm.name.trim()) return;
    const editingReason = [...immediate, ...scheduled].find((r) => r.id === editingId);
    if (!editingReason) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const isScheduled = editingReason.autoExitHour !== null;
      const updated = await vehicleStopsService.updateExitReason(zone.id, editingId, {
        name: editForm.name.trim(),
        autoExitHour: isScheduled ? editForm.autoExitHour : null,
      });
      if (isScheduled) {
        setScheduled((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      } else {
        setImmediate((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      }
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
      const isScheduled = reason.autoExitHour !== null;
      if (isScheduled) {
        setScheduled((prev) => prev.map((r) => (r.id === reason.id ? updated : r)));
      } else {
        setImmediate((prev) => prev.map((r) => (r.id === reason.id ? updated : r)));
      }
    } catch {
      // silently ignore
    } finally {
      setTogglingId(null);
    }
  };

  const openCreateForm = (type: 'immediate' | 'scheduled') => {
    setEditingId(null);
    setCreateForm(EMPTY_FORM);
    setCreateError(null);
    setCreateType(type);
  };

  const closeCreateForm = () => {
    setCreateType(null);
    setCreateError(null);
    setCreateForm(EMPTY_FORM);
  };

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
          {zone && <p className="text-center text-sm text-gray-500 mt-1">{zone.name}</p>}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-1">
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

          {!loading && !error && (
            <>
              {/* ── Salida inmediata ─────────────────────────── */}
              <Section
                title="Salida inmediata"
                color="red"
                reasons={immediate}
                editingId={editingId}
                editForm={editForm}
                editLoading={editLoading}
                editError={editError}
                togglingId={togglingId}
                onEditStart={handleEditStart}
                onEditChange={setEditForm}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onToggleStatus={handleToggleStatus}
                showCreate={createType === 'immediate'}
                createForm={createForm}
                createLoading={createLoading}
                createError={createError}
                onCreateChange={setCreateForm}
                onCreateSave={handleCreate}
                onCreateOpen={() => openCreateForm('immediate')}
                onCreateClose={closeCreateForm}
              />

              <div className="border-t border-gray-100" />

              {/* ── Salida programada ─────────────────────────── */}
              <Section
                title="Salida programada"
                color="blue"
                reasons={scheduled}
                editingId={editingId}
                editForm={editForm}
                editLoading={editLoading}
                editError={editError}
                togglingId={togglingId}
                onEditStart={handleEditStart}
                onEditChange={setEditForm}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onToggleStatus={handleToggleStatus}
                showCreate={createType === 'scheduled'}
                createForm={createForm}
                createLoading={createLoading}
                createError={createError}
                onCreateChange={setCreateForm}
                onCreateSave={handleCreate}
                onCreateOpen={() => openCreateForm('scheduled')}
                onCreateClose={closeCreateForm}
                showHour
              />
            </>
          )}
        </div>

        <div className="shrink-0 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-10 text-sm">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Section component ────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  color: 'red' | 'blue';
  reasons: StopExitReason[];
  editingId: number | null;
  editForm: FormState;
  editLoading: boolean;
  editError: string | null;
  togglingId: number | null;
  onEditStart: (r: StopExitReason) => void;
  onEditChange: (u: (prev: FormState) => FormState) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onToggleStatus: (r: StopExitReason) => void;
  showCreate: boolean;
  createForm: FormState;
  createLoading: boolean;
  createError: string | null;
  onCreateChange: (u: (prev: FormState) => FormState) => void;
  onCreateSave: () => void;
  onCreateOpen: () => void;
  onCreateClose: () => void;
  showHour?: boolean;
}

function Section({
  title, color, reasons,
  editingId, editForm, editLoading, editError, togglingId,
  onEditStart, onEditChange, onEditSave, onEditCancel, onToggleStatus,
  showCreate, createForm, createLoading, createError,
  onCreateChange, onCreateSave, onCreateOpen, onCreateClose,
  showHour = false,
}: SectionProps) {
  const accent = color === 'red'
    ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400' }
    : { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' };

  const activeCount = reasons.filter((r) => r.status === 1).length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
        </div>
        <span className="text-xs text-gray-400">
          {activeCount} activo{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {reasons.length === 0 && !showCreate && (
        <p className="text-xs text-gray-400 px-1 italic">Sin motivos configurados</p>
      )}

      {/* Reason list */}
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
                  onChange={(e) => onEditChange((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre del motivo"
                  className="h-9 text-sm"
                  disabled={editLoading}
                />
                {showHour && (
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hora de auto-salida
                    </p>
                    <Input
                      type="time"
                      value={editForm.autoExitHour}
                      onChange={(e) => onEditChange((f) => ({ ...f, autoExitHour: e.target.value }))}
                      className="h-9 text-sm"
                      disabled={editLoading}
                    />
                  </div>
                )}
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onEditSave}
                    disabled={editLoading || !editForm.name.trim()}
                    className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    {editLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><Check className="w-3 h-3 mr-1" />Guardar</>
                    }
                  </Button>
                  <Button size="sm" variant="outline" onClick={onEditCancel} disabled={editLoading} className="h-8 text-xs px-3">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{reason.name}</p>
                  {reason.autoExitHour && (
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {reason.autoExitHour.slice(0, 5)}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => onEditStart(reason)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleStatus(reason)}
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

      {/* Create form */}
      {showCreate && (
        <div className={`rounded-xl border-2 border-dashed ${accent.border} ${accent.bg} p-3 space-y-2`}>
          <p className={`text-xs font-semibold ${accent.text}`}>Nuevo motivo — {title.toLowerCase()}</p>
          <Input
            value={createForm.name}
            onChange={(e) => onCreateChange((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del motivo"
            className="h-9 text-sm bg-white"
            disabled={createLoading}
            autoFocus
          />
          {showHour && (
            <div className="space-y-1">
              <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Hora de auto-salida
              </p>
              <Input
                type="time"
                value={createForm.autoExitHour}
                onChange={(e) => onCreateChange((f) => ({ ...f, autoExitHour: e.target.value }))}
                className="h-9 text-sm bg-white"
                disabled={createLoading}
              />
            </div>
          )}
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onCreateSave}
              disabled={createLoading || !createForm.name.trim()}
              className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-xs"
            >
              {createLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <><Check className="w-3 h-3 mr-1" />Crear</>
              }
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateClose} disabled={createLoading} className="h-8 text-xs px-3">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showCreate && (
        <button
          onClick={onCreateOpen}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed ${accent.border} ${accent.text} hover:${accent.bg} text-xs font-medium transition-colors`}
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar motivo
        </button>
      )}
    </div>
  );
}
