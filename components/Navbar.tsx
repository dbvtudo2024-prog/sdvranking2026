
import React from 'react';
import { Home, Trophy, User, Gamepad2, ShieldCheck, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: 'home' | 'ranking' | 'leadership' | 'profile' | 'games' | 'chat') => void;
  unreadCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, unreadCount = 0 }) => {
  const getItemClasses = (page: string) => 
    `flex flex-col items-center justify-center transition-all duration-300 w-14 h-14 rounded-2xl ${
      currentPage === page ? 'bg-[#f0f7ff] text-[#0061f2] shadow-sm' : 'text-slate-400 hover:text-slate-600'
    }`;

  const iconStroke = (page: string) => (currentPage === page ? 2.5 : 2);

  return (
    <nav className="w-full bg-white flex justify-between items-center px-2 py-3">
      <button 
        onClick={() => setCurrentPage('home')}
        className={getItemClasses('home')}
      >
        <Home size={18} strokeWidth={iconStroke('home')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Início</span>
      </button>

      <button 
        onClick={() => setCurrentPage('ranking')}
        className={getItemClasses('ranking')}
      >
        <Trophy size={18} strokeWidth={iconStroke('ranking')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Rank</span>
      </button>

      <button 
        onClick={() => setCurrentPage('chat')}
        className={`${getItemClasses('chat')} relative`}
      >
        <MessageCircle size={18} strokeWidth={iconStroke('chat')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Chat</span>
        
        {/* BADGE DE NOTIFICAÇÃO */}
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <button 
        onClick={() => setCurrentPage('leadership')}
        className={getItemClasses('leadership')}
      >
        <ShieldCheck size={18} strokeWidth={iconStroke('leadership')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Líderes</span>
      </button>

      <button 
        onClick={() => setCurrentPage('games')}
        className={getItemClasses('games')}
      >
        <Gamepad2 size={18} strokeWidth={iconStroke('games')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Jogos</span>
      </button>

      <button 
        onClick={() => setCurrentPage('profile')}
        className={getItemClasses('profile')}
      >
        <User size={18} strokeWidth={iconStroke('profile')} />
        <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Perfil</span>
      </button>
    </nav>
  );
};

export default Navbar;
