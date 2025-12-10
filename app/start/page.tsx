import Meeting from '@/components/start/meeting'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#202124] text-white">Loading...</div>}>
      <Meeting/>
    </Suspense>
  )
}

export default Page
