import { Video, Activity, Brain } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-50/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-indigo-200/50`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const FeatureCards = () => {
  const features = [
    {
      icon: <Video className="w-6 h-6 text-indigo-500" />,
      title: "Real-Time Simulation",
      desc: "Conducts live AI-led interviews using audio and video inputs, adapting questions to mimic realistic human scenarios.",
    },
    {
      icon: <Activity className="w-6 h-6 text-purple-500" />,
      title: "Performance Analysis",
      desc: "Analyzes tone, pacing, clarity, posture, and emotions while evaluating the accuracy and depth of technical responses.",
    },
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      title: "Personalized Feedback",
      desc: "Generates tailored insights and learning resources based on your communication style, strengths, and weaknesses.",
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

      {/* --- TEXTURED BACKGROUND START --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dot Matrix Pattern */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        {/* Soft center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/80 blur-[100px] rounded-full"></div>
      </div>
      {/* --- TEXTURED BACKGROUND END --- */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Smart Interviewing Tools
          </h2>
          <p className="text-slate-600 text-lg max-w-xl font-light">
            Everything you need to organize your job searching journey in one
            place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-indigo-50 shadow-lg shadow-indigo-100/40 hover:shadow-indigo-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {f.title}
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed font-light">
                {f.desc}
              </p>

              {/* Mini UI Mockup inside card */}
              <div className="mt-auto">
                <ImagePlaceholder height="h-32" text={`UI: ${f.title}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
