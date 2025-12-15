"use client";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

export const Hero = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 40, damping: 10 },
    },
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="absolute inset-0 z-0">
        {/* UPDATED: Texture is preserved and layered over the gradient */}
        <div
          className="absolute inset-0 opacity-[1]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", // Slate-300 dots
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Soft Blob - Faint gray/blue */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-slate-200/40 blur-[120px] rounded-full pointer-events-none"
        />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 text-sm font-semibold text-slate-600 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
            </span>
            Transform your interviewing journey
          </div>
        </motion.div>

        {/* TITLE SECTION */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold text-slate-800 tracking-tighter mb-8 leading-[1.1]"
        >
          HireAbility <br />
          <span className="text-indigo-400">AI Interviewer</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 leading-relaxed font-light"
        >
          Conduct live AI-led interviews using audio and video. We evaluate your
          communication, technical accuracy, and confidence to make interview
          practice more realistic.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
        >
          <Link href={"/signup"}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-indigo-400 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-slate-200 hover:bg-indigo-500 transition-colors text-lg"
            >
              Get Started Now
            </motion.button>
          </Link>
        </motion.div>

        {/* Dashboard Image with Floating Animation */}
        <motion.div variants={itemVariants}>
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 bg-white/40 backdrop-blur-xl p-2 md:p-4"
          >
            {/* UPDATED: Real Image from Public Folder */}
            <img
              src="/screenshots/realdash1.png"
              alt="HireAbility Dashboard Interface"
              className="w-full h-auto rounded-xl shadow-sm"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
