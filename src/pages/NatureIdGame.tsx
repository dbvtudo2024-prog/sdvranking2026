
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Leaf, Trophy, RefreshCcw, TreePine, Home, Lock } from 'lucide-react';
import GameHeader from '@/components/GameHeader';
import GameInstructions from '@/components/GameInstructions';
import { AuthUser, Member, QuizQuestion, UserRole } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface NatureIdGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const NatureIdGame: React.FC<NatureIdGameProps> = ({ user, members, onUpdateMember, onBack, override }) => {
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
    // Aberto de Sábado (6) até Quinta (4). Bloqueado na Sexta (5).
    const isGameDay = day !== 5;
    const available = isGameDay || override || isAdmin;
    
    // O ciclo começa no sábado (6).
    const diff = (day + 1) % 7;
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
            return d >= cycleStart && s.gameId === 'natureIdGame';
          }
          return false;
        }
        return scoreDate >= cycleStart && s.gameId === 'natureIdGame';
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name]);

  useEffect(() => {
    if (hasPlayedThisWeek && !isAdmin) return;
    DatabaseService.getQuizQuestions().then(data => {
      const natureQuestions = data.filter(q => q.category === 'Natureza');
      if (natureQuestions.length > 0) {
        setAllQuestions(natureQuestions);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    });
  }, [hasPlayedThisWeek, isAdmin]);

  const questions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [allQuestions]);

  const currentItem = questions[currentStep];

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === currentItem.correct_answer;
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
    }, 1500);
  };

  const saveScore = () => {
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!currentMember) return;

    const newScore = {
      gameId: 'natureIdGame',
      points: score,
      date: new Date().toISOString()
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
      <GameHeader 
        stats={[
          { label: 'Questão', value: `${currentStep + 1}/${questions.length}` },
          { label: 'Pontos', value: score }
        ]}
      />
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Identificação da Natureza"
        instructions={[
          "Observe a imagem da planta, animal ou fenômeno natural.",
          "Identifique corretamente o que está sendo mostrado.",
          "Cada acerto demonstra seu conhecimento sobre a criação!",
          "O jogo termina após 5 identificações."
        ]}
        icon={<TreePine size={32} className="text-white" />}
      />

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {gameState === 'loading' ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCcw className="animate-spin text-emerald-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Natureza...</p>
            </div>
          ) : gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">O que é isto?</p>
                <div className="w-full aspect-video bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center">
                  <img src={currentItem.image_url} alt="Natureza" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentItem.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between
                      ${selectedOption === null 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50' 
                        : selectedOption === idx
                          ? isCorrect 
                            ? 'bg-green-500 border-green-700 text-white' 
                            : 'bg-red-500 border-red-700 text-white'
                          : idx === currentItem.correct_answer && selectedOption !== null
                            ? 'bg-green-500/20 border-green-500/40 text-green-600'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50'
                      }`}
                  >
                    {opt}
                    {selectedOption === idx && (
                      isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-6"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Explorador da Natureza!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você conhece bem a criação de Deus!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-emerald-600">{score} PTS</p>
              </div>
              <button 
                onClick={onBack}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
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

export default NatureIdGame;
