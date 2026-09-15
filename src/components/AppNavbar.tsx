
import React from 'react';
import { Home, Trophy, Gamepad2, ShieldCheck, LayoutGrid, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: 'home' | 'units' | 'ranking' | 'leadership' | 'profile' | 'games' | 'badges' | 'chat' | 'bible_reading' | 'bible' | 'specialty_study') => void;
  unreadCount?: number;
  isDarkMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, isDarkMode = false }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'units', label: 'Unidades', icon: LayoutGrid },
    { id: 'ranking', label: 'Rank', icon: Trophy },
    { id: 'badges', label: 'Insígnias', icon: ShieldCheck },
    { id: 'games', label: 'Jogos', icon: Gamepad2 },
    { id: 'specialty_study', label: 'Estudo', icon: BookOpen },
  ];

  return (
    <nav
      id="floating-bottom-dock"
      className={`w-full flex items-center justify-between p-1.5 sm:p-2 rounded-2xl sm:rounded-[1.75rem] border shadow-2xl transition-all duration-300 backdrop-blur-xl ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-700/60 shadow-black/50 text-slate-100'
          : 'bg-white/90 border-white/80 shadow-blue-900/15 text-slate-800'
      }`}
    >
      <div className="grid grid-cols-6 gap-0.5 sm:gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id as any)}
              className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-0.5 sm:px-1.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-90 select-none group relative ${
                isActive
                  ? 'bg-[#0061f2] text-white shadow-md shadow-blue-600/30'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}
              />
              <span
                className={`text-[8px] min-[360px]:text-[8.5px] sm:text-[9px] uppercase tracking-tight leading-none mt-1 whitespace-nowrap truncate max-w-full ${
                  isActive ? 'font-black text-white' : 'font-bold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
