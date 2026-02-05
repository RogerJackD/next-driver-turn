'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authUtils } from '@/utils/auth';
import { usePermissions } from '@/hooks/usePermissions';

export default function MisReportesPage() {
  const router = useRouter();
  const { isDriver, isAdmin, isLoading } = usePermissions();

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Si es admin, redirigir a reportes generales
    if (!isLoading && isAdmin) {
      router.push('/reportes');
    }
  }, [router, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
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
            <h1 className="text-xl font-bold">Reportes</h1>
            <p className="text-orange-100 text-sm">Mis reportes personales</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Mis Reportes
          </h2>
          <p className="text-gray-500">
            Próximamente podrás ver tus reportes personales aquí.
          </p>
        </div>
      </div>
    </div>
  );
}