
import React, { useState, useEffect, useMemo } from 'react';
import { Announcement, AuthUser, Member, BadgeLevel, UserStats, UserRole } from '@/types';
import { Megaphone, Users, Trophy, Gamepad2, MessageCircle, ShieldCheck, User, LayoutGrid, BookOpen, Share2, Cake, Star, BellRing, Pin, CheckCircle2, Calendar, Flame, X } from 'lucide-react';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const LOGO_APP = "https://lhcobtexredrovjbxaew.supabase.co/storage/v1/object/public/Imagens/app/brasao3d.PNG";

  // Check-in logic
  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = user.stats?.lastCheckInDate;
  const streak = user.stats?.checkInStreak || 0;
  
  const canCheckIn = lastCheckIn !== today;
  
  const handleCheckIn = () => {
    if (!onUpdateStats) return;
    
    let newStreak = 1;
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastCheckIn === yesterdayStr) {
        newStreak = streak + 1;
        // Reward for 7 days
        if (newStreak === 7 && onAwardBadge) {
           onAwardBadge('fidelidade_7_dias', BadgeLevel.SILVER);
        }
      }
    }
    
    onUpdateStats({
      lastCheckInDate: today,
      checkInStreak: newStreak
    });
    
    // Award badges for milestones
    if (onAwardBadge) {
      if (newStreak === 7) onAwardBadge('fidelidade_presenca', BadgeLevel.BRONZE);
      else if (newStreak === 15) onAwardBadge('fidelidade_presenca', BadgeLevel.SILVER);
      else if (newStreak === 30) onAwardBadge('fidelidade_presenca', BadgeLevel.GOLD);
      else if (newStreak === 60) onAwardBadge('fidelidade_presenca', BadgeLevel.DIAMOND);
      else if (newStreak === 90) onAwardBadge('fidelidade_presenca', BadgeLevel.MASTER);
    }

    // Close modal after check-in
    setTimeout(() => setShowCheckInModal(false), 1500);
  };

  useEffect(() => {
    // Check if streak should reset due to missed days
    if (lastCheckIn && onUpdateStats) {
      const lastDate = new Date(lastCheckIn + 'T12:00:00'); // Midday to avoid TZ issues
      const todayDate = new Date(today + 'T12:00:00');
      
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Se passou mais de 1 dia (ou seja, pulou o dia de ontem), reseta
      if (diffDays > 1 && streak > 0) {
        console.log(`[Streak] Resetando ofensiva. Último: ${lastCheckIn}, Hoje: ${today}, Diferença: ${diffDays} dias`);
        onUpdateStats({ checkInStreak: 0 });
      }
    }
  }, [lastCheckIn, today, streak, onUpdateStats]);

  // Handle auto-show modal if can check-in
  useEffect(() => {
    if (canCheckIn) {
      const timer = setTimeout(() => setShowCheckInModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [canCheckIn]);

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
    const todayDate = new Date();
    const currentDay = todayDate.getDate();
    const currentMonth = todayDate.getMonth();

    const birthdays = safeMembers.filter(m => {
      if (!m.birthday) return false;
      const [y, mStr, dStr] = m.birthday.split('-');
      return parseInt(mStr) - 1 === currentMonth && parseInt(dStr) === currentDay;
    });

    const seen = new Set();
    return birthdays.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [safeMembers]);

  const handleShare = (aviso: Announcement) => {
    const text = `📢 *AVISO DO CLUBE: ${aviso.title.toUpperCase()}*\n\n${aviso.content}\n\n🗓️ _Postado em: ${aviso.date}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const uniqueAnnouncements = useMemo(() => {
    const seen = new Set();
    return (announcements || []).filter(a => {
      if (!a.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [announcements]);

  useEffect(() => {
    if (uniqueAnnouncements && uniqueAnnouncements.length > 1) {
      const timer = setInterval(() => {
        setCurrentAvisoIndex((prev) => (prev + 1) % uniqueAnnouncements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [uniqueAnnouncements]);

  // Handle index out of bounds if announcements decrease
  useEffect(() => {
    if (currentAvisoIndex >= uniqueAnnouncements.length && uniqueAnnouncements.length > 0) {
      setCurrentAvisoIndex(0);
    }
  }, [uniqueAnnouncements.length, currentAvisoIndex]);

  const Shortcut = ({ icon: Icon, label, page, color }: { icon: any, label: string, page: string, color: string }) => (
    <motion.button 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onNavigate(page)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[2.5rem] shadow-xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-blue-900/10' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
    >
      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl mb-1 relative overflow-hidden group`} style={{ backgroundColor: color }}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon size={28} />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
    </motion.button>
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

      {/* MURAL DE AVISOS */}
      {uniqueAnnouncements.length > 0 && (
        <div className="px-6 mt-8">
          <div className={`relative rounded-[2.5rem] shadow-2xl overflow-hidden group border-2 ${isDarkMode ? 'bg-slate-900 border-blue-900/30 shadow-blue-900/10' : 'bg-white border-blue-100 shadow-blue-900/5'}`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="px-6 pt-6 flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                  <div className="relative w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <BellRing size={20} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Mural de Avisos</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Atualizado agora</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                {uniqueAnnouncements.map((aviso, i) => (
                  <button 
                    key={aviso.id} 
                    onClick={() => setCurrentAvisoIndex(i)}
                    className={`relative h-1.5 rounded-full transition-all duration-300 overflow-hidden ${i === currentAvisoIndex ? 'w-8 bg-blue-100 dark:bg-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} 
                  >
                    {i === currentAvisoIndex && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-blue-500"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pb-2 min-h-[110px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={uniqueAnnouncements[currentAvisoIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Pin size={14} className="text-blue-400 mt-1 shrink-0 rotate-12" />
                    <h4 className={`font-black text-base uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {uniqueAnnouncements[currentAvisoIndex].title}
                    </h4>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-3 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {uniqueAnnouncements[currentAvisoIndex].content}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400'} border border-slate-100 dark:border-slate-700`}>
                  Postado {uniqueAnnouncements[currentAvisoIndex].date}
                </div>
              </div>
              <button 
                onClick={() => handleShare(uniqueAnnouncements[currentAvisoIndex])}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Share2 size={12} strokeWidth={3} />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* FLOATING ACTION BUTTON / ICON FOR CHECK-IN */}
      <div className="fixed bottom-44 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {streak > 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: 20 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.8, x: 20 }}
               onClick={() => setShowCheckInModal(true)}
               className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border-2 cursor-pointer active:scale-95 transition-all pointer-events-auto ${isDarkMode ? 'bg-slate-900 border-orange-500/30 shadow-orange-950/20' : 'bg-white border-orange-100 shadow-orange-200/50'}`}
            >
               <Flame size={20} className="text-orange-500 fill-orange-500" />
               <span className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{streak} DIAS</span>
            </motion.div>
          )}

          {canCheckIn && (
            <motion.button 
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               whileHover={{ scale: 1.05 }}
               onClick={() => setShowCheckInModal(true)}
               className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-600/40 flex items-center justify-center animate-bounce hover:animate-none pointer-events-auto"
            >
               <Calendar size={28} />
               <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
               </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* CHECK-IN MODAL */}
      <AnimatePresence>
        {showCheckInModal && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowCheckInModal(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative border-2 overflow-hidden`}
              >
                 <button onClick={() => setShowCheckInModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                 
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                       <Calendar size={40} />
                    </div>
                    
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">Presença Diária</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Complete 7 dias consecutivos!</p>
                    </div>

                    <div className="flex justify-center gap-1.5">
                       <Flame size={20} className="text-orange-500 fill-orange-500" />
                       <span className="text-xl font-black text-orange-600 dark:text-orange-400">{streak} DIAS SEGUIDOS</span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                       {(() => {
                         const nextMilestone = streak <= 7 ? 7 : streak <= 15 ? 15 : streak <= 30 ? 30 : streak <= 60 ? 60 : streak <= 90 ? 90 : 100;
                         const start = Math.max(1, streak - 3);
                         const days = Array.from({ length: 7 }, (_, i) => start + i);
                         
                         return days.map(day => (
                            <div key={day} className="flex flex-col items-center gap-2">
                               <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  day <= streak 
                                     ? 'bg-blue-600 text-white shadow-lg' 
                                     : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
                               }`}>
                                  {day <= streak ? <CheckCircle2 size={18} strokeWidth={3} /> : <span className="text-[10px] font-black">{day}</span>}
                               </div>
                               <span className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">D{day}</span>
                            </div>
                         ));
                       })()}
                    </div>

                    {canCheckIn ? (
                       <button 
                          onClick={handleCheckIn}
                          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-900"
                       >
                          <ShieldCheck size={20} strokeWidth={3} />
                          Fazer Check-in de Hoje
                       </button>
                    ) : (
                       <div className="p-4 bg-green-500/10 rounded-2xl border-2 border-dashed border-green-500/30 flex flex-col items-center gap-2">
                          <CheckCircle2 size={32} className="text-green-500" strokeWidth={3} />
                          <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Presença Confirmada!</span>
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
