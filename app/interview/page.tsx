import RoundSelection from '@/components/start/round-selection';
import { Suspense } from 'react';

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#202124] text-white">
        Loading...
      </div>
    }>
      <RoundSelection />
    </Suspense>
  );
}
