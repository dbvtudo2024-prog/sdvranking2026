
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, HelpCircle, Shuffle, Anchor, User, Map, Type, Leaf, HeartPulse, X, Music } from 'lucide-react';
import { AuthUser, Member, UserRole, Score } from '@/types';
import QuizSelection from '@/pages/QuizSelection';
import MemoryGame from '@/pages/MemoryGame';
import SpecialtyGame from '@/pages/SpecialtyGame';
import Challenge1x1Page from '@/pages/Challenge1x1';
import ThreeCluesGame from '@/pages/ThreeCluesGame';
import PuzzleGame from '@/pages/PuzzleGame';
import KnotsGame from '@/pages/KnotsGame';
import WhoAmIGame from '@/pages/WhoAmIGame';
import SpecialtyTrailGame from '@/pages/SpecialtyTrailGame';
import ScrambledVerseGame from '@/pages/ScrambledVerseGame';
import NatureIdGame from '@/pages/NatureIdGame';
import FirstAidGame from '@/pages/FirstAidGame';
import PianoTilesGame from '@/pages/PianoTilesGame';
import MahjongGame from '@/pages/MahjongGame';
import BallSortGame from '@/pages/BallSortGame';
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
  whoAmIOverride: boolean;
  specialtyTrailOverride: boolean;
  scrambledVerseOverride: boolean;
  natureIdOverride: boolean;
  firstAidOverride: boolean;
  isDarkMode?: boolean;
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
  whoAmIOverride,
  specialtyTrailOverride,
  scrambledVerseOverride,
  natureIdOverride,
  firstAidOverride,
  isDarkMode
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'whoami' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid' | 'pianotiles' | 'mahjong' | 'ballsort' | 'brickbreaker'>('hub');

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';
  const isMaster = user.email === 'ronaldosonic@gmail.com';

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const isGameDay = useMemo(() => {
    const day = new Date().getDay();
    // Aberto de Sábado (6) até Quinta (4).
    // Bloqueado na Sexta (5).
    return day !== 5;
  }, []);

  const cycleStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // O ciclo começa no sábado (6).
    // Dias desde o último sábado:
    // Sáb: 0, Dom: 1, Seg: 2, Ter: 3, Qua: 4, Qui: 5, Sex: 6
    const diff = (day + 1) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const checkPlayedThisWeek = (gameId: string) => {
    if (!currentMember || isAdmin) return false;
    return (currentMember.scores || []).some(s => {
      const scoreDate = new Date(s.date);
      if (isNaN(scoreDate.getTime())) {
        // Fallback for old date format DD/MM/YYYY
        const parts = s.date.split('/');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          return d >= cycleStart && (s.gameId === gameId || (s as any)[gameId] !== undefined);
        }
        return false;
      }
      return scoreDate >= cycleStart && (s.gameId === gameId || (s as any)[gameId] !== undefined);
    });
  };

  const quizStatus = useMemo(() => {
    const unlocked = isGameDay || quizOverride || isAdmin;
    if (!currentMember) return { unlocked, alreadyPlayed: false };
    
    const playedDesb = (currentMember.scores || []).some(s => {
      const scoreDate = new Date(s.date);
      const d = isNaN(scoreDate.getTime()) ? new Date(s.date.split('/').reverse().join('-')) : scoreDate;
      return d >= cycleStart && (s.quizCategory === 'Desbravadores' || (s as any).quizCategory === 'Desbravadores');
    });
    const playedBiblia = (currentMember.scores || []).some(s => {
      const scoreDate = new Date(s.date);
      const d = isNaN(scoreDate.getTime()) ? new Date(s.date.split('/').reverse().join('-')) : scoreDate;
      return d >= cycleStart && (s.quizCategory === 'Bíblia' || (s as any).quizCategory === 'Bíblia');
    });
    
    return { unlocked, alreadyPlayed: playedDesb && playedBiblia && !isAdmin };
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

  const whoAmIStatus = useMemo(() => {
    const unlocked = isGameDay || whoAmIOverride || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('whoAmIGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, whoAmIOverride, isAdmin]);

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

  const ballSortStatus = useMemo(() => {
    const unlocked = isGameDay || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('ballSortGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, isAdmin]);

  const brickBreakerStatus = useMemo(() => {
    const unlocked = isGameDay || isAdmin;
    const alreadyPlayed = checkPlayedThisWeek('brickBreakerGame');
    return { unlocked, alreadyPlayed };
  }, [currentMember, cycleStart, isGameDay, isAdmin]);

  const getTimeToUnlock = () => {
    if (isGameDay) return "Disponível!";
    return "Abre Amanhã (Sábado)";
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
      case 'whoami': gameComponent = <WhoAmIGame {...gameProps} override={whoAmIOverride} />; break;
      case 'specialtytrail': gameComponent = <SpecialtyTrailGame {...gameProps} override={specialtyTrailOverride} />; break;
      case 'scrambledverse': gameComponent = <ScrambledVerseGame {...gameProps} override={scrambledVerseOverride} />; break;
      case 'natureid': gameComponent = <NatureIdGame {...gameProps} override={natureIdOverride} />; break;
      case 'firstaid': gameComponent = <FirstAidGame {...gameProps} override={firstAidOverride} />; break;
      case 'pianotiles': gameComponent = <PianoTilesGame {...gameProps} />; break;
      case 'mahjong': gameComponent = <MahjongGame {...gameProps} isDarkMode={isDarkMode} />; break;
      case 'ballsort': gameComponent = <BallSortGame {...gameProps} override={isAdmin} isDarkMode={isDarkMode} />; break;
      case 'brickbreaker': gameComponent = <BrickBreakerGame {...gameProps} override={isAdmin} isDarkMode={isDarkMode} />; break;
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
        case 'whoami': return 'Quem Sou Eu?';
        case 'specialtytrail': return 'Trilha de Especialidades';
        case 'scrambledverse': return 'Versículo Embaralhado';
        case 'natureid': return 'Identificação de Natureza';
        case 'firstaid': return 'Primeiros Socorros';
        case 'pianotiles': return 'Piano Tiles';
        case 'mahjong': return 'Mahjong Desbravador';
        case 'ballsort': return 'Organizar Cores';
        case 'brickbreaker': return 'Destruir Blocos';
        default: return 'Jogo';
      }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-[#0f172a] flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 shrink-0 bg-[#0061f2] text-white flex items-center justify-between px-6 shadow-lg z-10">
          <div className="flex items-center gap-3">
            <Gamepad2 size={24} className="text-yellow-400" />
            <h2 className="font-black uppercase tracking-tight text-sm">{getGameName(activeGame)}</h2>
          </div>
          <button 
            onClick={() => setActiveGame('hub')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90 flex items-center justify-center"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {gameComponent}
        </div>
      </div>
    );
  };

  if (activeGame !== 'hub') return renderActiveGame();

  const getButtonStyles = (unlocked: boolean, played: boolean) => {
    const base = "w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all border-2 border-b-4 active:scale-95 px-6 relative overflow-hidden ";
    if (!unlocked) return base + "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60 grayscale";
    if (played) return base + "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed grayscale shadow-inner";
    return base + "bg-white dark:bg-slate-800 border-[#0061f2] dark:border-blue-500 text-[#0061f2] dark:text-blue-400 shadow-lg shadow-blue-500/10 dark:shadow-none hover:bg-blue-50 dark:hover:bg-slate-700";
  };

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto animate-in fade-in duration-500 max-w-sm mx-auto pt-8 pb-24 px-4 custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
      <div className="flex flex-col gap-4 w-full">
        {/* DUELO ARENA 1x1 NO TOPO */}
        <button onClick={() => setActiveGame('1x1')} className="w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all bg-blue-600 dark:bg-blue-700 border-blue-800 dark:border-blue-900 border-b-4 text-white shadow-xl shadow-blue-500/20 dark:shadow-none active:scale-95 px-6 shrink-0">
          <Sword size={28} className="text-yellow-400 shrink-0" />
          <div className="flex flex-col items-start leading-tight min-w-0">
            <span className="uppercase tracking-widest text-sm truncate w-full">Duelo 1x1 Arena</span>
            <span className="text-[10px] font-bold opacity-80 lowercase mt-0.5 truncate w-full">Sempre disponível para duelar</span>
          </div>
        </button>

        {isMaster && (
          <button onClick={() => setActiveGame('pianotiles')} className="w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all bg-slate-800 dark:bg-slate-900 border-slate-950 border-b-4 text-white shadow-xl active:scale-95 px-6 shrink-0">
            <Music size={28} className="text-blue-400 shrink-0" />
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="uppercase tracking-widest text-sm truncate w-full">Piano Tiles</span>
              <span className="text-[10px] font-bold opacity-80 lowercase mt-0.5 truncate w-full">Exclusivo Admin</span>
            </div>
          </button>
        )}

        {isMaster && (
          <button onClick={() => setActiveGame('mahjong')} className="w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all bg-slate-800 dark:bg-slate-900 border-slate-950 border-b-4 text-white shadow-xl active:scale-95 px-6 shrink-0">
            <Medal size={28} className="text-amber-400 shrink-0" />
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="uppercase tracking-widest text-sm truncate w-full">Mahjong Solitaire</span>
              <span className="text-[10px] font-bold opacity-80 lowercase mt-0.5 truncate w-full">Exclusivo Master</span>
            </div>
          </button>
        )}

        {/* SEPARADOR COM CONTAGEM ABAIXO */}
        <div className="relative pt-6 pb-2 text-center">
          <div className="absolute inset-x-0 top-1/2 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex flex-col items-center justify-center">
            <span className="bg-slate-50 dark:bg-[#0f172a] px-4 text-slate-900 dark:text-slate-100 font-black text-[11px] uppercase tracking-[0.2em]">Desafios Semanais</span>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#0f172a] px-3">
              <Calendar size={11} />
              <span className="text-[9px] font-black uppercase tracking-widest">{getTimeToUnlock()}</span>
            </div>
          </div>
        </div>

        {/* QUIZ */}
        <button disabled={!quizStatus.unlocked || quizStatus.alreadyPlayed} onClick={() => setActiveGame('quiz')} className={getButtonStyles(quizStatus.unlocked, quizStatus.alreadyPlayed)}>
          {quizStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Brain size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Desafio do Quiz</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{quizStatus.alreadyPlayed ? 'Concluído esta semana' : !quizStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Teste seus conhecimentos'}</span></div>
        </button>

        {/* TRÊS DICAS */}
        <button disabled={!threeCluesStatus.unlocked || threeCluesStatus.alreadyPlayed} onClick={() => setActiveGame('threeclues')} className={getButtonStyles(threeCluesStatus.unlocked, threeCluesStatus.alreadyPlayed)}>
          {threeCluesStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HelpCircle size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Três Dicas</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{threeCluesStatus.alreadyPlayed ? 'Concluído esta semana' : !threeCluesStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Adivinhe o segredo'}</span></div>
        </button>

        {/* ESPECIALIDADE */}
        <button disabled={!specialtyStatus.unlocked || specialtyStatus.alreadyPlayed} onClick={() => setActiveGame('specialty')} className={getButtonStyles(specialtyStatus.unlocked, specialtyStatus.alreadyPlayed)}>
          {specialtyStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Medal size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Qual a Especialidade?</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{specialtyStatus.alreadyPlayed ? 'Concluído esta semana' : !specialtyStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Acerte o brasão'}</span></div>
        </button>

        {/* MEMÓRIA */}
        <button disabled={!memoryStatus.unlocked || memoryStatus.alreadyPlayed} onClick={() => setActiveGame('memory')} className={getButtonStyles(memoryStatus.unlocked, memoryStatus.alreadyPlayed)}>
          {memoryStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Jogo da Memória</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{memoryStatus.alreadyPlayed ? 'Concluído esta semana' : !memoryStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Mostre sua agilidade'}</span></div>
        </button>

        {/* QUEBRA-CABEÇA */}
        <button disabled={!puzzleStatus.unlocked || puzzleStatus.alreadyPlayed} onClick={() => setActiveGame('puzzle')} className={getButtonStyles(puzzleStatus.unlocked, puzzleStatus.alreadyPlayed)}>
          {puzzleStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Shuffle size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Quebra-Cabeça</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{puzzleStatus.alreadyPlayed ? 'Concluído esta semana' : !puzzleStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Descubra a imagem'}</span></div>
        </button>

        {/* NOVOS JOGOS */}
        <button disabled={!knotsStatus.unlocked || knotsStatus.alreadyPlayed} onClick={() => setActiveGame('knots')} className={getButtonStyles(knotsStatus.unlocked, knotsStatus.alreadyPlayed)}>
          {knotsStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Anchor size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Desafio dos Nós</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{knotsStatus.alreadyPlayed ? 'Concluído esta semana' : !knotsStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Domine as cordas'}</span></div>
        </button>

        <button disabled={!whoAmIStatus.unlocked || whoAmIStatus.alreadyPlayed} onClick={() => setActiveGame('whoami')} className={getButtonStyles(whoAmIStatus.unlocked, whoAmIStatus.alreadyPlayed)}>
          {whoAmIStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <User size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Quem Sou Eu?</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{whoAmIStatus.alreadyPlayed ? 'Concluído esta semana' : !whoAmIStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Personagens Bíblicos'}</span></div>
        </button>

        <button disabled={!specialtyTrailStatus.unlocked || specialtyTrailStatus.alreadyPlayed} onClick={() => setActiveGame('specialtytrail')} className={getButtonStyles(specialtyTrailStatus.unlocked, specialtyTrailStatus.alreadyPlayed)}>
          {specialtyTrailStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Map size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Trilha das Especialidades</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{specialtyTrailStatus.alreadyPlayed ? 'Concluído esta semana' : !specialtyTrailStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Aventure-se no conhecimento'}</span></div>
        </button>

        <button disabled={!scrambledVerseStatus.unlocked || scrambledVerseStatus.alreadyPlayed} onClick={() => setActiveGame('scrambledverse')} className={getButtonStyles(scrambledVerseStatus.unlocked, scrambledVerseStatus.alreadyPlayed)}>
          {scrambledVerseStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Type size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Versículo Embaralhado</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{scrambledVerseStatus.alreadyPlayed ? 'Concluído esta semana' : !scrambledVerseStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Memorize a palavra'}</span></div>
        </button>

        <button disabled={!natureIdStatus.unlocked || natureIdStatus.alreadyPlayed} onClick={() => setActiveGame('natureid')} className={getButtonStyles(natureIdStatus.unlocked, natureIdStatus.alreadyPlayed)}>
          {natureIdStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Leaf size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Identificação de Natureza</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{natureIdStatus.alreadyPlayed ? 'Concluído esta semana' : !natureIdStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Conheça a criação'}</span></div>
        </button>

        <button disabled={!firstAidStatus.unlocked || firstAidStatus.alreadyPlayed} onClick={() => setActiveGame('firstaid')} className={getButtonStyles(firstAidStatus.unlocked, firstAidStatus.alreadyPlayed)}>
          {firstAidStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HeartPulse size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Primeiros Socorros</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{firstAidStatus.alreadyPlayed ? 'Concluído esta semana' : !firstAidStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Saiba como ajudar'}</span></div>
        </button>

        <button disabled={!ballSortStatus.unlocked || ballSortStatus.alreadyPlayed} onClick={() => setActiveGame('ballsort')} className={getButtonStyles(ballSortStatus.unlocked, ballSortStatus.alreadyPlayed)}>
          {ballSortStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Shuffle size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Organizar Cores</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{ballSortStatus.alreadyPlayed ? 'Concluído esta semana' : !ballSortStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Desafio de lógica'}</span></div>
        </button>

        <button disabled={!brickBreakerStatus.unlocked || brickBreakerStatus.alreadyPlayed} onClick={() => setActiveGame('brickbreaker')} className={getButtonStyles(brickBreakerStatus.unlocked, brickBreakerStatus.alreadyPlayed)}>
          {brickBreakerStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Destruir Blocos</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{brickBreakerStatus.alreadyPlayed ? 'Concluído esta semana' : !brickBreakerStatus.unlocked ? 'Bloqueado (Abre Sábado)' : 'Clássico arcade'}</span></div>
        </button>

        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-2">
          <Lock size={24} className="text-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Novos jogos em breve</p>
          <p className="text-[9px] font-bold text-slate-400/60 lowercase">Estamos preparando novos desafios para você!</p>
        </div>

      </div>
    </div>
  );
};

export default Games;
