export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">
                H
              </div>
              <span className="text-xl font-bold">HireAbility</span>
            </div>
            <p className="text-sm text-slate-400">
              An AI-based mock interview system evaluating communication,
              technical accuracy, and confidence.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#solution" className="hover:text-indigo-400">
                  Solution
                </a>
              </li>
              <li>
                <a href="#innovations" className="hover:text-indigo-400">
                  Innovations
                </a>
              </li>
              <li>
                <a href="#tech" className="hover:text-indigo-400">
                  Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="#team" className="hover:text-indigo-400">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-indigo-600"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2025 HireAbility. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
