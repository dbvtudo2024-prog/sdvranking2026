
import React, { useState, useMemo } from 'react';
import { Brain, AlertTriangle, Lock, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { AuthUser, Member, UserRole } from '../types';
import QuizGame from './QuizGame';

interface QuizSelectionProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  quizOverride: boolean;
}

const QuizSelection: React.FC<QuizSelectionProps> = ({ user, members, onUpdateMember, onBack, quizOverride }) => {
  const [playingCategory, setPlayingCategory] = useState<'Desbravadores' | 'Bíblia' | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.id, user.name]);

  const isAvailable = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isLeadership = user.role === UserRole.LEADERSHIP;
    return isSunday || quizOverride || isLeadership; 
  }, [quizOverride, user.role]);

  const hasPlayedToday = (category: 'Desbravadores' | 'Bíblia') => {
    if (!currentMember) return false;
    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR');
    return currentMember.scores.some(s => 
      s.date === todayStr && 
      s.quiz !== undefined && 
      s.quizCategory === category
    );
  };

  const getBestScore = (category: 'Desbravadores' | 'Bíblia') => {
    if (!currentMember) return 0;
    const quizScores = currentMember.scores
      .filter(s => s.quiz !== undefined && s.quizCategory === category)
      .map(s => s.quiz || 0);
    return quizScores.length > 0 ? Math.max(...quizScores) : 0;
  };

  const getTimeToUnlock = () => {
    const now = new Date();
    if (now.getDay() === 0) return "Hoje";
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    const diff = nextSunday.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days}d`;
  };

  if (playingCategory) {
    return (
      <QuizGame 
        category={playingCategory} 
        user={user} 
        member={currentMember}
        onUpdateMember={onUpdateMember}
        onBack={() => setPlayingCategory(null)} 
      />
    );
  }

  const CategoryButton = ({ category, played }: { category: 'Desbravadores' | 'Bíblia', played: boolean }) => {
    const isDesbravadores = category === 'Desbravadores';
    const activeClasses = isDesbravadores 
      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
      : 'bg-amber-50 border-amber-200 hover:bg-amber-100';
    
    const iconContainerClasses = isDesbravadores
      ? 'bg-blue-600 text-white'
      : 'bg-amber-500 text-white';

    return (
      <button 
        disabled={!isAvailable || (played && user.role === UserRole.PATHFINDER)}
        onClick={() => setPlayingCategory(category)}
        className={`w-full rounded-[1.5rem] p-4 shadow-md border-2 flex items-center text-left transition-all relative group
          ${(!isAvailable || (played && user.role === UserRole.PATHFINDER)) 
            ? 'bg-slate-50 border-slate-100 opacity-75 grayscale-[0.5] cursor-not-allowed' 
            : `${activeClasses} active:scale-95 shadow-blue-900/5`}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-all ${played ? 'bg-slate-200 text-slate-400' : iconContainerClasses}`}>
          {played ? (
            <Lock size={20} />
          ) : isDesbravadores ? (
            <Brain size={24} className="group-hover:scale-110 transition-transform" />
          ) : (
            <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <h4 className={`font-black text-sm uppercase tracking-tight leading-tight mb-0.5 ${played ? 'text-slate-400' : isDesbravadores ? 'text-blue-900' : 'text-amber-900'}`}>
            {category}
          </h4>
          <div className="flex items-center gap-2">
             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${isDesbravadores ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
               Rec: {getBestScore(category)}
             </span>
             <div className="flex items-center gap-1 text-slate-400">
              {played && user.role === UserRole.PATHFINDER ? (
                <span className="text-[8px] font-black text-red-400 uppercase">Já Realizado</span>
              ) : (
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isAvailable ? (isDesbravadores ? 'text-blue-500' : 'text-amber-600') : 'text-slate-400'}`}>
                  {isAvailable ? 'Liberado' : `Abre em ${getTimeToUnlock()}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronRight size={16} className={`shrink-0 ${played ? 'text-slate-300' : isDesbravadores ? 'text-blue-300' : 'text-amber-300'}`} />
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center h-full animate-in fade-in duration-500 max-w-sm mx-auto px-2">
      <div className="w-full flex justify-start mb-2">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="w-full bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 mb-6 shadow-sm flex gap-3">
        <div className="shrink-0 flex items-start pt-0.5">
           <AlertTriangle size={16} className="text-amber-500 fill-amber-100" />
        </div>
        <div>
          <h3 className="text-amber-800 text-[10px] font-black uppercase tracking-tight">Uma tentativa por semana</h3>
          <p className="text-amber-600 text-[9px] font-bold leading-tight opacity-80">Você pode responder cada categoria uma vez por semana.</p>
        </div>
      </div>

      <h2 className="text-[#001f3f] text-lg font-black mb-6 tracking-widest uppercase">Categorias do Quiz</h2>

      <div className="grid grid-cols-1 gap-4 w-full">
        <CategoryButton category="Desbravadores" played={hasPlayedToday('Desbravadores')} />
        <CategoryButton category="Bíblia" played={hasPlayedToday('Bíblia')} />
      </div>
    </div>
  );
};

export default QuizSelection;
