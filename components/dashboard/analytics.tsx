import { BarChart2 } from "lucide-react";

export const Analytics = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">
        Analytics
      </h1>
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/60 backdrop-blur-md border border-white rounded-4xl p-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
          <BarChart2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Detailed Charts Coming Soon
        </h2>
      </div>
    </div>
  );
};
