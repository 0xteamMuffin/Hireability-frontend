import { BarChart, Calendar, BookOpen } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 animate-pulse border-2 border-dashed border-slate-300`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const FeatureCards = () => {
  const features = [
    {
      icon: <BarChart className="w-6 h-6 text-blue-500" />,
      title: "Real-Time Simulation",
      desc: "Conducts live AI-led interviews using audio and video inputs, adapting questions to mimic realistic human scenarios.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-orange-500" />,
      title: "Performance Analysis",
      desc: "Analyzes tone, pacing, clarity, posture, and emotions while evaluating the accuracy and depth of technical responses.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      title: "Personalized Feedback",
      desc: "Generates tailored insights and learning resources based on your communication style, strengths, and weaknesses.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Smart Interviewing Tools
          </h2>
          <p className="text-slate-600 text-lg max-w-xl">
            Everything you need to organize your job searching journey in one
            place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {f.title}
              </h3>
              <p className="text-slate-600 mb-6">{f.desc}</p>

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
