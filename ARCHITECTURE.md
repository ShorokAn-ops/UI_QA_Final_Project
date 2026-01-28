# Risk Handling Architecture Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         BACKEND (FastAPI + ERPNext)                    ┃
┃                              Brain 🧠                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                    │
                                    │ HTTP/JSON
                                    │
                      ┌─────────────┴─────────────┐
                      │                           │
                      ▼                           ▼
          ┌─────────────────────┐    ┌─────────────────────┐
          │  GET /invoices      │    │ GET /risk/anomalies │
          │                     │    │                     │
          │ Returns invoices    │    │ Returns:            │
          │ with items          │    │ • invoice_id        │
          │                     │    │ • supplier          │
          │                     │    │ • rate (0-1)        │
          │                     │    │ • risk_level ✨     │
          │                     │    │ • reasons[]         │
          └─────────────────────┘    └─────────────────────┘
                                              │
                                              │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    FRONTEND (Next.js + React)                         ┃
┃                         Eyes 👀                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   lib/api-client.ts   │
                        │  Fetches backend data │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
        │   types/api.ts   │  │risk-config.ts│  │   lib/utils.ts   │
        │                  │  │              │  │                  │
        │ • RiskLevel      │  │ RISK_CONFIG: │  │ getRiskColor()   │
        │ • RiskReason     │  │   LOW:       │  │ getRiskBgColor() │
        │ • RiskAnomaly    │  │   MEDIUM:    │  │ formatCurrency() │
        │                  │  │   HIGH:      │  │ formatDate()     │
        │ Type Definitions │  │   CRITICAL:  │  │ formatPercentage()
        └──────────────────┘  │              │  └──────────────────┘
                              │ getRiskConfig│
                              │ etc.         │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
        │  RiskBadge.tsx  │  │RiskChart.tsx│  │InvoicesTable.tsx│
        │                 │  │             │  │                 │
        │ Displays risk   │  │ Bar chart   │  │ • Risk badges   │
        │ level badge     │  │ showing     │  │ • Risk reasons  │
        │ with icon       │  │ distribution│  │ • Expandable    │
        └─────────────────┘  └─────────────┘  └─────────────────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │      User Interface    │
                        │                        │
                        │  ┏━━━━━━━━━━━━━━━━┓  │
                        │  ┃ Dashboard      ┃  │
                        │  ┃ • Summary Cards┃  │
                        │  ┃ • Risk Chart   ┃  │
                        │  ┃ • Vendor Chart ┃  │
                        │  ┗━━━━━━━━━━━━━━━━┛  │
                        │                        │
                        │  ┏━━━━━━━━━━━━━━━━┓  │
                        │  ┃ Invoices Table ┃  │
                        │  ┃ • Risk Badges  ┃  │
                        │  ┃ • Details      ┃  │
                        │  ┃ • Reasons      ┃  │
                        │  ┗━━━━━━━━━━━━━━━━┛  │
                        └────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Backend AI Analyzes Invoice                                   │
│    ├─ Checks unit prices                                         │
│    ├─ Validates quantities                                       │
│    ├─ Detects anomalies                                          │
│    └─ CALCULATES risk_level: "HIGH"                              │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. API Response                                                   │
│    {                                                              │
│      "invoice_id": "ACC-PINV-2026-00007",                        │
│      "rate": 0.87,                                               │
│      "risk_level": "HIGH",         ◄─── Trusted by frontend     │
│      "reasons": [...]                                            │
│    }                                                              │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. Frontend Mapping                                               │
│    const config = getRiskConfig("HIGH");                         │
│    → {                                                            │
│        label: "High Risk",                                       │
│        color: "orange",                                          │
│        badgeClass: "bg-orange-100 text-orange-800",             │
│        chartColor: "#f97316"                                     │
│      }                                                            │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. Visual Display                                                 │
│    <RiskBadge riskLevel="HIGH" />                                │
│    → Renders as: [High Risk] (orange background)                │
└──────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
app/page.tsx (Dashboard)
├─ DashboardSummary
│  └─ Displays risk_counts from backend
├─ RiskChart
│  ├─ Uses RISK_LEVEL_ORDER
│  └─ Maps risk_level → chart colors
└─ VendorsChart
   └─ Shows vendor risk analytics

app/invoices/page.tsx
└─ InvoicesTable
   ├─ Maps risk_level → RiskBadge
   ├─ Displays confidence score (rate)
   └─ Shows risk.reasons
      ├─ reason.reason
      └─ reason.details
```

## Configuration Structure

```
lib/risk-config.ts
│
├─ RISK_CONFIG
│  ├─ LOW:      { label, color, badgeClass, chartColor }
│  ├─ MEDIUM:   { label, color, badgeClass, chartColor }
│  ├─ HIGH:     { label, color, badgeClass, chartColor }
│  └─ CRITICAL: { label, color, badgeClass, chartColor }
│
├─ RISK_LEVEL_ORDER: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
│
└─ Helper Functions
   ├─ getRiskConfig(level)
   ├─ getRiskBadgeClass(level)
   └─ getRiskChartColor(level)
```

## Key Principles

```
┌─────────────────────────────────────────────────────────────┐
│                     SEPARATION OF CONCERNS                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (Brain 🧠)          Frontend (Eyes 👀)              │
│  ─────────────────          ────────────────                │
│  ✓ Calculate risk_level     ✓ Map risk → styles            │
│  ✓ Analyze anomalies        ✓ Display badges               │
│  ✓ Apply ML/AI logic        ✓ Show charts                  │
│  ✓ Business rules           ✓ Format data                  │
│  ✓ Thresholds               ✓ User interactions            │
│                                                              │
│  ✗ NO UI concerns           ✗ NO risk calculation          │
│  ✗ NO styling               ✗ NO thresholds                │
│                             ✗ NO overrides                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Risk Level Progression

```
                    Severity Scale
  ◄─────────────────────────────────────────────►
  
  LOW         MEDIUM         HIGH         CRITICAL
  🟢          🟡             🟠           🔴
  
  Normal      Monitor        Review       Immediate
  Operation   Needed         Required     Action
  
  #10b981     #f59e0b        #f97316      #ef4444
```

---

**Architecture Status: ✅ Implemented & Documented**
