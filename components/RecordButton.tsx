import React from 'react';
import { AppState } from '../types';

interface RecordButtonProps {
  appState: AppState;
  onClick: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ appState, onClick }) => {
  const isRecording = appState === AppState.RECORDING;
  const isProcessing = appState === AppState.PROCESSING;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow Ring (Static) */}
      <div className={`absolute inset-0 rounded-full border border-white/5 transition-all duration-700 ${isRecording ? 'scale-150 opacity-0' : 'scale-110 opacity-100'}`} />
      
      {/* Animated Rings */}
      {isRecording && (
        <>
          <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_200ms]" />
        </>
      )}

      {/* Main Orb Button */}
      <button
        onClick={onClick}
        disabled={isProcessing}
        className={`
          relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
          backdrop-blur-sm
          ${isProcessing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-105'}
          ${isRecording 
            ? 'bg-rose-500/10 shadow-[0_0_50px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50' 
            : 'bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] ring-1 ring-white/10 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]'
          }
        `}
      >
        {/* Inner Core */}
        <div className={`
          w-3 h-3 rounded-full transition-all duration-500
          ${isProcessing 
            ? 'bg-indigo-400 w-8 h-1 animate-spin rounded-sm' 
            : isRecording 
                ? 'bg-rose-500 w-8 h-8 rounded-md' 
                : 'bg-slate-200'
          }
          shadow-inner
        `} />
      </button>
    </div>
  );
};