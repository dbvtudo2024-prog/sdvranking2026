
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SPECIALTIES } from '../constants';
import { AuthUser, Member, Score } from '../types';
import { ArrowLeft, Timer, Trophy, X, Check, Medal } from 'lucide-react';

interface SpecialtyGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
}

interface Difficulty {
  name: string;
  time: number;
}

const DIFFICULTIES: Difficulty[] = [
  { name: 'Fácil', time: 5 },
  { name: 'Médio', time: 3 },
  { name: 'Difícil', time: 2 }
];

const SpecialtyGame: React.FC<SpecialtyGameProps> = ({ user, members, onUpdateMember, onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const timerRef = useRef<number | null>(null);

  const availableSpecialties = useMemo(() => {
    const saved = localStorage.getItem('sentinelas_all_specialties');
    if (saved) {
      return JSON.parse(saved);
    }
    // Fallback para constantes se o localStorage estiver vazio
    return SPECIALTIES;
  }, []);

  const gameQuestions = useMemo(() => {
    if (availableSpecialties.length === 0) return [];
    
    return [...availableSpecialties]
      .sort(() => Math.random() - 0.5)
      .slice(0, 15) // Mantém o requisito de 15 questões
      .map(q => {
        const others = availableSpecialties.filter(s => s.name !== q.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const options = [...others, q].sort(() => Math.random() - 0.5);
        return { ...q, options };
      });
  }, [availableSpecialties]);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.id, user.name]);

  useEffect(() => {
    if (difficulty && !isGameOver && !showFeedback && gameQuestions.length > 0) {
      setTimeLeft(difficulty.time);
      startTimer();
    }
    return () => stopTimer();
  }, [difficulty, currentIdx, isGameOver, showFeedback, gameQuestions]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          handleAnswer(null); // Tempo esgotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnswer = (selectedName: string | null) => {
    if (gameQuestions.length === 0) return;
    stopTimer();
    const isCorrect = selectedName === gameQuestions[currentIdx].name;
    
    if (isCorrect) {
      setScore(prev => prev + 2);
      setShowFeedback('correct');
    } else {
      setShowFeedback('wrong');
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (currentIdx < gameQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setIsGameOver(true);
      }
    }, 1000);
  };

  const handleFinish = () => {
    if (currentMember) {
      const newScore: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        specialtyGame: score
      };
      onUpdateMember({
        ...currentMember,
        scores: [...currentMember.scores, newScore]
      });
    }
    onBack();
  };

  if (gameQuestions.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <Medal size={48} className="text-slate-300 mb-4" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Nenhuma especialidade disponível.</p>
        <p className="text-xs text-slate-400 mt-2">O administrador precisa cadastrar especialidades.</p>
        <button onClick={onBack} className="mt-8 bg-[#0061f2] text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest">Voltar</button>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 sm:p-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
          <div>
            <h3 className="text-2xl font-black text-[#0061f2] uppercase tracking-tight mb-2">Qual a Especialidade?</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nível de Dificuldade</p>
          </div>
          
          <div className="space-y-3">
            {DIFFICULTIES.map(d => (
              <button 
                key={d.name}
                onClick={() => setDifficulty(d)}
                className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-100 p-5 rounded-2xl flex justify-between items-center transition-all active:scale-95 group"
              >
                <span className="font-black text-slate-700 uppercase tracking-widest text-sm group-hover:text-[#0061f2]">{d.name}</span>
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-slate-300" />
                  <span className="bg-[#FFD700] text-[#003366] px-4 py-1.5 rounded-full font-black text-xs">{d.time}s</span>
                </div>
              </button>
            ))}
          </div>
          
          <button onClick={onBack} className="text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] hover:text-red-400 pt-4">Sair do Jogo</button>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-[#FFD700] rounded-[2.5rem] flex items-center justify-center text-[#003366] shadow-xl mb-8">
           <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Fim de Jogo!</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest">Nível {difficulty.name}</p>
        
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full">
           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Pontuação Final</p>
           <p className="text-6xl font-black text-[#0061f2]">{score} <span className="text-xl">pts</span></p>
        </div>

        <button onClick={handleFinish} className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">SALVAR E VOLTAR</button>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIdx];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-[#0061f2] rounded-full border border-blue-100 shadow-sm">
          <Timer size={18} strokeWidth={3} />
          <span className="font-black text-xl font-mono">{timeLeft}s</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="font-black text-[#FFD700] text-lg drop-shadow-sm">{score} pts</div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Placar</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center p-8 border-4 border-slate-50 relative overflow-hidden group">
            <img src={currentQ.image} className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" alt="Especialidade" />
            
            {showFeedback === 'correct' && (
              <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <Check size={80} strokeWidth={4} />
              </div>
            )}
            {showFeedback === 'wrong' && (
              <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white animate-in fade-in zoom-in duration-300">
                <X size={80} strokeWidth={4} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
            QUESTÃO {currentIdx + 1} / {gameQuestions.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {currentQ.options.map((opt, idx) => (
            <button 
              key={idx}
              disabled={!!showFeedback}
              onClick={() => handleAnswer(opt.name)}
              className={`w-full p-4 rounded-2xl border-2 font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-sm
                ${showFeedback === 'correct' && opt.name === currentQ.name ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' : 
                  showFeedback === 'wrong' && opt.name !== currentQ.name ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-50' :
                  showFeedback === 'wrong' && opt.name === currentQ.name ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' :
                  'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'}`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="py-4 text-center opacity-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nível: {difficulty.name}</p>
      </div>
    </div>
  );
};

export default SpecialtyGame;
