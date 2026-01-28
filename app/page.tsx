'use client';

import DashboardSummary from '@/components/DashboardSummary';
import VendorsChart from '@/components/VendorsChart';
import RiskChart from '@/components/RiskChart';

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <DashboardSummary />
      </div>

      <div className="space-y-8">
        <RiskChart />
        <VendorsChart />
      </div>
    </div>
  );
}
