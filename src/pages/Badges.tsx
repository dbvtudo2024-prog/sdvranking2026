
import React, { useState } from 'react';
import { ShieldCheck, Star, Shield, Type, Gamepad2, MessageSquare, Brain, Map, Lock, Medal, CheckCircle2, Trophy, X, Zap, Target, BookOpenCheck } from 'lucide-react';
import { AuthUser, Member, BadgeLevel, BadgeDefinition } from '@/types';
import { BADGE_DEFINITIONS } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';

interface BadgesProps {
  user: AuthUser;
  members: Member[];
  isDarkMode: boolean;
}

const BADGE_ICONS: { [key: string]: any } = {
  'Shield': Shield,
  'Type': Type,
  'Gamepad2': Gamepad2,
  'MessageSquare': MessageSquare,
  'Brain': Brain,
  'Map': Map,
  'Medal': Medal,
  'CheckCircle2': CheckCircle2
};

const Badges: React.FC<BadgesProps> = ({ user, members, isDarkMode }) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [selectedMonthly, setSelectedMonthly] = useState<any | null>(null);
  
  const currentMember = members.find(m => String(m.id) === String(user.id));
  const userBadges = currentMember?.badges || [];

  const getBadgeIcon = (iconName: string) => {
    return BADGE_ICONS[iconName] || ShieldCheck;
  };

  const handleBadgeClick = (badge: BadgeDefinition) => {
    setSelectedBadge(badge);
    setSelectedMonthly(null);
  };

  const handleMonthlyClick = (badge: any) => {
    const parts = badge.badgeId.split('_');
    const monthStr = parts[2];
    const rank = parts[3];
    const [year, month] = monthStr.split('-');
    const monthName = badge.monthLabel || new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
    
    setSelectedMonthly({
      ...badge,
      monthName,
      year,
      rank
    });
    setSelectedBadge(null);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      {/* Stats Header */}
      <div className={`p-8 pb-10 pt-6 ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-600'} rounded-b-[3.5rem] shadow-xl relative overflow-hidden shrink-0`}>
        {/* Abstract circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Progresso Geral</p>
              <p className="text-white text-sm font-black leading-none">
                <span className="text-yellow-400">{userBadges.length} de {BADGE_DEFINITIONS.length}</span> conquistadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {BADGE_DEFINITIONS.map(badge => {
            const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
            const isUnlocked = !!userBadge;
            const BadgeIcon = getBadgeIcon(badge.icon);
            
            return (
              <button 
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`p-5 rounded-[2.5rem] border-2 transition-all relative flex flex-col items-center justify-between min-h-[180px] text-left w-full outline-none ${
                  isUnlocked 
                    ? (isDarkMode ? 'bg-blue-900/20 border-blue-500/50 scale-100 shadow-lg shadow-blue-500/5 active:scale-95' : 'bg-white border-blue-100 shadow-xl shadow-blue-500/10 active:scale-95') 
                    : (isDarkMode ? 'bg-slate-800/30 border-slate-700 opacity-40 grayscale hover:opacity-60 active:scale-95' : 'bg-slate-50 border-slate-100 opacity-40 grayscale hover:opacity-60 active:scale-95')
                }`}
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-3 transition-transform ${
                  isUnlocked 
                    ? (userBadge.level === BadgeLevel.GOLD ? 'bg-yellow-500 shadow-yellow-500/40' : 
                       userBadge.level === BadgeLevel.SILVER ? 'bg-slate-400 shadow-slate-400/40' : 
                       'bg-orange-700 shadow-orange-700/40')
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                } text-white shadow-xl`}>
                  <BadgeIcon size={32} />
                </div>
                
                <div className="text-center w-full">
                  <p className={`text-[11px] font-black uppercase leading-tight mb-1 truncate px-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{badge.name}</p>
                  <p className={`text-[8px] font-bold uppercase tracking-[0.1em] ${isUnlocked ? (userBadge.level === BadgeLevel.GOLD ? 'text-yellow-600' : userBadge.level === BadgeLevel.SILVER ? 'text-slate-500' : 'text-orange-800') : 'text-slate-400'}`}>
                    {isUnlocked ? userBadge.level : badge.category}
                  </p>
                </div>

                {isUnlocked && (
                  <div className={`absolute top-2 right-2 p-1 rounded-full shadow-lg border-2 border-white ${
                    userBadge.level === BadgeLevel.GOLD ? 'bg-yellow-400 text-yellow-900' : 
                    userBadge.level === BadgeLevel.SILVER ? 'bg-slate-200 text-slate-600' : 
                    'bg-orange-300 text-orange-900'
                  }`}>
                    <Star size={10} fill="currentColor" />
                  </div>
                )}
                
                {!isUnlocked && (
                  <div className="absolute bottom-2 right-2 opacity-50">
                    <Lock size={12} className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION: INSÍGNIAS MENSAIS */}
        {userBadges.some(b => b.badgeId.startsWith('monthly_games_')) && (
          <div className="space-y-4">
            <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] ml-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Campeões Mensais</h3>
            <div className="grid grid-cols-1 gap-4">
              {userBadges.filter(b => b.badgeId.startsWith('monthly_games_')).map(badge => {
                const parts = badge.badgeId.split('_');
                const monthStr = parts[2];
                const rank = parts[3];
                const [year, month] = monthStr.split('-');
                const monthName = badge.monthLabel || new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
                const points = badge.points || 0;
                
                const levelColors = {
                  [BadgeLevel.GOLD]: 'from-yellow-400 to-amber-600',
                  [BadgeLevel.SILVER]: 'from-slate-300 to-slate-500',
                  [BadgeLevel.BRONZE]: 'from-orange-400 to-orange-600',
                  [BadgeLevel.DIAMOND]: 'from-blue-400 to-indigo-600'
                };

                return (
                  <button 
                    key={badge.badgeId} 
                    onClick={() => handleMonthlyClick(badge)}
                    className={`relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br ${levelColors[badge.level as keyof typeof levelColors] || 'from-blue-500 to-indigo-600'} shadow-2xl shadow-black/10 transition-transform active:scale-95 text-left w-full outline-none`}
                  >
                    <div className="absolute -right-4 -bottom-4 text-white/10 rotate-12 pointer-events-none">
                      <Trophy size={120} />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl relative">
                        <Trophy size={32} className="text-white" fill="white" />
                        <div className="absolute -top-2 -right-2 bg-white text-[#0061f2] rounded-lg px-2 py-0.5 text-[8px] font-black shadow-lg">
                          {points} PTS
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Ranking de Jogos</span>
                        <h4 className="text-xl font-black text-white uppercase mt-1">{monthName} {year}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
                              <span className="text-[9px] font-black text-white uppercase tracking-tighter">{rank}º LUGAR</span>
                           </div>
                           <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/10">
                              <span className="text-[9px] font-black text-white uppercase tracking-tighter">{badge.level}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'bg-blue-900/10 border-blue-800/50' : 'bg-blue-50/50 border-blue-100'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`}>
              <Star size={20} />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>Como conquistar?</h4>
              <p className={`text-[10px] font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Jogue o Quiz com nota máxima, vença desafios semanais, participe do Chat e explore todas as áreas do aplicativo para desbloquear sua coleção!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA INSÍGNIAS NORMAIS */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
            >
              <div className={`p-8 bg-gradient-to-br ${isDarkMode ? 'from-blue-600/20 to-indigo-600/20' : 'from-blue-600 to-indigo-700'}`}>
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-20"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl relative shrink-0">
                    {React.createElement(getBadgeIcon(selectedBadge.icon), { size: 32, className: "text-white" })}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
                      <Zap size={14} className="text-yellow-900" fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{selectedBadge.name}</h3>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">{selectedBadge.category}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <Target size={18} />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>O Desafio:</span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedBadge.description}
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border-2 border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpenCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0061f2]">Como Ganhar?</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Bronze: Nível Inicial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Prata: Desafio Moderado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Ouro: Excelência Máxima</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Entendi, vou conquistar!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PARA INSÍGNIAS MENSAIS */}
      <AnimatePresence>
        {selectedMonthly && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMonthly(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
            >
              <div className={`p-8 bg-gradient-to-br from-amber-500 to-orange-600`}>
                <button 
                  onClick={() => setSelectedMonthly(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-20"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl relative shrink-0">
                    <Trophy size={32} className="text-white" fill="white" />
                  </div>
                  
                  <div className="text-left">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">Campeão de Jogos</h3>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">{selectedMonthly.monthName} {selectedMonthly.year}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className={`inline-block px-5 py-2 rounded-full border-2 border-amber-500/20 mb-4 ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                    <span className="text-[11px] font-black uppercase tracking-widest">{selectedMonthly.rank}º LUGAR NO RANKING</span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Esta insígnia é concedida aos 3 melhores jogadores do mês. Você alcançou a marca de **{selectedMonthly.points} pontos** e provou ser um verdadeiro Sentinela da Verdade!
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border-2 border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-blue-600 text-white`}>
                          <Medal size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0061f2]">Conquista</span>
                      </div>
                      <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>ESTRELAS GLOBAIS</span>
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedMonthly(null)}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                >
                  Fechar com orgulho!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Badges;
