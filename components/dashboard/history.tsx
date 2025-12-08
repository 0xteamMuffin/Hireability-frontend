import { History } from "lucide-react";

export const HistoryPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">
        History
      </h1>
      {/* Reuse your Recents table component here if you want */}
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
          <History size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Past Interviews
        </h2>
      </div>
    </div>
  );
};
