"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Target,
  Briefcase,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react";

// Types
interface Goal {
  id: number;
  company: string;
  role: string;
  link: string;
  createdAt: string;
}

export const TargetPage = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      company: "Google",
      role: "Frontend Engineer",
      link: "https://careers.google.com",
      createdAt: "Today",
    },
  ]);

  const [newGoal, setNewGoal] = useState({
    company: "",
    role: "",
    link: "",
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.company || !newGoal.role) return;

    const goal: Goal = {
      id: Date.now(),
      company: newGoal.company,
      role: newGoal.role,
      link: newGoal.link,
      createdAt: "Just now",
    };

    setGoals([goal, ...goals]);
    setNewGoal({ company: "", role: "", link: "" }); // Reset form
  };

  const handleDelete = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Target Companies
        </h1>
        <p className="text-slate-500 mt-1">
          Track the companies and roles you are targeting.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: ADD FORM --- */}
        <div className="lg:col-span-1">
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" /> Add New Target
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Netflix"
                    value={newGoal.company}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, company: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Dev"
                    value={newGoal.role}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, role: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                  Job Posting Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newGoal.link}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, link: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newGoal.company || !newGoal.role}
                className="w-full bg-indigo-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                Add Goal
              </button>
            </form>
          </section>
        </div>

        {/* --- RIGHT COLUMN: GOALS LIST --- */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="group bg-white/80 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-100">
                    {goal.company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">
                      {goal.role}
                    </h4>
                    <p className="text-slate-500 font-medium">{goal.company}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">
                        Added {goal.createdAt}
                      </span>
                      {goal.link && (
                        <a
                          href={goal.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-600 hover:underline"
                        >
                          View Job <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="bg-slate-100 text-slate-400 p-2.5 rounded-xl hover:bg-red-50 hover:text-red-400 transition-colors"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {goals.length === 0 && (
            <div className="text-center py-12 bg-white/40 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Target size={32} />
              </div>
              <p className="text-slate-500 font-medium">No goals set yet.</p>
              <p className="text-slate-400 text-sm">
                Start by adding a company you want to work for.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
