'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 5000, // Poll every 5 seconds
            staleTime: 3000,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>ERPNext Anomalous Analyzer Dashboard</title>
        <meta name="description" content="Real-time risk analysis dashboard for ERPNext invoices" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-sm text-gray-500">
                  ERPNext Anomalous Analyzer • Data refreshes every 5 seconds
                </p>
              </div>
            </footer>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
