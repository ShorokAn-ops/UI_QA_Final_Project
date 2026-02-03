/**
 * Risk Helpers for AI-enriched risk analysis
 * 
 * These utilities normalize and process risk reasons from the backend,
 * handling both rule-based and AI-generated insights.
 */

import { RawReason, NormalizedReason, AiMeta, VendorAnalytics } from '@/types/api';

/**
 * Parse reasons array from backend into normalized format
 * Extracts AI metadata and separates it from display reasons
 * 
 * @param reasons - Array of reasons (can be strings or objects)
 * @returns Object with normalized reasons, AI metadata, and hasAI flag
 */
export function parseReasons(reasons?: RawReason[]): {
  reasons: NormalizedReason[];
  aiMeta?: AiMeta;
  hasAI: boolean;
} {
  if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
    return { reasons: [], hasAI: false };
  }

  const normalizedReasons: NormalizedReason[] = [];
  let aiMeta: AiMeta | undefined;
  let hasAI = false;

  for (const reason of reasons) {
    // Handle string reasons (rule-based)
    if (typeof reason === 'string') {
      normalizedReasons.push({
        source: 'RULE',
        text: reason,
      });
      continue;
    }

    // Handle object reasons
    if (typeof reason === 'object' && reason !== null && 'reason' in reason) {
      const reasonText = reason.reason;
      const details = reason.details;

      // Check for AI metadata
      if (reasonText === 'AI metadata' && typeof details === 'object') {
        hasAI = true;
        aiMeta = {
          provider: details.provider,
          model: details.model,
          risk_adjustment: details.risk_adjustment,
          supplier_signal: details.supplier_signal,
          base_rate: details.base_rate,
          final_rate: details.final_rate,
        };
        // Do NOT add AI metadata to display reasons
        continue;
      }

      // Check for AI insight
      if (reasonText === 'AI insight' && typeof details === 'object' && details.message) {
        hasAI = true;
        normalizedReasons.push({
          source: 'AI',
          text: details.message,
          meta: details,
        });
        continue;
      }

      // Regular rule-based object reason
      const displayText = typeof details === 'string' 
        ? `${reasonText}: ${details}`
        : reasonText;
      
      normalizedReasons.push({
        source: 'RULE',
        text: displayText,
        meta: details,
      });
    }
  }

  return { reasons: normalizedReasons, aiMeta, hasAI };
}

/**
 * Generate human-readable explanation for vendor risk
 * 
 * @param vendor - Vendor analytics data
 * @returns Array of explanation strings (1-2 phrases)
 */
export function getVendorRiskExplanation(vendor: VendorAnalytics): string[] {
  const explanations: string[] = [];

  // Check for critical invoices
  if (vendor.critical > 0) {
    const plural = vendor.critical > 1 ? 'invoices' : 'invoice';
    explanations.push(`${vendor.critical} CRITICAL ${plural}`);
  } else if (vendor.high_or_more > 0) {
    // Only show HIGH+ if no critical
    const plural = vendor.high_or_more > 1 ? 'invoices' : 'invoice';
    explanations.push(`${vendor.high_or_more} HIGH+ ${plural}`);
  }

  // Check for high average total (>$10,000)
  if (vendor.avg_total > 10000) {
    explanations.push(`High avg: $${Math.round(vendor.avg_total / 1000)}K`);
  }

  // Default if no significant risk
  if (explanations.length === 0) {
    explanations.push('Low risk profile');
  }

  return explanations.slice(0, 2); // Max 2 reasons
}

/**
 * Format AI metadata for tooltip display
 * 
 * @param aiMeta - AI metadata object
 * @returns Formatted string for tooltip
 */
export function formatAiMetaTooltip(aiMeta?: AiMeta): string {
  if (!aiMeta) return '';

  const lines: string[] = [];
  
  if (aiMeta.provider) lines.push(`Provider: ${aiMeta.provider}`);
  if (aiMeta.model) lines.push(`Model: ${aiMeta.model}`);
  if (aiMeta.supplier_signal) lines.push(`Signal: ${aiMeta.supplier_signal}`);
  
  if (typeof aiMeta.risk_adjustment === 'number') {
    const sign = aiMeta.risk_adjustment >= 0 ? '+' : '';
    const pct = (aiMeta.risk_adjustment * 100).toFixed(1);
    lines.push(`Adjustment: ${sign}${pct}%`);
  }
  
  if (typeof aiMeta.base_rate === 'number' && typeof aiMeta.final_rate === 'number') {
    const basePct = (aiMeta.base_rate * 100).toFixed(1);
    const finalPct = (aiMeta.final_rate * 100).toFixed(1);
    lines.push(`${basePct}% → ${finalPct}%`);
  }

  return lines.join('\n');
}
