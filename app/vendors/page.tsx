'use client';

import { Suspense, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import VendorsTable from '@/components/VendorsTable';

function VendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorParam = searchParams?.get('vendor');
  const [isPending, startTransition] = useTransition();

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-analytics'],
    queryFn: () => api.getVendorsAnalytics(0.0),
  });

  const vendors = vendorsData?.data?.rows || [];
  const vendorNames = vendors.map(v => v.supplier).sort();

  const handleFilterChange = (vendorName: string) => {
    startTransition(() => {
      if (vendorName && vendorName !== 'ALL') {
        const encoded = encodeURIComponent(vendorName);
        router.push(`/vendors?vendor=${encoded}`);
      } else {
        router.push('/vendors');
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendors</h2>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <label htmlFor="vendor-filter" className="font-medium text-gray-700">
            Filter by Vendor:
          </label>
          <select
            id="vendor-filter"
            value={vendorParam || 'ALL'}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Vendors</option>
            {vendorNames.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>

          {vendorParam && (
            <>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                Filtered: {decodeURIComponent(vendorParam)}
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
      
      <VendorsTable filterVendor={vendorParam ? decodeURIComponent(vendorParam) : undefined} />
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading vendors...</div>}>
      <VendorsContent />
    </Suspense>
  );
}
