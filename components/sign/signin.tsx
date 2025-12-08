"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks";
import Link from "next/link";

export const LoginPage = () => {
  const router = useRouter();
  const { signin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signin(formData);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Sign in failed");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/40 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-3xl p-8 overflow-hidden"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-400 mb-4 shadow-sm">
              <span className="font-bold text-xl">H</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 mt-2 font-light">
              Enter your details to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-400 text-white font-bold rounded-xl py-3.5 mt-6 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-indigo-400 hover:text-indigo-500 hover:underline transition-all"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
