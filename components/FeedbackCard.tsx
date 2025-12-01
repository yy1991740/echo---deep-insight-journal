import React from 'react';

interface FeedbackCardProps {
  text: string;
  isVisible: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ text, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-lg animate-[slideIn_0.8s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="relative group">
        {/* Decorative line */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent opacity-50" />
        
        <div className="pl-6 py-2">
            <p className="text-lg md:text-xl text-indigo-100/90 leading-relaxed font-serif font-light tracking-wide">
            {text}
            </p>
        </div>
      </div>
    </div>
  );
};