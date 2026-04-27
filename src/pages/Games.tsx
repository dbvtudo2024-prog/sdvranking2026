
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, HelpCircle, Shuffle, Anchor, User, Map, Type, Leaf, HeartPulse, X, Music, ArrowLeft } from 'lucide-react';
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
  firstAidOverride: boolean;
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
  firstAidOverride,
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
    memory: memoryOverride,
    specialty: specialtyOverride,
    threeClues: threeCluesOverride,
    puzzle: puzzleOverride,
    knots: knotsOverride,
    specialtyTrail: specialtyTrailOverride,
    scrambledVerse: scrambledVerseOverride,
    natureId: natureIdOverride,
    firstAid: firstAidOverride
  };

  const getGameStatus = (gameId: string, overrideKey: string, dbGameId: string) => {
    const now = new Date();
    const clubUnlocked = isGameTimeAvailable(now.getDay(), now.getHours(), overrides, overrideKey, user);
    const unlocked = clubUnlocked || isAdmin;
    
    let alreadyPlayed = false;
    if (gameId === 'quiz') {
      const playedDesb = checkPlayedThisWeek(currentMember, 'quiz', 'Desbravadores');
      const playedBiblia = checkPlayedThisWeek(currentMember, 'quiz', 'Bíblia');
      alreadyPlayed = !isAdmin && playedDesb && playedBiblia;
    } else {
      alreadyPlayed = !isAdmin && checkPlayedThisWeek(currentMember, dbGameId);
    }
    
    return { unlocked, clubUnlocked, alreadyPlayed };
  };

  const quizStatus = useMemo(() => getGameStatus('quiz', 'quiz', 'quiz'), [currentMember, cycleStart, isGameDay, quizOverride, isAdmin]);
  const memoryStatus = useMemo(() => getGameStatus('memory', 'memory', 'memoryGame'), [currentMember, cycleStart, isGameDay, memoryOverride, isAdmin]);
  const specialtyStatus = useMemo(() => getGameStatus('specialty', 'specialty', 'specialtyGame'), [currentMember, cycleStart, isGameDay, specialtyOverride, isAdmin]);
  const threeCluesStatus = useMemo(() => getGameStatus('threeClues', 'threeClues', 'threeCluesGame'), [currentMember, cycleStart, isGameDay, threeCluesOverride, isAdmin]);
  const puzzleStatus = useMemo(() => getGameStatus('puzzle', 'puzzle', 'puzzleGame'), [currentMember, cycleStart, isGameDay, puzzleOverride, isAdmin]);
  const knotsStatus = useMemo(() => getGameStatus('knots', 'knots', 'knotsGame'), [currentMember, cycleStart, isGameDay, knotsOverride, isAdmin]);
  const specialtyTrailStatus = useMemo(() => getGameStatus('specialtyTrail', 'specialtyTrail', 'specialtyTrailGame'), [currentMember, cycleStart, isGameDay, specialtyTrailOverride, isAdmin]);
  const scrambledVerseStatus = useMemo(() => getGameStatus('scrambledVerse', 'scrambledVerse', 'scrambledVerseGame'), [currentMember, cycleStart, isGameDay, scrambledVerseOverride, isAdmin]);
  const natureIdStatus = useMemo(() => getGameStatus('natureId', 'natureId', 'natureIdGame'), [currentMember, cycleStart, isGameDay, natureIdOverride, isAdmin]);
  const firstAidStatus = useMemo(() => getGameStatus('firstAid', 'firstAid', 'firstAidGame'), [currentMember, cycleStart, isGameDay, firstAidOverride, isAdmin]);

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
      case 'quiz': gameComponent = <QuizSelection {...gameProps} quizOverride={quizOverride} />; break;
      case 'memory': gameComponent = <MemoryGame {...gameProps} memoryOverride={memoryOverride} />; break;
      case 'specialty': gameComponent = <SpecialtyGame {...gameProps} specialtyOverride={specialtyOverride} isDarkMode={isDarkMode} />; break;
      case '1x1': gameComponent = <Challenge1x1Page {...gameProps} />; break;
      case 'threeclues': gameComponent = <ThreeCluesGame {...gameProps} override={threeCluesOverride} />; break;
      case 'puzzle': gameComponent = <PuzzleGame {...gameProps} puzzleOverride={puzzleOverride} />; break;
      case 'knots': gameComponent = <KnotsGame {...gameProps} override={knotsOverride} />; break;
      case 'specialtytrail': gameComponent = <SpecialtyTrailGame {...gameProps} override={specialtyTrailOverride} />; break;
      case 'scrambledverse': gameComponent = <ScrambledVerseGame {...gameProps} override={scrambledVerseOverride} />; break;
      case 'natureid': gameComponent = <NatureIdGame {...gameProps} override={natureIdOverride} />; break;
      case 'firstaid': gameComponent = <FirstAidGame {...gameProps} override={firstAidOverride} />; break;
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

  const getButtonStyles = (unlocked: boolean, played: boolean, variant: 'normal' | 'large' | 'tall' = 'normal') => {
    const base = "w-full rounded-[2rem] sm:rounded-[2.5rem] font-black flex flex-col items-center justify-center gap-2 sm:gap-4 transition-all border-2 border-b-8 active:scale-95 px-4 sm:px-8 relative overflow-hidden group ";
    
    let height = "h-40 sm:h-48";
    if (variant === 'large') height = "h-56 sm:h-64";
    if (variant === 'tall') height = "h-80 sm:h-96";

    const stateStyles = !unlocked 
      ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60 grayscale"
      : played
      ? "bg-slate-50 dark:bg-slate-900 border-green-200 dark:border-green-900/30 text-slate-400 dark:text-slate-600 shadow-inner"
      : "bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/10 dark:shadow-none hover:bg-blue-50 dark:hover:bg-slate-700 hover:-translate-y-1";

    return `${base} ${height} ${stateStyles}`;
  };

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto animate-in fade-in duration-500 w-full pt-8 landscape:pt-4 pb-8 px-4 sm:px-8 custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 landscape:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[120px] sm:auto-rows-[160px] landscape:auto-rows-[140px]">
          
          {/* JOGOS SEMPRE DISPONÍVEIS */}
          <div className="col-span-2 row-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* DUELO ARENA 1x1 */}
            <button 
              onClick={() => setActiveGame('1x1')} 
              className="h-full rounded-[2.5rem] font-black flex flex-col items-center justify-center gap-4 transition-all bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-800 border-b-8 text-white shadow-2xl shadow-blue-500/30 active:scale-95 px-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sword size={100} />
              </div>
              <Sword size={48} className="text-yellow-400 drop-shadow-lg animate-bounce-slow" />
              <div className="flex flex-col items-center text-center leading-tight">
                <span className="uppercase tracking-[0.2em] text-base sm:text-lg">Duelo 1x1</span>
                <span className="text-[10px] font-bold opacity-80 lowercase mt-1 bg-black/20 px-2 py-0.5 rounded-full">Sempre disponível</span>
              </div>
            </button>

            {/* MAHJONG - AGORA PARA TODOS */}
            <button 
              onClick={() => setActiveGame('mahjong')} 
              className="h-full rounded-[2.5rem] font-black flex flex-col items-center justify-center gap-4 transition-all bg-slate-800 dark:bg-slate-900 border-slate-950 border-b-8 text-white shadow-2xl active:scale-95 px-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Gamepad2 size={100} />
              </div>
              <Medal size={48} className="text-amber-400 animate-pulse" />
              <div className="flex flex-col items-center text-center leading-tight">
                <span className="uppercase tracking-[0.2em] text-base sm:text-lg">Mahjong</span>
                <span className="text-[10px] font-bold opacity-80 lowercase mt-1 bg-black/20 px-2 py-0.5 rounded-full">Sempre disponível</span>
              </div>
            </button>

            {/* BLOCOS - SEMPRE LIBERADO */}
            <button 
              onClick={() => setActiveGame('brickbreaker')} 
              className="h-full rounded-[2.5rem] font-black flex flex-col items-center justify-center gap-4 transition-all bg-orange-500 dark:bg-orange-600 border-orange-700 border-b-8 text-white shadow-2xl active:scale-95 px-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Gamepad2 size={100} />
              </div>
              <Gamepad2 size={48} className="text-orange-200 animate-pulse" />
              <div className="flex flex-col items-center text-center leading-tight">
                <span className="uppercase tracking-[0.2em] text-base sm:text-lg">Blocos</span>
                <span className="text-[10px] font-bold opacity-80 lowercase mt-1 bg-black/20 px-2 py-0.5 rounded-full">Sempre disponível</span>
              </div>
            </button>
          </div>

          {/* SEPARADOR E ÁREA DE DESAFIOS SEMANAIS */}
          <div className="col-span-full mt-4 mb-2 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-900 dark:text-slate-100 font-black text-[10px] uppercase tracking-[0.3em]">Desafios Semanais</span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400 dark:text-slate-500">
                <Calendar size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">{getTimeToUnlock()}</span>
              </div>
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {/* CONTAINER DE DESAFIOS PARA MELHOR AGRUPAMENTO VISUAL */}
          <div className="col-span-full grid grid-cols-2 landscape:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-min">
            {/* QUIZ - DESTAQUE */}
            <button 
              disabled={!quizStatus.unlocked || quizStatus.alreadyPlayed} 
              onClick={() => setActiveGame('quiz')} 
              className={`${getButtonStyles(quizStatus.clubUnlocked, quizStatus.alreadyPlayed, 'large')} col-span-2 sm:col-span-1 row-span-1 sm:row-span-2`}
            >
              <div className={`p-5 rounded-[2rem] bg-amber-100 dark:bg-amber-900/30 text-amber-600 group-hover:scale-110 transition-transform ${quizStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
                {quizStatus.alreadyPlayed ? <CheckCircle2 size={40} /> : (!quizStatus.clubUnlocked && !isAdmin ? <Lock size={40} /> : <Brain size={40} />)}
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="uppercase tracking-[0.2em] text-xs sm:text-sm font-black">Mestre do Quiz</span>
                <span className="text-[9px] font-bold opacity-60 mt-1 max-w-[120px] uppercase tracking-widest">
                  {quizStatus.alreadyPlayed ? 'Concluído' : (quizStatus.clubUnlocked ? 'Disponível' : (isAdmin ? 'Admin: Aberto' : 'Bloqueado'))}
                </span>
              </div>
            </button>

            {/* TRÊS DICAS */}
            <button 
              disabled={!threeCluesStatus.unlocked || threeCluesStatus.alreadyPlayed} 
              onClick={() => setActiveGame('threeclues')} 
              className={`${getButtonStyles(threeCluesStatus.clubUnlocked, threeCluesStatus.alreadyPlayed)}`}
            >
              <div className={`p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 group-hover:scale-110 transition-transform ${threeCluesStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
                {threeCluesStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!threeCluesStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <HelpCircle size={24} />)}
              </div>
              <span className="uppercase tracking-widest text-[10px] font-black text-center">3 Pistas</span>
            </button>

            {/* ESPECIALIDADE */}
            <button 
              disabled={!specialtyStatus.unlocked || specialtyStatus.alreadyPlayed} 
              onClick={() => setActiveGame('specialty')} 
              className={`${getButtonStyles(specialtyStatus.clubUnlocked, specialtyStatus.alreadyPlayed)}`}
            >
              <div className={`p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform ${specialtyStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
                {specialtyStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!specialtyStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Medal size={24} />)}
              </div>
              <span className="uppercase tracking-widest text-[10px] font-black text-center">Brasões</span>
            </button>

          {/* MEMÓRIA */}
          <button 
            disabled={!memoryStatus.unlocked || memoryStatus.alreadyPlayed} 
            onClick={() => setActiveGame('memory')} 
            className={`${getButtonStyles(memoryStatus.clubUnlocked, memoryStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 group-hover:scale-110 transition-transform ${memoryStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {memoryStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!memoryStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Gamepad2 size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Memória</span>
          </button>

          {/* QUEBRA-CABEÇA */}
          <button 
            disabled={!puzzleStatus.unlocked || puzzleStatus.alreadyPlayed} 
            onClick={() => setActiveGame('puzzle')} 
            className={`${getButtonStyles(puzzleStatus.clubUnlocked, puzzleStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 group-hover:scale-110 transition-transform ${puzzleStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {puzzleStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!puzzleStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Shuffle size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Puzzle</span>
          </button>

          {/* NÓS */}
          <button 
            disabled={!knotsStatus.unlocked || knotsStatus.alreadyPlayed} 
            onClick={() => setActiveGame('knots')} 
            className={`${getButtonStyles(knotsStatus.clubUnlocked, knotsStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 group-hover:scale-110 transition-transform ${knotsStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {knotsStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!knotsStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Anchor size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Nós</span>
          </button>

          {/* TRILHA */}
          <button 
            disabled={!specialtyTrailStatus.unlocked || specialtyTrailStatus.alreadyPlayed} 
            onClick={() => setActiveGame('specialtytrail')} 
            className={`${getButtonStyles(specialtyTrailStatus.clubUnlocked, specialtyTrailStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 group-hover:scale-110 transition-transform ${specialtyTrailStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {specialtyTrailStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!specialtyTrailStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Map size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Trilha</span>
          </button>

          {/* VERSÍCULO */}
          <button 
            disabled={!scrambledVerseStatus.unlocked || scrambledVerseStatus.alreadyPlayed} 
            onClick={() => setActiveGame('scrambledverse')} 
            className={`${getButtonStyles(scrambledVerseStatus.clubUnlocked, scrambledVerseStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 group-hover:scale-110 transition-transform ${scrambledVerseStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {scrambledVerseStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!scrambledVerseStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Type size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Versículo</span>
          </button>

          {/* NATUREZA */}
          <button 
            disabled={!natureIdStatus.unlocked || natureIdStatus.alreadyPlayed} 
            onClick={() => setActiveGame('natureid')} 
            className={`${getButtonStyles(natureIdStatus.clubUnlocked, natureIdStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-lime-100 dark:bg-lime-900/30 text-lime-600 group-hover:scale-110 transition-transform ${natureIdStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {natureIdStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!natureIdStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <Leaf size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Natureza</span>
          </button>

          {/* SOCORROS */}
          <button 
            disabled={!firstAidStatus.unlocked || firstAidStatus.alreadyPlayed} 
            onClick={() => setActiveGame('firstaid')} 
            className={`${getButtonStyles(firstAidStatus.clubUnlocked, firstAidStatus.alreadyPlayed)}`}
          >
            <div className={`p-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 group-hover:scale-110 transition-transform ${firstAidStatus.alreadyPlayed ? 'grayscale opacity-50' : ''}`}>
              {firstAidStatus.alreadyPlayed ? <CheckCircle2 size={24} /> : (!firstAidStatus.clubUnlocked && !isAdmin ? <Lock size={24} /> : <HeartPulse size={24} />)}
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black text-center">Socorros</span>
          </button>


            {/* EM BREVE */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1 row-span-1 opacity-50">
              <Lock size={16} className="text-slate-400" />
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Em breve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
