"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  TrendingUp,
  Play,
  Calendar,
  CheckCircle2,
  MoreVertical,
  User,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { vapiApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { InterviewWithAnalysis } from "@/lib/types";

export const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: "0%",
    hoursPracticed: "0h",
  });
  const [recents, setRecents] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [statsRes, interviewsRes] = await Promise.all([
          vapiApi.getStats(),
          vapiApi.getInterviews(),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (interviewsRes.success && interviewsRes.data) {
          setRecents(interviewsRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const statCards = [
    {
      label: "Interviews",
      value: stats.totalInterviews.toString(),
      icon: <LayoutDashboard size={20} />,
      change: "Total sessions",
    },
    {
      label: "Avg. Score",
      value: stats.avgScore,
      icon: <TrendingUp size={20} />,
      change: "Overall performance",
    },
    {
      label: "Hours Practiced",
      value: stats.hoursPracticed,
      icon: <Clock size={20} />,
      change: "Time invested",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getScore = (interview: InterviewWithAnalysis) => {
    if (
      interview.analysis?.overall &&
      typeof interview.analysis.overall === "object" &&
      "score" in interview.analysis.overall
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (interview.analysis.overall as any).score;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.firstName || "User"}! Ready to ace your next
            interview?
          </p>
        </div>
        <div className="md:hidden">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <User size={20} className="text-slate-600" />
          </div>
        </div>
      </header>

      {/* 2. START NEW MEET SECTION (Hero) */}
      <section className="relative overflow-hidden rounded-[2rem] bg-indigo-400 text-white shadow-xl shadow-indigo-200 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            System Ready
          </div>
          <h2 className="text-3xl font-bold mb-2">Start New Interview</h2>
          <p className="text-indigo-100 mb-0">
            Start a new mock interview session to practice your skills and get
            real-time feedback.
          </p>
        </div>
        <Link href="/config">
          <button className="relative z-10 bg-white text-indigo-500 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 group whitespace-nowrap cursor-pointer">
            Start Session
            <Play
              size={20}
              className="fill-indigo-500 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </Link>
      </section>

      {/* 1. ANALYTICS PREVIEW (Top) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400 group-hover:bg-indigo-400 group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 3. RECENTS SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-500"
          >
            View All
          </Link>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] shadow-sm overflow-hidden">
          {recents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No interviews yet. Start one to see it here!
            </div>
          ) : (
            recents.map((item) => {
              const score = getScore(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 hover:bg-white/80 transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                      I
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Mock Interview
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar size={12} /> {formatDate(item.startedAt)}
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
                          score && score >= 80
                            ? "text-green-500"
                            : "text-orange-500"
                        }`}
                      >
                        {score ? `${score}%` : "N/A"}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 size={12} />{" "}
                      {item.endedAt ? "Completed" : "In Progress"}
                    </div>
                    <button className="text-slate-400 hover:text-indigo-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
};
