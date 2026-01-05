
import React from 'react';

interface SessionCompletedProps {
  onClose: () => void;
  totalFocusTime: number; // in minutes
}

const SessionCompleted: React.FC<SessionCompletedProps> = ({ onClose, totalFocusTime }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a2c23] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center p-10 text-center animate-in zoom-in-95 duration-500 delay-150">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        
        {/* Icon Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce" style={{ animationDuration: '3s' }}>
            <span className="material-symbols-outlined text-6xl">check_circle</span>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }}></div>
        </div>

        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Session Complete
        </h2>
        
        <p className="text-slate-500 dark:text-slate-300 text-lg mb-8 leading-relaxed">
          You've successfully maintained your focus. Take a moment to appreciate your effort.
        </p>

        <div className="w-full bg-slate-50 dark:bg-black/20 rounded-2xl p-6 mb-10 border border-slate-100 dark:border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Focus Time</p>
          <p className="text-5xl font-black text-primary">{Math.floor(totalFocusTime / 60)}<span className="text-2xl text-slate-400 font-bold ml-1">h</span> {totalFocusTime % 60}<span className="text-2xl text-slate-400 font-bold ml-1">m</span></p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all active:scale-95"
        >
          Start New Session
        </button>

      </div>
    </div>
  );
};

export default SessionCompleted;
