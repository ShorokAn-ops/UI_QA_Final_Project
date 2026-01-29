/**
 * Risk Distribution Chart Component
 * 
 * Displays risk level distribution across all invoices.
 * Uses risk_level categories from the backend.
 * 
 * Backend calculates risk levels, frontend visualizes them.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { RISK_CONFIG, RISK_LEVEL_ORDER } from '@/lib/risk-config';
import { RiskLevel } from '@/types/api';

export default function RiskChart() {
  const router = useRouter();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: api.getDashboardSummary,
  });

  const handleRiskLevelClick = (riskLevel: RiskLevel) => {
    router.push(`/invoices?risk_level=${riskLevel}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-100 rounded mb-6 animate-pulse"></div>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const summary = data?.data;
  
  // Prepare chart data using backend risk counts
  const chartData = RISK_LEVEL_ORDER.map((level) => ({
    risk_level: level,
    label: RISK_CONFIG[level].label,
    count: summary?.risk_counts?.[level] || 0,
    color: RISK_CONFIG[level].chartColor,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Risk Distribution</h2>
        <p className="text-sm text-gray-500">
          Invoice count by risk level (calculated by backend AI)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload.length > 0) {
              const riskLevel = data.activePayload[0].payload.risk_level as RiskLevel;
              handleRiskLevelClick(riskLevel);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white px-4 py-3 rounded-lg shadow-xl border-2 border-gray-100">
                    <p className="font-bold text-gray-900 mb-1">{data.label}</p>
                    <p className="text-sm text-gray-600">
                      Invoices: <span className="font-semibold">{data.count}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">Click to filter</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[12, 12, 0, 0]}
            maxBarSize={80}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item) => {
          const bgColorClass = item.risk_level === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                              item.risk_level === 'HIGH' ? 'bg-orange-50 border-orange-200' :
                              item.risk_level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-green-50 border-green-200';
          const textColorClass = item.risk_level === 'CRITICAL' ? 'text-red-600' :
                                item.risk_level === 'HIGH' ? 'text-orange-600' :
                                item.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                                'text-green-600';
          return (
            <div 
              key={item.risk_level} 
              onClick={() => handleRiskLevelClick(item.risk_level)}
              className={`text-center p-4 rounded-lg border-2 ${bgColorClass} hover:shadow-md transition-all cursor-pointer hover:scale-105`}
            >
              <div className={`text-3xl font-extrabold ${textColorClass} mb-1`}>
                {item.count}
              </div>
              <div className="text-xs font-medium text-gray-700">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
