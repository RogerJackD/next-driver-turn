'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, MapPin, LogOut, UserCog } from 'lucide-react';
import { authUtils } from '@/utils/auth';

export default function Menu() {
  const router = useRouter();

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    authUtils.clearAuth();
    router.push('/login');
  };

  const menuItems = [
    {
      id: 1,
      title: 'Reportes',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      onClick: () => console.log('Reportes clicked')
    },
    {
      id: 2,
      title: 'Mi Perfil',
      icon: User,
      color: 'from-purple-500 to-purple-600',
      onClick: () => console.log('Perfil clicked')
    },
    {
      id: 3,
      title: 'Paraderos',
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      onClick: () => router.push('/paraderos')
    },
    {
      id: 4,
      title: 'Conductores',
      icon: UserCog,
      color: 'from-orange-500 to-orange-600',
      onClick: () => router.push('/conductores')
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold">Transport App</h1>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-9 px-3"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
          <p className="text-blue-100 text-sm">Sistema de Transporte</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                onClick={item.onClick}
                className="aspect-square flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl transition-all duration-300 active:scale-95 border-0 shadow-md"
              >
                <div className={`w-16 h-16 bg-linear-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 text-center px-2">
                  {item.title}
                </h3>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}