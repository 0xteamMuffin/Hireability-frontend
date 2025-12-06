export const CTA = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto bg-indigo-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Experience the most realistic mock interview simulation with
            detailed performance feedback.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all">
              Try HireAbility Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
