import {
  InvoicesResponse,
  RiskAnomaliesResponse,
  VendorsAnalyticsResponse,
  DashboardSummaryResponse,
} from '@/types/api';

const API_BASE_URL = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  health: () => fetchAPI<{ status: string }>('/health'),
  
  getInvoices: (limit = 100, includeItems = true) =>
    fetchAPI<InvoicesResponse>(`/invoices?limit=${limit}&include_items=${includeItems}`),
  
  getRiskAnomalies: (minRate = 0.6) =>
    fetchAPI<RiskAnomaliesResponse>(`/risk/anomalies?min_rate=${minRate}`),
  
  getVendorsAnalytics: (minRate = 0.6) =>
    fetchAPI<VendorsAnalyticsResponse>(`/risk/vendors?min_rate=${minRate}`),
  
  getDashboardSummary: () =>
    fetchAPI<DashboardSummaryResponse>('/dashboard/summary'),
};
