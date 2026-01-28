# Risk Handling & Mapping - Frontend Implementation

## 🎯 Overview

This document describes how the frontend handles risk levels in the AI Purchase Invoice Risk Analyzer.

**Key Principle:** The frontend is a **pure presentation layer** for risk data.

```
Backend = Brain 🧠  (Calculates risk)
Frontend = Eyes 👀  (Displays risk)
```

## 📡 Backend Contract

The backend returns risk data for each invoice:

```typescript
{
  "invoice_id": "ACC-PINV-2026-00007",
  "supplier": "NovaTech Trading",
  "rate": 0.87,
  "risk_level": "HIGH",
  "reasons": [
    {
      "reason": "High unit price",
      "details": "Unit price 10,000 exceeds expected threshold"
    }
  ]
}
```

## 🚦 Risk Levels

Risk levels are **string enums** calculated by the backend:

```typescript
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
```

**Risk Progression Order:**
```
LOW → MEDIUM → HIGH → CRITICAL
```

## 🎨 Frontend Architecture

### 1. Risk Configuration (`lib/risk-config.ts`)

Centralized configuration mapping risk levels to UI representations:

```typescript
export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  LOW: {
    label: 'Low Risk',
    color: 'green',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    chartColor: '#10b981',
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'yellow',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    chartColor: '#f59e0b',
  },
  HIGH: {
    label: 'High Risk',
    color: 'orange',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    chartColor: '#f97316',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'red',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    chartColor: '#ef4444',
  },
};
```

### 2. Type Definitions (`types/api.ts`)

```typescript
export interface RiskReason {
  reason: string;
  details: string;
}

export interface RiskAnomaly {
  invoice_id: string;
  supplier?: string;
  rate: number;        // Confidence score (0-1)
  risk_level: RiskLevel; // Trust this value from backend
  reasons: RiskReason[];
}
```

### 3. Utility Functions (`lib/utils.ts`)

Helper functions that use the centralized configuration:

```typescript
// Get chart color for a risk level
export const getRiskColor = (level: RiskLevel): string => {
  return getRiskChartColor(level);
};

// Get badge CSS classes for a risk level
export const getRiskBgColor = (level: RiskLevel): string => {
  const config = getRiskConfig(level);
  return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
};
```

### 4. Components

#### RiskBadge (`components/RiskBadge.tsx`)
Reusable component for displaying risk levels:

```tsx
<RiskBadge riskLevel={invoice.risk_level} />
```

#### RiskChart (`components/RiskChart.tsx`)
Visualizes risk distribution using backend data:
- Bar chart showing invoice counts per risk level
- Uses RISK_LEVEL_ORDER for consistent ordering
- Color-coded by risk level

#### InvoicesTable (`components/InvoicesTable.tsx`)
Displays invoices with risk badges and detailed reasons:
- Risk badge with confidence score
- Expandable rows showing risk reasons
- Formatted reason details

## ✅ What the Frontend Does

1. **Consumes** risk_level from backend API
2. **Maps** risk_level to visual styles using `RISK_CONFIG`
3. **Displays** risk badges in:
   - Invoice list
   - Invoice details
   - Dashboard charts
4. **Shows** risk reasons with proper formatting
5. **Provides** safe fallbacks (defaults to LOW if undefined)

## ❌ What the Frontend Does NOT Do

The frontend **NEVER**:

- ❌ Calculates or derives risk from `rate`, `amount`, or `quantity`
- ❌ Rechecks unit prices or quantities
- ❌ Overrides backend risk decisions
- ❌ Hardcodes risk thresholds
- ❌ Performs any risk logic

## 📊 Visual Mapping

| Risk Level | Color  | Badge Style                    | Use Case        |
|-----------|--------|--------------------------------|-----------------|
| CRITICAL  | Red    | Alert style with icon          | Immediate action|
| HIGH      | Orange | Strong warning                 | Review required |
| MEDIUM    | Yellow | Soft warning                   | Monitor         |
| LOW       | Green  | Calm/neutral                   | Normal          |

## 🔧 Usage Examples

### Display Risk Badge
```tsx
import RiskBadge from '@/components/RiskBadge';

<RiskBadge riskLevel={invoice.risk_level} />
```

### Safe Risk Access
```tsx
const safeRiskLevel = invoice.risk_level ?? "LOW";
const config = getRiskConfig(safeRiskLevel);
```

### Display Risk Reasons
```tsx
{risk.reasons.map((reason, idx) => (
  <li key={idx}>
    <div className="font-medium">{reason.reason}</div>
    <div className="text-gray-600">{reason.details}</div>
  </li>
))}
```

### Chart Integration
```tsx
import { RISK_CONFIG, RISK_LEVEL_ORDER } from '@/lib/risk-config';

const chartData = RISK_LEVEL_ORDER.map((level) => ({
  risk_level: level,
  count: summary.risk_counts[level],
  color: RISK_CONFIG[level].chartColor,
}));
```

## 🛡️ Safety Features

1. **Type Safety**: TypeScript enforces RiskLevel enum
2. **Fallback Handling**: Defaults to LOW if undefined
3. **Centralized Config**: Single source of truth for styling
4. **Backend Trust**: No client-side risk calculation

## 🧪 Testing Considerations

When testing:

1. Mock API responses with correct `risk_level` values
2. Test all risk levels: LOW, MEDIUM, HIGH, CRITICAL
3. Verify visual rendering for each level
4. Test fallback behavior (undefined risk_level)
5. Ensure reasons display correctly

## 📝 Best Practices

1. **Always use** `getRiskConfig()` for consistent styling
2. **Never recalculate** risk_level on the frontend
3. **Trust the backend** - it's the source of truth
4. **Use RiskBadge** component for consistency
5. **Provide fallbacks** for safety

## 🚀 Integration Points

### Dashboard Summary
- Displays risk counts from backend
- Uses `risk_counts` object

### Invoices Table
- Shows risk badge per invoice
- Displays detailed risk reasons
- Expandable rows for more info

### Charts
- Risk distribution chart
- Vendor risk analytics
- All use backend risk_level

## 📖 Related Files

- `lib/risk-config.ts` - Risk configuration and utilities
- `types/api.ts` - TypeScript type definitions
- `lib/utils.ts` - Helper functions
- `components/RiskBadge.tsx` - Reusable badge component
- `components/RiskChart.tsx` - Risk distribution chart
- `components/InvoicesTable.tsx` - Main invoice display
- `components/DashboardSummary.tsx` - Summary cards
- `components/VendorsChart.tsx` - Vendor analytics

---

**Remember:** Backend = Brain 🧠, Frontend = Eyes 👀
