/**
 * Dashboard Summary Component
 * 
 * Displays high-level statistics including risk counts.
 * All risk counts come directly from the backend API.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { TrendingUp, Users, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardSummary() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: api.getDashboardSummary,
    refetchInterval: 5000, // 🔄 Poll every 5 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when tab becomes active
  });

  // Update timestamp when data changes
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
      console.log('[DashboardSummary] Data refreshed at:', new Date().toLocaleTimeString());
    }
  }, [data]);

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

  // ✅ FIX: api-client already unwraps json.data, so 'data' IS the summary
  const summary = data;
  
  console.log('[DashboardSummary] Received data:', summary);

  const cards = [
    {
      title: 'Total Invoices',
      value: summary?.total_invoices || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      clickable: false,
    },
    {
      title: 'Total Suppliers',
      value: summary?.total_suppliers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      clickable: false,
    },
    {
      title: 'Critical Invoices',
      value: summary?.risk_counts?.CRITICAL || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      clickable: true,
      riskLevel: 'CRITICAL' as const,
    },
    {
      title: 'High Risk',
      value: summary?.risk_counts?.HIGH || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      clickable: true,
      riskLevel: 'HIGH' as const,
    },
  ];

  const handleManualRefresh = () => {
    console.log('[DashboardSummary] Manual refresh triggered');
    refetch();
  };

  return (
    <div>
      {/* Refresh Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <span className="text-xs text-gray-400">• Auto-refresh every 5s</span>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh dashboard data"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            onClick={() => card.clickable && card.riskLevel && router.push(`/invoices?risk_level=${card.riskLevel}`)}
            className={`bg-white rounded-lg shadow hover:shadow-md transition-all p-6 ${
              card.clickable ? 'cursor-pointer hover:scale-105' : ''
            }`}
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
    </div>
  );
}
