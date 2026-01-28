'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, FileText, Users } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/vendors', label: 'Vendors', icon: Users },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ERPNext Risk Analyzer
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time invoice risk monitoring and analysis
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-1 -mb-px">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
