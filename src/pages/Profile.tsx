
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, UserRole, UnitName, Member, UserBadge, BadgeDefinition, BadgeCategory, BadgeLevel, ClubUnit, DEFAULT_UNITS, sortUnitsWithLeadershipLast, isLeadershipUnit } from '@/types';
import { getClassByAge, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_ROLES, BADGE_DEFINITIONS } from '@/constants';
import { Save, User as UserIcon, Camera, ChevronDown, Trophy, BookOpen, Medal, ShieldCheck, Check, Shield, X, Settings, LogOut, Gamepad2, Brain, Zap, Shuffle, HelpCircle, Moon, Sun, Star, MessageSquare, Type, Map, Shield as ShieldIcon, Award, GraduationCap, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateWeeklyTotal, calculateGamesTotal, calculateSpecific } from '@/helpers/scoreHelpers';
import { formatDate } from '@/helpers/dateHelpers';
import { getBadgeLevelColorClass, getStarLevelColorClass } from './Badges';

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
  onToggleDarkMode?: () => void;
  unitsList?: ClubUnit[];
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
  onToggleDarkMode,
  unitsList = DEFAULT_UNITS
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
    <div className="h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="px-4 pt-8 space-y-6">
        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 border border-green-500">
              <Check size={16} strokeWidth={4} /> Perfil Atualizado!
            </div>
          </div>
        )}

        {/* CABEÇALHO COM FOTO À ESQUERDA E BOTÕES À DIREITA */}
        <div className={`p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5'} flex flex-col md:flex-row items-center justify-between gap-6`}>
          {/* LADO ESQUERDO: FOTO + IDENTIFICAÇÃO */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-[#0061f2] to-[#0052cc] rounded-2xl sm:rounded-3xl flex items-center justify-center text-white border-4 ${isDarkMode ? 'border-slate-800' : 'border-white'} shadow-2xl overflow-hidden`}>
                {formData.photoUrl ? <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserIcon size={56} />}
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`}>
                {formData.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black uppercase text-[10px] sm:text-xs tracking-wider border shadow-xs ${
                  isDarkMode 
                    ? 'bg-blue-950/60 border-blue-800/60 text-blue-300' 
                    : 'bg-blue-50 border-blue-200 text-[#0061f2]'
                }`}>
                  <Shield size={13} className={isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'} />
                  <span className="whitespace-nowrap">{formData.unit || 'Sem Unidade'}</span>
                </span>
                {formData.funcao && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold uppercase text-[10px] sm:text-xs tracking-wide border shadow-xs ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300' 
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {formData.funcao}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: BOTÕES DE GESTÃO, EDITAR E SAIR */}
          <div className="flex flex-col items-center sm:items-stretch md:items-end gap-3 w-full sm:w-72 md:w-80 shrink-0">
            {isLeadership && (
              <button 
                onClick={onGoToAdminManagement} 
                className={`w-full border-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 inline-flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white' 
                    : 'bg-white border-[#0061f2] text-[#0061f2] hover:bg-[#0061f2] hover:text-white'
                }`}
              >
                <ShieldCheck size={16} /> GESTÃO ADMINISTRATIVA
              </button>
            )}
            
            <button 
              onClick={() => {
                setFormData({ ...user });
                setShowEditModal(true);
              }}
              className="w-full bg-[#0061f2] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-[#0052cc] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Settings size={16} /> EDITAR PERFIL
            </button>

            <button 
              onClick={onLogout}
              className={`w-full border-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-slate-800 border-red-900/30 text-red-400 hover:bg-red-900/20' 
                  : 'bg-white border-red-200 text-red-500 hover:bg-red-50'
              }`}
            >
              <LogOut size={16} /> SAIR DA CONTA
            </button>
          </div>
        </div>

        {/* PAINEL DE MÉTRICAS & PONTUAÇÕES (RESPONSIVO PARA MOBILE, TABLET E PC) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. PONTOS DE JOGOS */}
          <div 
            id="profile-kpi-games"
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/40 shadow-lg shadow-black/20' 
                : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm shadow-blue-500/5'
            }`}
          >
            <div className="absolute -right-2 -bottom-2 text-blue-500/10 dark:text-blue-400/10 pointer-events-none group-hover:scale-110 transition-transform">
              <Trophy size={56} />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-[#0061f2] border border-blue-100'
              }`}>
                <Trophy size={18} className="text-yellow-500" />
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                Jogos
              </span>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4">
              <span className={`block text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums ${
                isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'
              }`}>
                {gameStats.totalPoints}
              </span>
              <span className={`block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Pontos Acumulados
              </span>
            </div>
          </div>

          {/* 2. MEMBRO SEMANAL */}
          <div 
            id="profile-kpi-weekly"
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 shadow-lg shadow-black/20' 
                : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm shadow-emerald-500/5'
            }`}
          >
            <div className="absolute -right-2 -bottom-2 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none group-hover:scale-110 transition-transform">
              <Star size={56} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                <Star size={18} className="text-yellow-400" fill="currentColor" />
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                Semanal
              </span>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4">
              <span className={`block text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {gameStats.weeklyPoints}
              </span>
              <span className={`block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Presença & Classe
              </span>
            </div>
          </div>

          {/* 3. ESPECIALIDADES CONCLUÍDAS */}
          <div 
            id="profile-kpi-specialties"
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 shadow-lg shadow-black/20' 
                : 'bg-white border-slate-100 hover:border-amber-200 shadow-sm shadow-amber-500/5'
            }`}
          >
            <div className="absolute -right-2 -bottom-2 text-amber-500/10 dark:text-amber-400/10 pointer-events-none group-hover:scale-110 transition-transform">
              <Award size={56} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <Award size={18} className="text-amber-500" />
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                Estudos
              </span>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4">
              <span className={`block text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>
                {gameStats.study.completed}
              </span>
              <span className={`block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {gameStats.study.completed === 1 ? 'Especialidade Feita' : 'Especialidades Feitas'}
              </span>
            </div>
          </div>

          {/* 4. ÚLTIMO EXAME / APROVEITAMENTO */}
          <div 
            id="profile-kpi-exam"
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 flex flex-col justify-between group ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 shadow-lg shadow-black/20' 
                : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm shadow-indigo-500/5'
            }`}
          >
            <div className="absolute -right-2 -bottom-2 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none group-hover:scale-110 transition-transform">
              <GraduationCap size={56} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              }`}>
                <GraduationCap size={18} className="text-indigo-500" />
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}>
                Avaliação
              </span>
            </div>

            <div className="relative z-10 mt-3 sm:mt-4">
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  {gameStats.study.history.length > 0 ? gameStats.study.history[0].specialtyStudyScore : '-'}
                </span>
                {gameStats.study.history.length > 0 && (
                  <span className={`text-xs sm:text-sm font-bold opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    /10
                  </span>
                )}
              </div>
              <span className={`block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {gameStats.study.history.length > 0
                  ? (Number(gameStats.study.history[0].specialtyStudyScore) >= 7 ? 'Aprovado' : 'Em Reforço')
                  : 'Sem Registros'}
              </span>
            </div>
          </div>
        </div>

        {/* ESPECIALIDADES CONCLUÍDAS & HISTÓRICO DE ESTUDOS */}
        <div 
          id="profile-section-specialties"
          className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border transition-all ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5'
          } space-y-5 sm:space-y-6`}
        >
          {/* CABEÇALHO DA SEÇÃO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <Medal size={20} />
              </div>
              <div>
                <h3 className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-sm sm:text-base uppercase tracking-tight`}>
                  Especialidades Concluídas
                </h3>
                <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Histórico de avaliações práticas e estudos realizados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                gameStats.study.completed > 0
                  ? isDarkMode 
                    ? 'bg-amber-950/60 border-amber-800/50 text-amber-300' 
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                  : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                {gameStats.study.completed} {gameStats.study.completed === 1 ? 'Concluída' : 'Concluídas'}
              </span>
            </div>
          </div>

          {/* HISTÓRICO DE ESTUDOS */}
          <div>
            {gameStats.study.history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {gameStats.study.history.map((s, idx) => {
                  const scoreNum = Number(s.specialtyStudyScore);
                  const isPassed = scoreNum >= 7;

                  return (
                    <div 
                      key={`profile-study-hist-${s.specialtyStudyId || idx}-${idx}`}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600' 
                          : 'bg-slate-50/70 border-slate-200/60 hover:bg-white hover:border-blue-200 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                          isPassed
                            ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                            : isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <BookOpen size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs sm:text-sm font-black uppercase truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {s.specialtyStudyName || 'Especialidade'}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={11} className="text-slate-400 shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                              {formatDate(s.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm tabular-nums border flex items-center gap-1 ${
                          isPassed 
                            ? isDarkMode 
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isDarkMode 
                              ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span>{s.specialtyStudyScore}</span>
                          <span className="text-[9px] opacity-60">/10</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`py-10 sm:py-12 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed ${
                isDarkMode ? 'bg-slate-800/20 border-slate-700/60' : 'bg-slate-50/60 border-slate-200/80'
              } flex flex-col items-center justify-center px-4 space-y-2`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                }`}>
                  <BookOpen size={24} />
                </div>
                <p className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Nenhuma Especialidade Concluída
                </p>
                <p className={`text-[10px] sm:text-[11px] font-bold max-w-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Participe dos estudos de especialidades e realize as provas para registrar seu progresso aqui.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* INSÍGNIAS (BADGES) CONQUISTADAS */}
        <div className={`p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5'} space-y-6 sm:space-y-8`}>
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
              {(() => {
                const gamesBadges = (user.badges || []).filter(b => b.badgeId.startsWith('monthly_games_'));
                const uniqueBadges: UserBadge[] = [];
                const seen = new Set<string>();
                for (const b of gamesBadges) {
                  if (!seen.has(b.badgeId)) {
                    seen.add(b.badgeId);
                    uniqueBadges.push(b);
                  }
                }
                
                return uniqueBadges.map((ub, ubIdx) => {
                  const parts = (ub.monthLabel || '').split('-');
                  const positionLabel = parts[0]?.trim() || 'Campeão';
                  const monthYear = parts[1]?.trim() || 'Mensal';

                  return (
                    <div 
                      key={`profile-monthly-${ub.badgeId || 'badge'}-${ub.monthLabel || ''}-${ubIdx}`}
                      className={`relative flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all ${
                        isDarkMode ? 'bg-yellow-900/10 border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'bg-yellow-50/50 border-yellow-200 shadow-lg shadow-yellow-500/10'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform scale-110 active:scale-125 ${
                        ub.level === BadgeLevel.GOLD ? 'bg-yellow-400 font-bold text-yellow-900' : 
                        ub.level === BadgeLevel.SILVER ? 'bg-slate-300 font-bold text-slate-700' : 
                        'bg-orange-600 font-bold text-orange-100'
                      } text-white shadow-xl`}>
                        <Trophy size={28} />
                      </div>
                      <p className={`text-[10px] font-black uppercase text-center leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{positionLabel}</p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center truncate w-full">
                        {monthYear}
                      </p>
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 p-1 rounded-full shadow-lg border-2 border-white">
                        <Star size={10} fill="currentColor" />
                      </div>
                    </div>
                  );
                });
              })()}
              
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
              {(() => {
                const clubBadges = (user.badges || []).filter(b => !b.badgeId.startsWith('monthly_games_'));
                const uniqueBadges: UserBadge[] = [];
                const seen = new Set<string>();
                for (const b of clubBadges) {
                  if (!seen.has(b.badgeId)) {
                    seen.add(b.badgeId);
                    uniqueBadges.push(b);
                  }
                }

                return uniqueBadges.map((ub, ubIdx) => {
                  const isSpecialtyMaster = ub.badgeId.startsWith('specialty_master_');
                  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === ub.badgeId || (isSpecialtyMaster && b.id === 'mestre_especialidade'));
                  
                  if (!badgeDef) return null;
                  
                  const BadgeIcon = isSpecialtyMaster ? Medal : (BADGE_ICONS[badgeDef.icon] || HelpCircle);
                  const badgeName = badgeDef.name;
                  
                  return (
                    <div 
                      key={`profile-club-badge-${ub.badgeId || 'badge'}-${ubIdx}`}
                      className={`relative flex flex-col items-center p-5 rounded-[2.5rem] border-2 transition-all ${
                        isDarkMode ? 'bg-blue-900/10 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-500/10'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform scale-110 active:scale-125 ${
                        getBadgeLevelColorClass(ub.level)
                      } text-white shadow-xl`}>
                        <BadgeIcon size={28} />
                      </div>
                      <p className={`text-[10px] font-black uppercase text-center leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{badgeName}</p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        {ub.level}
                      </p>
                      <div className={`absolute -top-2 -right-2 p-1 rounded-full shadow-lg border-2 border-white ${getStarLevelColorClass(ub.level)}`}>
                        <Star size={10} fill="currentColor" />
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Renderizar insígnias do clube que o usuário ainda NÃO conquistou */}
              {BADGE_DEFINITIONS
                .filter(badge => !user.badges?.some(ub => ub.badgeId === badge.id || (ub.badgeId.startsWith('specialty_master_') && badge.id === 'mestre_especialidade')))
                .map((badge, bIdx) => {
                const BadgeIcon = BADGE_ICONS[badge.icon] || HelpCircle;
                
                return (
                  <div 
                    key={`profile-unearned-${badge.id}-${bIdx}`}
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
      <div className="text-center py-10 opacity-20"><p className="text-[8px] font-black uppercase tracking-[0.5em]">v3.4.0 • Versão Oficial</p></div>

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
                        {formData.role === UserRole.LEADERSHIP 
                          ? LEADERSHIP_ROLES.map((pos, pIdx) => <option key={`lead-role-${pos}-${pIdx}`} value={pos}>{pos}</option>) 
                          : PATHFINDER_ROLES.map((pos, pIdx) => <option key={`pf-role-${pos}-${pIdx}`} value={pos}>{pos}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Nascimento</label>
                      <input 
                        type="date" 
                        className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} 
                        value={formData.birthday || ''} 
                        onChange={e => {
                          const birthStr = e.target.value;
                          let newAge = formData.age || 0;
                          if (birthStr) {
                            const parts = birthStr.split('-');
                            if (parts.length === 3) {
                              const year = parseInt(parts[0], 10);
                              const month = parseInt(parts[1], 10) - 1;
                              const day = parseInt(parts[2], 10);
                              const birthDate = new Date(year, month, day);
                              if (!isNaN(birthDate.getTime())) {
                                const today = new Date();
                                let age = today.getFullYear() - birthDate.getFullYear();
                                const m = today.getMonth() - birthDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                  age--;
                                }
                                if (age >= 0 && age <= 120) {
                                  newAge = age;
                                }
                              }
                            }
                          }
                          const newClass = formData.role === UserRole.PATHFINDER ? getClassByAge(newAge) : formData.className;
                          setFormData({...formData, birthday: birthStr, age: newAge, className: newClass});
                        }} 
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Idade</label>
                      <input 
                        type="number" 
                        className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} 
                        value={formData.age || ''} 
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          const newAge = isNaN(val) ? 0 : val;
                          const newClass = formData.role === UserRole.PATHFINDER ? getClassByAge(newAge) : formData.className;
                          setFormData({...formData, age: newAge, className: newClass});
                        }} 
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className={labelClasses}>Classe</label>
                    {isLeadership ? (
                      <>
                        <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.className || ''} onChange={e => setFormData({...formData, className: e.target.value})}>
                          <option value="">Nenhuma</option>
                          {LEADERSHIP_CLASSES.map((cls, cIdx) => <option key={`lead-cls-${cls}-${cIdx}`} value={cls}>{cls}</option>)}
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
                        {sortUnitsWithLeadershipLast(unitsList)
                          .filter(u => isLeadership || !isLeadershipUnit(u.name))
                          .map((u, uIdx) => (
                            <option key={`unit-opt-${u.id || u.name}-${uIdx}`} value={u.name}>{u.name}</option>
                          ))
                        }
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                       <label className={labelClasses}>{isLeadership ? 'Setor' : 'Conselheiro(a)'}</label>
                       {isLeadership ? ( <input className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value="Diretoria" readOnly /> ) : (
                         <>
                           <select className={`${inputClasses} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} appearance-none`} value={formData.counselor || ''} onChange={e => setFormData({...formData, counselor: e.target.value})}>
                             <option value="" disabled>Selecionar</option>
                             {counselorList.map((name, nIdx) => <option key={`counselor-opt-${name}-${nIdx}`} value={name}>{name}</option>)}
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
