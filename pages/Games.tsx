
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal, Sword, CheckCircle2, Calendar, Zap, Infinity, HelpCircle } from 'lucide-react';
import { AuthUser, Member, UserRole } from '../types';
import QuizSelection from './QuizSelection';
import MemoryGame from './MemoryGame';
import SpecialtyGame from './SpecialtyGame';
import Challenge1x1Page from './Challenge1x1';
import ThreeCluesGame from './ThreeCluesGame';

interface GamesProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  quizOverride: boolean;
  memoryOverride: boolean;
  specialtyOverride: boolean;
  threeCluesOverride: boolean;
}

const Games: React.FC<GamesProps> = ({ 
  user, 
  members, 
  onUpdateMember, 
  quizOverride, 
  memoryOverride, 
  specialtyOverride,
  threeCluesOverride
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues'>('hub');

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const todayStr = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);
  const isSunday = useMemo(() => new Date().getDay() === 0, []);

  // 1. Lógica do QUIZ
  const quizStatus = useMemo(() => {
    const unlocked = isSunday || quizOverride;
    if (!currentMember) return { unlocked, alreadyPlayed: false };
    const playedDesb = currentMember.scores.some(s => s.date === todayStr && s.quizCategory === 'Desbravadores');
    const playedBiblia = currentMember.scores.some(s => s.date === todayStr && s.quizCategory === 'Bíblia');
    return { unlocked, alreadyPlayed: playedDesb && playedBiblia };
  }, [currentMember, todayStr, isSunday, quizOverride]);

  // 2. Lógica da MEMÓRIA
  const memoryStatus = useMemo(() => {
    const unlocked = isSunday || memoryOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.memoryGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, memoryOverride]);

  // 3. Lógica da ESPECIALIDADE
  const specialtyStatus = useMemo(() => {
    const unlocked = isSunday || specialtyOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.specialtyGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, specialtyOverride]);

  // 4. Lógica TRÊS DICAS
  const threeCluesStatus = useMemo(() => {
    const unlocked = isSunday || threeCluesOverride;
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.threeCluesGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [currentMember, todayStr, isSunday, threeCluesOverride]);

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

  const getButtonStyles = (unlocked: boolean, played: boolean) => {
    const base = "w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all border-2 border-b-4 active:scale-95 px-6 relative overflow-hidden ";
    if (!unlocked) return base + "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-60 grayscale";
    if (played) return base + "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed grayscale shadow-inner";
    return base + "bg-white border-[#0061f2] text-[#0061f2] shadow-lg shadow-blue-500/10 hover:bg-blue-50";
  };

  return (
    <div className="flex flex-col items-center justify-start h-full animate-in fade-in duration-500 max-w-sm mx-auto pt-4 pb-10 px-4">
      <div className="mb-6 text-[#0061f2] bg-blue-50 p-6 rounded-[2.5rem] shadow-inner"><Gamepad2 size={64} strokeWidth={1.5} /></div>
      <div className="text-center mb-8">
        <h2 className="text-[#001f3f] text-2xl font-black tracking-tight uppercase">Central de Jogos</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-400"><Calendar size={12} /><span className="text-[10px] font-black uppercase tracking-widest">{getTimeToUnlock()}</span></div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {/* QUIZ */}
        <div className="relative w-full">
          <button disabled={!quizStatus.unlocked || quizStatus.alreadyPlayed} onClick={() => setActiveGame('quiz')} className={getButtonStyles(quizStatus.unlocked, quizStatus.alreadyPlayed)}>
            {quizStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Brain size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Desafio do Quiz</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{quizStatus.alreadyPlayed ? 'Concluído hoje' : !quizStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Teste seus conhecimentos'}</span></div>
          </button>
        </div>

        {/* TRÊS DICAS */}
        <div className="relative w-full">
          <button disabled={!threeCluesStatus.unlocked || threeCluesStatus.alreadyPlayed} onClick={() => setActiveGame('threeclues')} className={getButtonStyles(threeCluesStatus.unlocked, threeCluesStatus.alreadyPlayed)}>
            {threeCluesStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <HelpCircle size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Três Dicas</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{threeCluesStatus.alreadyPlayed ? 'Concluído hoje' : !threeCluesStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Adivinhe o segredo'}</span></div>
          </button>
        </div>

        {/* ESPECIALIDADE */}
        <div className="relative w-full">
          <button disabled={!specialtyStatus.unlocked || specialtyStatus.alreadyPlayed} onClick={() => setActiveGame('specialty')} className={getButtonStyles(specialtyStatus.unlocked, specialtyStatus.alreadyPlayed)}>
            {specialtyStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Medal size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Qual a Especialidade?</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{specialtyStatus.alreadyPlayed ? 'Concluído hoje' : !specialtyStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Acerte o brasão'}</span></div>
          </button>
        </div>

        {/* MEMÓRIA */}
        <div className="relative w-full">
          <button disabled={!memoryStatus.unlocked || memoryStatus.alreadyPlayed} onClick={() => setActiveGame('memory')} className={getButtonStyles(memoryStatus.unlocked, memoryStatus.alreadyPlayed)}>
            {memoryStatus.alreadyPlayed ? <CheckCircle2 size={24} className="text-green-500" /> : <Gamepad2 size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Jogo da Memória</span><span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">{memoryStatus.alreadyPlayed ? 'Concluído hoje' : !memoryStatus.unlocked ? 'Bloqueado (Abre Domingo)' : 'Mostre sua agilidade'}</span></div>
          </button>
        </div>

        <div className="relative py-4"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200"></div></div><div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-slate-50 px-4 text-slate-400 tracking-[0.3em]">Treinamento Livre</span></div></div>

        {/* ARENA 1x1 */}
        <div className="relative w-full">
          <button onClick={() => setActiveGame('1x1')} className="w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all bg-blue-600 border-blue-800 border-b-4 text-white shadow-xl shadow-blue-500/20 active:scale-95 px-6">
            <Sword size={28} className="text-yellow-400 shrink-0" />
            <div className="flex flex-col items-start leading-tight min-w-0"><span className="uppercase tracking-widest text-sm truncate w-full">Duelo 1x1 Arena</span><span className="text-[10px] font-bold opacity-80 lowercase mt-0.5 truncate w-full">Sempre disponível para duelar</span></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Games;
