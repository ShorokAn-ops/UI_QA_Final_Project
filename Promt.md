FRONTEND PROMPT – ERPNext Risk Analyzer Dashboard
Context

You are building a React / Next.js dashboard that consumes an existing FastAPI backend.
The backend is already implemented and is the single source of truth (DB-driven) with background sync from ERPNext.

Your task is to design and implement a clean, professional, light-colored UI that fully matches the backend API responses and data model.

🔗 Backend API – Available Endpoints

Base URL:

http://localhost:8081

1️⃣ Health
GET /health

2️⃣ Invoices list (DB source of truth)
GET /invoices?limit=100&include_items=true


Response structure:

{
  data: {
    invoice_id: string;
    supplier?: string;
    posting_date?: string;
    grand_total?: number;
    erp_modified?: string;
    items: {
      item_code?: string;
      item_name?: string;
      qty?: number;
      rate?: number;   // unit price
      amount?: number;
    }[];
  }[];
}


👉 UI requirements

Table view

Columns:

Invoice ID

Supplier

Invoice Date

Total Amount

Risk Level (from anomalies endpoint)

Expandable row / modal to show:

Items table (Quantity + Unit Price are mandatory)

3️⃣ Risk anomalies
GET /risk/anomalies?min_rate=0.6


Response:

{
  data: {
    invoice_id: string;
    supplier?: string;
    rate: number;        // 0..1
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reasons: any[];
  }[];
}


👉 UI requirements

Highlight risky invoices

Color mapping:

LOW → green

MEDIUM → yellow

HIGH → orange

CRITICAL → red

Show:

Risk level badge

Risk score (percentage)

Tooltip / expandable section for reasons

4️⃣ Vendors analytics (charts)
GET /risk/vendors?min_rate=0.6


Response:

{
  data: {
    rows: {
      supplier: string;
      invoices: number;
      avg_total: number;
      high_or_more: number;
      critical: number;
    }[];
  }
}


👉 UI requirements

Charts (use Recharts / Chart.js):

Bar chart: number of invoices per supplier

Stacked bar or grouped chart: HIGH + CRITICAL per supplier

Display supplier name + invoice count clearly

5️⃣ Dashboard summary
GET /dashboard/summary


Response:

{
  data: {
    total_invoices: number;
    total_suppliers: number;
    risk_counts: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRITICAL: number;
      NO_RISK: number;
    }
  }
}


👉 UI requirements

Top KPI cards:

Total invoices

Total suppliers

Critical invoices

Clean cards with icons

⚡ UX & State Management Rules

Use React Query / SWR

Polling:

Refresh data every 3–5 seconds

Use stale-while-revalidate

Avoid flickering:

Skeleton should disappear immediately once data arrives

Do NOT keep skeleton visible after data is rendered

Backend already handles caching → frontend should not over-optimize

🎨 Design Guidelines

Light theme (white / soft gray background)

Professional, financial-dashboard style

Clear typography

Use badges, chips, and subtle shadows

No dark theme

No upload / PDF actions (read-only dashboard)

❌ Important Constraints

Do NOT calculate risk on frontend

Do NOT duplicate backend logic

Backend is the only source of truth

Frontend should adapt strictly to backend fields

✅ Final Goal

Produce a responsive, clean, production-ready dashboard that:

Clearly shows risk per invoice

Highlights dangerous suppliers

Feels real-time

Is suitable for a final academic / QA automation project demo