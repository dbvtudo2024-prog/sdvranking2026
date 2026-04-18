
import React from 'react';
import { Home, Trophy, User, Gamepad2, ShieldCheck, MessageCircle, LayoutGrid, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: 'home' | 'units' | 'ranking' | 'leadership' | 'profile' | 'games' | 'badges' | 'chat' | 'bible_reading' | 'bible' | 'specialty_study') => void;
  unreadCount?: number;
  isDarkMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, unreadCount = 0, isDarkMode = false }) => {
  const getItemClasses = (page: string) => 
    `flex flex-col items-center justify-center transition-all duration-300 w-12 h-12 rounded-xl ${
      currentPage === page 
        ? (isDarkMode ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'bg-[#f0f7ff] text-[#0061f2] shadow-sm') 
        : (isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')
    }`;

  const iconStroke = (page: string) => (currentPage === page ? 2.5 : 2);

  return (
    <nav className={`w-full flex justify-between items-center px-1 py-2 ${isDarkMode ? 'bg-dark-card border-t border-dark-border' : 'bg-white border-t border-slate-100'}`}>
      <button 
        onClick={() => setCurrentPage('home')}
        className={getItemClasses('home')}
      >
        <Home size={16} strokeWidth={iconStroke('home')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Início</span>
      </button>

      <button 
        onClick={() => setCurrentPage('units')}
        className={getItemClasses('units')}
      >
        <LayoutGrid size={16} strokeWidth={iconStroke('units')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Unidades</span>
      </button>

      <button 
        onClick={() => setCurrentPage('ranking')}
        className={getItemClasses('ranking')}
      >
        <Trophy size={16} strokeWidth={iconStroke('ranking')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Rank</span>
      </button>

      <button 
        onClick={() => setCurrentPage('badges')}
        className={getItemClasses('badges')}
      >
        <ShieldCheck size={16} strokeWidth={iconStroke('badges')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Insígnias</span>
      </button>

      <button 
        onClick={() => setCurrentPage('games')}
        className={getItemClasses('games')}
      >
        <Gamepad2 size={16} strokeWidth={iconStroke('games')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Jogos</span>
      </button>

      <button 
        onClick={() => setCurrentPage('specialty_study')}
        className={getItemClasses('specialty_study')}
      >
        <BookOpen size={16} strokeWidth={iconStroke('specialty_study')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Estudo</span>
      </button>

      <button 
        onClick={() => setCurrentPage('profile')}
        className={getItemClasses('profile')}
      >
        <User size={16} strokeWidth={iconStroke('profile')} />
        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Perfil</span>
      </button>
    </nav>
  );
};

export default Navbar;
