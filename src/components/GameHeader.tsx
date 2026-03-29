
import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { AuthUser } from '@/types';

interface GameHeaderProps {
  title: string;
  user: AuthUser;
  stats?: {
    label: string;
    value: string | number;
  }[];
  onRefresh?: () => void;
  onBack: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, user, stats = [], onRefresh, onBack }) => {
  return (
    <header className="bg-[#0061f2] text-white px-5 h-20 flex items-center justify-between shadow-xl z-50 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90 border border-white/20"
          title="Voltar"
        >
          <ArrowLeft size={22} strokeWidth={3} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-black uppercase tracking-tight text-base leading-tight">{title}</h1>
          <p className="text-[10px] font-bold uppercase opacity-80 leading-none mt-1">
            {user.name} • {user.funcao || user.role}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex gap-6 mr-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-end">
              <span className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">
                {stat.label}
              </span>
              <span className="text-sm font-black text-white font-mono leading-none">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90 border border-white/20"
            title="Reiniciar Jogo"
          >
            <RefreshCw size={20} strokeWidth={3} />
          </button>
        )}
      </div>
    </header>
  );
};

export default GameHeader;
