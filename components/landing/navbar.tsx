'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed z-50 w-full border-b border-indigo-50 bg-white/80 backdrop-blur-md"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Ensure font is available */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Linked to Home */}
          <Link href="/" className="group flex flex-shrink-0 cursor-pointer items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400 shadow-md shadow-indigo-200 transition-colors group-hover:bg-indigo-500">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">HireAbility</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {/* Login Link */}
            <Link
              href="/signin"
              className="font-medium text-slate-600 transition-colors hover:text-indigo-500"
            >
              Login
            </Link>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="transform rounded-full bg-indigo-400 px-6 py-2 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-indigo-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 transition-colors hover:text-indigo-500"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="border-b border-indigo-50 bg-white shadow-xl md:hidden">
          <div className="space-y-2 px-4 pt-2 pb-4">
            {/* Scroll Links */}
            {['Solution', 'Features', 'Team'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}

            {/* Mobile Auth Links */}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="block w-full py-2 text-center font-medium text-slate-600 hover:text-indigo-500"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-full bg-indigo-400 px-5 py-2 text-center font-medium text-white shadow-md shadow-indigo-200 hover:bg-indigo-500"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
