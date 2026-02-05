// Backend API Types

export interface InvoiceItem {
  item_code?: string;
  item_name?: string;
  qty?: number;
  rate?: number;   // unit price
  amount?: number;
}

export interface Invoice {
  invoice_id: string;
  supplier?: string;
  posting_date?: string;
  grand_total?: number;
  erp_modified?: string;
  items: InvoiceItem[];
}

export interface InvoicesResponse {
  data: Invoice[];
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// AI metadata from risk analysis
export interface AiMeta {
  provider?: string;
  model?: string;
  risk_adjustment?: number;
  supplier_signal?: string;
  base_rate?: number;
  final_rate?: number;
}

// Normalized reason format (client-side)
export interface NormalizedReason {
  source: "RULE" | "AI";
  text: string;
  meta?: any;
}

// Raw reason from API (can be string or object)
export type RawReason = string | {
  reason: string;
  details?: any;
};

export interface RiskReason {
  reason: string;
  details: string;
}

export interface RiskAnomaly {
  invoice_id: string;
  supplier?: string;
  rate: number;        // 0..1 (confidence score)
  risk_level: RiskLevel; // Always trust this value from backend
  reasons: RawReason[]; // Can be string or object
}

export interface RiskAnomaliesResponse {
  data: RiskAnomaly[];
}

export interface VendorAnalytics {
  supplier: string;
  invoices: number;
  avg_total: number;
  high_or_more: number;
  critical: number;
}

export interface VendorsAnalyticsResponse {
  data: {
    rows: VendorAnalytics[];
  };
}

export interface DashboardSummary {
  total_invoices: number;
  total_suppliers: number;
  risk_counts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
    NO_RISK: number;
  };
}

export interface DashboardSummaryResponse {
  data: DashboardSummary;
}
