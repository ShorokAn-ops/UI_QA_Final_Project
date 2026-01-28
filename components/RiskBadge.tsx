/**
 * Risk Badge Component
 * 
 * A reusable component for displaying risk levels consistently across the application.
 * 
 * CRITICAL: This component does NOT calculate risk levels.
 * It only displays the risk_level value received from the backend.
 * 
 * Backend = Brain 🧠
 * Frontend = Eyes 👀
 */

import { RiskLevel } from '@/types/api';
import { getRiskConfig } from '@/lib/risk-config';
import { AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  showIcon?: boolean;
  className?: string;
}

export default function RiskBadge({ riskLevel, showIcon = true, className = '' }: RiskBadgeProps) {
  const config = getRiskConfig(riskLevel);
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${config.badgeClass} ${className}`}
    >
      {showIcon && riskLevel === 'CRITICAL' && <AlertCircle size={14} />}
      {config.label}
    </span>
  );
}
