import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseTheme: 'light' | 'dark' | 'custom';
  setBaseTheme: (theme: 'light' | 'dark' | 'custom') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  breakColor: string;
  setBreakColor: (color: string) => void;
  customBackgroundColor: string;
  setCustomBackgroundColor: (color: string) => void;
  customSurfaceColor: string;
  setCustomSurfaceColor: (color: string) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose,
  baseTheme,
  setBaseTheme,
  accentColor,
  setAccentColor,
  breakColor,
  setBreakColor,
  customBackgroundColor,
  setCustomBackgroundColor,
  customSurfaceColor,
  setCustomSurfaceColor,
  isSoundEnabled,
  setIsSoundEnabled,
  volume,
  setVolume
}) => {
  if (!isOpen) return null;

  const presets = [
    { name: 'Emerald', hex: '#38e07b', class: 'bg-emerald-400' },
    { name: 'Blue', hex: '#60a5fa', class: 'bg-blue-400' },
    { name: 'Rose', hex: '#fb7185', class: 'bg-rose-400' },
    { name: 'Amber', hex: '#fbbf24', class: 'bg-amber-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a2c23] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#29382f] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2f4236] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c2e24]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </h3>
          <button 
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-[#2f4236] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Theme Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">format_paint</span>
              App Theme
            </h4>
            
            {/* Base Color */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Base Color</span>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-[#233329] rounded-xl">
                {([
                  { id: 'light', icon: 'light_mode' },
                  { id: 'dark', icon: 'dark_mode' },
                  { id: 'custom', icon: 'brush' }
                ] as const).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setBaseTheme(theme.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      baseTheme === theme.id 
                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{theme.icon}</span>
                    {theme.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Theme Pickers - Only visible when Custom is active */}
            {baseTheme === 'custom' && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center block">Background</span>
                  <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-[#233329] rounded-xl border border-slate-200 dark:border-transparent">
                    <div className="relative size-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0 cursor-pointer shadow-sm">
                      <input 
                        type="color" 
                        value={customBackgroundColor}
                        onChange={(e) => setCustomBackgroundColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: customBackgroundColor }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center block">Header</span>
                  <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-[#233329] rounded-xl border border-slate-200 dark:border-transparent">
                    <div className="relative size-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0 cursor-pointer shadow-sm">
                      <input 
                        type="color" 
                        value={customSurfaceColor}
                        onChange={(e) => setCustomSurfaceColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: customSurfaceColor }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accent Color */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color (Focus)</span>
              <div className="flex gap-3">
                 {/* Presets */}
                 {presets.map((preset) => (
                   <button
                    key={preset.name}
                    onClick={() => setAccentColor(preset.hex)}
                    title={preset.name}
                    className={`size-10 rounded-full transition-transform hover:scale-110 ${preset.class} ${
                      accentColor === preset.hex ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-[#1a2c23]' : ''
                    }`}
                   />
                 ))}
                 
                 {/* Custom Picker */}
                 <div className="relative size-10 rounded-full overflow-hidden transition-transform hover:scale-110 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center group cursor-pointer">
                    <input 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-white drop-shadow-md">add</span>
                 </div>
              </div>
            </div>

            {/* Break Color - Always visible or only custom? User said "Mueve el selector de color break fuera junto con Accent Color". Usually implies it's a primary setting. */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Break Color</span>
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-[#233329] rounded-xl border border-slate-200 dark:border-transparent">
                <div className="relative size-10 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0 cursor-pointer shadow-sm transition-transform hover:scale-105">
                  <input 
                    type="color" 
                    value={breakColor}
                    onChange={(e) => setBreakColor(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: breakColor }}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-200">Select Color</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">{breakColor}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#2f4236]" />

          {/* Sound Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">notifications</span>
              Sound
            </h4>
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#233329] border border-slate-100 dark:border-transparent space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white dark:bg-[#1a2c23] flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                    <span className="material-symbols-outlined">{isSoundEnabled ? 'volume_up' : 'volume_off'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Timer Sounds</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enable audio alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isSoundEnabled}
                    onChange={(e) => setIsSoundEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#1a2c23] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Volume Slider */}
              <div className={`space-y-3 pt-2 transition-opacity ${isSoundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                  <span>Volume</span>
                  <span>{volume}%</span>
                </div>
                <div className="relative w-full h-5 flex items-center select-none touch-none">
                  {/* Track Background */}
                  <div className="absolute w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"></div>
                  {/* Filled Track */}
                  <div 
                    className="absolute h-1.5 bg-primary rounded-full transition-all duration-75" 
                    style={{ width: `${volume}%` }}
                  ></div>
                  {/* Thumb */}
                  <div 
                    className="absolute h-4 w-4 bg-white border-2 border-primary rounded-full shadow-md transition-all duration-75 hover:scale-110"
                    style={{ left: `${volume}%`, transform: 'translateX(-50%)' }}
                  ></div>
                  {/* Invisible Input for Interaction */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;