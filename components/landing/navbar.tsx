"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-indigo-50"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Ensure font is available */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-500 transition-colors">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              HireAbility
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <button className="text-slate-600 font-medium hover:text-indigo-500 transition-colors">
              Login
            </button>
            <button className="bg-indigo-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-indigo-500 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-indigo-50 shadow-xl">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {["Solution", "Features", "Team"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button className="w-full text-center text-slate-600 font-medium py-2 hover:text-indigo-500">
                Login
              </button>
              <button className="w-full bg-indigo-400 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-500 shadow-md shadow-indigo-200">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
