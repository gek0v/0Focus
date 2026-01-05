import React from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenSettings: () => void;
  customSurfaceColor?: string;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onOpenSettings, customSurfaceColor }) => {
  return (
    <header 
      className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#29382f] px-10 py-4 bg-white dark:bg-[#111714]"
      style={{ backgroundColor: customSurfaceColor }}
    >
      <div className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
          <span className="material-symbols-outlined text-2xl">timer</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">0 Focus</h2>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={toggleDarkMode}
          className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#364a3e] transition-colors"
          style={{ backgroundColor: customSurfaceColor ? `${customSurfaceColor}cc` : undefined }} // Use slightly transparent or same color
        >
          <span className="material-symbols-outlined text-[20px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button 
          onClick={onOpenSettings}
          className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#29382f] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#364a3e] transition-colors"
          style={{ backgroundColor: customSurfaceColor ? `${customSurfaceColor}cc` : undefined }}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;