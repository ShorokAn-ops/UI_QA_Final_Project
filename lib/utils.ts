import { RiskLevel } from '@/types/api';
import { getRiskConfig, getRiskChartColor } from './risk-config';

/**
 * Get chart color for a risk level
 * Uses centralized risk configuration
 */
export const getRiskColor = (level: RiskLevel): string => {
  return getRiskChartColor(level);
};

/**
 * Get badge CSS classes for a risk level
 * Uses centralized risk configuration
 * 
 * IMPORTANT: Do NOT modify or recalculate risk_level.
 * Always use the value from the backend API.
 */
export const getRiskBgColor = (level: RiskLevel): string => {
  const config = getRiskConfig(level);
  return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatPercentage = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};
