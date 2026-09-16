
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, HelpCircle, Shuffle, Anchor, User, Map, Type, Leaf, HeartPulse, X, Music, ArrowLeft, Sparkles, Flame, Shield, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthUser, Member, UserRole, Score, BadgeLevel, UserStats } from '@/types';
import QuizSelection from '@/pages/QuizSelection';
import MemoryGame from '@/pages/MemoryGame';
import SpecialtyGame from '@/pages/SpecialtyGame';
import Challenge1x1Page from '@/pages/Challenge1x1';
import ThreeCluesGame from '@/pages/ThreeCluesGame';
import PuzzleGame from '@/pages/PuzzleGame';
import KnotsGame from '@/pages/KnotsGame';
import SpecialtyTrailGame from '@/pages/SpecialtyTrailGame';
import ScrambledVerseGame from '@/pages/ScrambledVerseGame';
import NatureIdGame from '@/pages/NatureIdGame';
import FirstAidGame from '@/pages/FirstAidGame';
import MahjongGame from '@/pages/MahjongGame';
import BrickBreakerGame from '@/pages/BrickBreakerGame';
import { isGameTimeAvailable, getCycleStart, parseScoreDate, checkPlayedThisWeek, checkIsAdmin, findMemberForUser } from '@/utils/gameUtils';

interface GamesProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onAwardBadge?: (badgeId: string, level: BadgeLevel) => void;
  onUpdateStats?: (stats: Partial<UserStats>) => void;
  quizOverride: boolean;
  memoryOverride: boolean;
  specialtyOverride: boolean;
  threeCluesOverride: boolean;
  puzzleOverride: boolean;
  knotsOverride: boolean;
  specialtyTrailOverride: boolean;
  scrambledVerseOverride: boolean;
  natureIdOverride: boolean;
  natureIdAllowedDay?: number | null;
  firstAidOverride: boolean;
  firstAidAllowedDay?: number | null;
  quizAllowedDay?: number | null;
  memoryAllowedDay?: number | null;
  specialtyAllowedDay?: number | null;
  threeCluesAllowedDay?: number | null;
  puzzleAllowedDay?: number | null;
  knotsAllowedDay?: number | null;
  specialtyTrailAllowedDay?: number | null;
  scrambledVerseAllowedDay?: number | null;
  isDarkMode?: boolean;
  onGameActiveChange?: (active: boolean) => void;
}

