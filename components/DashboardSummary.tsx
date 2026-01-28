/**
 * Dashboard Summary Component
 * 
 * Displays high-level statistics including risk counts.
 * All risk counts come directly from the backend API.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { TrendingUp, Users, FileText, AlertTriangle } from 'lucide-react';

export default function DashboardSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: api.getDashboardSummary,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const summary = data?.data;

  const cards = [
    {
      title: 'Total Invoices',
      value: summary?.total_invoices || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Suppliers',
      value: summary?.total_suppliers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Critical Invoices',
      value: summary?.risk_counts?.CRITICAL || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'High Risk',
      value: summary?.risk_counts?.HIGH || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}
