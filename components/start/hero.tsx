import { ArrowRight } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 animate-pulse border-2 border-dashed border-slate-300`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const Hero = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold text-indigo-600 mb-6 shadow-sm">
          🚀 Transform your interviewing journey
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          HireAbility <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            AI Interviewer
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
          Conduct live AI-led interviews using audio and video. We evaluate your
          communication, technical accuracy, and confidence to make interview
          practice more realistic.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Get Started now
          </button>
        </div>

        {/* Dashboard Image Container */}
        <div className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl shadow-indigo-100 border border-slate-200 bg-white p-2 md:p-4">
          <ImagePlaceholder
            height="h-[300px] md:h-[500px]"
            text="Main Dashboard UI"
          />
        </div>
      </div>
    </section>
  );
};
