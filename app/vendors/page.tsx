'use client';

import VendorsTable from '@/components/VendorsTable';

export default function VendorsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendors</h2>
      <VendorsTable />
    </div>
  );
}
