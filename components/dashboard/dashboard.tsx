"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart2,
  History,
  Settings,
  Play,
  Clock,
  TrendingUp,
  User,
  LogOut,
  MoreVertical,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks";

// --- MOCK DATA ---
const stats = [
  {
    label: "Interviews",
    value: "12",
    icon: <LayoutDashboard size={20} />,
    change: "+2 this week",
  },
  {
    label: "Avg. Score",
    value: "84%",
    icon: <TrendingUp size={20} />,
    change: "+5% increase",
  },
  {
    label: "Hours Practiced",
    value: "8.5h",
    icon: <Clock size={20} />,
    change: "Top 10%",
  },
];

const recents = [
  {
    id: 1,
    role: "Backend Developer",
    company: "Amazon",
    date: "Today, 10:30 AM",
    score: 88,
    status: "Completed",
  },
  {
    id: 2,
    role: "FullStack Engineer",
    company: "Google",
    date: "Yesterday",
    score: 72,
    status: "Review Pending",
  },
  {
    id: 3,
    role: "SDE II",
    company: "Netflix",
    date: "Oct 24, 2025",
    score: 91,
    status: "Completed",
  },
];

export const DashboardPage = () => {
  const { user, signout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sidebar Items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
    { id: "history", label: "History", icon: <History size={20} /> },
    { id: "settings", label: "Profile", icon: <Settings size={20} /> },
  ];

  return (
    <div
      className="min-h-screen relative flex overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        {/* Subtle decorative blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 blur-[100px] rounded-full"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className="relative z-20 w-64 hidden md:flex flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-xl p-6">
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
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-400 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-500 hover:bg-white hover:text-indigo-400"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Welcome back, ready to ace your next interview?
              </p>
            </div>
            <div className="md:hidden">
              {/* Mobile Menu Trigger Placeholder */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User size={20} className="text-slate-600" />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* 2. START NEW MEET SECTION (Hero) */}
                <section className="relative overflow-hidden rounded-[2rem] bg-indigo-400 text-white shadow-xl shadow-indigo-200 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      System Ready
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      Start New Interview
                    </h2>
                    <p className="text-indigo-100 mb-0">
                      Based on your recent onboarding, we have prepared a{" "}
                      <span className="font-semibold text-white">
                        Backend Developer
                      </span>{" "}
                      mock interview for{" "}
                      <span className="font-semibold text-white">Amazon</span>.
                    </p>
                  </div>
                  <Link href={"/start"}>
                    <button className="relative z-10 bg-white text-indigo-500 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 group whitespace-nowrap cursor-pointer">
                      Start Session
                      <Play
                        size={20}
                        className="fill-indigo-500 group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </Link>
                </section>
                {/* 1. ANALYTICS SECTION (Top) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400 group-hover:bg-indigo-400 group-hover:text-white transition-colors">
                          {stat.icon}
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </section>

                {/* 3. RECENTS SECTION */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                      Recent Activity
                    </h3>
                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-500">
                      View All
                    </button>
                  </div>

                  <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] shadow-sm overflow-hidden">
                    {recents.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-5 hover:bg-white/80 transition-colors cursor-pointer ${
                          idx !== recents.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                            {/* Simple Logo Placeholder */}
                            {item.company[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">
                              {item.role} @ {item.company}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <Calendar size={12} /> {item.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">
                              Score
                            </span>
                            <span
                              className={`font-bold ${
                                item.score >= 80
                                  ? "text-green-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {item.score}%
                            </span>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5">
                            <CheckCircle2 size={12} /> {item.status}
                          </div>
                          <button className="text-slate-400 hover:text-indigo-400">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== "dashboard" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                  <Settings size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Work in Progress
                </h2>
                <p className="text-slate-500 max-w-md">
                  The{" "}
                  <strong>
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </strong>{" "}
                  section is currently under development. Check back later!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
