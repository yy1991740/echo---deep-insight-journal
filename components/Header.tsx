import React from 'react';

interface HeaderProps {
  dailyQuestion?: string;
}

export const Header: React.FC<HeaderProps> = ({ dailyQuestion }) => {
  return (
    <header className="text-center flex flex-col items-center w-full max-w-2xl mx-auto mb-8 animate-[fadeIn_1s_ease-out]">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif tracking-[0.3em] text-white/90 font-light select-none">
          ECHO
        </h1>
      </div>
      
      <div className={`w-full transition-all duration-1000 ease-out ${dailyQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {dailyQuestion && (
            <div className="relative px-6 md:px-12">
                <p className="text-base md:text-lg text-slate-300 font-serif font-light leading-relaxed tracking-wide text-center italic">
                  "{dailyQuestion}"
                </p>
                <div className="mt-4 w-1 h-1 bg-white/20 rounded-full mx-auto" />
            </div>
        )}
      </div>
    </header>
  );
};