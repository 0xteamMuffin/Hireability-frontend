import { Star } from "lucide-react";

export const Testimonials = () => {
  const reviews = [
    {
      name: "Alex Johnson",
      role: "UX Designer",
      text: "This platform completely changed how I organize my study material. Highly recommended!",
    },
    {
      name: "Sarah Williams",
      role: "Developer",
      text: "The analytics feature helped me identify my weak spots. I'm learning twice as fast now.",
    },
    {
      name: "Michael Chen",
      role: "Student",
      text: "I love the clean interface and how easy it is to track assignments. 5 stars!",
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 text-center">
          Sweet Words from Our Customers
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-8 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-100"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">"{r.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-slate-900">{r.name}</h4>
                  <p className="text-xs text-slate-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
