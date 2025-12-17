import { Sidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/dashboard/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div
        className="min-h-screen relative flex bg-gradient-to-b from-white via-slate-50 to-slate-100"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Global Font Import */}
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
        </style>

        {/* --- BACKGROUND TEXTURE (Fixed position) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 blur-[100px] rounded-full"></div>
        </div>

        {/* --- SIDEBAR --- */}
        <Sidebar />

        {/* --- PAGE CONTENT --- */}
        {/* Added 'md:pl-64' to push content to the right of the fixed sidebar */}
        <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 pt-20 md:pt-6 md:pl-64">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
