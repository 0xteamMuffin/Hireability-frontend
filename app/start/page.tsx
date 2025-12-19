import Meeting from '@/components/start/meeting';
import React, { Suspense } from 'react';

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#202124] text-white">
          Loading...
        </div>
      }
    >
      <Meeting />
    </Suspense>
  );
};

export default Page;