const Games: React.FC<GamesProps> = ({ 
  user, 
  members, 
  onUpdateMember, 
  onAwardBadge,
  onUpdateStats,
  quizOverride, 
  memoryOverride, 
  specialtyOverride,
  threeCluesOverride,
  puzzleOverride,
  knotsOverride,
  specialtyTrailOverride,
  scrambledVerseOverride,
  natureIdOverride,
  natureIdAllowedDay,
  firstAidOverride,
  firstAidAllowedDay,
  quizAllowedDay,
  memoryAllowedDay,
  specialtyAllowedDay,
  threeCluesAllowedDay,
  puzzleAllowedDay,
  knotsAllowedDay,
  specialtyTrailAllowedDay,
  scrambledVerseAllowedDay,
  isDarkMode,
  onGameActiveChange
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid' | 'mahjong' | 'brickbreaker'>('hub');

  React.useEffect(() => {
    onGameActiveChange?.(activeGame !== 'hub');
    return () => onGameActiveChange?.(false);
  }, [activeGame, onGameActiveChange]);

  const isAdmin = checkIsAdmin(user);

  const currentMember = useMemo(() => {
    return findMemberForUser(members, user);
  }, [members, user]);

  const isGameDay = useMemo(() => {
    const now = new Date();
    return isGameTimeAvailable(now.getDay(), now.getHours(), {}, 'global', user);
  }, [user]);

  const cycleStart = useMemo(() => getCycleStart(), []);

  const overrides = {
    quiz: quizOverride,
    quiz_allowed_day: quizAllowedDay,
    memory: memoryOverride,
    memory_allowed_day: memoryAllowedDay,
    specialty: specialtyOverride,
    specialty_allowed_day: specialtyAllowedDay,
    threeClues: threeCluesOverride,
    threeClues_allowed_day: threeCluesAllowedDay,
    puzzle: puzzleOverride,
    puzzle_allowed_day: puzzleAllowedDay,
    knots: knotsOverride,
    knots_allowed_day: knotsAllowedDay,
    specialtyTrail: specialtyTrailOverride,
    specialtyTrail_allowed_day: specialtyTrailAllowedDay,
    scrambledVerse: scrambledVerseOverride,
    scrambledVerse_allowed_day: scrambledVerseAllowedDay,
    natureId: natureIdOverride,
    natureId_allowed_day: natureIdAllowedDay,
    firstAid: firstAidOverride,
    firstAid_allowed_day: firstAidAllowedDay
  };

  const getGameStatus = (gameId: string, overrideKey: string, dbGameId: string) => {
    const now = new Date();
    const clubUnlocked = isGameTimeAvailable(now.getDay(), now.getHours(), overrides, overrideKey, user);
    const unlocked = clubUnlocked || isAdmin;
    
    let alreadyPlayed = false;
    if (gameId === 'quiz') {
      const playedDesb = checkPlayedThisWeek(currentMember, 'quiz', 'Desbravadores');
      const playedBiblia = checkPlayedThisWeek(currentMember, 'quiz', 'Bíblia');
      alreadyPlayed = playedDesb && playedBiblia;
    } else {
      alreadyPlayed = checkPlayedThisWeek(currentMember, dbGameId);
    }
    
    return { unlocked, clubUnlocked, alreadyPlayed };
  };

  const quizStatus = useMemo(() => getGameStatus('quiz', 'quiz', 'quiz'), [currentMember, cycleStart, quizOverride, quizAllowedDay, isAdmin]);
  const memoryStatus = useMemo(() => getGameStatus('memory', 'memory', 'memoryGame'), [currentMember, cycleStart, memoryOverride, memoryAllowedDay, isAdmin]);
  const specialtyStatus = useMemo(() => getGameStatus('specialty', 'specialty', 'specialtyGame'), [currentMember, cycleStart, specialtyOverride, specialtyAllowedDay, isAdmin]);
  const threeCluesStatus = useMemo(() => getGameStatus('threeClues', 'threeClues', 'threeCluesGame'), [currentMember, cycleStart, threeCluesOverride, threeCluesAllowedDay, isAdmin]);
  const puzzleStatus = useMemo(() => getGameStatus('puzzle', 'puzzle', 'puzzleGame'), [currentMember, cycleStart, puzzleOverride, puzzleAllowedDay, isAdmin]);
  const knotsStatus = useMemo(() => getGameStatus('knots', 'knots', 'knotsGame'), [currentMember, cycleStart, knotsOverride, knotsAllowedDay, isAdmin]);
  const specialtyTrailStatus = useMemo(() => getGameStatus('specialtyTrail', 'specialtyTrail', 'specialtyTrailGame'), [currentMember, cycleStart, specialtyTrailOverride, specialtyTrailAllowedDay, isAdmin]);
  const scrambledVerseStatus = useMemo(() => getGameStatus('scrambledVerse', 'scrambledVerse', 'scrambledVerseGame'), [currentMember, cycleStart, scrambledVerseOverride, scrambledVerseAllowedDay, isAdmin]);
  const natureIdStatus = useMemo(() => getGameStatus('natureId', 'natureId', 'natureIdGame'), [currentMember, cycleStart, natureIdOverride, natureIdAllowedDay, isAdmin]);
  const firstAidStatus = useMemo(() => getGameStatus('firstAid', 'firstAid', 'firstAidGame'), [currentMember, cycleStart, firstAidOverride, firstAidAllowedDay, isAdmin]);

  const mahjongStatus = useMemo(() => getGameStatus('mahjong', 'mahjong', 'mahjongGame'), [currentMember, isAdmin]);
  const duelStatus = useMemo(() => getGameStatus('1x1', '1x1', 'challenge1x1'), [currentMember, isAdmin]);
  const brickStatus = useMemo(() => getGameStatus('brickbreaker', 'brick', 'brickBreakerGame'), [currentMember, isAdmin]);

  const getTimeToUnlock = () => {
    if (isGameDay) return "Disponível!";
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 0 && hour < 12) return "Abre hoje ao meio-dia";
    if (day === 6) return "Abre Amanhã ao meio-dia";
    return "Abre Domingo ao meio-dia";
  };

  const renderActiveGame = () => {
    const gameProps = { user, members, onUpdateMember, onAwardBadge, onUpdateStats, onBack: () => setActiveGame('hub') };
    
    let gameComponent = null;
    switch (activeGame) {
      case 'quiz': gameComponent = <QuizSelection {...gameProps} quizOverride={quizOverride} allowedDay={quizAllowedDay} />; break;
      case 'memory': gameComponent = <MemoryGame {...gameProps} memoryOverride={memoryOverride} allowedDay={memoryAllowedDay} />; break;
      case 'specialty': gameComponent = <SpecialtyGame {...gameProps} specialtyOverride={specialtyOverride} allowedDay={specialtyAllowedDay} isDarkMode={isDarkMode} />; break;
      case '1x1': gameComponent = <Challenge1x1Page {...gameProps} />; break;
      case 'threeclues': gameComponent = <ThreeCluesGame {...gameProps} override={threeCluesOverride} allowedDay={threeCluesAllowedDay} />; break;
      case 'puzzle': gameComponent = <PuzzleGame {...gameProps} puzzleOverride={puzzleOverride} allowedDay={puzzleAllowedDay} />; break;
      case 'knots': gameComponent = <KnotsGame {...gameProps} override={knotsOverride} allowedDay={knotsAllowedDay} />; break;
      case 'specialtytrail': gameComponent = <SpecialtyTrailGame {...gameProps} override={specialtyTrailOverride} allowedDay={specialtyTrailAllowedDay} />; break;
      case 'scrambledverse': gameComponent = <ScrambledVerseGame {...gameProps} override={scrambledVerseOverride} allowedDay={scrambledVerseAllowedDay} />; break;
      case 'natureid': gameComponent = <NatureIdGame {...gameProps} override={natureIdOverride} allowedDay={natureIdAllowedDay} />; break;
      case 'firstaid': gameComponent = <FirstAidGame {...gameProps} override={firstAidOverride} allowedDay={firstAidAllowedDay} />; break;
      case 'mahjong': gameComponent = <MahjongGame {...gameProps} isDarkMode={isDarkMode} />; break;
      case 'brickbreaker': gameComponent = <BrickBreakerGame {...gameProps} isDarkMode={isDarkMode} />; break;
      default: return null;
    }

    const getGameName = (game: string) => {
      switch (game) {
        case 'quiz': return 'Quiz Desbravador';
        case 'memory': return 'Jogo da Memória';
        case 'specialty': return 'Desafio Especialidade';
        case '1x1': return 'Duelo 1x1 Arena';
        case 'threeclues': return 'Três Pistas';
        case 'puzzle': return 'Quebra-Cabeça';
        case 'knots': return 'Mestre dos Nós';
        case 'specialtytrail': return 'Trilha de Especialidades';
        case 'scrambledverse': return 'Versículo Embaralhado';
        case 'natureid': return 'Identificação de Natureza';
        case 'firstaid': return 'Primeiros Socorros';
        case 'mahjong': return 'Mahjong Desbravador';
        case 'brickbreaker': return 'Destruir Blocos';
        default: return 'Jogo';
      }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f172a] flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center bg-slate-100 dark:bg-slate-950">
          <div className="w-full max-w-4xl h-full bg-white dark:bg-[#0f172a] shadow-2xl relative">
            {gameComponent}
          </div>
        </div>
      </div>
    );
  };

  if (activeGame !== 'hub') return renderActiveGame();

  interface GameCardProps {
    id: string;
    title: string;
    subtitle: string;
    badgeLabel?: string;
    icon: any;
    watermarkIcon?: any;
    gradient: string;
    shadow: string;
    unlocked: boolean;
    alreadyPlayed: boolean;
    onClick: () => void;
    colSpan?: string;
  }

  const GameCard: React.FC<GameCardProps> = ({
    id,
    title,
    subtitle,
    badgeLabel,
    icon: Icon,
    watermarkIcon: WatermarkIcon = Icon,
    gradient,
    shadow,
    unlocked,
    alreadyPlayed,
    onClick,
    colSpan = 'col-span-1'
  }) => {
    // 1. Estado Bloqueado
    if (!unlocked) {
      return (
        <div
          id={id}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 min-h-[105px] min-[380px]:min-h-[115px] sm:min-h-[160px] bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 opacity-60 grayscale cursor-not-allowed select-none ${colSpan}`}
        >
          <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 text-slate-300 dark:text-slate-700 pointer-events-none">
            <WatermarkIcon size={46} strokeWidth={1.2} className="sm:w-20 sm:h-20" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-13 sm:h-13 rounded-lg sm:rounded-2xl bg-slate-200 dark:bg-slate-700/70 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-xs">
              <Lock size={15} strokeWidth={2.4} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-200/90 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400">
              Bloq.
            </span>
          </div>

          <div className="relative z-10 mt-2 sm:mt-4">
            <span className="block text-slate-400 dark:text-slate-500 font-black text-[10px] min-[380px]:text-xs sm:text-base uppercase tracking-tight truncate leading-tight">
              {title}
            </span>
            <span className="block text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-slate-400/80 font-bold uppercase tracking-wider truncate mt-0.5 leading-tight">
              {subtitle}
            </span>
          </div>
        </div>
      );
    }

    // 2. Estado Já Concluído esta semana
    if (alreadyPlayed) {
      return (
        <div
          id={id}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 min-h-[105px] min-[380px]:min-h-[115px] sm:min-h-[160px] bg-gradient-to-br from-emerald-600/90 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-900/10 border border-emerald-400/30 opacity-90 select-none ${colSpan}`}
        >
          <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 text-white/10 pointer-events-none">
            <WatermarkIcon size={46} strokeWidth={1.2} className="sm:w-20 sm:h-20" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-13 sm:h-13 rounded-lg sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/35">
              <CheckCircle2 size={16} strokeWidth={2.5} className="sm:w-6 sm:h-6 text-emerald-200" />
            </div>
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 rounded-full bg-black/25 text-emerald-100 backdrop-blur-xs border border-white/10">
              Feito
            </span>
          </div>

          <div className="relative z-10 mt-2 sm:mt-4">
            <span className="block text-white font-black text-[10px] min-[380px]:text-xs sm:text-base uppercase tracking-tight drop-shadow-sm truncate leading-tight">
              {title}
            </span>
            <span className="block text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-emerald-100/90 font-bold uppercase tracking-wider truncate mt-0.5 leading-tight">
              {subtitle}
            </span>
          </div>
        </div>
      );
    }

    // 3. Estado Disponível (Padrão Início e Unidades: gradiente vivo, vidro, brilho e animação fluida)
    return (
      <motion.button
        id={id}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-col justify-between text-left transition-all duration-300 min-h-[105px] min-[380px]:min-h-[115px] sm:min-h-[160px] ${gradient} ${shadow} border border-white/30 group cursor-pointer w-full select-none ${colSpan}`}
      >
        {/* Ícone d'água de fundo decorativo rotacionado */}
        <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 text-white/15 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
          <WatermarkIcon size={46} strokeWidth={1.4} className="sm:w-22 sm:h-22" />
        </div>

        {/* Brilho suave no canto superior */}
        <div className="absolute -top-8 -left-8 w-20 h-20 bg-white/25 rounded-full blur-xl pointer-events-none group-hover:bg-white/35 transition-colors" />

        {/* Topo do Card: Cápsula translúcida + Tag de status */}
        <div className="flex items-start justify-between relative z-10 w-full gap-1">
          <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-13 sm:h-13 rounded-lg sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/35 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Icon size={16} strokeWidth={2.4} className="sm:w-6 sm:h-6" />
          </div>

          <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 rounded-full bg-black/20 text-white/95 backdrop-blur-xs border border-white/15 drop-shadow-xs shrink-0">
            {badgeLabel || (isAdmin && !unlocked ? 'Admin' : 'Livre')}
          </span>
        </div>

        {/* Base do Card: Título e Subtítulo estilizados */}
        <div className="relative z-10 w-full mt-2 sm:mt-4">
          <span className="block text-white font-black text-[10px] min-[380px]:text-xs sm:text-base uppercase tracking-tight sm:tracking-wider drop-shadow-md leading-tight truncate">
            {title}
          </span>
          <span className="block text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-white/85 font-bold uppercase tracking-tight sm:tracking-wider mt-0.5 leading-tight truncate">
            {subtitle}
          </span>
        </div>

        {/* Realce ao passar o mouse */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto animate-in fade-in duration-500 w-full pb-28 px-4 sm:px-8 custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
      <div className="w-full max-w-7xl mx-auto py-6 flex flex-col gap-6">
        
        {/* SEÇÃO 1: JOGOS LIVRES / ARENA DIÁRIA */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
                Arena & Jogos Livres
              </h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-700/50">
              Sempre Liberados
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4.5">
            {/* DUELO ARENA 1x1 */}
            <GameCard
              id="btn-game-duel"
              title="Duelo 1x1"
              subtitle="Arena de Desafios"
              badgeLabel={duelStatus.alreadyPlayed ? 'Concluído' : 'Semanal'}
              icon={Sword}
              watermarkIcon={Sword}
              gradient="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700"
              shadow="shadow-indigo-500/20 shadow-lg"
              unlocked={duelStatus.unlocked}
              alreadyPlayed={duelStatus.alreadyPlayed}
              onClick={() => setActiveGame('1x1')}
            />

            {/* MAHJONG */}
            <GameCard
              id="btn-game-mahjong"
              title="Mahjong"
              subtitle="Combinações & Foco"
              badgeLabel={mahjongStatus.alreadyPlayed ? 'Concluído' : 'Semanal'}
              icon={Medal}
              watermarkIcon={Gamepad2}
              gradient="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"
              shadow="shadow-teal-500/20 shadow-lg"
              unlocked={mahjongStatus.unlocked}
              alreadyPlayed={mahjongStatus.alreadyPlayed}
              onClick={() => setActiveGame('mahjong')}
            />

            {/* DESTRUIR BLOCOS */}
            <GameCard
              id="btn-game-brickbreaker"
              title="Blocos"
              subtitle="Reflexo & Agilidade"
              badgeLabel={brickStatus.alreadyPlayed ? 'Concluído' : 'Semanal'}
              icon={Gamepad2}
              watermarkIcon={Gamepad2}
              gradient="bg-gradient-to-br from-orange-500 via-amber-600 to-rose-600"
              shadow="shadow-orange-500/20 shadow-lg"
              unlocked={brickStatus.unlocked}
              alreadyPlayed={brickStatus.alreadyPlayed}
              onClick={() => setActiveGame('brickbreaker')}
            />
          </div>
        </div>

        {/* SEÇÃO 2: DESAFIOS SEMANAIS DO CLUBE */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
                Desafios Semanais
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
              <Calendar size={11} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">{getTimeToUnlock()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4.5">
            {/* QUIZ - MESTRE DO QUIZ */}
            <GameCard
              id="btn-game-quiz"
              title="Mestre do Quiz"
              subtitle="Bíblia & Clube"
              badgeLabel={quizStatus.alreadyPlayed ? 'Concluído' : (quizStatus.clubUnlocked ? 'Disponível' : (isAdmin ? 'Admin' : 'Semanal'))}
              icon={Brain}
              gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600"
              shadow="shadow-amber-500/20 shadow-lg"
              unlocked={quizStatus.unlocked}
              alreadyPlayed={quizStatus.alreadyPlayed}
              onClick={() => setActiveGame('quiz')}
              colSpan="col-span-2 sm:col-span-1 md:col-span-1"
            />

            {/* 3 PISTAS */}
            <GameCard
              id="btn-game-threeclues"
              title="3 Pistas"
              subtitle="Dedução Bíblica"
              icon={HelpCircle}
              gradient="bg-gradient-to-br from-teal-500 via-emerald-600 to-green-600"
              shadow="shadow-emerald-500/20 shadow-lg"
              unlocked={threeCluesStatus.unlocked}
              alreadyPlayed={threeCluesStatus.alreadyPlayed}
              onClick={() => setActiveGame('threeclues')}
            />

            {/* BRASÕES / ESPECIALIDADES */}
            <GameCard
              id="btn-game-specialty"
              title="Brasões"
              subtitle="Especialidades"
              icon={Medal}
              gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
              shadow="shadow-blue-600/20 shadow-lg"
              unlocked={specialtyStatus.unlocked}
              alreadyPlayed={specialtyStatus.alreadyPlayed}
              onClick={() => setActiveGame('specialty')}
            />

            {/* MEMÓRIA */}
            <GameCard
              id="btn-game-memory"
              title="Memória"
              subtitle="Pares & Foco"
              icon={Gamepad2}
              gradient="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700"
              shadow="shadow-purple-500/20 shadow-lg"
              unlocked={memoryStatus.unlocked}
              alreadyPlayed={memoryStatus.alreadyPlayed}
              onClick={() => setActiveGame('memory')}
            />

            {/* QUEBRA-CABEÇA */}
            <GameCard
              id="btn-game-puzzle"
              title="Puzzle"
              subtitle="Quebra-Cabeça"
              icon={Shuffle}
              gradient="bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700"
              shadow="shadow-rose-500/20 shadow-lg"
              unlocked={puzzleStatus.unlocked}
              alreadyPlayed={puzzleStatus.alreadyPlayed}
              onClick={() => setActiveGame('puzzle')}
            />

            {/* NÓS */}
            <GameCard
              id="btn-game-knots"
              title="Nós"
              subtitle="Mestre dos Nós"
              icon={Anchor}
              gradient="bg-gradient-to-br from-amber-700 via-yellow-800 to-orange-900"
              shadow="shadow-amber-700/20 shadow-lg"
              unlocked={knotsStatus.unlocked}
              alreadyPlayed={knotsStatus.alreadyPlayed}
              onClick={() => setActiveGame('knots')}
            />

            {/* TRILHA */}
            <GameCard
              id="btn-game-specialtytrail"
              title="Trilha"
              subtitle="Especialidades"
              icon={Map}
              gradient="bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700"
              shadow="shadow-cyan-500/20 shadow-lg"
              unlocked={specialtyTrailStatus.unlocked}
              alreadyPlayed={specialtyTrailStatus.alreadyPlayed}
              onClick={() => setActiveGame('specialtytrail')}
            />

            {/* VERSÍCULO */}
            <GameCard
              id="btn-game-scrambledverse"
              title="Versículo"
              subtitle="Embaralhado"
              icon={Type}
              gradient="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700"
              shadow="shadow-violet-500/20 shadow-lg"
              unlocked={scrambledVerseStatus.unlocked}
              alreadyPlayed={scrambledVerseStatus.alreadyPlayed}
              onClick={() => setActiveGame('scrambledverse')}
            />

            {/* NATUREZA */}
            <GameCard
              id="btn-game-natureid"
              title="Natureza"
              subtitle="Identificação"
              icon={Leaf}
              gradient="bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700"
              shadow="shadow-green-500/20 shadow-lg"
              unlocked={natureIdStatus.unlocked}
              alreadyPlayed={natureIdStatus.alreadyPlayed}
              onClick={() => setActiveGame('natureid')}
            />

            {/* SOCORROS */}
            <GameCard
              id="btn-game-firstaid"
              title="Socorros"
              subtitle="Primeiros Socorros"
              icon={HeartPulse}
              gradient="bg-gradient-to-br from-red-600 via-rose-600 to-red-700"
              shadow="shadow-red-500/20 shadow-lg"
              unlocked={firstAidStatus.unlocked}
              alreadyPlayed={firstAidStatus.alreadyPlayed}
              onClick={() => setActiveGame('firstaid')}
            />

            {/* CARD VISUAL "EM BREVE" */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 min-h-[135px] sm:min-h-[160px] bg-slate-100 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700/60 opacity-60 select-none">
              <div className="w-10 h-10 min-[360px]:w-11 min-[360px]:h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Lock size={18} />
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="block text-slate-400 dark:text-slate-500 font-black text-xs sm:text-base uppercase tracking-tight">
                  Novos Jogos
                </span>
                <span className="block text-[9px] sm:text-[11px] text-slate-400/80 font-bold uppercase tracking-wider mt-0.5">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Games;
