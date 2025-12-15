"use client";

import { motion } from "framer-motion";
import {
  BarChart2,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- MOCK DATA ---
const meetings = [
  {
    id: 1,
    companyName: "Amazon",
    role: "Backend Developer",
    meetingTime: "2024-12-10T14:30:00",
    duration: 45, // minutes
  },
  {
    id: 2,
    companyName: "Google",
    role: "Full Stack Engineer",
    meetingTime: "2024-12-09T10:15:00",
    duration: 60,
  },
  {
    id: 3,
    companyName: "Netflix",
    role: "SDE II",
    meetingTime: "2024-12-08T16:00:00",
    duration: 50,
  },
  {
    id: 4,
    companyName: "Microsoft",
    role: "Software Engineer",
    meetingTime: "2024-12-07T11:30:00",
    duration: 40,
  },
  {
    id: 5,
    companyName: "Meta",
    role: "Frontend Developer",
    meetingTime: "2024-12-06T15:45:00",
    duration: 55,
  },
];

const overallStats = [
  {
    label: "Total Interviews",
    value: meetings.length,
    icon: <Target size={20} />,
    color: "bg-blue-400",
  },
  {
    label: "This Week",
    value: "3",
    icon: <Calendar size={20} />,
    color: "bg-green-400",
  },
  {
    label: "Total Hours",
    value: `${(
      meetings.reduce((acc, m) => acc + m.duration, 0) / 60
    ).toFixed(1)}h`,
    icon: <Clock size={20} />,
    color: "bg-purple-400",
  },
];

// Helper to format date
const formatMeetingDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to get company color
const getCompanyColor = (companyName: string) => {
  const colors: Record<string, string> = {
    Amazon: "bg-orange-400",
    Google: "bg-blue-500",
    Netflix: "bg-red-500",
    Microsoft: "bg-cyan-500",
    Meta: "bg-blue-600",
    Apple: "bg-slate-800",
  };
  return colors[companyName] || "bg-indigo-400";
};

export const Analytics = () => {
  const router = useRouter();

  const handleViewMeeting = (meetingId: number) => {
    router.push(`/dashboard/analytics/${meetingId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
          Analytics
        </h1>
        <p className="text-slate-500">
          Track your interview performance and progress
        </p>
      </header>

      {/* Overall Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overallStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Meeting Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            Interview Sessions
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BarChart2 size={16} />
            <span>{meetings.length} total</span>
          </div>
        </div>

        <div className="space-y-3">
          {meetings.map((meeting, idx) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Company + Role */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-14 h-14 ${getCompanyColor(
                      meeting.companyName
                    )} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`}
                  >
                    {meeting.companyName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-lg mb-1 truncate">
                      {meeting.role}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {meeting.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <Calendar size={14} />
                    <span>{formatMeetingDate(meeting.meetingTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <Clock size={14} />
                    <span>{meeting.duration} min</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewMeeting(meeting.id)}
                  className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group/btn whitespace-nowrap cursor-pointer"
                >
                  <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Empty State (if no meetings) */}
      {meetings.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/60 backdrop-blur-md border border-white rounded-2xl p-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
            <BarChart2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            No Interviews Yet
          </h2>
          <p className="text-slate-500">
            Start your first mock interview to see analytics here
          </p>
        </div>
      )}
    </motion.div>
  );
};