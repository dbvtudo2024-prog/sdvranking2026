
import React from 'react';
import { ShieldCheck, Star, Shield, Type, Gamepad2, MessageSquare, Brain, Map, Lock, Medal } from 'lucide-react';
import { AuthUser, Member, BadgeLevel } from '@/types';
import { BADGE_DEFINITIONS } from '@/constants';

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
  'Map': Map
};

const Badges: React.FC<BadgesProps> = ({ user, members, isDarkMode }) => {
  const currentMember = members.find(m => m.id === user.id);
  const userBadges = currentMember?.badges || [];

  const getBadgeIcon = (iconName: string) => {
    return BADGE_ICONS[iconName] || ShieldCheck;
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      {/* Stats Header */}
      <div className={`p-8 pb-10 pt-6 ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-600'} rounded-b-[3.5rem] shadow-xl relative overflow-hidden`}>
        {/* Abstract circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
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
              <div 
                key={badge.id}
                className={`p-5 rounded-[2.5rem] border-2 transition-all relative flex flex-col items-center justify-between min-h-[180px] ${
                  isUnlocked 
                    ? (isDarkMode ? 'bg-blue-900/20 border-blue-500/50 scale-100 shadow-lg shadow-blue-500/5' : 'bg-white border-blue-100 shadow-xl shadow-blue-500/10') 
                    : (isDarkMode ? 'bg-slate-800/30 border-slate-700 opacity-40 grayscale' : 'bg-slate-50 border-slate-100 opacity-40 grayscale')
                }`}
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-3 transition-transform ${isUnlocked ? 'active:scale-110' : ''} ${
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
              </div>
            );
          })}
        </div>

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
    </div>
  );
};

export default Badges;
