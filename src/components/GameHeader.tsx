
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface GameHeaderProps {
  stats: {
    label: string;
    value: string | number;
  }[];
  onRefresh?: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ stats, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
      <div className="flex gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {stat.label}
            </span>
            <span className="text-xl font-black text-slate-700 dark:text-slate-200 font-mono leading-none">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      {onRefresh && (
        <button 
          onClick={onRefresh}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
          title="Reiniciar Jogo"
        >
          <RefreshCw size={24} />
        </button>
      )}
    </div>
  );
};

export default GameHeader;
