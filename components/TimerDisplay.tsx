
import React, { useEffect, useState } from 'react';
import { TimeSegment } from '../types';

interface TimerDisplayProps {
  currentSegment: TimeSegment;
  onSegmentEnd: () => void;
  onReset: () => void;
  onSkip: (remainingSeconds: number) => void;
  isLastSegment: boolean;
  themeColor: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  currentSegment, 
  onSegmentEnd, 
  onReset, 
  onSkip,
  isLastSegment,
  themeColor
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

  const progress = 1 - (timeLeft / totalDurationSeconds);
  const numDots = 60; 

  const getThemeGradient = () => {
    if (!isWork) return 'from-emerald-500 to-emerald-600';
    switch (themeColor) {
      case 'rose': return 'from-rose-500 to-rose-600';
      case 'amber': return 'from-amber-500 to-amber-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'emerald': return 'from-emerald-500 to-emerald-600';
      default: return 'from-indigo-600 to-indigo-700';
    }
  };

  const getDotTextColor = () => {
    if (!isWork) return 'text-emerald-500';
    switch (themeColor) {
      case 'rose': return 'text-rose-500';
      case 'amber': return 'text-amber-500';
      case 'blue': return 'text-blue-500';
      case 'emerald': return 'text-emerald-500';
      default: return 'text-indigo-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* Anillo de fondo neutro */}
        <div className="absolute w-[92%] h-[92%] rounded-full border border-neutral-200/50 dark:border-neutral-800/50"></div>
        
        {/* Bolas de progreso dinámicas */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: numDots }).map((_, i) => {
            const angle = (i * (360 / numDots)) - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 46; 
            const x = 50 + radius * Math.cos(radian);
            const y = 50 + radius * Math.sin(radian);
            const isActive = (i / numDots) <= progress;
            const dotColorClass = getDotTextColor();
            
            return (
              <div 
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-700 ${
                  isActive 
                    ? `bg-current scale-150 dot-glow ${dotColorClass}` 
                    : 'bg-neutral-200 dark:bg-neutral-800/50 scale-100'
                }`}
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              />
            );
          })}
        </div>

        {/* Núcleo del Temporizador Premium */}
        <div className={`relative w-[78%] aspect-square rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-all duration-1000 z-10 overflow-hidden bg-gradient-to-br text-white ${getThemeGradient()}`}>
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
          
          <span className="text-sm font-bold uppercase tracking-[0.4em] opacity-80 mb-3 drop-shadow-sm flex items-center gap-3">
            <i className={`fa-solid ${isWork ? 'fa-brain' : 'fa-mug-hot'}`}></i>
            {isWork ? 'Enfoque' : 'Descanso'}
          </span>
          <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter drop-shadow-2xl">
            {String(minutes).padStart(2, '0')}<span className="opacity-30 animate-pulse">:</span>{String(seconds).padStart(2, '0')}
          </div>
          <div className="mt-8 flex flex-col items-center bg-black/10 px-6 py-2 rounded-2xl backdrop-blur-sm">
            <p className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-0.5">Siguiente meta</p>
            <p className="text-lg font-black flex items-center gap-2">
              <i className="fa-regular fa-clock text-xs"></i>
              {currentSegment.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full px-4">
        <button 
          onClick={() => onSkip(timeLeft)}
          disabled={isLastSegment}
          className="group relative overflow-hidden px-8 py-6 rounded-3xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-current ${getDotTextColor()}`}></div>
          <span className={`relative flex items-center justify-center gap-3 ${getDotTextColor()}`}>
             <i className="fa-solid fa-forward-step text-lg"></i>
             {isWork ? 'Saltar a Pausa' : 'Terminar Pausa'}
          </span>
        </button>
        
        <button 
          onClick={onReset}
          className="px-8 py-6 rounded-3xl bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 font-black hover:opacity-90 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-power-off text-sm"></i>
          <span>Detener</span>
        </button>
      </div>
      
      {isLastSegment && (
        <div className="glass px-10 py-4 rounded-[2rem] animate-pulse shadow-2xl flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${getDotTextColor()} bg-current dot-glow`}></div>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 font-black uppercase tracking-widest">
            Tramo final de la sesión
          </p>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
