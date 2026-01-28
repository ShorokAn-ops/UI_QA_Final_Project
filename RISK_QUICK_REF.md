# Quick Reference: Risk Handling

## ⚡ Quick Start

### Display a Risk Badge
```tsx
import RiskBadge from '@/components/RiskBadge';

<RiskBadge riskLevel={invoice.risk_level} />
```

### Get Risk Styling
```tsx
import { getRiskConfig } from '@/lib/risk-config';

const config = getRiskConfig(riskLevel);
// Access: config.label, config.color, config.badgeClass, config.chartColor
```

### Safe Risk Access
```tsx
const safeRiskLevel = invoice.risk_level ?? "LOW";
```

## 🎨 Risk Level Colors

| Level    | Color  | Hex     |
|----------|--------|---------|
| LOW      | Green  | #10b981 |
| MEDIUM   | Yellow | #f59e0b |
| HIGH     | Orange | #f97316 |
| CRITICAL | Red    | #ef4444 |

## ✅ DO

✅ Use `risk_level` from backend API  
✅ Use `RISK_CONFIG` for styling  
✅ Use `RiskBadge` component  
✅ Provide fallbacks (`?? "LOW"`)  
✅ Display `risk.reasons` array  

## ❌ DON'T

❌ Calculate risk from rate/amount/quantity  
❌ Override backend risk_level  
❌ Hardcode risk thresholds  
❌ Modify risk logic in frontend  

## 📦 Import Paths

```tsx
// Types
import { RiskLevel, RiskAnomaly, RiskReason } from '@/types/api';

// Configuration
import { RISK_CONFIG, getRiskConfig, RISK_LEVEL_ORDER } from '@/lib/risk-config';

// Components
import RiskBadge from '@/components/RiskBadge';
import RiskChart from '@/components/RiskChart';

// Utils
import { getRiskColor, getRiskBgColor } from '@/lib/utils';
```

## 🎯 Common Patterns

### Conditional Risk Display
```tsx
{risk ? (
  <RiskBadge riskLevel={risk.risk_level} />
) : (
  <span className="text-gray-500">No Risk Data</span>
)}
```

### Risk Reasons Loop
```tsx
{risk.reasons.map((reason, idx) => (
  <div key={idx}>
    <strong>{reason.reason}</strong>
    <p>{reason.details}</p>
  </div>
))}
```

### Chart Data Preparation
```tsx
const chartData = RISK_LEVEL_ORDER.map(level => ({
  level,
  count: summary.risk_counts[level] || 0,
  color: RISK_CONFIG[level].chartColor,
}));
```

---

**Remember:** Backend calculates, Frontend displays! 🧠👀
