import React, { useEffect, useState } from 'react';
import { TimeSegment } from '../types';

interface TimerDisplayProps {
  currentSegment: TimeSegment;
  onSegmentEnd: () => void;
  onReset: () => void;
  onSkip: (remainingSeconds: number) => void;
  schedule: TimeSegment[];
  currentIndex: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  currentSegment, 
  onSegmentEnd, 
  onReset, 
  onSkip,
  schedule,
  currentIndex
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const totalDurationSeconds = (currentSegment.endTime.getTime() - currentSegment.startTime.getTime()) / 1000;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = currentSegment.endTime.getTime() - new Date().getTime();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onSegmentEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSegment, onSegmentEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWork = currentSegment.type === 'work';

  // Linear progress calculation
  const progressPercentage = Math.max(0, Math.min(100, ((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100));
  
  // Break calculation
  const allBreaks = schedule.filter(s => s.type === 'break');
  const breaksUntilNow = schedule.slice(0, currentIndex + 1).filter(s => s.type === 'break').length;
  // If current segment is a break, it is the "current" one (index breaksUntilNow - 1)
  // If current segment is work, the next break is the "pending" one (index breaksUntilNow)

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 pb-32 relative animate-in fade-in zoom-in duration-500">
      
      {/* Ambient Glow */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Breathing Background Layer */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[450px] h-[450px] md:w-[750px] md:h-[750px]">
        <div className="w-full h-full animate-breathe relative">
          
          {/* Main Blur Circle */}
          <div className="absolute inset-0 rounded-full bg-slate-200/20 dark:bg-black/15 blur-3xl"></div>
          
          {/* Satellite Circles */}
          {Array.from({ length: 12 }).map((_, i) => (
             <div 
               key={i} 
               className="absolute inset-0"
               style={{ transform: `rotate(${i * 30}deg)` }}
             >
               <div 
                 className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-300/30 dark:bg-slate-700/30 animate-pulse-slow"
                 style={{ animationDelay: `${i * 0.5}s` }}
               ></div>
             </div>
           ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-col items-center mb-8 gap-3 relative z-10">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${isWork ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWork ? 'bg-primary' : 'bg-orange-500'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isWork ? 'bg-primary' : 'bg-orange-500'}`}></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">{isWork ? 'Focus Session' : 'Break Time'}</span>
        </div>
        <p className="text-slate-500 dark:text-white/60 text-sm font-medium">
          {isWork ? 'Stay focused on your task' : 'Take a deep breath and relax'}
        </p>
      </div>

      {/* Timer Display */}
      <div className="relative z-10 mb-12">
        <div className="flex items-baseline justify-center text-slate-900 dark:text-white">
          <span className="text-[120px] md:text-[180px] font-black leading-none select-none tracking-tighter tabular-nums text-slate-900 dark:text-white drop-shadow-[0_0_40px_rgba(var(--color-primary)/0.1)]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-lg flex flex-col gap-8 relative z-10">
        {/* Linear Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full h-3 bg-slate-200 dark:bg-[#1c2e24] rounded-full overflow-hidden shadow-inner">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--color-primary)/0.5)] ${isWork ? 'bg-primary' : 'bg-orange-500'}`} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={`font-bold ${isWork ? 'text-primary' : 'text-orange-500'}`}>{Math.round(progressPercentage)}% completed</span>
            <span className="text-slate-400 dark:text-white/40 font-medium">
              Ends at {currentSegment.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={onReset}
            className="group flex items-center justify-center size-16 rounded-full bg-white dark:bg-[#1c2e24] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg" 
            title="Stop Session"
          >
            <span className="material-symbols-outlined text-[32px] group-hover:text-red-500 transition-colors">stop</span>
          </button>
          
          <button 
            onClick={() => onSkip(timeLeft)}
            className="group flex items-center justify-center size-16 rounded-full bg-white dark:bg-[#1c2e24] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg" 
            title="Skip Segment"
          >
            <span className="material-symbols-outlined text-[32px] group-hover:text-primary transition-colors">skip_next</span>
          </button>
        </div>
      </div>

      {/* Break Indicators (Footer Area) */}
      {allBreaks.length > 0 && (
        <div className="absolute bottom-10 left-0 w-full flex justify-center">
          <div className="bg-white/50 dark:bg-[#1c2e24]/60 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-4 border border-slate-200 dark:border-white/5">
            <span className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wide">Breaks</span>
            <div className="flex items-center gap-2">
              {allBreaks.map((_, index) => {
                let status = 'pending';
                const totalBreaks = allBreaks.length;
                
                // Calculate which break index (0-based) is currently active or just finished relative to time
                const isCurrentSegmentBreak = currentSegment.type === 'break';
                const breaksPassed = isCurrentSegmentBreak ? breaksUntilNow - 1 : breaksUntilNow;
                
                // We want to fill/consume from Right to Left.
                // The active break visual index is the one we are currently on, counting from the right.
                const activeVisualIndex = totalBreaks - 1 - breaksPassed;
                
                if (index > activeVisualIndex) {
                  status = 'completed';
                } else if (index === activeVisualIndex && isCurrentSegmentBreak) {
                  status = 'current';
                } else {
                  status = 'pending';
                }
                
                return (
                  <div 
                    key={index}
                    className={`size-3 rounded-full transition-all ${
                      status === 'completed' ? 'bg-slate-300 dark:bg-white/10' : 
                      status === 'current' ? 'border-2 border-primary bg-transparent scale-125' : 
                      'bg-primary'
                    }`} 
                    title={status === 'completed' ? 'Spent' : status === 'current' ? 'Current' : 'Remaining'}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;