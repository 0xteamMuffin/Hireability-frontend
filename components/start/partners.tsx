"use client";

import { useState } from "react";

const TechLogo = ({ name, logo }: { name: string; logo: string }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex items-center justify-center flex-shrink-0 group cursor-pointer">
      {!hasError ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-8 md:h-10 w-20 object-contain group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-xl font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">
          {name}
        </span>
      )}
    </div>
  );
};

export const Partners = () => {
  const technologies = [
    { name: "Gemini", logo: "/logos/gemini.png" },
    { name: "Vapi", logo: "/logos/vapi.png" },
    { name: "LangChain", logo: "/logos/langchain.png" },
    { name: "Next.js", logo: "/logos/nextjs.png" },
    { name: "Firebase", logo: "/logos/firebase.webp" },
    { name: "RabbitMQ", logo: "/logos/rabbitmq.png" },
    { name: "Milvus", logo: "/logos/milvus.png" },
  ];

  return (
    <section
      className="py-10 border-b border-indigo-50 bg-white overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-infinite-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 text-center mb-8">
        <p className="text-sm font-semibold text-indigo-300 mb-6 uppercase tracking-wider">
          Powered by Modern Tech
        </p>
      </div>

      <div
        className="relative w-full flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 25%, black 75%, transparent)",
        }}
      >
        <div className="flex animate-infinite-scroll gap-16 w-max px-8">
          {[...technologies, ...technologies].map((tech, index) => (
            <TechLogo key={index} name={tech.name} logo={tech.logo} />
          ))}
        </div>
      </div>
    </section>
  );
};
