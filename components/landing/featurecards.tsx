import { Video, Activity, Brain } from "lucide-react";

export const FeatureCards = () => {
  const features = [
    {
      icon: <Video className="w-6 h-6 text-indigo-600" />,
      title: "Real-Time Simulation",
      desc: "Practice with an AI that mimics real interview pressure, adapting seamlessly to your answers.",
    },
    {
      icon: <Activity className="w-6 h-6 text-purple-600" />,
      title: "Performance Analysis",
      desc: "Get instant metrics on your tone, body language, and technical accuracy—not just a transcript.",
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: "Personalized Feedback",
      desc: "Turn weaknesses into strengths with custom learning paths and targeted resources.",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-24 overflow-hidden bg-slate-50"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* --- FONT IMPORT --- */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/60 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Smart Interviewing Tools
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-normal">
            Essential features to organize and elevate your job search.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group relative bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {f.title}
              </h3>

              <p className="text-slate-600 text-base leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
