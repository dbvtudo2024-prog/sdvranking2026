
import React, { useMemo, useState } from 'react';
import { Gamepad2, Brain, Lock, Medal } from 'lucide-react';
import { AuthUser, Member, UserRole } from '../types';
import QuizSelection from './QuizSelection';
import MemoryGame from './MemoryGame';
import SpecialtyGame from './SpecialtyGame';

interface GamesProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  quizOverride: boolean;
  memoryOverride: boolean;
  specialtyOverride: boolean;
}

const Games: React.FC<GamesProps> = ({ 
  user, 
  members, 
  onUpdateMember, 
  quizOverride, 
  memoryOverride, 
  specialtyOverride 
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'quiz' | 'memory' | 'specialty'>('hub');

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.id, user.name]);

  const memoryStatus = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isLeadership = user.role === UserRole.LEADERSHIP;
    const unlocked = isSunday || memoryOverride || isLeadership;
    const todayStr = now.toLocaleDateString('pt-BR');
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.memoryGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [memoryOverride, currentMember, user.role]);

  const specialtyStatus = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isLeadership = user.role === UserRole.LEADERSHIP;
    const unlocked = isSunday || specialtyOverride || isLeadership;
    const todayStr = now.toLocaleDateString('pt-BR');
    const alreadyPlayed = currentMember?.scores.some(s => s.date === todayStr && s.specialtyGame !== undefined) || false;
    return { unlocked, alreadyPlayed };
  }, [specialtyOverride, currentMember, user.role]);

  const getTimeToUnlock = () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 0) return "Hoje";
    const daysLeft = 7 - day;
    if (daysLeft === 1) return "Amanhã";
    return `em ${daysLeft} dias`;
  };

  if (activeGame === 'quiz') {
    return (
      <QuizSelection 
        user={user} 
        members={members} 
        onUpdateMember={onUpdateMember} 
        onBack={() => setActiveGame('hub')} 
        quizOverride={quizOverride}
      />
    );
  }
  if (activeGame === 'memory') {
    return (
      <MemoryGame 
        user={user} 
        members={members} 
        onUpdateMember={onUpdateMember} 
        onBack={() => setActiveGame('hub')}
        memoryOverride={memoryOverride}
      />
    );
  }
  if (activeGame === 'specialty') {
    return (
      <SpecialtyGame 
        user={user} 
        members={members} 
        onUpdateMember={onUpdateMember} 
        onBack={() => setActiveGame('hub')}
      />
    );
  }

  const buttonBaseClasses = "w-full h-24 rounded-3xl font-black flex items-center justify-center gap-4 transition-all border-2 border-b-4 active:scale-95 px-6";

  return (
    <div className="flex flex-col items-center justify-start h-full animate-in fade-in duration-500 max-w-sm mx-auto pt-2 pb-10 px-4">
      <div className="mb-6 text-[#0061f2] bg-blue-50 p-6 rounded-[2.5rem] shadow-inner mt-2">
        <Gamepad2 size={64} strokeWidth={1.5} />
      </div>

      <h2 className="text-[#001f3f] text-2xl font-black mb-8 tracking-tight uppercase text-center">Central de Desafios</h2>

      <div className="flex flex-col gap-5 w-full">
        {/* BOTÃO QUIZ */}
        <button 
          onClick={() => setActiveGame('quiz')}
          className={`${buttonBaseClasses} bg-white border-[#0061f2] text-[#0061f2] shadow-lg shadow-blue-500/10 hover:bg-blue-50`}
        >
          <Brain size={24} className="text-[#0061f2] shrink-0" />
          <div className="flex flex-col items-start leading-tight min-w-0">
            <span className="uppercase tracking-widest text-sm truncate w-full">Desafio do Quiz</span>
            <span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">teste seus conhecimentos</span>
          </div>
        </button>

        {/* BOTÃO QUAL A ESPECIALIDADE */}
        <div className="relative w-full">
          <button 
            disabled={!specialtyStatus.unlocked || (specialtyStatus.alreadyPlayed && user.role === UserRole.PATHFINDER)}
            onClick={() => setActiveGame('specialty')}
            className={`${buttonBaseClasses} 
              ${(!specialtyStatus.unlocked || (specialtyStatus.alreadyPlayed && user.role === UserRole.PATHFINDER))
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                : 'bg-white border-[#0061f2] text-[#0061f2] shadow-lg shadow-blue-500/10 hover:bg-blue-50'}`}
          >
            {!specialtyStatus.unlocked ? <Lock size={24} /> : <Medal size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="uppercase tracking-widest text-sm truncate w-full">Qual a Especialidade?</span>
              <span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">
                {!specialtyStatus.unlocked ? `liberado ${getTimeToUnlock()}` : specialtyStatus.alreadyPlayed ? 'concluído hoje' : 'acerte o brasão'}
              </span>
            </div>
          </button>
          {!specialtyStatus.unlocked && <div className="absolute -top-2 -right-2 bg-slate-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">BLOQUEADO</div>}
        </div>

        {/* BOTÃO JOGO DA MEMÓRIA */}
        <div className="relative w-full">
          <button 
            disabled={!memoryStatus.unlocked || (memoryStatus.alreadyPlayed && user.role === UserRole.PATHFINDER)}
            onClick={() => setActiveGame('memory')}
            className={`${buttonBaseClasses} 
              ${(!memoryStatus.unlocked || (memoryStatus.alreadyPlayed && user.role === UserRole.PATHFINDER))
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                : 'bg-white border-[#FFD700] text-[#0061f2] shadow-lg shadow-yellow-500/10 hover:bg-yellow-50'}`}
          >
            {!memoryStatus.unlocked ? <Lock size={24} /> : <Gamepad2 size={24} />}
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="uppercase tracking-widest text-sm truncate w-full">Jogo da Memória</span>
              <span className="text-[10px] font-bold opacity-60 lowercase mt-0.5 truncate w-full">
                {!memoryStatus.unlocked ? `liberado ${getTimeToUnlock()}` : memoryStatus.alreadyPlayed ? 'concluído hoje' : 'mostre sua agilidade'}
              </span>
            </div>
          </button>
          {!memoryStatus.unlocked && <div className="absolute -top-2 -right-2 bg-slate-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">BLOQUEADO</div>}
        </div>
      </div>
    </div>
  );
};

export default Games;
