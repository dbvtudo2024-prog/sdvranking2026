
import React, { useState, useMemo } from 'react';
import { Brain, AlertTriangle, Lock, ArrowLeft, BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { AuthUser, Member, UserRole } from '@/types';
import QuizGame from '@/pages/QuizGame';

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
    return isSunday || quizOverride; 
  }, [quizOverride]);

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
    
    // Bloqueia se já jogou OU se não for domingo (Global para todos)
    const isDisabled = played || !isAvailable;

    const activeClasses = isDesbravadores 
      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900' 
      : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900';
    
    const iconContainerClasses = isDesbravadores
      ? 'bg-blue-600 text-white'
      : 'bg-amber-500 text-white';

    return (
      <button 
        disabled={isDisabled}
        onClick={() => setPlayingCategory(category)}
        className={`w-full rounded-[1.5rem] p-4 shadow-md border-2 flex items-center text-left transition-all relative group
          ${isDisabled
            ? 'bg-slate-50 border-slate-100 opacity-70 grayscale cursor-not-allowed' 
            : `${activeClasses} active:scale-95 shadow-blue-900/5`}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-all ${played ? 'bg-green-100 text-green-600' : iconContainerClasses}`}>
          {played || !isAvailable ? (
            <Lock size={20} />
          ) : isDesbravadores ? (
            <Brain size={24} />
          ) : (
            <BookOpen size={24} />
          )}
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <h4 className={`font-black text-sm uppercase tracking-tight leading-tight mb-0.5 ${isDisabled ? 'text-slate-400' : ''}`}>
            {category}
          </h4>
          <div className="flex items-center gap-2">
             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${isDesbravadores ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
               Recorde: {getBestScore(category)} pts
             </span>
             {played ? (
               <span className="text-[8px] font-black text-green-600 uppercase">Concluído</span>
             ) : !isAvailable ? (
               <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                 <Calendar size={10} /> Abre Domingo
               </span>
             ) : (
               <span className="text-[8px] font-black text-blue-500 uppercase">Liberado</span>
             )}
          </div>
        </div>

        <ChevronRight size={16} className="text-slate-300 shrink-0" />
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
           <AlertTriangle size={16} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-amber-800 text-[10px] font-black uppercase tracking-tight">Regras de Acesso</h3>
          <p className="text-amber-600 text-[9px] font-bold leading-tight opacity-80">
            {isAvailable 
              ? "Você tem uma tentativa em cada categoria hoje. O botão ficará bloqueado após o término." 
              : "Os desafios abrem automaticamente aos domingos (00:00). Hoje o acesso está bloqueado."}
          </p>
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
