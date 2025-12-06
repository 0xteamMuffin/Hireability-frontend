import { CheckCircle } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 animate-pulse border-2 border-dashed border-slate-300`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const BentoGrid = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Enhance Efficiency with Smart Tracking
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get detailed insights into your learning habits and stay flexible
            with mobile access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Large Graph */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-slate-500">
                Visualize your learning curve with easy-to-read graphs.
              </p>
            </div>
            <ImagePlaceholder height="h-64" text="Analytics Graph" />
          </div>

          {/* Card 2: Chat/Assignments */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Class and Assignment
              </h3>
              <p className="text-slate-500">
                Keep track of pending tasks and chat with instructors.
              </p>
            </div>
            <ImagePlaceholder height="h-64" text="Chat Interface" />
          </div>

          {/* Card 3: Wide/Instructors */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Learn Anywhere, Anytime
              </h3>
              <p className="text-slate-600 mb-6">
                Our mobile-first platform ensures you can continue your lessons
                on the go.
              </p>
              <ul className="space-y-3 mb-6">
                {["Offline Access", "Progress Sync", "Dark Mode"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <CheckCircle size={18} className="text-indigo-600" />{" "}
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-64">
                <ImagePlaceholder height="h-[400px]" text="Mobile App Mockup" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
