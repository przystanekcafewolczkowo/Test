import React from 'react';

interface MockIPhoneFrameProps {
  children: React.ReactNode;
}

export default function MockIPhoneFrame({ children }: MockIPhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-[#f2f2f7] dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      {/* Primary Screen Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}

