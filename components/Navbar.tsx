
import React from 'react';
import { Home, Trophy, User, Gamepad2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: 'home' | 'ranking' | 'leadership' | 'profile' | 'games') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const getItemClasses = (page: string) => 
    `flex flex-col items-center justify-center transition-all duration-300 w-16 h-14 rounded-2xl ${
      currentPage === page ? 'bg-[#f0f7ff] text-[#0061f2] shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`;

  const iconStroke = (page: string) => (currentPage === page ? 2.5 : 2);

  return (
    <nav className="w-full bg-white flex justify-between items-center px-1 py-3">
      <button 
        onClick={() => setCurrentPage('home')}
        className={getItemClasses('home')}
      >
        <Home size={20} strokeWidth={iconStroke('home')} />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Início</span>
      </button>

      <button 
        onClick={() => setCurrentPage('ranking')}
        className={getItemClasses('ranking')}
      >
        <Trophy size={20} strokeWidth={iconStroke('ranking')} />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Ranking</span>
      </button>

      <button 
        onClick={() => setCurrentPage('leadership')}
        className={getItemClasses('leadership')}
      >
        <ShieldCheck size={20} strokeWidth={iconStroke('leadership')} />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Líderes</span>
      </button>

      <button 
        onClick={() => setCurrentPage('games')}
        className={getItemClasses('games')}
      >
        <Gamepad2 size={20} strokeWidth={iconStroke('games')} />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Jogos</span>
      </button>

      <button 
        onClick={() => setCurrentPage('profile')}
        className={getItemClasses('profile')}
      >
        <User size={20} strokeWidth={iconStroke('profile')} />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Perfil</span>
      </button>
    </nav>
  );
};

export default Navbar;
