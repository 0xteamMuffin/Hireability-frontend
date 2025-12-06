import { ArrowRight } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-50/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-indigo-200/50`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const Hero = () => {
  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden bg-slate-50"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* --- FONT IMPORT START --- */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>
      {/* --- FONT IMPORT END --- */}

      {/* --- TEXTURED BACKGROUND START --- */}
      <div className="absolute inset-0 z-0">
        {/* Dot Matrix Pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        {/* Soft Indigo Glow Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-300/20 blur-[100px] rounded-full pointer-events-none"></div>
      </div>
      {/* --- TEXTURED BACKGROUND END --- */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 text-sm font-semibold text-indigo-500 mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Transform your interviewing journey
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          HireAbility <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AI Interviewer
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-light">
          Conduct live AI-led interviews using audio and video. We evaluate your
          communication, technical accuracy, and confidence to make interview
          practice more realistic.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button className="bg-indigo-400 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 text-lg">
            Get Started Now
          </button>
        </div>

        {/* Dashboard Image Container */}
        <div className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl shadow-indigo-100/50 border border-white/60 bg-white/40 backdrop-blur-xl p-2 md:p-4">
          <ImagePlaceholder
            height="h-[300px] md:h-[500px]"
            text="Main Dashboard UI"
          />
        </div>
      </div>
    </section>
  );
};
