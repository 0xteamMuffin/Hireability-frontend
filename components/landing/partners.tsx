'use client';

import { useState } from 'react';

const TechLogo = ({ name, logo }: { name: string; logo: string }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="group flex flex-shrink-0 cursor-pointer items-center justify-center">
      {!hasError ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-8 w-20 object-contain transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:h-10"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-xl font-bold text-slate-400 transition-colors group-hover:text-indigo-400">
          {name}
        </span>
      )}
    </div>
  );
};

export const Partners = () => {
  const technologies = [
    { name: 'Gemini', logo: '/logos/gemini.png' },
    { name: 'Vapi', logo: '/logos/vapi.png' },
    { name: 'LangChain', logo: '/logos/langchain.png' },
    { name: 'Next.js', logo: '/logos/nextjs.png' },
    { name: 'Firebase', logo: '/logos/firebase.webp' },
    { name: 'RabbitMQ', logo: '/logos/rabbitmq.png' },
    { name: 'Milvus', logo: '/logos/milvus.png' },
  ];

  return (
    <section
      className="overflow-hidden border-b border-indigo-50 bg-white py-10"
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

      <div className="mx-auto mb-8 max-w-7xl px-4 text-center">
        <p className="mb-6 text-sm font-semibold tracking-wider text-indigo-300 uppercase">
          Powered by Modern Tech
        </p>
      </div>

      <div
        className="relative flex w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
        }}
      >
        <div className="animate-infinite-scroll flex w-max gap-16 px-8">
          {[...technologies, ...technologies].map((tech, index) => (
            <TechLogo key={index} name={tech.name} logo={tech.logo} />
          ))}
        </div>
      </div>
    </section>
  );
};
