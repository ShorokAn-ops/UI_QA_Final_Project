'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RiskLevel } from '@/types/api';
import { RISK_CONFIG } from '@/lib/risk-config';
import InvoicesTable from '@/components/InvoicesTable';

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const riskLevelParam = searchParams?.get('risk_level') as RiskLevel | null;

  const handleFilterChange = (newFilter: RiskLevel | 'ALL') => {
    if (newFilter === 'ALL') {
      router.push('/invoices');
    } else {
      router.push(`/invoices?risk_level=${newFilter}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <label htmlFor="risk-filter" className="font-medium text-gray-700">
            Filter by Risk:
          </label>
          <select
            id="risk-filter"
            value={riskLevelParam || 'ALL'}
            onChange={(e) => handleFilterChange(e.target.value as RiskLevel | 'ALL')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {riskLevelParam && (
            <>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${RISK_CONFIG[riskLevelParam].badgeClass}`}>
                Filtered: {RISK_CONFIG[riskLevelParam].label}
              </span>
              <button
                onClick={() => handleFilterChange('ALL')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      </div>
      
      <InvoicesTable filterRiskLevel={riskLevelParam} />
    </div>
  );
}
