
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, HelpCircle, Shuffle, Anchor, User, Map, Type, Leaf, HeartPulse, X, Music, ArrowLeft } from 'lucide-react';
import { AuthUser, Member, UserRole, Score } from '@/types';
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

interface GamesProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
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
  brickBreakerOverride: boolean;
  mahjongOverride: boolean;
  isDarkMode?: boolean;
  onGameActiveChange?: (active: boolean) => void;
}

const Games: React.FC<GamesProps> = ({ 
  user, 
  members, 
  onUpdateMember, 
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
  brickBreakerOverride,
  mahjongOverride,
  isDarkMode,
  onGameActiveChange
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid' | 'mahjong' | 'brickbreaker'>('hub');

  React.useEffect(() => {
    onGameActiveChange?.(activeGame !== 'hub');
    return () => onGameActiveChange?.(false);
  }, [activeGame, onGameActiveChange]);

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';
  const isMaster = user.email === 'ronaldosonic@gmail.com';

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const isGameDay = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // Aberto de Domingo (0) a partir das 12h até Quinta (4).
    // Bloqueado na Sexta (5) e Sábado (6).
    if (day === 0) return hour >= 12;
    return day >= 1 && day <= 4;
  }, [members]); // Recalcular se membros mudarem (ou ao recarregar)

  const cycleStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const start = new Date(now);
    // Se for domingo e ainda não for meio-dia, o ciclo começou no domingo passado às 12h.
    // Caso contrário, o ciclo começou no domingo mais recente às 12h.
    if (day === 0 && hour < 12) {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(now.getDate() - day);
    }
    start.setHours(12, 0, 0, 0);
    return start;
  }, []);

  const parseScoreDate = (dateStr: string): Date | null => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    // Fallback for DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return null;
  };

  const checkPlayedThisWeek = (gameId: string) => {
    if (!currentMember || isAdmin) return false;
    return (currentMember.scores || []).some(s => {
      const d = parseScoreDate(s.date);
      if (!d) return false;
      // Se o score tem gameId, ele DEVE ser igual ao gameId procurado.
      // Se não tem gameId (scores antigos), verificamos se a chave específica existe.
      const matchesGame = s.gameId ? s.gameId === gameId : (s as any)[gameId] !== undefined;
      return d >= cycleStart && matchesGame;
    });
  };

  const quizStatus = useMemo(() => {
    const unlocked = isGameDay || quizOverride || isAdmin;
    if (!currentMember || isAdmin) return { unlocked, alreadyPlayed: false };
    
    const playedDesb = (currentMember.scores || []).some(s => {
      const d = parseScoreDate(s.date);
      if (!d) return false;
      return d >= cycleStart && (s.quizCategory === 'Desbravadores' || (s as any).quizCategory === 'Desbravadores');
    });
    const playedBiblia = (currentMember.scores || []).some(s => {
      const d = parseScoreDate(s.date);
      if (!d) return false;
      return d >= cycleStart && (s.quizCategory === 'Bíblia' || (s as any).quizCategory === 'Bíblia');
    });
    
    return { unlocked, alreadyPlayed: playedDesb && playedBiblia };
  }, [currentMember, cycleStart, isGameDay, quizOverride, isAdmin]);

  const memoryStatus = useMemo(() => {
    const unlocked = isGameDay || memoryOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('memoryGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, memoryOverride, isAdmin]);

  const specialtyStatus = useMemo(() => {
    const unlocked = isGameDay || specialtyOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('specialtyGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, specialtyOverride, isAdmin]);

  const threeCluesStatus = useMemo(() => {
    const unlocked = isGameDay || threeCluesOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('threeCluesGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, threeCluesOverride, isAdmin]);

  const puzzleStatus = useMemo(() => {
    const unlocked = isGameDay || puzzleOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('puzzleGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, puzzleOverride, isAdmin]);

  const knotsStatus = useMemo(() => {
    const unlocked = isGameDay || knotsOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('knotsGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, knotsOverride, isAdmin]);

  const specialtyTrailStatus = useMemo(() => {
    const unlocked = isGameDay || specialtyTrailOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('specialtyTrailGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, specialtyTrailOverride, isAdmin]);

  const scrambledVerseStatus = useMemo(() => {
    const unlocked = isGameDay || scrambledVerseOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('scrambledVerseGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, scrambledVerseOverride, isAdmin]);

  const natureIdStatus = useMemo(() => {
    const unlocked = isGameDay || natureIdOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('natureIdGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, natureIdOverride, isAdmin]);

  const firstAidStatus = useMemo(() => {
    const unlocked = isGameDay || firstAidOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('firstAidGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, firstAidOverride, isAdmin]);

  const brickBreakerStatus = useMemo(() => {
    const unlocked = isGameDay || brickBreakerOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('brickBreakerGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, brickBreakerOverride, isAdmin]);

  const getTimeToUnlock = () => {
    if (isGameDay) return "Disponível!";
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 0 && hour < 12) return "Abre hoje ao meio-dia";
    if (day === 5) return "Abre Domingo ao meio-dia";
    if (day === 6) return "Abre Amanhã ao meio-dia";
    return "Bloqueado";
  };

  const renderActiveGame = () => {
    const gameProps = { user, members, onUpdateMember, onBack: () => setActiveGame('hub') };
    
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
      case 'mahjong': gameComponent = <MahjongGame {...gameProps} override={mahjongOverride} isDarkMode={isDarkMode} />; break;
      case 'brickbreaker': gameComponent = <BrickBreakerGame {...gameProps} override={brickBreakerOverride} isDarkMode={isDarkMode} />; break;
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
    const base = "w-full rounded-3xl font-black flex flex-col items-center justify-center gap-3 transition-all border-2 border-b-4 active:scale-95 px-6 relative overflow-hidden group ";
    
    let height = "h-32";
    if (variant === 'large') height = "h-48 sm:h-full";
    if (variant === 'tall') height = "h-64 sm:h-full";

    const stateStyles = !unlocked 
      ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60 grayscale"
      : played
      ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed grayscale shadow-inner"
      : "bg-white dark:bg-slate-800 border-[#0061f2] dark:border-blue-500 text-[#0061f2] dark:text-blue-400 shadow-lg shadow-blue-500/10 dark:shadow-none hover:bg-blue-50 dark:hover:bg-slate-700 hover:-translate-y-1";

    return `${base} ${height} ${stateStyles}`;
  };

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto animate-in fade-in duration-500 w-full pt-8 landscape:pt-4 pb-24 px-4 sm:px-8 custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 landscape:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[120px] sm:auto-rows-[160px] landscape:auto-rows-[140px]">
          
          {/* DUELO ARENA 1x1 - DESTAQUE */}
          <button 
            onClick={() => setActiveGame('1x1')} 
            className="col-span-2 row-span-1 sm:row-span-2 h-full rounded-[2.5rem] font-black flex flex-col items-center justify-center gap-4 transition-all bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-800 border-b-8 text-white shadow-2xl shadow-blue-500/30 active:scale-95 px-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sword size={120} />
            </div>
            <Sword size={48} className="text-yellow-400 drop-shadow-lg animate-bounce-slow" />
            <div className="flex flex-col items-center text-center leading-tight">
              <span className="uppercase tracking-[0.2em] text-base sm:text-xl">Duelo 1x1 Arena</span>
              <span className="text-[10px] sm:text-xs font-bold opacity-80 lowercase mt-2 bg-black/20 px-3 py-1 rounded-full">Sempre disponível para duelar</span>
            </div>
          </button>

          {/* MAHJONG - MASTER ONLY */}
          {isMaster && (
            <button 
              onClick={() => setActiveGame('mahjong')} 
              className="col-span-1 row-span-1 sm:row-span-2 h-full rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 transition-all bg-slate-800 dark:bg-slate-900 border-slate-950 border-b-8 text-white shadow-2xl active:scale-95 px-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                <Medal size={80} />
              </div>
              <Medal size={32} className="text-amber-400 animate-pulse" />
              <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Mahjong</span>
            </button>
          )}

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
          <div className="col-span-full grid grid-cols-2 landscape:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[120px] sm:auto-rows-[160px] landscape:auto-rows-[140px]">
            {/* QUIZ - DESTAQUE */}
            <button 
              disabled={!quizStatus.unlocked || quizStatus.alreadyPlayed} 
              onClick={() => setActiveGame('quiz')} 
              className={`${getButtonStyles(quizStatus.unlocked, quizStatus.alreadyPlayed, 'large')} col-span-2 sm:col-span-1 row-span-2 sm:row-span-2`}
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                {quizStatus.alreadyPlayed ? <CheckCircle2 size={32} className="text-green-500" /> : <Brain size={32} />}
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="uppercase tracking-widest text-xs sm:text-sm">Quiz</span>
                <span className="text-[9px] font-bold opacity-60 mt-1 max-w-[120px]">
                  {quizStatus.alreadyPlayed ? 'Concluído' : 'Teste seus conhecimentos'}
                </span>
              </div>
            </button>

            {/* TRÊS DICAS */}
            <button 
              disabled={!threeCluesStatus.unlocked || threeCluesStatus.alreadyPlayed} 
              onClick={() => setActiveGame('threeclues')} 
              className={`${getButtonStyles(threeCluesStatus.unlocked, threeCluesStatus.alreadyPlayed)} row-span-1`}
            >
              {threeCluesStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HelpCircle size={24} />}
              <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Três Dicas</span>
            </button>

            {/* ESPECIALIDADE */}
            <button 
              disabled={!specialtyStatus.unlocked || specialtyStatus.alreadyPlayed} 
              onClick={() => setActiveGame('specialty')} 
              className={`${getButtonStyles(specialtyStatus.unlocked, specialtyStatus.alreadyPlayed)} row-span-1`}
            >
              {specialtyStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Medal size={24} />}
              <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Especialidade</span>
            </button>

          {/* MEMÓRIA */}
          <button 
            disabled={!memoryStatus.unlocked || memoryStatus.alreadyPlayed} 
            onClick={() => setActiveGame('memory')} 
            className={`${getButtonStyles(memoryStatus.unlocked, memoryStatus.alreadyPlayed)} row-span-1`}
          >
            {memoryStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Memória</span>
          </button>

          {/* QUEBRA-CABEÇA */}
          <button 
            disabled={!puzzleStatus.unlocked || puzzleStatus.alreadyPlayed} 
            onClick={() => setActiveGame('puzzle')} 
            className={`${getButtonStyles(puzzleStatus.unlocked, puzzleStatus.alreadyPlayed)} row-span-1`}
          >
            {puzzleStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Shuffle size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Puzzle</span>
          </button>

          {/* NÓS */}
          <button 
            disabled={!knotsStatus.unlocked || knotsStatus.alreadyPlayed} 
            onClick={() => setActiveGame('knots')} 
            className={`${getButtonStyles(knotsStatus.unlocked, knotsStatus.alreadyPlayed)} row-span-1`}
          >
            {knotsStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Anchor size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Nós</span>
          </button>

          {/* TRILHA */}
          <button 
            disabled={!specialtyTrailStatus.unlocked || specialtyTrailStatus.alreadyPlayed} 
            onClick={() => setActiveGame('specialtytrail')} 
            className={`${getButtonStyles(specialtyTrailStatus.unlocked, specialtyTrailStatus.alreadyPlayed)} row-span-1`}
          >
            {specialtyTrailStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Map size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Trilha</span>
          </button>

          {/* VERSÍCULO */}
          <button 
            disabled={!scrambledVerseStatus.unlocked || scrambledVerseStatus.alreadyPlayed} 
            onClick={() => setActiveGame('scrambledverse')} 
            className={`${getButtonStyles(scrambledVerseStatus.unlocked, scrambledVerseStatus.alreadyPlayed)} row-span-1`}
          >
            {scrambledVerseStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Type size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Versículo</span>
          </button>

          {/* NATUREZA */}
          <button 
            disabled={!natureIdStatus.unlocked || natureIdStatus.alreadyPlayed} 
            onClick={() => setActiveGame('natureid')} 
            className={`${getButtonStyles(natureIdStatus.unlocked, natureIdStatus.alreadyPlayed)} row-span-1`}
          >
            {natureIdStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Leaf size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Natureza</span>
          </button>

          {/* SOCORROS */}
          <button 
            disabled={!firstAidStatus.unlocked || firstAidStatus.alreadyPlayed} 
            onClick={() => setActiveGame('firstaid')} 
            className={`${getButtonStyles(firstAidStatus.unlocked, firstAidStatus.alreadyPlayed)} row-span-1`}
          >
            {firstAidStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HeartPulse size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Socorros</span>
          </button>

          {/* BLOCOS */}
          <button 
            disabled={!brickBreakerStatus.unlocked || brickBreakerStatus.alreadyPlayed} 
            onClick={() => setActiveGame('brickbreaker')} 
            className={`${getButtonStyles(brickBreakerStatus.unlocked, brickBreakerStatus.alreadyPlayed)} row-span-1`}
          >
            {brickBreakerStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
            <span className="uppercase tracking-widest text-[10px] sm:text-xs text-center">Blocos</span>
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
