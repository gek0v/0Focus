
import React, { useState, useEffect, useCallback } from 'react';
import { TimeSegment, ScheduleConfig } from './types';
import { calculateSchedule } from './services/scheduleEngine';
import TimerDisplay from './components/TimerDisplay';

type ThemeColor = 'indigo' | 'rose' | 'amber' | 'emerald' | 'blue';

const App: React.FC = () => {
  const [endTime, setEndTime] = useState('21:00');
  const [breakCount, setBreakCount] = useState(2);
  const [breakDuration, setBreakDuration] = useState(30);
  const [schedule, setSchedule] = useState<TimeSegment[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGenerate = () => {
    try {
      setError(null);
      const newSchedule = calculateSchedule({
        targetEndTime: endTime,
        breakCount,
        breakDuration
      });
      setSchedule(newSchedule);
      setActiveIdx(0);
    } catch (err: any) {
      setError(err.message.includes("No space") 
        ? "¡Tiempo insuficiente! Ajusta las pausas o la hora final." 
        : err.message);
    }
  };

  const handlePomodoro = () => {
    try {
      setError(null);
      const now = new Date();
      const [hours, minutes] = endTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);

      const totalMins = Math.floor((target.getTime() - now.getTime()) / 60000);
      const numBreaks = Math.floor(totalMins / 30);
      
      if (numBreaks < 1) throw new Error("Tiempo insuficiente para Pomodoro.");

      setBreakDuration(5);
      setBreakCount(numBreaks - 1);
      
      const newSchedule = calculateSchedule({
        targetEndTime: endTime,
        breakCount: numBreaks - 1,
        breakDuration: 5
      });
      setSchedule(newSchedule);
      setActiveIdx(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSegmentEnd = useCallback(() => {
    setActiveIdx((prev) => (prev !== null && prev < schedule.length - 1 ? prev + 1 : prev));
  }, [schedule.length]);

  const handleSkip = (remainingSeconds: number) => {
    if (activeIdx === null || activeIdx >= schedule.length - 1) return;

    const newSchedule = [...schedule];
    const now = new Date();
    
    const current = { ...newSchedule[activeIdx] };
    current.endTime = new Date(now);
    newSchedule[activeIdx] = current;

    const next = { ...newSchedule[activeIdx + 1] };
    next.startTime = new Date(now);
    
    if (next.type === 'break') {
      next.endTime = new Date(now.getTime() + breakDuration * 60000);
      if (activeIdx + 2 < newSchedule.length) {
        const nextFocus = { ...newSchedule[activeIdx + 2] };
        nextFocus.startTime = new Date(next.endTime);
        newSchedule[activeIdx + 2] = nextFocus;
      }
    }
    
    newSchedule[activeIdx + 1] = next;

    for (let i = activeIdx + 2; i < newSchedule.length; i++) {
        const prev = newSchedule[i - 1];
        const seg = { ...newSchedule[i] };
        seg.startTime = new Date(prev.endTime);
        if (seg.type === 'break') {
            seg.endTime = new Date(seg.startTime.getTime() + breakDuration * 60000);
        }
        newSchedule[i] = seg;
    }

    setSchedule(newSchedule);
    setActiveIdx(activeIdx + 1);
  };

  const handleReset = () => {
    setSchedule([]);
    setActiveIdx(null);
  };

  const currentSegment = activeIdx !== null ? schedule[activeIdx] : null;
  const isLastSegment = activeIdx !== null && activeIdx === schedule.length - 1;

  const getBlobColor = () => {
    if (isDarkMode) return 'bg-neutral-800/20'; // Modo oscuro neutro
    switch(themeColor) {
      case 'rose': return 'bg-rose-200/30';
      case 'amber': return 'bg-amber-200/30';
      case 'blue': return 'bg-blue-200/30';
      case 'emerald': return 'bg-emerald-200/30';
      default: return 'bg-indigo-200/30';
    }
  };

  const getThemeBg = () => {
    switch(themeColor) {
      case 'rose': return 'bg-rose-500';
      case 'amber': return 'bg-amber-500';
      case 'blue': return 'bg-blue-500';
      case 'emerald': return 'bg-emerald-500';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden transition-colors duration-500 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      
      {/* Fondo dinámico neutral */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${getBlobColor()} rounded-full blur-[120px] animate-blob`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${isDarkMode ? 'bg-neutral-900/40' : 'bg-neutral-200/30'} rounded-full blur-[120px] animate-blob animation-delay-2000`}></div>
      </div>

      <header className="max-w-5xl w-full px-8 py-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-500 ${getThemeBg()}`}>
             <i className="fa-solid fa-bolt-lightning text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tighter leading-none">FocusFlow</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-neutral-400 dark:text-neutral-500 mt-1">Tempo Master</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="glass w-12 h-12 rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-xl text-neutral-700 dark:text-neutral-300"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </header>

      <main className="w-full max-w-xl px-4 py-6 flex-grow flex items-center justify-center">
        {!currentSegment ? (
          <section className="glass w-full p-8 md:p-12 rounded-[3rem] shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-neutral-900 dark:text-neutral-50 mb-2 tracking-tight">Tu Sesión.</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">Define el ritmo de tu productividad.</p>
                </div>
                
                {/* Selector de Tema */}
                <div className="flex gap-2 p-2 glass rounded-2xl self-end md:self-start">
                   {(['indigo', 'blue', 'rose', 'amber', 'emerald'] as ThemeColor[]).map((c) => (
                     <button
                      key={c}
                      onClick={() => setThemeColor(c)}
                      title={`Tema ${c}`}
                      className={`w-7 h-7 rounded-lg transition-all ${
                        c === 'indigo' ? 'bg-indigo-500' :
                        c === 'blue' ? 'bg-blue-500' :
                        c === 'rose' ? 'bg-rose-500' :
                        c === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                      } ${themeColor === c ? 'scale-125 ring-2 ring-white dark:ring-neutral-400 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                     />
                   ))}
                </div>
              </div>
              
              <div className="space-y-10">
                <div className="group">
                  <label className={`flex items-center gap-2 text-[11px] font-black mb-4 uppercase tracking-[0.2em] transition-colors ${
                    themeColor === 'indigo' ? 'group-focus-within:text-indigo-500' :
                    themeColor === 'blue' ? 'group-focus-within:text-blue-500' :
                    themeColor === 'rose' ? 'group-focus-within:text-rose-500' :
                    themeColor === 'emerald' ? 'group-focus-within:text-emerald-500' : 'group-focus-within:text-amber-500'
                  } text-neutral-400 dark:text-neutral-500`}>
                    <i className="fa-regular fa-clock"></i> Hora de Finalización
                  </label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-6 text-3xl font-black rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-8 focus:ring-neutral-500/5 outline-none transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="flex items-center gap-2 text-[11px] font-black text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-[0.2em] transition-colors">
                      <i className="fa-solid fa-couch"></i> Pausas
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={breakCount}
                      onChange={(e) => setBreakCount(parseInt(e.target.value) || 0)}
                      className="w-full p-6 text-3xl font-black rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-[11px] font-black text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-[0.2em] transition-colors">
                      <i className="fa-solid fa-hourglass-half"></i> Min/Pausa
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                      className="w-full p-6 text-3xl font-black rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 mt-14">
                <button 
                  onClick={handleGenerate}
                  className={`group relative w-full py-6 rounded-3xl font-black transition-all shadow-2xl active:scale-95 text-xl overflow-hidden text-white ${getThemeBg()}`}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    <i className="fa-solid fa-play"></i> Iniciar Sesión
                  </span>
                </button>
                
                <button 
                  onClick={handlePomodoro}
                  className="w-full glass text-neutral-800 dark:text-neutral-200 hover:bg-white/90 dark:hover:bg-neutral-800/90 font-black py-5 rounded-3xl transition-all active:scale-95 text-sm flex items-center justify-center gap-3 border border-neutral-200 dark:border-neutral-800 shadow-lg"
                >
                  <i className="fa-solid fa-clock-rotate-left text-neutral-500 text-lg"></i> Modo Pomodoro
                </button>
              </div>

              {error && (
                <div className="mt-8 p-5 bg-red-50/80 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-shake">
                  <i className="fa-solid fa-triangle-exclamation text-lg"></i> {error}
                </div>
              )}
            </div>
          </section>
        ) : (
          <TimerDisplay 
            currentSegment={currentSegment} 
            onSegmentEnd={handleSegmentEnd} 
            onReset={handleReset}
            onSkip={handleSkip}
            isLastSegment={isLastSegment}
            themeColor={themeColor}
          />
        )}
      </main>

      <footer className="w-full py-10 flex flex-col items-center gap-4 opacity-30">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500 dark:text-neutral-400">Flow with purpose</p>
          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
