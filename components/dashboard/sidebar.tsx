"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/hooks";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: <BarChart2 size={20} />,
    },
    { href: "/dashboard/target", label: "Goals", icon: <Target size={20} /> },
    {
      href: "/dashboard/resume",
      label: "Resume Review",
      icon: <FileText size={20} />,
    },
    {
      href: "/dashboard/settings",
      label: "Profile",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href={"/"}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              HireAbility
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 
          bg-white/90 md:bg-white/50 backdrop-blur-xl 
          border-r border-slate-200/60 
          flex flex-col p-6 
          transition-transform duration-300 ease-in-out
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <Link href={"/"}>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight hidden md:block">
                HireAbility
              </span>
              {/* Show title on mobile sidebar as well */}
              <span className="font-bold text-xl text-slate-800 tracking-tight md:hidden">
                HireAbility
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-red-400 transition-colors"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-400 text-white shadow-lg shadow-indigo-200"
                    : "text-slate-500 hover:bg-white hover:text-indigo-400"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
            <button
              onClick={signout}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
