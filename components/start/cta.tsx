export const CTA = () => {
  return (
    <section
      className="py-20 px-4"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Ensure font is available if this component is used standalone */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="max-w-6xl mx-auto bg-indigo-50 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-sm border border-indigo-100">
        {/* --- TEXTURED BACKGROUND START --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Dot Matrix Pattern */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          {/* Soft Blobs (Updated to match Hero's lighter theme) */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-purple-300/30 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/30 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* --- TEXTURED BACKGROUND END --- */}

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg font-light">
            Experience the most realistic mock interview simulation with
            detailed performance feedback.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-indigo-500 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 border border-indigo-50">
              Try HireAbility Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
