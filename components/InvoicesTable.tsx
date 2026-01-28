/**
 * Invoices Table Component
 * 
 * This component displays invoices with their risk levels.
 * 
 * IMPORTANT: Risk levels are calculated by the backend.
 * This component only displays the risk_level value from the API.
 * Do NOT recalculate or override risk levels in the frontend.
 */
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Invoice, RiskAnomaly } from '@/types/api';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { getRiskConfig } from '@/lib/risk-config';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

export default function InvoicesTable() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.getInvoices(100, true),
  });

  const { data: riskData, isLoading: riskLoading } = useQuery({
    queryKey: ['risk-anomalies'],
    queryFn: () => api.getRiskAnomalies(0.0),
  });

  const isLoading = invoicesLoading || riskLoading;

  const toggleRow = (invoiceId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Invoices</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const invoices = invoicesData?.data || [];
  const risks = riskData?.data || [];

  // Create a map of invoice_id to risk data
  const riskMap = new Map<string, RiskAnomaly>();
  risks.forEach((risk) => {
    riskMap.set(risk.invoice_id, risk);
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
        <p className="text-sm text-gray-500 mt-1">
          {invoices.length} total invoices
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const risk = riskMap.get(invoice.invoice_id);
              const isExpanded = expandedRows.has(invoice.invoice_id);

              return (
                <React.Fragment key={invoice.invoice_id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(invoice.invoice_id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.supplier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.posting_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.grand_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {risk ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const config = getRiskConfig(risk.risk_level);
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${config.badgeClass}`}
                              >
                                {risk.risk_level === 'CRITICAL' && <AlertCircle size={14} />}
                                {config.label}
                              </span>
                            );
                          })()}
                          <span className="text-xs text-gray-500 font-medium">
                            {formatPercentage(risk.rate)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                          No Data
                        </span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Items Table */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Invoice Items</h4>
                            {invoice.items && invoice.items.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Item Code
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Item Name
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Quantity
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Unit Price
                                      </th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {invoice.items.map((item, idx) => (
                                      <tr key={idx}>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.item_code || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {item.item_name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                                          {item.qty !== undefined ? item.qty.toFixed(2) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right text-gray-900">
                                          {formatCurrency(item.rate)}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                                          {formatCurrency(item.amount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No items available</p>
                            )}
                          </div>

                          {/* Risk Reasons */}
                          {risk && risk.reasons && risk.reasons.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" />
                                Risk Reasons
                              </h4>
                              <ul className="space-y-2">
                                {risk.reasons.map((reason, idx) => (
                                  <li key={idx} className="text-sm pl-4">
                                    <div className="font-medium text-gray-900">
                                      • {typeof reason === 'object' && reason.reason ? reason.reason : reason}
                                    </div>
                                    {typeof reason === 'object' && reason.details && (
                                      <div className="text-gray-600 pl-4 mt-0.5">
                                        {reason.details}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
