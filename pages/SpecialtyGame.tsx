
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DatabaseService, SpecialtyDBV } from '../db';
import { AuthUser, Member, Score, UserRole } from '../types';
import { ArrowLeft, Timer, Trophy, Lock, Calendar, Loader2, BookOpen } from 'lucide-react';

interface SpecialtyGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  specialtyOverride: boolean;
}

const SpecialtyGame: React.FC<SpecialtyGameProps> = ({ user, members, onUpdateMember, onBack, specialtyOverride }) => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [gameQuestions, setGameQuestions] = useState<{question: string, options: string[], correct: number, image: string}[]>([]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const prepareGame = async () => {
      try {
        const specs = await DatabaseService.getSpecialties();
        
        if (specs.length < 4) {
          alert("Necessário pelo menos 4 especialidades cadastradas no banco para jogar.");
          onBack();
          return;
        }

        // Jogo de adivinhar o nome pela imagem (Requisito do usuário)
        const selectedSpecs = [...specs].sort(() => Math.random() - 0.5).slice(0, 10);
        
        const questions = selectedSpecs.map(s => {
          // Pega 3 nomes aleatórios diferentes do correto
          const others = specs
            .filter(o => o.Nome !== s.Nome)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          
          const options = [...others.map(o => o.Nome), s.Nome].sort(() => Math.random() - 0.5);
          
          return {
            question: "Qual o nome desta especialidade?",
            options: options,
            correct: options.indexOf(s.Nome),
            image: s.Imagem
          };
        });

        setGameQuestions(questions);
      } catch (err) {
        console.error("Erro ao preparar jogo:", err);
      } finally {
        setLoading(false);
      }
    };
    prepareGame();
  }, []);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const { isAvailable, hasPlayedToday } = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const available = isSunday || specialtyOverride;
    const played = currentMember?.scores.some(s => s.date === now.toLocaleDateString('pt-BR') && s.specialtyGame !== undefined) || false;
    return { isAvailable: available, hasPlayedToday: played };
  }, [specialtyOverride, currentMember]);

  const startTimer = () => {
    stopTimer();
    setTimeLeft(12);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnswer = (idx: number) => {
    if (feedback) return;
    stopTimer();
    
    const correct = idx === gameQuestions[currentIdx].correct;
    if (correct) {
      setScore(prev => prev + 2);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx < gameQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        startTimer();
      } else {
        setGameState('result');
      }
    }, 1200);
  };

  const handleFinish = () => {
    if (currentMember) {
      const newScore: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
        specialtyGame: score
      };
      onUpdateMember({ ...currentMember, scores: [...currentMember.scores, newScore] });
    }
    onBack();
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-full gap-4"><Loader2 className="animate-spin text-[#0061f2]" size={40} /><p className="text-xs font-black text-slate-400 uppercase">Sincronizando Especialidades...</p></div>;

  if (hasPlayedToday && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6"><Lock size={40} /></div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Limite Diário</h2>
        <p className="text-slate-500 mb-8 text-sm">Você já jogou hoje. Volte no próximo domingo!</p>
        <button onClick={onBack} className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase text-xs">VOLTAR</button>
      </div>
    );
  }

  if (gameState === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-[#0061f2] shadow-inner"><BookOpen size={48} /></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Qual a Especialidade?</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest px-4">Identifique o brasão correto da especialidade mostrada na tela.</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 w-full">
           <p className="text-amber-700 text-[10px] font-black uppercase tracking-widest mb-1">Premiação</p>
           <p className="text-sm font-bold text-amber-800">Ganhe até 20 pontos para o Ranking!</p>
        </div>
        <button onClick={() => { setGameState('playing'); startTimer(); }} className="w-full bg-[#0061f2] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">INICIAR DESAFIO</button>
        <button onClick={onBack} className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Sair</button>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95">
        <Trophy size={80} className="text-yellow-400 mb-8" />
        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase">Duelo Encerrado!</h2>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pontuação conquistada</p>
           <p className="text-6xl font-black text-[#0061f2]">{score} <span className="text-xl">pts</span></p>
        </div>
        <button onClick={handleFinish} className="w-full bg-[#0061f2] text-white py-6 rounded-[2.5rem] font-black uppercase shadow-xl">SALVAR E VOLTAR</button>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIdx];

  return (
    <div className="flex flex-col h-full animate-in fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
        <div className="bg-blue-50 px-6 py-2 rounded-full border border-blue-100 flex items-center gap-2">
           <Timer size={18} className="text-blue-600" />
           <span className="font-black text-blue-600 text-xl font-mono">{timeLeft}s</span>
        </div>
        <div className="text-right"><p className="text-xl font-black text-[#FFD700]">{score} pts</p></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="w-full bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-6">
          <div className="w-36 h-36 mx-auto bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-center">
            <img src={currentQ.image} className="w-full h-full object-contain" alt="Espec" />
          </div>
          <h3 className="text-lg font-black text-slate-800 leading-tight px-2 uppercase tracking-tight">{currentQ.question}</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full">
          {currentQ.options.map((opt, idx) => {
            let style = "bg-white border-slate-100 text-slate-600";
            if (feedback) {
              if (idx === currentQ.correct) style = "bg-green-500 border-green-600 text-white";
              else style = "bg-slate-50 border-slate-50 text-slate-300 opacity-50";
            }
            return (
              <button 
                key={idx} 
                disabled={!!feedback} 
                onClick={() => handleAnswer(idx)} 
                className={`w-full p-5 rounded-2xl border-2 font-black text-sm uppercase tracking-tight transition-all active:scale-95 shadow-sm ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Desafio {currentIdx + 1} de {gameQuestions.length}</p>
      </div>
    </div>
  );
};

export default SpecialtyGame;
