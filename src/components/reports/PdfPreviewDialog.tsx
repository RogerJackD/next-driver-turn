'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, X, ExternalLink, AlertCircle } from 'lucide-react';
import { reportsService } from '@/services/reports.service';
import type { ReportFilters, ReportType } from '@/types';

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  filters: ReportFilters;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  summary: 'Resumen General',
  records: 'Registros',
  by_stop: 'Por Paradero',
  by_driver: 'Por Conductor',
  by_exit_reason: 'Por Motivo de Salida',
  hourly_distribution: 'Distribucion por Hora',
  daily_trend: 'Tendencia Diaria',
};

export function PdfPreviewDialog({
  open,
  onOpenChange,
  reportType,
  filters,
}: PdfPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState('reporte.pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPdfUrl(null);
    setPdfBlob(null);
    setError(null);
  }, []);

  const fetchPdf = useCallback(async () => {
    cleanup();
    setIsLoading(true);

    try {
      const { blob, filename } = await reportsService.getPdfReport(filters);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setPdfUrl(url);
      setPdfBlob(blob);
      setPdfFilename(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el PDF');
    } finally {
      setIsLoading(false);
    }
  }, [filters, cleanup]);

  useEffect(() => {
    if (open) {
      fetchPdf();
    } else {
      cleanup();
    }
  }, [open, fetchPdf, cleanup]);

  const handleDownload = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfBlob, pdfFilename]);

  const handleOpenInNewTab = useCallback(() => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [pdfBlob]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] sm:max-w-3xl h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0 rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-blue-600" />
            Vista Previa
          </DialogTitle>
          <DialogDescription className="text-xs">
            {REPORT_TYPE_LABELS[reportType] ?? reportType}
          </DialogDescription>
        </DialogHeader>

        {/* PDF Preview Area */}
        <div className="flex-1 min-h-0 bg-gray-100 overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Generando PDF...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm text-red-600 text-center">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPdf}>
                Reintentar
              </Button>
            </div>
          )}

          {!isLoading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Vista previa del reporte PDF"
            />
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-4 py-3 border-t border-gray-200 shrink-0 flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            <X className="w-4 h-4 mr-1" />
            Cerrar
          </Button>

          {pdfUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </Button>

              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
