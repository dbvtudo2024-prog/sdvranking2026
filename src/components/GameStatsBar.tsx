
import React from 'react';

interface Stat {
  label: string;
  value: string | number;
}

interface GameStatsBarProps {
  stats: Stat[];
}

const GameStatsBar: React.FC<GameStatsBarProps> = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="sm:hidden flex items-center justify-around bg-slate-50 dark:bg-slate-900/50 py-2 border-b border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center">
          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
            {stat.label}
          </span>
          <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono leading-none">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GameStatsBar;
