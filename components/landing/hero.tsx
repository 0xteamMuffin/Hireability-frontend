'use client';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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
      transition: { type: 'spring', stiffness: 40, damping: 10 },
    },
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-32 pb-20"
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
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        {/* Soft Blob - Faint gray/blue */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-full -translate-x-1/2 rounded-full bg-slate-200/40 blur-[120px]"
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400"></span>
            </span>
            Transform your interviewing journey
          </div>
        </motion.div>

        {/* TITLE SECTION */}
        <motion.h1
          variants={itemVariants}
          className="mb-8 text-5xl leading-[1.1] font-bold tracking-tighter text-slate-800 md:text-7xl"
        >
          HireAbility <br />
          <span className="text-indigo-400">AI Interviewer</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light text-slate-500 md:text-xl"
        >
          Conduct live AI-led interviews using audio and video. We evaluate your communication,
          technical accuracy, and confidence to make interview practice more realistic.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-20 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href={'/signup'}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-indigo-400 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-slate-200 transition-colors hover:bg-indigo-500"
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
            className="relative mx-auto max-w-5xl rounded-2xl border border-white/80 bg-white/40 p-2 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-4"
          >
            {/* UPDATED: Real Image from Public Folder */}
            <img
              src="/screenshots/realdash1.png"
              alt="HireAbility Dashboard Interface"
              className="h-auto w-full rounded-xl shadow-sm"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
