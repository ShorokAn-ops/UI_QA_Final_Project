/**
 * Vendors Table Component
 * 
 * This component displays vendors with their risk analytics and AI-enriched insights.
 */
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { VendorAnalytics, RiskAnomaly } from '@/types/api';
import { formatCurrency } from '@/lib/utils';
import { getVendorRiskExplanation, parseReasons } from '@/lib/risk-helpers';
import { AlertCircle, Sparkles } from 'lucide-react';

interface VendorsTableProps {
  filterVendor?: string;
}

export default function VendorsTable({ filterVendor }: VendorsTableProps) {
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors-analytics'],
    queryFn: () => api.getVendorsAnalytics(0.0),
  });

  const { data: anomaliesData, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['risk-anomalies-vendors'],
    queryFn: () => api.getRiskAnomalies(0.0),
  });

  const isLoading = vendorsLoading || anomaliesLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Vendors</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ FIX: api-client already unwraps json.data
  const vendors = vendorsData?.rows || [];
  const anomalies = anomaliesData || [];

  // Filter vendors based on filterVendor prop
  const filteredVendors = filterVendor
    ? vendors.filter((vendor: VendorAnalytics) => 
        vendor.supplier?.toLowerCase() === filterVendor.toLowerCase()
      )
    : vendors;

  // Build a map of supplier -> hasAI
  const supplierHasAI = new Map<string, boolean>();
  anomalies.forEach((anomaly: RiskAnomaly) => {
    if (anomaly.supplier) {
      const parsed = parseReasons(anomaly.reasons);
      if (parsed.hasAI) {
        supplierHasAI.set(anomaly.supplier, true);
      }
    }
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Vendors</h2>
        <p className="text-sm text-gray-500 mt-1">
          {filterVendor 
            ? `Showing ${filteredVendors.length} of ${vendors.length} vendors`
            : `${vendors.length} total vendors`
          }
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Invoices
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                High Risk+
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Critical Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                REASONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors.map((vendor: VendorAnalytics, index: number) => {
              const hasHighRisk = vendor.high_or_more > 0;
              const hasCriticalRisk = vendor.critical > 0;
              const hasAI = supplierHasAI.get(vendor.supplier) || false;
              const riskExplanations = getVendorRiskExplanation(vendor);

              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {vendor.supplier || 'N/A'}
                      </span>
                      {hasCriticalRisk && (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                      {hasAI && (
                        <div className="group relative">
                          <Sparkles 
                            size={14} 
                            className="text-purple-500 cursor-help" 
                            title="AI-enriched analysis available"
                          />
                          <div className="hidden group-hover:block absolute z-10 left-0 top-6 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                            AI-enriched analysis
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900 font-medium">
                      {vendor.invoices}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(vendor.avg_total)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {hasHighRisk ? (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                        {vendor.high_or_more}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {hasCriticalRisk ? (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                        {vendor.critical}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="space-y-1">
                      {riskExplanations.map((explanation, idx) => (
                        <div key={idx} className="text-xs text-gray-700">
                          • {explanation}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredVendors.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {filterVendor 
            ? `No vendors found matching "${filterVendor}"`
            : 'No vendor data available'
          }
        </div>
      )}
    </div>
  );
}
