export const CTA = () => {
  return (
    <section className="px-4 py-20" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Ensure font is available if this component is used standalone */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] border border-indigo-100 bg-indigo-50 p-12 text-center shadow-sm md:p-20">
        {/* --- TEXTURED BACKGROUND START --- */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Dot Matrix Pattern */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          {/* Soft Blobs (Updated to match Hero's lighter theme) */}
          <div className="absolute top-0 left-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/30 blur-[80px]"></div>
          <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-400/30 blur-[80px]"></div>
        </div>
        {/* --- TEXTURED BACKGROUND END --- */}

        <div className="relative z-10">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-slate-600">
            Experience the most realistic mock interview simulation with detailed performance
            feedback.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="transform rounded-full border border-indigo-50 bg-white px-8 py-3 font-bold text-indigo-500 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
              Try HireAbility Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
