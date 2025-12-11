"use client";

import { useEffect, useState } from "react";
import { History, Calendar, CheckCircle2, MoreVertical, Loader2 } from "lucide-react";
import { vapiApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { InterviewWithAnalysis } from "@/lib/types";

export const HistoryPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return;
      try {
        const response = await vapiApi.getInterviews();
        if (response.success && response.data) {
          setInterviews(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const getScore = (interview: InterviewWithAnalysis) => {
    if (interview.analysis?.overall && typeof interview.analysis.overall === 'object' && 'score' in interview.analysis.overall) {
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
    <div>
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">
        History
      </h1>
      
      <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] shadow-sm overflow-hidden">
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
              <History size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No Past Interviews
            </h2>
            <p className="text-slate-500">Start a new session to see your history here.</p>
          </div>
        ) : (
          interviews.map((item) => {
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
                        score && score >= 80 ? "text-green-500" : "text-orange-500"
                      }`}
                    >
                      {score ? `${score}%` : "N/A"}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> {item.endedAt ? "Completed" : "In Progress"}
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
    </div>
  );
};

