
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, UserRole, UnitName, Member, UserBadge, BadgeDefinition, BadgeCategory, BadgeLevel } from '@/types';
import { getClassByAge, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_ROLES, BADGE_DEFINITIONS } from '@/constants';
import { Save, User as UserIcon, Camera, ChevronDown, Trophy, BookOpen, Medal, ShieldCheck, Check, Shield, X, Settings, LogOut, Gamepad2, Brain, Zap, Shuffle, HelpCircle, Moon, Sun, Star, MessageSquare, Type, Map, Shield as ShieldIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateWeeklyTotal, calculateGamesTotal, calculateSpecific } from '@/helpers/scoreHelpers';
import { formatDate } from '@/helpers/dateHelpers';

// ICON MAPPING FOR BADGES
const BADGE_ICONS: { [key: string]: any } = {
  'Shield': ShieldIcon,
  'Type': Type,
  'Gamepad2': Gamepad2,
  'MessageSquare': MessageSquare,
  'Brain': Brain,
  'Map': Map,
  'CheckCircle2': Check,
  'Medal': Medal,
  'Book': BookOpen
};

interface ProfileProps {
  user: AuthUser;
  members: Member[];
  onUpdateUser: (user: AuthUser, member?: Member) => void;
  onLogout: () => void;
  onGoToAdminManagement?: () => void;
  counselorList?: string[];
  onUpdateMember?: (member: Member) => void;
  onGoToBadges?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  members, 
  onUpdateUser, 
  onLogout, 
  onGoToAdminManagement,
  counselorList = [],
  onUpdateMember,
  onGoToBadges,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [formData, setFormData] = useState<AuthUser>({ ...user });
  const [showToast, setShowToast] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.name, user.id]);

  const gameStats = useMemo(() => {
    if (!currentMember) return { 
      totalPoints: 0,
      quiz: { total: 0, completed: 0, bestDesbravadores: 0, bestBiblia: 0 },
      memory: { total: 0, best: 0 },
      scrambledVerse: { total: 0, best: 0 },
      knots: { total: 0, best: 0 },
      natureId: { total: 0, best: 0 },
      firstAid: { total: 0, best: 0 },
      specialtyTrail: { total: 0, best: 0 },
      puzzle: { total: 0, best: 0 },
      threeClues: { total: 0, best: 0 },
      specialty: { total: 0, best: 0 },
      study: { completed: 0, history: [] }
    };

    const scores = currentMember.scores || [];
    
    // Quiz Stats
    const quizScores = scores.filter(s => s.quiz !== undefined);
    const quizStats = {
      total: quizScores.reduce((acc, s) => acc + (s.quiz || 0), 0),
      completed: quizScores.length,
      bestDesbravadores: Math.max(0, ...quizScores.filter(s => s.quizCategory === 'Desbravadores').map(s => s.quiz || 0)),
      bestBiblia: Math.max(0, ...quizScores.filter(s => s.quizCategory === 'Bíblia').map(s => s.quiz || 0)),
    };

    // Memory Game Stats
    const memoryScores = scores.filter(s => s.memoryGame !== undefined).map(s => s.memoryGame || 0);
    const memoryStats = {
      total: memoryScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...memoryScores)
    };

    // Scrambled Verse Stats
    const scrolledVerseScores = scores.filter(s => s.scrambledVerseGame !== undefined).map(s => s.scrambledVerseGame || 0);
    const scrolledVerseStats = {
      total: scrolledVerseScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...scrolledVerseScores)
    };

    // Knots Game Stats
    const knotsScores = scores.filter(s => s.knotsGame !== undefined).map(s => s.knotsGame || 0);
    const knotsStats = {
      total: knotsScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...knotsScores)
    };

    // Nature ID Stats
    const natureIdScores = scores.filter(s => s.natureIdGame !== undefined).map(s => s.natureIdGame || 0);
    const natureIdStats = {
      total: natureIdScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...natureIdScores)
    };

    // First Aid Stats
    const firstAidScores = scores.filter(s => s.firstAidGame !== undefined).map(s => s.firstAidGame || 0);
    const firstAidStats = {
      total: firstAidScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...firstAidScores)
    };

    // Specialty Trail Stats
    const specialtyTrailScores = scores.filter(s => s.specialtyTrailGame !== undefined).map(s => s.specialtyTrailGame || 0);
    const specialtyTrailStats = {
      total: specialtyTrailScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...specialtyTrailScores)
    };

    // Puzzle Game Stats
    const puzzleScores = scores.filter(s => s.puzzleGame !== undefined).map(s => s.puzzleGame || 0);
    const puzzleStats = {
      total: puzzleScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...puzzleScores)
    };

    // Three Clues Stats
    const threeCluesScores = scores.filter(s => s.threeCluesGame !== undefined).map(s => s.threeCluesGame || 0);
    const threeCluesStats = {
      total: threeCluesScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...threeCluesScores)
    };

    // Specialty Game Stats
    const specialtyGameScores = scores.filter(s => s.specialtyGame !== undefined).map(s => s.specialtyGame || 0);
    const specialtyGameStats = {
      total: specialtyGameScores.reduce((acc, s) => acc + s, 0),
      best: Math.max(0, ...specialtyGameScores)
    };

    // Specialty Study Stats
    const studyScores = scores.filter(s => s.specialtyStudyId !== undefined);
    const studyStats = {
      completed: studyScores.length,
      history: studyScores.slice().reverse()
    };

    const totalPoints = calculateGamesTotal(currentMember);
    const weeklyPoints = calculateWeeklyTotal(currentMember);

    return {
      totalPoints,
      weeklyPoints,
      quiz: quizStats,
      memory: memoryStats,
      scrambledVerse: scrolledVerseStats,
      knots: knotsStats,
      natureId: natureIdStats,
      firstAid: firstAidStats,
      specialtyTrail: specialtyTrailStats,
      puzzle: puzzleStats,
      threeClues: threeCluesStats,
      specialty: specialtyGameStats,
      study: studyStats
    };
  }, [currentMember]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const validAge = parseInt(formData.age as any);
    const updatedFormData = { ...formData, name: formData.name.trim(), age: isNaN(validAge) ? formData.age : validAge };

    let updatedMember: Member | undefined = undefined;
    if (currentMember) {
      updatedMember = {
        ...currentMember,
        name: updatedFormData.name,
        age: updatedFormData.age || 0,
        birthday: updatedFormData.birthday,
        className: updatedFormData.className || '',
        unit: updatedFormData.unit || currentMember.unit,
        counselor: formData.role === UserRole.LEADERSHIP ? updatedFormData.funcao || currentMember.counselor : (updatedFormData.counselor || currentMember.counselor),
        photoUrl: updatedFormData.photoUrl,
        role: updatedFormData.role
      };
    }
    onUpdateUser(updatedFormData, updatedMember);
    setShowToast(true);
    setShowEditModal(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const inputClasses = "w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-[#94a3b8] uppercase ml-2 tracking-widest mb-1.5 block";
  const isLeadership = formData.role === UserRole.LEADERSHIP;

  return (
    <div className="h-full overflow-y-auto pb-32 animate-in fade-in duration-500 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="px-4 pt-8 space-y-6">
        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 border border-green-500">
              <Check size={16} strokeWidth={4} /> Perfil Atualizado!
            </div>
          </div>
        )}

        {/* CABEÇALHO COM NOME E UNIDADE ABAIXO DA FOTO */}
        <div className="text-center py-4">
          <div className="relative inline-block">
            <div className={`w-32 h-32 bg-gradient-to-br from-[#0061f2] to-[#0052cc] rounded-[2.5rem] mx-auto flex items-center justify-center text-white border-4 ${isDarkMode ? 'border-dark-border' : 'border-white'} shadow-2xl overflow-hidden`}>
              {formData.photoUrl ? <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserIcon size={64} />}
            </div>
          </div>
          
          <div className="mt-6 space-y-1">
            <h2 className={`text-2xl font-black tracking-tight uppercase leading-tight ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`}>{formData.name}</h2>
            <div className={`flex items-center justify-center gap-1.5 font-bold uppercase text-[10px] tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Shield size={12} className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} />
              {formData.unit || 'Sem Unidade'}
            </div>
          </div>
          
          {isLeadership && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button onClick={onGoToAdminManagement} className={`w-full max-w-xs border-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 inline-flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-white border-[#0061f2] text-[#0061f2] hover:bg-[#0061f2] hover:text-white'}`}>
                <ShieldCheck size={16} /> GESTÃO ADMINISTRATIVA
              </button>
              
              <button 
                onClick={() => {
                  setFormData({ ...user });
                  setShowEditModal(true);
                }}
                className="w-full max-w-xs bg-[#0061f2] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-[#0052cc] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings size={16} /> EDITAR PERFIL
              </button>

              <button 
                onClick={onLogout}
                className={`w-full max-w-xs border-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 border-red-900/30 text-red-400 hover:bg-red-900/20' : 'bg-white border-red-100 text-red-500 hover:bg-red-50'}`}>
                <LogOut size={16} /> SAIR DA CONTA
              </button>
            </div>
          )}

          {!isLeadership && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button 
                onClick={() => {
                  setFormData({ ...user });
                  setShowEditModal(true);
                }}
                className="w-full max-w-xs bg-[#0061f2] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-[#0052cc] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings size={16} /> EDITAR PERFIL
              </button>

              <button 
                onClick={onLogout}
                className={`w-full max-w-xs border-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 border-red-900/30 text-red-400 hover:bg-red-900/20' : 'bg-white border-red-100 text-red-500 hover:bg-red-50'}`}>
                <LogOut size={16} /> SAIR DA CONTA
              </button>
            </div>
          )}
        </div>

        {/* RESUMO DE PONTUAÇÃO GERAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0061f2] p-8 rounded-[3.5rem] text-white shadow-2xl shadow-blue-500/20 flex items-center justify-between border-b-8 border-blue-800">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/60 mb-1">Jogos</p>
              <h3 className="text-5xl font-black tracking-tighter tabular-nums">{gameStats.totalPoints}</h3>
              <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest mt-1">Pontos Acumulados</p>
            </div>
            <div className="w-20 h-20 rounded-[2rem] bg-white/20 flex items-center justify-center backdrop-blur-md border-2 border-white/30 shrink-0">
              <Trophy size={40} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-emerald-500 p-8 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-500/20 flex items-center justify-between border-b-8 border-emerald-700">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/60 mb-1">Membro Semanal</p>
              <h3 className="text-5xl font-black tracking-tighter tabular-nums">{gameStats.weeklyPoints}</h3>
              <p className="text-[10px] font-bold text-emerald-100/80 uppercase tracking-widest mt-1">Pontos da Semana</p>
            </div>
            <div className="w-20 h-20 rounded-[2rem] bg-white/20 flex items-center justify-center backdrop-blur-md border-2 border-white/30 shrink-0">
              <Star size={40} className="text-yellow-300" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES E PREFERÊNCIAS */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-8 rounded-[3.5rem] border-2 shadow-xl shadow-blue-900/5 space-y-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Settings size={20} />
            </div>
            <h3 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm uppercase tracking-tight`}>Configurações de Conta</h3>
          </div>

          <div className={`flex items-center justify-between p-5 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-[2rem] border-2`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
                {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Modo de Exibição</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isDarkMode ? 'Escuro Ativado' : 'Claro Ativado'}</p>
              </div>
            </div>
            <button 
              onClick={onToggleDarkMode}
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative group ${isDarkMode ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* ESPECIALIDADES CONCLUÍDAS */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-8 rounded-[3.5rem] border-2 shadow-xl shadow-blue-900/5 space-y-8`}>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
              <Medal size={20} />
            </div>
            <h3 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm uppercase tracking-tight`}>Especialidades Concluídas</h3>
          </div>

          <div className={`grid grid-cols-2 gap-4`}>
             <div className={`${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'} p-6 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-500/5`}>
                <p className={`text-[8px] font-black ${isDarkMode ? 'text-amber-500/60' : 'text-amber-500'} uppercase tracking-widest mb-1.5`}>Total Concluído</p>
                <p className={`text-5xl font-black ${isDarkMode ? 'text-amber-500' : 'text-amber-600'} leading-none`}>{gameStats.study.completed}</p>
             </div>
             <div className={`${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} p-6 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center shadow-lg shadow-blue-500/5`}>
                <p className={`text-[8px] font-black ${isDarkMode ? 'text-blue-500/60' : 'text-blue-500'} uppercase tracking-widest mb-1.5`}>Último Exame</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} leading-tight`}>
                  {gameStats.study.history.length > 0 ? gameStats.study.history[0].specialtyStudyScore : '-'}<span className="text-xs ml-0.5 opacity-60">/10</span>
                </p>
             </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-2">Histórico de Estudos</p>
            {gameStats.study.history.length > 0 ? (
              <div className="space-y-3">
                {gameStats.study.history.map((s, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 rounded-3xl border shadow-sm transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-50/50'}`}>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className={`text-[11px] font-black uppercase truncate mb-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {s.specialtyStudyName || 'Especialidade'}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(s.date)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl font-black text-xs ${Number(s.specialtyStudyScore) >= 7 ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                      {s.specialtyStudyScore}/10
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-10 text-center rounded-3xl border border-dashed ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma Especialidade Concluída</p>
              </div>
            )}
          </div>
        </div>

        {/* INSÍGNIAS (BADGES) CONQUISTADAS */}
        <div className={`${isDarkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-50'} p-8 rounded-[3rem] border shadow-xl shadow-blue-900/5 space-y-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Medal className="text-yellow-500" size={24} />
              <h3 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm uppercase tracking-tight`}>Suas Insígnias</h3>
            </div>
            {onGoToBadges && (
              <button 
                onClick={onGoToBadges}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}
              >
                Ver Tudo
              </button>
            )}
          </div>

          {/* 1. SEÇÃO DE MEDALHAS DE JOGOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                <Trophy size={16} />
              </div>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Medalhas de Campeão</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(user.badges || []).filter(b => b.badgeId.startsWith('monthly_games_')).map(ub => {
                const positionLabel = ub.monthLabel?.split('-')[0].trim() || 'Campeão';
                const monthYear = ub.monthLabel?.split('-')[1]?.trim() || 'Mensal';

                return (
                  <div 
                    key={ub.badgeId}
                    className={`relative flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all ${
                      isDarkMode ? 'bg-yellow-900/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'bg-yellow-50/50 border-yellow-200 shadow-lg shadow-yellow-500/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform scale-110 active:scale-125 ${
                      ub.level === BadgeLevel.GOLD ? 'bg-yellow-400' : ub.level === BadgeLevel.SILVER ? 'bg-slate-300' : 'bg-orange-600'
                    } text-white shadow-xl`}>
                      <Trophy size={28} />
                    </div>
                    <p className={`text-[10px] font-black uppercase text-center leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{positionLabel}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {monthYear}
                    </p>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 p-1 rounded-full shadow-lg border-2 border-white">
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                );
              })}
              
              {(!user.badges || !user.badges.some(b => b.badgeId.startsWith('monthly_games_'))) && (
                 <div className={`col-span-full py-8 text-center rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'} opacity-50`}>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dispute o ranking para ganhar sua primeira medalha!</p>
                 </div>
              )}
            </div>
          </div>

          {/* 2. SEÇÃO DE INSÍGNIAS DO CLUBE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-900/30 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                <Medal size={16} />
              </div>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Insígnias do Clube</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Renderizar todas as insígnias do clube que o usuário JÁ conquistou */}
              {(user.badges || []).filter(b => !b.badgeId.startsWith('monthly_games_')).map(ub => {
                const isSpecialtyMaster = ub.badgeId.startsWith('specialty_master_');
                const badgeDef = BADGE_DEFINITIONS.find(b => b.id === ub.badgeId || (isSpecialtyMaster && b.id === 'mestre_especialidade'));
                
                if (!badgeDef) return null;
                
                const BadgeIcon = isSpecialtyMaster ? Medal : (BADGE_ICONS[badgeDef.icon] || HelpCircle);
                const badgeName = isSpecialtyMaster ? `Mestre ${ub.level}` : badgeDef.name;
                
                return (
                  <div 
                    key={ub.badgeId}
                    className={`relative flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all ${
                      isDarkMode ? 'bg-blue-900/10 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-500/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform scale-110 active:scale-125 ${
                      ub.level === BadgeLevel.GOLD || ub.level === BadgeLevel.MASTER ? 'bg-yellow-500' : 
                      ub.level === BadgeLevel.DIAMOND ? 'bg-blue-400' :
                      ub.level === BadgeLevel.SILVER ? 'bg-slate-400' : 
                      'bg-blue-600'
                    } text-white shadow-xl`}>
                      <BadgeIcon size={28} />
                    </div>
                    <p className={`text-[10px] font-black uppercase text-center leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{badgeName}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {badgeDef.category}
                    </p>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 p-1 rounded-full shadow-lg border-2 border-white">
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                );
              })}

              {/* Renderizar insígnias do clube que o usuário ainda NÃO conquistou */}
              {BADGE_DEFINITIONS
                .filter(badge => !user.badges?.some(ub => ub.badgeId === badge.id || (ub.badgeId.startsWith('specialty_master_') && badge.id === 'mestre_especialidade')))
                .map(badge => {
                const BadgeIcon = BADGE_ICONS[badge.icon] || HelpCircle;
                
                return (
                  <div 
                    key={badge.id}
                    className={`relative flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all ${
                      isDarkMode ? 'bg-slate-800/30 border-slate-700 opacity-40' : 'bg-slate-50 border-slate-100 opacity-20 grayscale'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-slate-200 dark:bg-slate-700 text-slate-400">
                      <BadgeIcon size={28} />
                    </div>
                    <p className={`text-[10px] font-black uppercase text-center leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{badge.name}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center">{badge.category}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border border-dashed ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-relaxed text-center">
              Continue jogando e participando para conquistar novas insígnias!
            </p>
          </div>
        </div>

        {/* DESEMPENHO EM JOGOS - NOVO LAYOUT COMPLETO */}
        <div className={`${isDarkMode ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-50'} p-8 rounded-[3rem] border shadow-xl shadow-blue-900/5 space-y-8`}>
          <div className="flex items-center gap-3">
            <Gamepad2 className="text-[#0061f2]" size={24} />
            <h3 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm uppercase tracking-tight`}>Desempenho em Jogos</h3>
          </div>
          
          {/* GRID DE JOGOS */}
          <div className="grid grid-cols-2 gap-4">
            {/* QUIZ */}
            <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-blue-500" />
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Quiz</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{gameStats.quiz.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-blue-400 uppercase mt-1">Recorde: {Math.max(gameStats.quiz.bestDesbravadores, gameStats.quiz.bestBiblia)}</p>
            </div>

            {/* MEMÓRIA */}
            <div className={`${isDarkMode ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50/50 border-emerald-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-emerald-500" />
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Memória</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{gameStats.memory.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-emerald-400 uppercase mt-1">Recorde: {gameStats.memory.best}</p>
            </div>

            {/* QUEBRA-CABEÇA */}
            <div className={`${isDarkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50/50 border-amber-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Shuffle size={14} className="text-amber-500" />
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Puzzle</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{gameStats.puzzle.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-amber-400 uppercase mt-1">Recorde: {gameStats.puzzle.best}</p>
            </div>

            {/* 3 DICAS */}
            <div className={`${isDarkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50/50 border-purple-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={14} className="text-purple-500" />
                <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">3 Dicas</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>{gameStats.threeClues.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-purple-400 uppercase mt-1">Recorde: {gameStats.threeClues.best}</p>
            </div>

            {/* VERSÍCULO EMBARALHADO */}
            <div className={`${isDarkMode ? 'bg-rose-900/20 border-rose-800/30' : 'bg-rose-50/50 border-rose-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Type size={14} className="text-rose-500" />
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Versículo</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`}>{gameStats.scrambledVerse.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-rose-400 uppercase mt-1">Recorde: {gameStats.scrambledVerse.best}</p>
            </div>

            {/* NÓS */}
            <div className={`${isDarkMode ? 'bg-orange-900/20 border-orange-800/30' : 'bg-orange-50/50 border-orange-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-orange-500" />
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Nós</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>{gameStats.knots.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-orange-400 uppercase mt-1">Recorde: {gameStats.knots.best}</p>
            </div>

            {/* NATURE_ID */}
            <div className={`${isDarkMode ? 'bg-lime-900/20 border-lime-800/30' : 'bg-lime-50/50 border-lime-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-lime-500" />
                <p className="text-[9px] font-black text-lime-600 uppercase tracking-widest">Natureza</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-lime-400' : 'text-lime-700'}`}>{gameStats.natureId.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-lime-400 uppercase mt-1">Recorde: {gameStats.natureId.best}</p>
            </div>

            {/* PRIMEIROS SOCORROS */}
            <div className={`${isDarkMode ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50/50 border-red-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <ShieldIcon size={14} className="text-red-500" />
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Socorros</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{gameStats.firstAid.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-red-400 uppercase mt-1">Recorde: {gameStats.firstAid.best}</p>
            </div>

            {/* TRILHA ESPECIALIDADE */}
            <div className={`${isDarkMode ? 'bg-indigo-900/20 border-indigo-800/30' : 'bg-indigo-50/50 border-indigo-100'} p-5 rounded-[2rem] border`}>
              <div className="flex items-center gap-2 mb-3">
                <Map size={14} className="text-indigo-500" />
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Trilha</p>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{gameStats.specialtyTrail.total} <span className="text-[10px] opacity-50">pts</span></p>
              <p className="text-[8px] font-bold text-indigo-400 uppercase mt-1">Recorde: {gameStats.specialtyTrail.best}</p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'} p-6 rounded-[2rem] border flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Medal size={20} className="text-slate-400" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qual a Especialidade?</p>
                <p className={`text-xl font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{gameStats.specialty.total} pts</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Recorde</p>
              <p className="text-sm font-black text-slate-400">{gameStats.specialty.best}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-10 opacity-20"><p className="text-[8px] font-black uppercase tracking-[0.5em]">v3.0.0 • Versão Oficial</p></div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false);
                setFormData({ ...user }); // Reset on close
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${isDarkMode ? 'bg-dark-card' : 'bg-white'} w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0061f2] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Settings size={20} />
                  </div>
                  <h3 className={`font-black text-sm uppercase tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Editar Perfil</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({ ...user }); // Reset on close
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {/* FOTO NO MODAL */}
                <div className="text-center">
                  <div className="relative inline-block group">
                    <div onClick={() => fileInputRef.current?.click()} className={`w-32 h-32 bg-gradient-to-br from-[#0061f2] to-[#0052cc] rounded-[2.5rem] mx-auto flex items-center justify-center text-white border-4 ${isDarkMode ? 'border-slate-700' : 'border-white'} shadow-2xl cursor-pointer overflow-hidden group-hover:opacity-90 transition-opacity`}>
                      {formData.photoUrl ? <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserIcon size={64} />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-[#FFD700] p-2.5 rounded-2xl border-4 border-white shadow-lg text-[#0061f2] hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </div>
                  <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Toque para alterar a foto</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Nome Completo</label>
                    <input className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClasses}>Cargo</label>
                      <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.role} onChange={e => {
                        const newRole = e.target.value as UserRole;
                        setFormData({ ...formData, role: newRole, funcao: '', unit: newRole === UserRole.LEADERSHIP ? UnitName.LIDERANCA : formData.unit, className: '' });
                      }}>
                        <option value={UserRole.PATHFINDER}>Desbravador</option>
                        <option value={UserRole.LEADERSHIP}>Liderança</option>
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                      <label className={labelClasses}>Função</label>
                      <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.funcao || ''} onChange={e => setFormData({...formData, funcao: e.target.value})}>
                        <option value="" disabled>Selecionar</option>
                        {formData.role === UserRole.LEADERSHIP ? LEADERSHIP_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>) : PATHFINDER_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Idade</label>
                      <input type="number" className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={formData.age || ''} onChange={e => {
                        const val = parseInt(e.target.value);
                        const newAge = isNaN(val) ? 0 : val;
                        const newClass = formData.role === UserRole.PATHFINDER ? getClassByAge(newAge) : formData.className;
                        setFormData({...formData, age: newAge, className: newClass});
                      }} />
                    </div>
                    <div>
                      <label className={labelClasses}>Nascimento</label>
                      <input type="date" className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={formData.birthday || ''} onChange={e => setFormData({...formData, birthday: e.target.value})} />
                    </div>
                  </div>
                  <div className="relative">
                    <label className={labelClasses}>Classe</label>
                    {isLeadership ? (
                      <>
                        <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.className || ''} onChange={e => setFormData({...formData, className: e.target.value})}>
                          <option value="">Nenhuma</option>
                          {LEADERSHIP_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                      </>
                    ) : (
                      <div className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} flex items-center`}><span className="truncate">{getClassByAge(formData.age || 0)}</span></div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClasses}>Unidade</label>
                      <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value as UnitName})}>
                        <option value={UnitName.AGUIA_DOURADA}>Águia Dourada</option>
                        <option value={UnitName.GUERREIROS}>Guerreiros</option>
                        <option value={UnitName.LIDERANCA}>Liderança</option>
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                       <label className={labelClasses}>{isLeadership ? 'Setor' : 'Conselheiro(a)'}</label>
                       {isLeadership ? ( <input className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value="Diretoria" readOnly /> ) : (
                         <>
                           <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.counselor || ''} onChange={e => setFormData({...formData, counselor: e.target.value})}>
                             <option value="" disabled>Selecionar</option>
                             {counselorList.map(name => <option key={name} value={name}>{name}</option>)}
                           </select>
                           <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
                         </>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <button onClick={handleSave} className="w-full bg-[#0061f2] text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs border-b-4 border-blue-800">
                  <Save size={18} /> SALVAR ALTERAÇÕES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
