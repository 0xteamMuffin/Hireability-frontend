'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Target,
  Settings,
  User,
  LogOut,
  FileText,
  Menu,
  X,
  Play,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: '/dashboard/interviews',
      label: 'Interviews',
      icon: <Play size={20} />,
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart2 size={20} />,
    },
    { href: '/dashboard/target', label: 'Goals', icon: <Target size={20} /> },
    {
      href: '/dashboard/resume',
      label: 'Resume Review',
      icon: <FileText size={20} />,
    },
    {
      href: '/dashboard/settings',
      label: 'Profile',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400 shadow-md shadow-indigo-200">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">HireAbility</span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* --- MOBILE BACKDROP --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200/60 bg-white/90 p-6 backdrop-blur-xl transition-transform duration-300 ease-in-out md:bg-white/50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } `}
      >
        {/* Header */}
        <div className="mb-10 flex items-center justify-between px-2">
          <Link href={'/'}>
            <div className="flex cursor-pointer items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400 shadow-md shadow-indigo-200">
                <span className="text-lg font-bold text-white">H</span>
              </div>
              <span className="hidden text-xl font-bold tracking-tight text-slate-800 md:block">
                HireAbility
              </span>
              {/* Show title on mobile sidebar as well */}
              <span className="text-xl font-bold tracking-tight text-slate-800 md:hidden">
                HireAbility
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 transition-colors hover:text-red-400 md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-400 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-white hover:text-indigo-400'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="mt-auto border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-400 shadow-sm">
              <User size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                {user?.username || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">Free Plan</p>
            </div>
            <button
              onClick={signout}
              className="text-slate-400 transition-colors hover:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
