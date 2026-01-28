/**
 * Risk Configuration
 * 
 * The frontend acts as a pure presentation layer for risk data.
 * All risk calculations are performed by the backend.
 * 
 * Backend = Brain 🧠
 * Frontend = Eyes 👀
 * 
 * CRITICAL: Do NOT recalculate risk_level in the frontend.
 * Always use the risk_level value provided by the backend API.
 */

import { RiskLevel } from '@/types/api';

export interface RiskConfig {
  label: string;
  color: string;
  badgeClass: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  chartColor: string;
}

/**
 * Risk Level Configuration Mapping
 * Maps backend risk_level values to frontend UI representations
 */
export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  LOW: {
    label: 'Low Risk',
    color: 'green',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    chartColor: '#10b981',
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'yellow',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    chartColor: '#f59e0b',
  },
  HIGH: {
    label: 'High Risk',
    color: 'orange',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    chartColor: '#f97316',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'red',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    chartColor: '#ef4444',
  },
};

/**
 * Risk Level Order (for sorting)
 * LOW → MEDIUM → HIGH → CRITICAL
 */
export const RISK_LEVEL_ORDER: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Get risk configuration for a given risk level
 * Provides safe fallback to LOW if risk_level is undefined
 * 
 * @param riskLevel - The risk level from the backend
 * @returns Risk configuration object
 */
export const getRiskConfig = (riskLevel?: RiskLevel): RiskConfig => {
  const safeRiskLevel = riskLevel ?? 'LOW';
  return RISK_CONFIG[safeRiskLevel];
};

/**
 * Get full badge CSS classes for a risk level
 * 
 * @param riskLevel - The risk level from the backend
 * @returns Complete badge CSS class string
 */
export const getRiskBadgeClass = (riskLevel?: RiskLevel): string => {
  const config = getRiskConfig(riskLevel);
  return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
};

/**
 * Get chart color for a risk level
 * 
 * @param riskLevel - The risk level from the backend
 * @returns Hex color code for charts
 */
export const getRiskChartColor = (riskLevel: RiskLevel): string => {
  return RISK_CONFIG[riskLevel].chartColor;
};
