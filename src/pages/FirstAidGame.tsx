
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HeartPulse, Trophy, AlertCircle, RefreshCcw, Activity } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import { AuthUser, Member, QuizQuestion } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface FirstAidGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const FirstAidGame: React.FC<FirstAidGameProps> = ({ user, members, onUpdateMember, onBack }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    DatabaseService.getQuizQuestions().then(data => {
      const firstAidQuestions = data.filter(q => q.category === 'Primeiros Socorros');
      if (firstAidQuestions.length > 0) {
        setAllQuestions(firstAidQuestions);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    });
  }, []);

  const questions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [allQuestions]);

  const currentQ = questions[currentStep];

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === currentQ.correctAnswer;
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
    const currentMember = members.find(m => m.id === user.id);
    if (!currentMember) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const updatedScores = [...(currentMember.scores || [])];
    const todayScoreIndex = updatedScores.findIndex(s => s.date === todayStr);

    const finalScore = score;

    if (todayScoreIndex >= 0) {
      (updatedScores[todayScoreIndex] as any).firstAidGame = finalScore;
    } else {
      updatedScores.push({
        date: todayStr,
        punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
        firstAidGame: finalScore
      } as any);
    }

    onUpdateMember({ ...currentMember, scores: updatedScores });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
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
      <header className="bg-red-600 text-white p-6 flex items-center gap-4 shrink-0 pt-10">
        <div className="flex flex-col">
          <h2 className="font-black uppercase tracking-tight text-lg">Primeiros Socorros</h2>
          <p className="text-[10px] font-bold opacity-80 uppercase">Cenário {currentStep + 1} de {questions.length}</p>
        </div>
        <div className="ml-auto bg-white/20 px-4 py-1 rounded-full font-black text-sm">
          {score} PTS
        </div>
      </header>

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
                    className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between
                      ${selectedOption === null 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50' 
                        : selectedOption === idx
                          ? isCorrect 
                            ? 'bg-green-500 border-green-700 text-white' 
                            : 'bg-red-500 border-red-700 text-white'
                          : idx === currentQ.correctAnswer && selectedOption !== null
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
