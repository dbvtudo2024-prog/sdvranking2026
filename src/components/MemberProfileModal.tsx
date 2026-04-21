
import React from 'react';
import { Member, BadgeLevel } from '@/types';
import { X, Medal, Brain, History, Star, HelpCircle, Shield, Type, Gamepad2, MessageSquare, Map, Book, Trophy, Check } from 'lucide-react';
import { calculateWeeklyTotal, calculateGamesTotal } from '@/helpers/scoreHelpers';
import { formatDate } from '@/helpers/dateHelpers';
import { BADGE_DEFINITIONS } from '@/constants';

const BADGE_ICONS: { [key: string]: any } = {
  'Shield': Shield,
  'Type': Type,
  'Gamepad2': Gamepad2,
  'MessageSquare': MessageSquare,
  'Brain': Brain,
  'Map': Map,
  'Book': Book,
  'Medal': Medal,
  'CheckCircle2': Check
};

interface MemberProfileModalProps {
  member: Member;
  onClose: () => void;
  onViewHistory?: () => void;
  isDarkMode?: boolean;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose, onViewHistory, isDarkMode }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className={`relative w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Decorative background element */}
        <div className="absolute top-0 inset-x-0 h-32 bg-blue-600 opacity-10 blur-3xl -z-10" />
        
        <button onClick={onClose} className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-50 ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-300'}`}>
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center p-8 space-y-6 max-h-[85vh] overflow-y-auto px-6 custom-scrollbar">
          {/* Avatar with Ring */}
          <div className="relative shrink-0 pt-4">
            <div className={`w-28 h-28 rounded-[2.5rem] p-1.5 shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-blue-500/20">
                {member.photoUrl ? (
                  <img src={member.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 text-blue-900">
              <Trophy size={18} />
            </div>
          </div>

          <div>
            <h3 className={`text-2xl font-black uppercase tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {member.name}
            </h3>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-blue-950/50 text-blue-400 border border-blue-900/50' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {member.unit}
              </span>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                {member.className || 'Sem Classe'}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className={`p-5 rounded-[2rem] border-2 shadow-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-50'}`}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Pontos Semanais</p>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {calculateWeeklyTotal(member)}
              </p>
            </div>
            <div className={`p-5 rounded-[2rem] border-2 shadow-sm ${isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50/50 border-blue-100'}`}>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 leading-none ${isDarkMode ? 'text-blue-400/70' : 'text-blue-400'}`}>Pontos Jogos</p>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {calculateGamesTotal(member)}
              </p>
            </div>
          </div>

          {/* BADGES SECTIONS */}
          <div className="w-full space-y-6 pt-2">
            {/* 1. MEDALHAS MENSAIS (Campeões de Jogos) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                  <Trophy size={16} />
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Medalhas de Jogos</h4>
              </div>
              
              {member.badges?.some(b => b.badgeId.startsWith('monthly_games_')) ? (
                <div className="grid grid-cols-4 gap-3">
                  {member.badges
                    .filter(b => b.badgeId.startsWith('monthly_games_'))
                    .map(ub => (
                      <div key={ub.badgeId} className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5 shadow-lg relative ${
                          ub.level === BadgeLevel.GOLD ? 'bg-yellow-400 shadow-yellow-500/20' : 
                          ub.level === BadgeLevel.SILVER ? 'bg-slate-300 shadow-slate-500/20' : 
                          'bg-orange-600 shadow-orange-500/20'
                        } text-white border-2 border-white dark:border-slate-800`}>
                          <Trophy size={24} />
                        </div>
                        <p className={`text-[7px] font-black uppercase text-center leading-tight truncate w-full ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {ub.monthLabel?.split('-')[0].trim() || 'Campeão'}
                        </p>
                        <p className={`text-[6px] font-bold uppercase text-center opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {ub.monthLabel?.split('-')[1]?.trim().split(' ')[0] || ''}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className={`py-4 text-center rounded-2xl border-2 border-dashed ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma medalha conquistada</p>
                </div>
              )}
            </div>

            {/* 2. INSÍGNIAS DO CLUBE (Especialidades, Atividades, etc) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Medal size={16} />
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Insígnias do Clube</h4>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Conquered Club Badges */}
                {(member.badges || []).filter(b => !b.badgeId.startsWith('monthly_games_')).map(ub => {
                  const isSpecialtyMaster = ub.badgeId.startsWith('specialty_master_');
                  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === ub.badgeId || (isSpecialtyMaster && b.id === 'mestre_especialidade'));
                  
                  if (!badgeDef) return null;
                  
                  const BadgeIcon = isSpecialtyMaster ? Medal : (BADGE_ICONS[badgeDef.icon] || HelpCircle);
                  const badgeName = isSpecialtyMaster ? `Mestre ${ub.level}` : badgeDef.name;
                  
                  return (
                    <div key={ub.badgeId} className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5 shadow-lg relative ${
                        ub.level === BadgeLevel.GOLD || ub.level === BadgeLevel.MASTER ? 'bg-yellow-500' : 
                        ub.level === BadgeLevel.DIAMOND ? 'bg-blue-400' :
                        ub.level === BadgeLevel.SILVER ? 'bg-slate-400' : 
                        'bg-blue-600'
                      } text-white border-2 border-white dark:border-slate-800`}>
                        <BadgeIcon size={24} />
                      </div>
                      <p className={`text-[8px] font-black uppercase text-center leading-tight truncate w-full ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {badgeName.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}

                {/* Not Conquered Club Badges */}
                {BADGE_DEFINITIONS
                  .filter(badge => !member.badges?.some(ub => ub.badgeId === badge.id || (ub.badgeId.startsWith('specialty_master_') && badge.id === 'mestre_especialidade')))
                  .map(badge => {
                  const BadgeIcon = BADGE_ICONS[badge.icon] || HelpCircle;
                  return (
                    <div key={`not-conquered-${badge.id}`} className="flex flex-col items-center opacity-20 grayscale">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5 bg-slate-200 dark:bg-slate-700 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <BadgeIcon size={24} />
                      </div>
                      <p className={`text-[8px] font-black uppercase text-center leading-tight truncate w-full ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {badge.name.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STUDIES SECTION */}
          <div className="w-full space-y-4 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                <Brain size={16} />
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Especialidades Estudadas</h4>
            </div>
            
            {member.scores.filter(s => s.specialtyStudyId).length > 0 ? (
              <div className="space-y-2.5">
                {member.scores
                  .filter(s => s.specialtyStudyId)
                  .map((s, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 rounded-[1.5rem] border shadow-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="flex-1 min-w-0 pr-4 text-left">
                      <p className={`text-[10px] font-black uppercase truncate mb-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{s.specialtyStudyName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(s.date)}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-black text-xs ${Number(s.specialtyStudyScore) >= 7 ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                      {s.specialtyStudyScore}/10
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-6 text-center rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Nenhum estudo concluído</p>
              </div>
            )}
          </div>

          {onViewHistory && (
            <div className="w-full pt-4 pb-4">
              <button 
                onClick={onViewHistory}
                className="w-full py-5 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-800"
              >
                <History size={16} strokeWidth={2.5} /> Histórico Completo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfileModal;
