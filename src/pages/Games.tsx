
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, HelpCircle, Shuffle, Anchor, User, Map, Type, Leaf, HeartPulse } from 'lucide-react';
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
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'whoami' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid'>('hub');

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const todayStr = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);
  const isSunday = useMemo(() => new Date().getDay() === 0, []);

  const quizStatus = useMemo(() => {
    const unlocked = isSunday || quizOverride;
    if (!currentMember) return { unlocked, alreadyPlayed: false };
    const playedDesb = currentMember.scores.some(s => s.date === todayStr && s.quizCategory === 'Desbravadores');
    const playedBiblia = currentMember.scores.some(s => s.date === todayStr && s.quizCategory === 'Bíblia');
    return { unlocked, alreadyPlayed: playedDesb && playedBiblia };
  }, [currentMember, todayStr, isSunday, quizOverride]);

  const memoryStatus = useMemo(() => {
    const unlocked = isSunday || memoryOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.memoryGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, memoryOverride]);

  const specialtyStatus = useMemo(() => {
    const unlocked = isSunday || specialtyOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.specialtyGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, specialtyOverride]);

  const threeCluesStatus = useMemo(() => {
    const unlocked = isSunday || threeCluesOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.threeCluesGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, threeCluesOverride]);

  const puzzleStatus = useMemo(() => {
    const unlocked = isSunday || puzzleOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.puzzleGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, puzzleOverride, isAdmin]);

  const knotsStatus = useMemo(() => {
    const unlocked = isSunday || knotsOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).knotsGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, knotsOverride, isAdmin]);

  const whoAmIStatus = useMemo(() => {
    const unlocked = isSunday || whoAmIOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).whoAmIGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, whoAmIOverride, isAdmin]);

  const specialtyTrailStatus = useMemo(() => {
    const unlocked = isSunday || specialtyTrailOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).specialtyTrailGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, specialtyTrailOverride, isAdmin]);

  const scrambledVerseStatus = useMemo(() => {
    const unlocked = isSunday || scrambledVerseOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).scrambledVerseGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, scrambledVerseOverride, isAdmin]);

  const natureIdStatus = useMemo(() => {
    const unlocked = isSunday || natureIdOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).natureIdGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, natureIdOverride, isAdmin]);

  const firstAidStatus = useMemo(() => {
    const unlocked = isSunday || firstAidOverride || isAdmin;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && (s as any).firstAidGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, firstAidOverride, isAdmin]);

  const getTimeToUnlock = () => {
    if (isSunday) return "Disponível Hoje!";
    const now = new Date();
    const day = now.getDay();
    const daysLeft = 7 - day;
    return daysLeft === 1 ? "Abre Amanhã (00:00)" : `Abre em ${daysLeft} dias`;
  };

  if (activeGame === 'quiz') return <QuizSelection user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} quizOverride={quizOverride} />;
  if (activeGame === 'memory') return <MemoryGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} memoryOverride={memoryOverride} />;
  if (activeGame === 'specialty') return <SpecialtyGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} specialtyOverride={specialtyOverride} />;
  if (activeGame === '1x1') return <Challenge1x1Page user={user} members={members} onBack={() => setActiveGame('hub')} onUpdateMember={onUpdateMember} />;
  if (activeGame === 'threeclues') return <ThreeCluesGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={threeCluesOverride} />;
  if (activeGame === 'puzzle') return <PuzzleGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} puzzleOverride={puzzleOverride} />;
  if (activeGame === 'knots') return <KnotsGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={knotsOverride} />;
  if (activeGame === 'whoami') return <WhoAmIGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={whoAmIOverride} />;
  if (activeGame === 'specialtytrail') return <SpecialtyTrailGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={specialtyTrailOverride} />;
  if (activeGame === 'scrambledverse') return <ScrambledVerseGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={scrambledVerseOverride} />;
  if (activeGame === 'natureid') return <NatureIdGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={natureIdOverride} />;
  if (activeGame === 'firstaid') return <FirstAidGame user={user} members={members} onUpdateMember={onUpdateMember} onBack={() => setActiveGame('hub')} override={firstAidOverride} />;

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

        {/* SEPARADOR COM CONTAGEM ABAIXO */}
        <div className="relative pt-6 pb-2 text-center">
          <div className="absolute inset-x-0 top-1/2 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex flex-col items-center justify-center">
            <span className="bg-slate-50 dark:bg-[#0f172a] px-4 text-slate-900 dark:text-slate-100 font-black text-[11px] uppercase tracking-[0.2em]">Desafios de Domingo</span>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#0f172a] px-3">
              <Calendar size={11} />
              <span className="text-[9px] font-black uppercase tracking-widest">{getTimeToUnlock()}</span>
            </div>
          </div>
        </div>

        {/* QUIZ */}
        <button disabled={!quizStatus.unlocked || quizStatus.alreadyPlayed} onClick={() => setActiveGame('quiz')} className={getButtonStyles(quizStatus.unlocked, quizStatus.alreadyPlayed)}>
          {quizStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Brain size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Desafio do Quiz</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{quizStatus.alreadyPlayed ? 'Concluído hoje' : !quizStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Teste seus conhecimentos'}</span></div>
        </button>

        {/* TRÊS DICAS */}
        <button disabled={!threeCluesStatus.unlocked || threeCluesStatus.alreadyPlayed} onClick={() => setActiveGame('threeclues')} className={getButtonStyles(threeCluesStatus.unlocked, threeCluesStatus.alreadyPlayed)}>
          {threeCluesStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HelpCircle size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Três Dicas</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{threeCluesStatus.alreadyPlayed ? 'Concluído hoje' : !threeCluesStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Adivinhe o segredo'}</span></div>
        </button>

        {/* ESPECIALIDADE */}
        <button disabled={!specialtyStatus.unlocked || specialtyStatus.alreadyPlayed} onClick={() => setActiveGame('specialty')} className={getButtonStyles(specialtyStatus.unlocked, specialtyStatus.alreadyPlayed)}>
          {specialtyStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Medal size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Qual a Especialidade?</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{specialtyStatus.alreadyPlayed ? 'Concluído hoje' : !specialtyStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Acerte o brasão'}</span></div>
        </button>

        {/* MEMÓRIA */}
        <button disabled={!memoryStatus.unlocked || memoryStatus.alreadyPlayed} onClick={() => setActiveGame('memory')} className={getButtonStyles(memoryStatus.unlocked, memoryStatus.alreadyPlayed)}>
          {memoryStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Jogo da Memória</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{memoryStatus.alreadyPlayed ? 'Concluído hoje' : !memoryStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Mostre sua agilidade'}</span></div>
        </button>

        {/* QUEBRA-CABEÇA */}
        <button disabled={!puzzleStatus.unlocked || puzzleStatus.alreadyPlayed} onClick={() => setActiveGame('puzzle')} className={getButtonStyles(puzzleStatus.unlocked, puzzleStatus.alreadyPlayed)}>
          {puzzleStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Shuffle size={24} />}
          <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Quebra-Cabeça</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{puzzleStatus.alreadyPlayed ? 'Concluído hoje' : !puzzleStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Descubra a imagem'}</span></div>
        </button>

        {/* NOVOS JOGOS (VISÍVEIS SE LIBERADOS OU SE FOR ADMIN) */}
        {(knotsStatus.unlocked || isAdmin) && (
          <button disabled={!knotsStatus.unlocked || knotsStatus.alreadyPlayed} onClick={() => setActiveGame('knots')} className={getButtonStyles(knotsStatus.unlocked, knotsStatus.alreadyPlayed)}>
            {knotsStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Anchor size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Desafio dos Nós</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{knotsStatus.alreadyPlayed ? 'Concluído hoje' : !knotsStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Domine as cordas'}</span></div>
          </button>
        )}

        {(whoAmIStatus.unlocked || isAdmin) && (
          <button disabled={!whoAmIStatus.unlocked || whoAmIStatus.alreadyPlayed} onClick={() => setActiveGame('whoami')} className={getButtonStyles(whoAmIStatus.unlocked, whoAmIStatus.alreadyPlayed)}>
            {whoAmIStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <User size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Quem Sou Eu?</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{whoAmIStatus.alreadyPlayed ? 'Concluído hoje' : !whoAmIStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Personagens Bíblicos'}</span></div>
          </button>
        )}

        {(specialtyTrailStatus.unlocked || isAdmin) && (
          <button disabled={!specialtyTrailStatus.unlocked || specialtyTrailStatus.alreadyPlayed} onClick={() => setActiveGame('specialtytrail')} className={getButtonStyles(specialtyTrailStatus.unlocked, specialtyTrailStatus.alreadyPlayed)}>
            {specialtyTrailStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Map size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Trilha das Especialidades</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{specialtyTrailStatus.alreadyPlayed ? 'Concluído hoje' : !specialtyTrailStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Aventure-se no conhecimento'}</span></div>
          </button>
        )}

        {(scrambledVerseStatus.unlocked || isAdmin) && (
          <button disabled={!scrambledVerseStatus.unlocked || scrambledVerseStatus.alreadyPlayed} onClick={() => setActiveGame('scrambledverse')} className={getButtonStyles(scrambledVerseStatus.unlocked, scrambledVerseStatus.alreadyPlayed)}>
            {scrambledVerseStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Type size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Versículo Embaralhado</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{scrambledVerseStatus.alreadyPlayed ? 'Concluído hoje' : !scrambledVerseStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Memorize a palavra'}</span></div>
          </button>
        )}

        {(natureIdStatus.unlocked || isAdmin) && (
          <button disabled={!natureIdStatus.unlocked || natureIdStatus.alreadyPlayed} onClick={() => setActiveGame('natureid')} className={getButtonStyles(natureIdStatus.unlocked, natureIdStatus.alreadyPlayed)}>
            {natureIdStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Leaf size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Identificação de Natureza</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{natureIdStatus.alreadyPlayed ? 'Concluído hoje' : !natureIdStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Conheça a criação'}</span></div>
          </button>
        )}

        {(firstAidStatus.unlocked || isAdmin) && (
          <button disabled={!firstAidStatus.unlocked || firstAidStatus.alreadyPlayed} onClick={() => setActiveGame('firstaid')} className={getButtonStyles(firstAidStatus.unlocked, firstAidStatus.alreadyPlayed)}>
            {firstAidStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HeartPulse size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Primeiros Socorros</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{firstAidStatus.alreadyPlayed ? 'Concluído hoje' : !firstAidStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Saiba como ajudar'}</span></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Games;
