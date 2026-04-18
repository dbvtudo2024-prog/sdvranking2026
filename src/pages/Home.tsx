
import React, { useState, useEffect, useMemo } from 'react';
import { Announcement, AuthUser, Member, BadgeLevel, UserStats } from '@/types';
import { Megaphone, Users, Trophy, Gamepad2, MessageCircle, ShieldCheck, User, LayoutGrid, BookOpen, Share2, Cake, Star } from 'lucide-react';
import { formatImageUrl } from '@/helpers/imageHelpers';

interface HomeProps {
  announcements: Announcement[];
  onNavigate: (page: any) => void;
  isDarkMode?: boolean;
  user: AuthUser;
  members: Member[];
  onAwardBadge?: (badgeId: string, level: BadgeLevel) => void;
  onUpdateStats?: (statsUpdate: Partial<UserStats>) => void;
}

const Home: React.FC<HomeProps> = ({ announcements, onNavigate, isDarkMode = false, user, members, onAwardBadge, onUpdateStats }) => {
  const [currentAvisoIndex, setCurrentAvisoIndex] = useState(0);
  const LOGO_APP = "https://lhcobtexredrovjbxaew.supabase.co/storage/v1/object/public/Imagens/app/brasao3d.PNG";

  useEffect(() => {
    // AWARD BADGE - Discipline (Sentinela Fiel)
    // Award the login badge when the user lands on the Home page
    const loginFlag = sessionStorage.getItem('login_counted');
    if (!loginFlag && onUpdateStats && onAwardBadge) {
      onUpdateStats({ totalLogins: 1 });
      sessionStorage.setItem('login_counted', 'true');
      
      const totalLogins = (user.stats?.totalLogins || 0) + 1;
      if (totalLogins >= 30) onAwardBadge('sentinela_fiel', BadgeLevel.GOLD);
      else if (totalLogins >= 7) onAwardBadge('sentinela_fiel', BadgeLevel.SILVER);
      else onAwardBadge('sentinela_fiel', BadgeLevel.BRONZE);
    }
  }, [onAwardBadge, onUpdateStats, user.stats?.totalLogins]);

  const safeMembers = Array.isArray(members) ? members : [];

  // Aniversariantes do dia
  const todayBirthdays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    return safeMembers.filter(m => {
      if (!m.birthday) return false;
      const [y, mStr, dStr] = m.birthday.split('-');
      return parseInt(mStr) - 1 === currentMonth && parseInt(dStr) === currentDay;
    });
  }, [safeMembers]);

  const handleShare = (aviso: Announcement) => {
    const text = `📢 *AVISO DO CLUBE: ${aviso.title.toUpperCase()}*\n\n${aviso.content}\n\n🗓️ _Postado em: ${aviso.date}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (announcements && announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentAvisoIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [announcements]);

  const Shortcut = ({ icon: Icon, label, page, color }: { icon: any, label: string, page: string, color: string }) => (
    <button 
      onClick={() => onNavigate(page)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] shadow-lg border active:scale-95 transition-all ${isDarkMode ? 'bg-dark-card border-dark-border shadow-blue-900/10' : 'bg-white border-slate-50 shadow-slate-200/50'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-full overflow-y-auto pb-8 animate-in fade-in duration-500 ${isDarkMode ? 'bg-dark-bg' : 'bg-slate-50'}`}>
      {/* BRASÃO DO CLUBE AO TOPO */}
      <div className={`flex flex-col items-center justify-center pt-12 pb-8 landscape:pt-4 landscape:pb-4 rounded-b-[3rem] shadow-xl relative ${isDarkMode ? 'bg-dark-card shadow-blue-900/10' : 'bg-white shadow-blue-900/5'}`}>
        <button 
          onClick={() => onNavigate('profile')}
          className={`absolute top-8 right-8 landscape:top-4 landscape:right-4 w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl active:scale-90 transition-all border shadow-sm overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
        >
          {user.photoUrl ? (
            <img 
              src={formatImageUrl(user.photoUrl)} 
              alt="Perfil" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={24} />
          )}
        </button>
        <img 
          src={LOGO_APP} 
          alt="Brasão do Clube" 
          className="w-32 h-32 landscape:w-20 landscape:h-20 object-contain drop-shadow-2xl" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* DESTAQUE DO DIA - ANIVERSARIANTES */}
      {todayBirthdays.length > 0 && (
        <div className="px-6 mt-8">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-6 shadow-2xl shadow-pink-500/30 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/10 rotate-12 pointer-events-none">
              <Cake size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-300 animate-pulse" size={16} fill="currentColor" />
                <h3 className="text-white text-[11px] font-black uppercase tracking-widest">Aniversariante do Dia!</h3>
              </div>
              <div className="flex flex-col gap-3">
                {todayBirthdays.map(m => (
                  <div key={m.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden bg-white/20">
                      <img src={m.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-black uppercase truncate">{m.name}</p>
                      <p className="text-white/70 text-[9px] font-bold uppercase">{m.unit}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate('birthdays')}
                      className="bg-white text-pink-600 px-3 py-1 rounded-full text-[10px] font-black uppercase active:scale-95 transition-all"
                    >
                      Parabéns!
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÍCONES DE ATALHOS */}
      <div className="px-6 mt-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Acesso Rápido</h3>
        <div className="grid grid-cols-3 gap-4">
          <Shortcut icon={LayoutGrid} label="Unidades" page="units" color="#0061f2" />
          <Shortcut icon={Cake} label="Aniversários" page="birthdays" color="#ec4899" />
          <Shortcut icon={BookOpen} label="Bíblia" page="bible" color="#8b5cf6" />
          <Shortcut icon={Trophy} label="Ranking" page="ranking" color="#f59e0b" />
          <Shortcut icon={MessageCircle} label="Chat" page="chat" color="#10b981" />
          <Shortcut icon={Gamepad2} label="Jogos" page="games" color="#ec4899" />
          <Shortcut icon={BookOpen} label="Estudo" page="specialty_study" color="#059669" />
        </div>
      </div>
    </div>
  );
};

export default Home;
