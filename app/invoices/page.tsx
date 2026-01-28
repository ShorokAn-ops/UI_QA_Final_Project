'use client';

import InvoicesTable from '@/components/InvoicesTable';

export default function InvoicesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Invoices</h2>
      <InvoicesTable />
    </div>
  );
}
