'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authUtils } from '@/utils/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { reportsService } from '@/services/reports.service';
import { DriverReportFiltersForm } from '@/components/reports/DriverReportFiltersForm';
import { ReportResultRenderer } from '@/components/reports/ReportResultRenderer';
import { PdfPreviewDialog } from '@/components/reports/PdfPreviewDialog';
import type { ReportFilters, ReportType, ReportResponse } from '@/types';

export default function MisReportesPage() {
  const router = useRouter();
  const { isAdmin, isLoading: permLoading } = usePermissions();

  const [driverId, setDriverId] = useState<number | null>(null);
  const [results, setResults] = useState<ReportResponse | null>(null);
  const [currentReportType, setCurrentReportType] = useState<ReportType | null>(null);
  const [lastFilters, setLastFilters] = useState<ReportFilters | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!permLoading && isAdmin) {
      router.push('/reportes');
      return;
    }

    const user = authUtils.getUser();
    if (user?.driverId) {
      setDriverId(user.driverId);
    }
  }, [router, isAdmin, permLoading]);

  const handleGenerateReport = useCallback(async (filters: ReportFilters) => {
    setIsLoadingReport(true);
    setReportError(null);
    setResults(null);
    setLastFilters(filters);
    setCurrentReportType(filters.reportType);
    try {
      const data = await reportsService.getReport(filters);
      setResults(data);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Error al generar reporte');
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const handlePageChange = useCallback(async (page: number) => {
    if (!lastFilters) return;
    const newFilters = { ...lastFilters, page };
    setIsLoadingReport(true);
    setReportError(null);
    setLastFilters(newFilters);
    try {
      const data = await reportsService.getReport(newFilters);
      setResults(data);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Error al cambiar página');
    } finally {
      setIsLoadingReport(false);
    }
  }, [lastFilters]);

  if (permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!driverId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-6 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              onClick={() => router.push('/menu')}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mis Reportes</h1>
              <p className="text-orange-100 text-sm">Reportes personales</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No se encontró información de conductor asociada a tu cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={() => router.push('/menu')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Mis Reportes</h1>
            <p className="text-orange-100 text-sm">Reportes personales</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Filters Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <DriverReportFiltersForm
            onSubmit={handleGenerateReport}
            isLoading={isLoadingReport}
            driverId={driverId}
          />
        </div>

        {/* Loading */}
        {isLoadingReport && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        )}

        {/* Error */}
        {reportError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al generar reporte</p>
              <p className="text-sm text-red-600">{reportError}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoadingReport && results && currentReportType && (
          <div className="space-y-6">
            <ReportResultRenderer
              reportType={currentReportType}
              data={results}
              onPageChange={handlePageChange}
            />

            {/* PDF Button */}
            <div className="flex justify-center pt-2 pb-6">
              <Button
                onClick={() => setIsPdfDialogOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 rounded-xl"
              >
                <FileText className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>

            {/* PDF Preview Dialog */}
            {lastFilters && (
              <PdfPreviewDialog
                open={isPdfDialogOpen}
                onOpenChange={setIsPdfDialogOpen}
                reportType={currentReportType}
                filters={lastFilters}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
