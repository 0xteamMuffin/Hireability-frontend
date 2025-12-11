"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  History,
  Target,
  Settings,
  User,
  LogOut,
  FileText, // Imported FileText icon for Resume
} from "lucide-react";
import { useAuth } from "@/lib/hooks";

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, signout } = useAuth();

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
    {
      href: "/dashboard/target",
      label: "Goals",
      icon: <Target size={20} />,
    },
    {
      href: "/dashboard/resume", // New Resume Route
      label: "Resume Review",
      icon: <FileText size={20} />,
    },
    // {
    //   href: "/dashboard/history",
    //   label: "History",
    //   icon: <History size={20} />,
    // },
    {
      href: "/dashboard/settings",
      label: "Profile",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside className="relative z-20 w-64 hidden md:flex flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-xl p-6 h-screen top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
          <span className="text-white font-bold text-lg">H</span>
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">
          HireAbility
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
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

      {/* User Mini Profile */}
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
  );
};
