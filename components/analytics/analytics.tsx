'use client';

import { motion } from 'framer-motion';
import { BarChart2, Clock, Calendar, TrendingUp, Award, Target, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

const meetings = [
  {
    id: 1,
    companyName: 'Amazon',
    role: 'Backend Developer',
    meetingTime: '2024-12-10T14:30:00',
    duration: 45,
  },
  {
    id: 2,
    companyName: 'Google',
    role: 'Full Stack Engineer',
    meetingTime: '2024-12-09T10:15:00',
    duration: 60,
  },
  {
    id: 3,
    companyName: 'Netflix',
    role: 'SDE II',
    meetingTime: '2024-12-08T16:00:00',
    duration: 50,
  },
  {
    id: 4,
    companyName: 'Microsoft',
    role: 'Software Engineer',
    meetingTime: '2024-12-07T11:30:00',
    duration: 40,
  },
  {
    id: 5,
    companyName: 'Meta',
    role: 'Frontend Developer',
    meetingTime: '2024-12-06T15:45:00',
    duration: 55,
  },
];

const overallStats = [
  {
    label: 'Total Interviews',
    value: meetings.length,
    icon: <Target size={20} />,
    color: 'bg-blue-400',
  },
  {
    label: 'This Week',
    value: '3',
    icon: <Calendar size={20} />,
    color: 'bg-green-400',
  },
  {
    label: 'Total Hours',
    value: `${(meetings.reduce((acc, m) => acc + m.duration, 0) / 60).toFixed(1)}h`,
    icon: <Clock size={20} />,
    color: 'bg-purple-400',
  },
];

const formatMeetingDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getCompanyColor = (companyName: string) => {
  const colors: Record<string, string> = {
    Amazon: 'bg-orange-400',
    Google: 'bg-blue-500',
    Netflix: 'bg-red-500',
    Microsoft: 'bg-cyan-500',
    Meta: 'bg-blue-600',
    Apple: 'bg-slate-800',
  };
  return colors[companyName] || 'bg-indigo-400';
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
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-800">Analytics</h1>
        <p className="text-slate-500">Track your interview performance and progress</p>
      </header>

      {/* Overall Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overallStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}>{stat.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Meeting Cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Interview Sessions</h3>
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
              className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-lg"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                {/* Left: Company + Role */}
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className={`h-14 w-14 ${getCompanyColor(
                      meeting.companyName,
                    )} flex flex-shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-lg`}
                  >
                    {meeting.companyName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 truncate text-lg font-bold text-slate-800">
                      {meeting.role}
                    </h4>
                    <p className="text-sm font-medium text-slate-500">{meeting.companyName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <Calendar size={14} />
                    <span>{formatMeetingDate(meeting.meetingTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <Clock size={14} />
                    <span>{meeting.duration} min</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewMeeting(meeting.id)}
                  className="group/btn flex cursor-pointer items-center gap-2 rounded-full bg-indigo-400 px-6 py-2.5 font-semibold whitespace-nowrap text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg"
                >
                  <Eye size={16} className="transition-transform group-hover/btn:scale-110" />
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Empty State (if no meetings) */}
      {meetings.length === 0 && (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-2xl border border-white bg-white/60 p-8 text-center backdrop-blur-md">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-300">
            <BarChart2 size={40} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">No Interviews Yet</h2>
          <p className="text-slate-500">Start your first mock interview to see analytics here</p>
        </div>
      )}
    </motion.div>
  );
};
