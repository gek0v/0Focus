import React, { useState, useEffect, useCallback } from 'react';
import { TimeSegment } from './types';
import { calculateSchedule } from './services/scheduleEngine';
import TimerDisplay from './components/TimerDisplay';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';

const App: React.FC = () => {
  // Get current time rounded to next 5 minutes for default start
  const getDefaultTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60); // Default 1 hour from now
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const [endTime, setEndTime] = useState(getDefaultTime());
  const [breakCount, setBreakCount] = useState(2);
  const [breakDuration, setBreakDuration] = useState(15);
  const [schedule, setSchedule] = useState<TimeSegment[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Theme State
  const [baseTheme, setBaseTheme] = useState<'light' | 'dark' | 'custom'>('dark');
  const [accentColor, setAccentColor] = useState<string>('#38e07b');
  const [breakColor, setBreakColor] = useState<string>('#60a5fa');
  const [customBackgroundColor, setCustomBackgroundColor] = useState<string>('#122017');
  const [customSurfaceColor, setCustomSurfaceColor] = useState<string>('#29382f');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Sound State
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);
  
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Derived state for display
  const [hours, setHours] = useState(endTime.split(':')[0]);
  const [minutes, setMinutes] = useState(endTime.split(':')[1]);

  // Determine current mode
  const currentSegment = activeIdx !== null ? schedule[activeIdx] : null;
  const isBreak = currentSegment?.type === 'break';

  useEffect(() => {
    const [h, m] = endTime.split(':');
    setHours(h);
    setMinutes(m);
  }, [endTime]);

  // Sync Base Theme with Dark Mode
  useEffect(() => {
    if (baseTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Dark and Custom default to dark mode base styles for now
      setIsDarkMode(true);
    }
  }, [baseTheme]);

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper to determine the effective break color based on theme
  const getEffectiveBreakColor = useCallback(() => {
    if (baseTheme === 'light') return '#60a5fa'; // Blue-400
    if (baseTheme === 'dark') return '#1e3a8a';  // Blue-900
    return breakColor; // Custom user selection
  }, [baseTheme, breakColor]);

  // Apply Primary Color to CSS Variable (Dynamic based on mode)
  useEffect(() => {
    const targetColor = isBreak ? getEffectiveBreakColor() : accentColor;
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
        '56 224 123'; // Default fallback
    };
    
    document.documentElement.style.setProperty('--color-primary', hexToRgb(targetColor));
  }, [accentColor, breakColor, isBreak, getEffectiveBreakColor]);

  // Handle Pomodoro Mode Toggle
  useEffect(() => {
    if (isPomodoro) {
      const now = new Date();
      const target = new Date();
      target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      
      const totalMinutes = Math.floor((target.getTime() - now.getTime()) / 60000);
      const cycleLength = 25 + 5; 
      const cycles = Math.floor(totalMinutes / cycleLength);
      
      setBreakDuration(5);
      setBreakCount(Math.max(0, cycles - 1));
    }
  }, [isPomodoro, hours, minutes]);

  const updateTime = (addMinutes: number) => {
    const now = new Date();
    const target = new Date();
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    
    target.setMinutes(target.getMinutes() + addMinutes);
    
    const h = String(target.getHours()).padStart(2, '0');
    const m = String(target.getMinutes()).padStart(2, '0');
    setEndTime(`${h}:${m}`);
  };

  const setTimeSpecific = (type: 'hour' | 'minute', val: number) => {
    let h = parseInt(hours);
    let m = parseInt(minutes);

    if (type === 'hour') h = val % 24;
    if (type === 'minute') m = val % 60;

    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    setEndTime(`${hStr}:${mStr}`);
  }

  const handleGenerate = () => {
    try {
      setError(null);
      const newSchedule = calculateSchedule({
        targetEndTime: endTime,
        breakCount,
        breakDuration,
        pomodoroMode: isPomodoro
      });
      setSchedule(newSchedule);
      setActiveIdx(0);
    } catch (err: any) {
      setError(err.message.includes("No space") 
        ? "Insufficient time! Adjust breaks or the end time." 
        : err.message);
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

  const isLastSegment = activeIdx !== null && activeIdx === schedule.length - 1;

  // Summary Calculations
  const now = new Date();
  const target = new Date();
  target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);
  
  const totalDurationMinutes = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 60000));
  const totalHours = Math.floor(totalDurationMinutes / 60);
  const totalMinsRem = totalDurationMinutes % 60;
  
  const totalBreakMinutes = breakCount * breakDuration;
  const focusMinutes = Math.max(0, totalDurationMinutes - totalBreakMinutes);
  const focusH = Math.floor(focusMinutes / 60);
  const focusM = focusMinutes % 60;

  // Custom Surface Style helper
  const customSurfaceStyle = baseTheme === 'custom' ? { backgroundColor: customSurfaceColor } : undefined;

  // Determine Background Color
  let appBackgroundColor: string | undefined = undefined;
  if (isBreak) {
    appBackgroundColor = getEffectiveBreakColor();
  } else if (baseTheme === 'custom') {
    appBackgroundColor = customBackgroundColor;
  }

  return (
    <div 
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased transition-colors duration-500"
      style={{ backgroundColor: appBackgroundColor }}
    >
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setBaseTheme(isDarkMode ? 'light' : 'dark')} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        customSurfaceColor={baseTheme === 'custom' ? customSurfaceColor : undefined}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        baseTheme={baseTheme}
        setBaseTheme={setBaseTheme}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        breakColor={breakColor}
        setBreakColor={setBreakColor}
        customBackgroundColor={customBackgroundColor}
        setCustomBackgroundColor={setCustomBackgroundColor}
        customSurfaceColor={customSurfaceColor}
        setCustomSurfaceColor={setCustomSurfaceColor}
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        volume={volume}
        setVolume={setVolume}
      />

      <div className="flex-grow flex flex-col overflow-y-auto">
        {activeIdx !== null ? (
          <TimerDisplay 
              currentSegment={currentSegment!} 
              onSegmentEnd={handleSegmentEnd} 
              onReset={handleReset}
              onSkip={handleSkip}
              isLastSegment={isLastSegment}
              schedule={schedule}
              currentIndex={activeIdx}
          />
        ) : (
          <div className="layout-container flex h-full grow flex-col items-center justify-center p-6 pb-20">
            <div className="w-full max-w-[960px] flex flex-col gap-8">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
                  Session Setup
                </h1>
                <p className="text-slate-500 dark:text-[#9eb7a8] text-lg font-normal">
                  Customize your workflow for maximum productivity
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div 
                    className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-[#29382f]"
                    style={baseTheme === 'custom' ? { backgroundColor: customSurfaceColor ? `${customSurfaceColor}20` : undefined, borderColor: customSurfaceColor ? `${customSurfaceColor}40` : undefined } : undefined}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
                        <h3 className="text-xl font-bold">End Time</h3>
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        Duration: {totalHours}h {totalMinsRem}m
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      {/* Hours */}
                      <div className="flex flex-col items-center gap-3">
                        <div 
                          className="bg-slate-50 dark:bg-[#233329] w-24 h-32 rounded-xl flex items-center justify-center border border-slate-200 dark:border-transparent hover:border-primary/50 transition-colors cursor-pointer group shadow-sm relative overflow-hidden"
                          style={customSurfaceStyle}
                        >
                          <input 
                              type="number" 
                              value={hours}
                              onChange={(e) => setTimeSpecific('hour', parseInt(e.target.value) || 0)}
                              className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-5xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors appearance-none"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hour</span>
                      </div>
                      
                      <div className="flex items-center h-32 pb-8">
                        <span className="text-5xl font-bold text-slate-300 dark:text-white/20">:</span>
                      </div>
                      
                      {/* Minutes */}
                      <div className="flex flex-col items-center gap-3">
                        <div 
                          className="bg-slate-50 dark:bg-[#233329] w-24 h-32 rounded-xl flex items-center justify-center border border-slate-200 dark:border-transparent ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark cursor-pointer shadow-sm relative overflow-hidden"
                          style={customSurfaceStyle}
                        >
                          <input 
                              type="number" 
                              value={minutes}
                              onChange={(e) => setTimeSpecific('minute', parseInt(e.target.value) || 0)}
                              className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-5xl font-bold text-primary appearance-none"
                          />
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Minute</span>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button onClick={() => updateTime(-60)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-bold transition-colors whitespace-nowrap border border-red-100 dark:border-red-500/20">-1 hour</button>
                        <button onClick={() => updateTime(-30)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-bold transition-colors whitespace-nowrap border border-red-100 dark:border-red-500/20">-30 min</button>
                        <button onClick={() => updateTime(-15)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-bold transition-colors whitespace-nowrap border border-red-100 dark:border-red-500/20">-15 min</button>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button onClick={() => updateTime(15)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-primary/10 text-primary dark:text-primary hover:bg-primary/20 text-sm font-bold transition-colors whitespace-nowrap border border-primary/20 dark:border-primary/20">+15 min</button>
                        <button onClick={() => updateTime(30)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-primary/10 text-primary dark:text-primary hover:bg-primary/20 text-sm font-bold transition-colors whitespace-nowrap border border-primary/20 dark:border-primary/20">+30 min</button>
                        <button onClick={() => updateTime(60)} style={customSurfaceStyle} className="flex-1 min-w-[100px] px-4 py-3.5 rounded-xl bg-primary/10 text-primary dark:text-primary hover:bg-primary/20 text-sm font-bold transition-colors whitespace-nowrap border border-primary/20 dark:border-primary/20">+1 hour</button>
                      </div>
                      <div className="flex justify-center mt-2">
                        <button onClick={() => setEndTime(getDefaultTime())} style={customSurfaceStyle} className="px-10 py-3 rounded-xl bg-slate-100 dark:bg-[#233329] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2f4236] text-sm font-bold transition-colors border border-slate-200 dark:border-transparent">Reset to Default</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-[#29382f]"
                      style={baseTheme === 'custom' ? { backgroundColor: customSurfaceColor ? `${customSurfaceColor}20` : undefined, borderColor: customSurfaceColor ? `${customSurfaceColor}40` : undefined } : undefined}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">free_breakfast</span>
                        <h3 className="text-lg font-bold">Breaks</h3>
                      </div>
                                          <div 
                                              className="flex items-center justify-between bg-slate-50 dark:bg-[#233329] rounded-xl p-2 border border-slate-200 dark:border-transparent"
                                              style={customSurfaceStyle}
                                          >
                                            <button 
                                              onClick={() => setBreakCount(Math.max(0, breakCount - 1))}
                                              className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors text-slate-600 dark:text-white"
                                            >
                                              <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <input 
                                              type="number"
                                              value={breakCount}
                                              onChange={(e) => setBreakCount(Math.max(0, parseInt(e.target.value) || 0))}
                                              className="w-16 text-center bg-transparent border-none focus:ring-0 text-2xl font-bold text-slate-900 dark:text-white appearance-none"
                                            />
                                            <button 
                                              onClick={() => setBreakCount(breakCount + 1)}
                                              className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors text-slate-600 dark:text-white"
                                            >
                                              <span className="material-symbols-outlined">add</span>
                                            </button>
                                          </div>
                      
                    </div>

                    <div 
                      className={`bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-[#29382f] ${isPomodoro ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                      style={baseTheme === 'custom' ? { backgroundColor: customSurfaceColor ? `${customSurfaceColor}20` : undefined, borderColor: customSurfaceColor ? `${customSurfaceColor}40` : undefined } : undefined}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">hourglass_top</span>
                        <h3 className="text-lg font-bold">Min / Break</h3>
                      </div>
                                          <div 
                                              className="flex items-center justify-between bg-slate-50 dark:bg-[#233329] rounded-xl p-2 border border-slate-200 dark:border-transparent"
                                              style={customSurfaceStyle}
                                          >
                                            <button 
                                              disabled={isPomodoro}
                                              onClick={() => setBreakDuration(Math.max(1, breakDuration - 1))}
                                              className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors text-slate-600 dark:text-white disabled:cursor-not-allowed"
                                            >
                                              <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <div className="flex items-baseline justify-center">
                                              <input 
                                                type="number"
                                                disabled={isPomodoro}
                                                value={breakDuration}
                                                onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-12 text-center bg-transparent border-none focus:ring-0 text-2xl font-bold text-slate-900 dark:text-white appearance-none disabled:cursor-not-allowed"
                                              />
                                              <span className="text-sm font-normal text-slate-400 ml-0.5">m</span>
                                            </div>
                                            <button 
                                              disabled={isPomodoro}
                                              onClick={() => setBreakDuration(breakDuration + 1)}
                                              className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors text-slate-600 dark:text-white disabled:cursor-not-allowed"
                                            >
                                              <span className="material-symbols-outlined">add</span>
                                            </button>
                                          </div>
                      
                    </div>
                  </div>

                  <div 
                    className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-[#29382f] flex items-center justify-between cursor-pointer group hover:border-primary/50 transition-colors"
                    onClick={() => setIsPomodoro(!isPomodoro)}
                    style={baseTheme === 'custom' ? { backgroundColor: customSurfaceColor ? `${customSurfaceColor}20` : undefined, borderColor: customSurfaceColor ? `${customSurfaceColor}40` : undefined } : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">timer_10_alt_1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Pomodoro Mode</h3>
                        <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">Strict 25m focus / 5m break intervals</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                      <input type="checkbox" checked={isPomodoro} readOnly className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-[#233329] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div 
                      className="bg-white dark:bg-[#1a2c23] rounded-2xl p-6 md:p-8 text-slate-900 dark:text-white relative overflow-hidden border border-slate-200 dark:border-[#29382f] flex flex-col h-full justify-between shadow-lg dark:shadow-none"
                      style={baseTheme === 'custom' ? { backgroundColor: customSurfaceColor ? `${customSurfaceColor}20` : undefined, borderColor: customSurfaceColor ? `${customSurfaceColor}40` : undefined } : undefined}
                  >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div>
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined">summarize</span> Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/10">
                          <span className="text-slate-500 dark:text-slate-400">Total Duration</span>
                          <span className="font-bold">{totalHours}h {totalMinsRem}m</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/10">
                          <span className="text-slate-500 dark:text-slate-400">Focus Time</span>
                          <span className="font-bold text-slate-900 dark:text-white">{focusH}h {focusM}m</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-white/10">
                          <span className="text-slate-500 dark:text-slate-400">Total Breaks</span>
                          <span className="font-bold text-slate-900 dark:text-white">{totalBreakMinutes}m</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-slate-500 dark:text-slate-400">Finish At</span>
                          <span className="font-bold text-primary">{endTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <button 
                        onClick={handleGenerate}
                        className="w-full bg-primary hover:bg-primary/90 text-[#111714] font-bold text-lg py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(var(--color-primary)/0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary)/0.5)] transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        Start Session
                      </button>
                      <p className="text-center text-xs text-slate-500 mt-4">Pressing start will enable Do Not Disturb</p>
                      
                      {error && (
                        <div className="mt-4 p-3 bg-red-500/20 text-red-200 rounded-lg text-xs font-bold border border-red-500/50 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">error</span> {error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default App;
