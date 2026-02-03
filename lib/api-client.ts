import {
  InvoicesResponse,
  RiskAnomaliesResponse,
  VendorsAnalyticsResponse,
  DashboardSummaryResponse,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8081';

type ApiEnvelope<T> = {
  data: T;
  error: any;
};

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: 'no-store', // חשוב לדאשבורד
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }

  const json: ApiEnvelope<T> = await res.json();

  if (json.error) {
    throw new Error(`Backend error: ${JSON.stringify(json.error)}`);
  }

  // 🔍 Debug logging to verify API integration
  console.log(`[API Client] ${endpoint}:`, json.data);

  return json.data;
}

export const api = {
  health: () => fetchAPI<{ ok: boolean }>('/health'),

  getInvoices: (limit = 100, includeItems = true) =>
    fetchAPI<InvoicesResponse>(`/invoices?limit=${limit}&include_items=${includeItems}`),

  getRiskAnomalies: (minRate = 0.6) =>
    fetchAPI<RiskAnomaliesResponse>(`/risk/anomalies?min_rate=${minRate}`),

  getVendorsAnalytics: (minRate = 0.6) =>
    fetchAPI<VendorsAnalyticsResponse>(`/risk/vendors?min_rate=${minRate}`),

  getDashboardSummary: () =>
    fetchAPI<DashboardSummaryResponse>('/dashboard/summary'),
};
