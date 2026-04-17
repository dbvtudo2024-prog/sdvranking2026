
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DatabaseService } from '@/db';
import { AuthUser, Member, Score, UserRole, SpecialtyDBV } from '@/types';
import { ArrowLeft, Timer, Trophy, Lock, Calendar, Loader2, BookOpen, Image, RefreshCw, Check } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import GameStatsBar from '@/components/GameStatsBar';

interface SpecialtyGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  specialtyOverride: boolean;
  isDarkMode?: boolean;
}

const SpecialtyGame: React.FC<SpecialtyGameProps> = ({ user, members, onUpdateMember, onBack, specialtyOverride, isDarkMode }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLimit, setTimeLimit] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [gameQuestions, setGameQuestions] = useState<{question: string, options: string[], correct: number, image: string}[]>([]);

  const timerRef = useRef<number | null>(null);
  const imageLoadedRef = useRef(false);

  useEffect(() => {
    imageLoadedRef.current = imageLoaded;
  }, [imageLoaded]);

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

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';

  const { isAvailable, hasPlayedThisWeek } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    
    // Standard availability: Open Sunday (0) to Thursday (4). Locked Friday (5) and Saturday (6).
    const available = (day >= 0 && day <= 4) || specialtyOverride || isAdmin;
    
    // Calculate start of current week (Sunday)
    const diff = day;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - diff);
    sunday.setHours(0, 0, 0, 0);

    let played = false;
    if (currentMember && !isAdmin) {
      played = (currentMember.scores || []).some(s => {
        const scoreDate = new Date(s.date);
        
        // Handle ISO and DD/MM/YYYY formats
        let d: Date;
        if (isNaN(scoreDate.getTime())) {
          const parts = s.date.split('/');
          if (parts.length === 3) {
            d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            return false;
          }
        } else {
          d = scoreDate;
        }
        
        return d >= sunday && (s.gameId === 'specialtyGame' || s.specialtyGame !== undefined);
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [specialtyOverride, currentMember, isAdmin]);

  const startTimer = (limit?: number) => {
    stopTimer();
    const actualLimit = limit || timeLimit;
    setTimeLeft(actualLimit);
    timerRef.current = window.setInterval(() => {
      if (!imageLoadedRef.current) return;
      
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
      // Pontuação baseada no tempo escolhido (mais difícil = mais pontos)
      const multiplier = timeLimit === 2 ? 4 : timeLimit === 3 ? 3 : 2;
      setScore(prev => prev + multiplier);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setImageLoaded(false);
      imageLoadedRef.current = false;
      if (currentIdx < gameQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        startTimer();
      } else {
        setGameState('result');
      }
    }, 1200);
  };

  useEffect(() => {
    if (gameState === 'result') {
      try {
        // Find member again to ensure we have latest data
        const memberToUpdate = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
        
        if (memberToUpdate) {
          const points = score;
          const newScore: Score = {
            type: 'game',
            gameId: 'specialtyGame',
            date: new Date().toLocaleDateString('pt-BR'),
            points: points,
            specialtyGame: points
          };
          
          const currentScores = Array.isArray(memberToUpdate.scores) ? memberToUpdate.scores : [];
          onUpdateMember({ ...memberToUpdate, scores: [...currentScores, newScore] });
        }
      } catch (err) {
        console.error("Erro ao salvar pontuação:", err);
      }
    }
  }, [gameState, score, members, user.id, user.name, onUpdateMember]);

  if (loading) return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
      <GameHeader title="Especialidades" user={user} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#0061f2]" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando Especialidades...</p>
      </div>
    </div>
  );

  if (hasPlayedThisWeek && !isAdmin && !specialtyOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
        <GameHeader title="Especialidades" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase">Concluído</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Você já completou este desafio esta semana. Volte no próximo sábado!</p>
        </div>
      </div>
    );
  }

  if (!isAvailable && !isAdmin && !specialtyOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
        <GameHeader title="Especialidades" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-[#0061f2] mb-6">
            <Calendar size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase">Indisponível</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Os desafios estão bloqueados hoje. Volte amanhã!</p>
        </div>
      </div>
    );
  }

  if (gameQuestions.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
        <GameHeader title="Especialidades" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tighter">Ops! Sem Dados</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-tight uppercase font-bold text-[10px]">Não encontramos especialidades cadastradas. Peça para um instrutor adicionar no painel administrativo.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'lobby') {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in">
        <GameHeader title="Especialidade" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 overflow-y-auto">
        <GameInstructions
          isOpen={showInstructions}
          onStart={() => setShowInstructions(false)}
          onBack={onBack}
          title="Qual a Especialidade?"
          instructions={[
            "Veja a imagem da especialidade.",
            "Escolha o nome correto entre as opções.",
            "Você tem um tempo limitado para cada resposta.",
            "Quanto mais rápido responder, mais pontos ganha!",
            "O jogo acaba após 10 especialidades."
          ]}
          icon={<Image size={32} className="text-white" />}
        />
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-[#0061f2] shadow-inner">
          <BookOpen size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Qual a Especialidade?</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest px-4">Identifique o brasão correto da especialidade mostrada na tela.</p>
        </div>

        <div className="w-full space-y-3">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escolha o tempo por pergunta:</p>
          <div className="flex gap-2">
            {[5, 3, 2].map(t => (
              <button 
                key={t} 
                onClick={() => setTimeLimit(t)}
                className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all active:scale-95 ${timeLimit === t ? 'bg-[#0061f2] border-blue-700 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 w-full">
           <p className="text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Premiação</p>
           <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Ganhe até {timeLimit === 2 ? 40 : timeLimit === 3 ? 30 : 20} pontos!</p>
        </div>

        <button onClick={() => { setGameState('playing'); startTimer(timeLimit); }} className="w-full bg-[#0061f2] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">INICIAR DESAFIO</button>
      </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
        <GameHeader title="Brasões" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
          <Trophy size={80} className="text-yellow-400 mb-8" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase">Desafio Concluído!</h2>
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 mb-10 w-full max-w-sm">
             <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Pontuação conquistada</p>
             <p className="text-6xl font-black text-[#0061f2] dark:text-blue-400">{score} <span className="text-xl">pts</span></p>
             <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase mt-2">Dificuldade: {timeLimit} segundos</p>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            Sua pontuação foi salva automaticamente!
          </p>
        </div>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIdx];

  if (!currentQ) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in overflow-hidden">
      <GameHeader 
        title="Brasões" 
        user={user} 
        onBack={onBack}
        stats={[
          { label: 'Tempo', value: `${timeLeft}s` },
          { label: 'Pontos', value: score },
          { label: 'Desafio', value: `${currentIdx + 1}/10` }
        ]}
        onRefresh={() => {
          setScore(0);
          setCurrentIdx(0);
          setTimeLeft(timeLimit);
          setGameState('playing');
        }}
      />
      <GameStatsBar stats={[
        { label: 'Tempo', value: `${timeLeft}s` },
        { label: 'Pontos', value: score },
        { label: 'Desafio', value: `${currentIdx + 1}/10` }
      ]} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
        <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 p-4 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl text-center space-y-3 relative overflow-hidden">
          <div className="w-32 h-32 mx-auto bg-slate-50 dark:bg-slate-900 p-3 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-slate-200 dark:text-slate-700" size={24} />
              </div>
            )}
            <img 
              src={currentQ.image || undefined} 
              onLoad={() => {
                setImageLoaded(true);
                imageLoadedRef.current = true;
              }}
              className={`w-full h-full object-contain transition-all duration-500 ${imageLoaded ? 'scale-100 opacity-100 blur-0' : 'scale-90 opacity-0 blur-md'}`} 
              alt="Espec" 
            />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight px-2 uppercase tracking-tight">{currentQ.question}</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full md:w-1/2">
          {(currentQ.options || []).map((opt, idx) => {
            let style = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300";
            if (feedback) {
              if (idx === currentQ.correct) style = "bg-green-500 border-green-600 text-white scale-105 shadow-lg";
              else if (idx === (feedback === 'wrong' ? -1 : -2)) { /* dummy */ }
              else style = "bg-slate-50 dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-50";
            }
            return (
              <button 
                key={`${currentIdx}-${idx}`} 
                disabled={!!feedback} 
                onClick={() => handleAnswer(idx)} 
                className={`w-full p-4 rounded-2xl border-2 font-black text-sm uppercase tracking-tight transition-all active:scale-95 shadow-sm flex items-center justify-between text-left ${style}`}
              >
                <span className="flex-1">{opt}</span>
                {feedback && idx === currentQ.correct && <Check size={18} className="shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
         <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Desafio {currentIdx + 1} de {gameQuestions.length}</p>
      </div>
    </div>
  );
};

export default SpecialtyGame;
