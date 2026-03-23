
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HeartPulse, Trophy, AlertCircle, RefreshCcw, Activity, Home, Lock, RefreshCw } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import { AuthUser, Member, QuizQuestion, Score, UserRole } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface FirstAidGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const FirstAidGame: React.FC<FirstAidGameProps> = ({ user, members, onUpdateMember, onBack, override }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';

  const { isAvailable, hasPlayedThisWeek } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // Aberto de Domingo (0) até Quinta (4).
    // Bloqueado na Sexta (5) e Sábado (6).
    const isGameDay = day >= 0 && day <= 4;
    const available = isGameDay || override || isAdmin;
    
    // O ciclo começa no Domingo (0).
    const diff = day;
    const cycleStart = new Date(now);
    cycleStart.setDate(now.getDate() - diff);
    cycleStart.setHours(0, 0, 0, 0);

    let played = false;
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    
    if (currentMember && !isAdmin) {
      played = (currentMember.scores || []).some(s => {
        const scoreDate = new Date(s.date);
        if (isNaN(scoreDate.getTime())) {
          const parts = s.date.split('/');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            return d >= cycleStart && s.gameId === 'firstAidGame';
          }
          return false;
        }
        return scoreDate >= cycleStart && s.gameId === 'firstAidGame';
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name]);

  useEffect(() => {
    if (hasPlayedThisWeek && !isAdmin) return;
    DatabaseService.getQuizQuestions().then(data => {
      const firstAidQuestions = data.filter(q => q.category === 'Primeiros Socorros');
      if (firstAidQuestions.length > 0) {
        setAllQuestions(firstAidQuestions);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    });
  }, [hasPlayedThisWeek, isAdmin]);

  const questions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [allQuestions]);

  const currentQ = questions[currentStep];

  const resetGame = () => {
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === currentQ.correct_answer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 20);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('finished');
        saveScore();
      }
    }, 2500); // Longer delay to read the tip
  };

  const saveScore = () => {
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!currentMember) return;

    const newScore: Score = {
      type: 'game',
      gameId: 'firstAidGame',
      points: score,
      firstAidGame: score,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedMember = {
      ...currentMember,
      scores: [...(currentMember.scores || []), newScore]
    };

    onUpdateMember(updatedMember);
  };

  if (!isAvailable && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6 bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Indisponível</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Os jogos estão bloqueados hoje. Volte amanhã!</p>
        </div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Voltar</button>
      </div>
    );
  }

  if (hasPlayedThisWeek && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Missão Cumprida!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
          Você já completou este desafio esta semana. Volte na próxima segunda!
        </p>
        <button 
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-slate-800 p-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Cenário</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono leading-none">{currentStep + 1}/{questions.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pontos</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono leading-none">{score}</span>
          </div>
        </div>
        <button 
          onClick={resetGame}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Primeiros Socorros"
        instructions={[
          "Analise a situação de emergência apresentada.",
          "Escolha a conduta correta de primeiros socorros.",
          "Cada acerto salva uma vida e soma pontos!",
          "O jogo termina após 5 situações."
        ]}
        icon={<Activity size={32} className="text-white" />}
      />

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {gameState === 'loading' ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCcw className="animate-spin text-red-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Socorros...</p>
            </div>
          ) : gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 space-y-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{currentQ.question}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between text-left
                      ${selectedOption === null 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50' 
                        : selectedOption === idx
                          ? isCorrect 
                            ? 'bg-green-500 border-green-700 text-white' 
                            : 'bg-red-500 border-red-700 text-white'
                          : idx === currentQ.correct_answer && selectedOption !== null
                            ? 'bg-green-500/20 border-green-500/40 text-green-600'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50'
                      }`}
                  >
                    <span className="flex-1">{opt}</span>
                    {selectedOption === idx && (
                      isCorrect ? <CheckCircle2 size={20} className="shrink-0 ml-2" /> : <XCircle size={20} className="shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>

              {selectedOption !== null && currentQ.tip && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border-2 ${isCorrect ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'} text-xs font-bold flex items-start gap-3`}
                >
                  <HeartPulse size={16} className="shrink-0 mt-0.5" />
                  <p>{currentQ.tip}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-6"
            >
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Socorrista Preparado!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você sabe como agir em emergências!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-red-600">{score} PTS</p>
              </div>
              <button 
                onClick={onBack}
                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                VOLTAR PARA A CENTRAL
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FirstAidGame;
