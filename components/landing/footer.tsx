export const Footer = () => {
  return (
    <footer
      className="bg-slate-950 py-16 text-slate-300"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6 flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400 font-bold shadow-lg shadow-indigo-500/20">
                H
              </div>
              <span className="text-xl font-bold tracking-tight">HireAbility</span>
            </div>
            <p className="text-sm leading-relaxed font-light text-slate-400">
              An AI-based mock interview system evaluating communication, technical accuracy, and
              confidence.
            </p>
          </div>
          <div>
            <h4 className="mb-6 font-bold text-white">Product</h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <a href="#solution" className="transition-colors hover:text-indigo-400">
                  Solution
                </a>
              </li>
              <li>
                <a href="#innovations" className="transition-colors hover:text-indigo-400">
                  Innovations
                </a>
              </li>
              <li>
                <a href="#tech" className="transition-colors hover:text-indigo-400">
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">Company</h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <a href="#team" className="transition-colors hover:text-indigo-400">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-indigo-400">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-indigo-400">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">Stay Updated</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 transition-all focus:border-indigo-400 focus:outline-none"
              />
              <button className="rounded-lg bg-indigo-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/20 transition-colors hover:bg-indigo-500">
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-900 pt-8 text-xs font-light text-slate-500 md:flex-row">
          <p>© 2025 HireAbility. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
