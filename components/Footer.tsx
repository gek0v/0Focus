
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 flex flex-col items-center gap-4 shrink-0 border-t border-slate-200/50 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 opacity-60">
        <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Master your time, focus on what matters
        </p>
        <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
      </div>

      <div className="flex items-center gap-2">
        <a 
          href="https://github.com/gek0v" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
        >
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
            Created by <span className="text-slate-900 dark:text-white">@gek0v</span>
          </span>
          <span className="material-symbols-outlined text-sm text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
            open_in_new
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
