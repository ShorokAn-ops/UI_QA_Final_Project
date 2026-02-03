/**
 * Vendors Chart Component
 * 
 * Displays vendor analytics with risk distribution.
 * Uses backend-calculated risk levels for visualization.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RISK_CONFIG } from '@/lib/risk-config';

// Chart colors for vendor differentiation (not risk levels)
const VENDOR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e'];

export default function VendorsChart() {
  const router = useRouter();
  
  const { data, isLoading } = useQuery({
    queryKey: ['vendors-analytics'],
    queryFn: () => api.getVendorsAnalytics(0.6),
  });

  const handleVendorClick = (vendorName: string) => {
    const encodedVendor = encodeURIComponent(vendorName);
    router.push(`/vendors?vendor=${encodedVendor}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Vendor Risk Analytics</h2>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // ✅ FIX: api-client already unwraps json.data
  const vendors = data?.rows || [];

  // Calculate total risk invoices per vendor for pie chart
  const pieData = vendors
    .filter(vendor => vendor.high_or_more > 0)
    .map((vendor) => ({
      name: vendor.supplier,
      value: vendor.high_or_more,
      critical: vendor.critical,
      high: vendor.high_or_more - vendor.critical,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Vendor Risk Analytics</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Risk Distribution by Vendor</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name.length > 15 ? name.substring(0, 15) + '...' : name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={(data) => {
                if (data && data.name) {
                  handleVendorClick(data.name);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={VENDOR_COLORS[index % VENDOR_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded shadow-lg border">
                      <p className="font-semibold text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-600">Total Risk Invoices: {data.value}</p>
                      <p className="text-sm text-orange-600">High Risk: {data.high}</p>
                      <p className="text-sm text-red-600">Critical: {data.critical}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => {
                const data = entry.payload;
                return `${value} (${data.value} risky invoices)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
