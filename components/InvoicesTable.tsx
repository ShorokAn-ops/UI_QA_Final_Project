/**
 * Invoices Table Component
 * 
 * This component displays invoices with their risk levels and AI-enriched insights.
 * 
 * IMPORTANT: Risk levels are calculated by the backend.
 * This component only displays the risk_level value from the API.
 * Do NOT recalculate or override risk levels in the frontend.
 */
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Invoice, RiskAnomaly, NormalizedReason, AiMeta, RiskLevel } from '@/types/api';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { getRiskConfig } from '@/lib/risk-config';
import { parseReasons, formatAiMetaTooltip } from '@/lib/risk-helpers';
import { ChevronDown, ChevronRight, AlertCircle, Sparkles, Info } from 'lucide-react';

interface InvoicesTableProps {
  filterRiskLevel?: RiskLevel | null;
}

export default function InvoicesTable({ filterRiskLevel }: InvoicesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [reasonsModal, setReasonsModal] = useState<{
    invoiceId: string;
    reasons: NormalizedReason[];
    aiMeta?: AiMeta;
  } | null>(null);

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.getInvoices(100, true),
  });

  const { data: riskData, isLoading: riskLoading } = useQuery({
    queryKey: ['risk-anomalies'],
    queryFn: () => api.getRiskAnomalies(0.0),
  });

  const isLoading = invoicesLoading || riskLoading;
  const invoices = invoicesData?.data || [];
  const risks = riskData?.data || [];

  // Create a map of invoice_id to risk data with parsed reasons
  // This must be before any conditional returns to follow Rules of Hooks
  const riskMap = useMemo(() => {
    const map = new Map<string, { risk: RiskAnomaly; parsed: ReturnType<typeof parseReasons> }>();
    risks.forEach((risk) => {
      const parsed = parseReasons(risk.reasons);
      map.set(risk.invoice_id, { risk, parsed });
    });
    return map;
  }, [risks]);

  // Filter invoices by risk level if filterRiskLevel is provided
  const filteredInvoices = useMemo(() => {
    if (!filterRiskLevel) return invoices;
    
    return invoices.filter((invoice) => {
      const riskData = riskMap.get(invoice.invoice_id);
      return riskData?.risk?.risk_level === filterRiskLevel;
    });
  }, [invoices, filterRiskLevel, riskMap]);

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

  const openReasonsModal = (invoiceId: string, reasons: NormalizedReason[], aiMeta?: AiMeta) => {
    setReasonsModal({ invoiceId, reasons, aiMeta });
  };

  const closeReasonsModal = () => {
    setReasonsModal(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
        <p className="text-sm text-gray-500 mt-1">
          {filterRiskLevel 
            ? `${filteredInvoices.length} of ${invoices.length} invoices` 
            : `${invoices.length} total invoices`}
        </p>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500">
            {filterRiskLevel 
              ? `There are no invoices with ${getRiskConfig(filterRiskLevel).label} at this time.`
              : 'No invoices available.'}
          </p>
        </div>
      ) : (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                REASONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => {
              const riskData = riskMap.get(invoice.invoice_id);
              const risk = riskData?.risk;
              const parsed = riskData?.parsed;
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
                      <div className="flex items-center gap-2">
                        <span>{invoice.invoice_id}</span>
                        {parsed?.hasAI && (
                          <div className="group relative">
                            <Sparkles 
                              size={16} 
                              className="text-purple-500 cursor-help" 
                              title="AI-enriched risk analysis"
                            />
                            {parsed.aiMeta && (
                              <div className="hidden group-hover:block absolute z-10 left-0 top-6 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-pre-line shadow-lg min-w-[200px]">
                                {formatAiMetaTooltip(parsed.aiMeta)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                    <td className="px-6 py-4 text-sm">
                      {parsed && parsed.reasons.length > 0 ? (
                        <div className="space-y-1">
                          {/* Show first 2 reasons */}
                          {parsed.reasons.slice(0, 2).map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              {reason.source === 'AI' && (
                                <Sparkles size={12} className="text-purple-500 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${reason.source === 'AI' ? 'text-purple-700' : 'text-gray-700'} line-clamp-1`}>
                                {reason.text}
                              </span>
                            </div>
                          ))}
                          {/* Show "More" button if > 2 reasons */}
                          {parsed.reasons.length > 2 && (
                            <button
                              onClick={() => openReasonsModal(invoice.invoice_id, parsed.reasons, parsed.aiMeta)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                            >
                              <Info size={12} />
                              +{parsed.reasons.length - 2} more
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No reasons</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
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

                          {/* Risk Reasons - Detailed View */}
                          {parsed && parsed.reasons && parsed.reasons.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" />
                                All Risk Reasons
                              </h4>
                              <ul className="space-y-2">
                                {parsed.reasons.map((reason, idx) => (
                                  <li key={idx} className="text-sm pl-4 flex items-start gap-2">
                                    {reason.source === 'AI' ? (
                                      <Sparkles size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <span className="text-gray-400 font-bold mt-0.5">•</span>
                                    )}
                                    <div>
                                      <div className={`font-medium ${reason.source === 'AI' ? 'text-purple-700' : 'text-gray-900'}`}>
                                        {reason.source === 'AI' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mr-2">AI</span>}
                                        {reason.text}
                                      </div>
                                    </div>
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
      )}

      {/* Reasons Modal */}
      {reasonsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeReasonsModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-orange-500" />
                  Risk Analysis Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">Invoice: {reasonsModal.invoiceId}</p>
              </div>
              <button
                onClick={closeReasonsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {reasonsModal.aiMeta && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <h4 className="text-sm font-semibold text-purple-900">AI Analysis Metadata</h4>
                  </div>
                  <div className="text-sm text-purple-800 space-y-1">
                    {reasonsModal.aiMeta.provider && (
                      <div><span className="font-medium">Provider:</span> {reasonsModal.aiMeta.provider}</div>
                    )}
                    {reasonsModal.aiMeta.model && (
                      <div><span className="font-medium">Model:</span> {reasonsModal.aiMeta.model}</div>
                    )}
                    {reasonsModal.aiMeta.supplier_signal && (
                      <div><span className="font-medium">Supplier Signal:</span> {reasonsModal.aiMeta.supplier_signal}</div>
                    )}
                    {typeof reasonsModal.aiMeta.risk_adjustment === 'number' && (
                      <div>
                        <span className="font-medium">Risk Adjustment:</span>{' '}
                        <span className={reasonsModal.aiMeta.risk_adjustment >= 0 ? 'text-red-600' : 'text-green-600'}>
                          {reasonsModal.aiMeta.risk_adjustment >= 0 ? '+' : ''}
                          {(reasonsModal.aiMeta.risk_adjustment * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {typeof reasonsModal.aiMeta.base_rate === 'number' && typeof reasonsModal.aiMeta.final_rate === 'number' && (
                      <div>
                        <span className="font-medium">Rate Change:</span>{' '}
                        {(reasonsModal.aiMeta.base_rate * 100).toFixed(1)}% → {(reasonsModal.aiMeta.final_rate * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">All Reasons ({reasonsModal.reasons.length})</h4>
                <ul className="space-y-3">
                  {reasonsModal.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {reason.source === 'AI' ? (
                        <Sparkles size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {reason.source === 'AI' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">
                              AI INSIGHT
                            </span>
                          )}
                          {reason.source === 'RULE' && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold">
                              RULE-BASED
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${reason.source === 'AI' ? 'text-purple-900' : 'text-gray-900'}`}>
                          {reason.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeReasonsModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
