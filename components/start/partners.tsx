export const Partners = () => {
  return (
    <section className="py-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-wider">
          Powered by Modern Tech
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
          {/* Replace with SVG Logos */}
          {[
            "Gemini",
            "Vapi",
            "LangChain",
            "Next.js",
            "Firebase",
            "RabbitMQ",
            "Milvus",
          ].map((brand) => (
            <span key={brand} className="text-xl font-bold text-slate-400">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
