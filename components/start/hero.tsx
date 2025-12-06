"use client";
import { motion, Variants } from "framer-motion"; // 1. Import Variants
import { ArrowRight } from "lucide-react";

const ImagePlaceholder = ({ height = "h-64", text = "Image" }) => (
  <div
    className={`w-full ${height} bg-slate-50/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-indigo-200/50`}
  >
    <span>{text} Placeholder</span>
  </div>
);

export const Hero = () => {
  // 2. Add ': Variants' type annotation to your objects
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
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden bg-slate-50"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-300/20 blur-[100px] rounded-full pointer-events-none"
        />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 text-sm font-semibold text-indigo-500 mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Transform your interviewing journey
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6"
        >
          HireAbility <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AI Interviewer
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-light"
        >
          Conduct live AI-led interviews using audio and video. We evaluate your
          communication, technical accuracy, and confidence to make interview
          practice more realistic.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-400 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-lg"
          >
            Get Started Now
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ImagePlaceholder
            height="h-[300px] md:h-[500px]"
            text="Main Dashboard UI"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
