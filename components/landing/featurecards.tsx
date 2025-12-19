import { Video, Activity, Brain } from 'lucide-react';

export const FeatureCards = () => {
  const features = [
    {
      icon: <Video className="h-6 w-6 text-indigo-600" />,
      title: 'Real-Time Simulation',
      desc: 'Practice with an AI that mimics real interview pressure, adapting seamlessly to your answers.',
    },
    {
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      title: 'Performance Analysis',
      desc: 'Get instant metrics on your tone, body language, and technical accuracy—not just a transcript.',
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      title: 'Personalized Feedback',
      desc: 'Turn weaknesses into strengths with custom learning paths and targeted resources.',
    },
  ];

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-slate-50 py-24"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* --- FONT IMPORT --- */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* --- BACKGROUND --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
            Smart Interviewing Tools
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-normal text-slate-500">
            Essential features to organize and elevate your job search.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl border border-slate-200/60 bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>

              <h3 className="mb-3 text-xl font-bold text-slate-800">{f.title}</h3>

              <p className="text-base leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
