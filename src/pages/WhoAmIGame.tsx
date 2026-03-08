
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, User, Trophy, HelpCircle, ChevronRight, Search } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import { AuthUser, Member } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface WhoAmIQuestion {
  id: string;
  clues: string[];
  answer: string;
}

interface WhoAmIGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const WhoAmIGame: React.FC<WhoAmIGameProps> = ({ user, members, onUpdateMember, onBack }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [allQuestions, setAllQuestions] = useState<WhoAmIQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [revealedClues, setRevealedClues] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    DatabaseService.getWhoAmIQuestions().then(data => {
      if (data && data.length > 0) {
        setAllQuestions(data);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    });
  }, []);

  const questions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [allQuestions]);

  const currentCharacter = questions[currentStep];

  const options = useMemo(() => {
    if (!currentCharacter) return [];
    const others = allQuestions.filter(c => c.answer !== currentCharacter.answer);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffledOthers, currentCharacter].sort(() => Math.random() - 0.5);
  }, [currentCharacter, allQuestions]);

  const handleRevealClue = () => {
    if (revealedClues < 3) setRevealedClues(prev => prev + 1);
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = options[index].answer === currentCharacter.answer;
    setIsCorrect(correct);
    
    // Score based on clues revealed
    if (correct) {
      const points = revealedClues === 1 ? 30 : revealedClues === 2 ? 20 : 10;
      setScore(prev => prev + points);
    }

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setRevealedClues(1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('finished');
        saveScore();
      }
    }, 1500);
  };

  const saveScore = () => {
    const currentMember = members.find(m => m.id === user.id);
    if (!currentMember) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const updatedScores = [...(currentMember.scores || [])];
    const todayScoreIndex = updatedScores.findIndex(s => s.date === todayStr);

    const finalScore = score;

    if (todayScoreIndex >= 0) {
      (updatedScores[todayScoreIndex] as any).whoAmIGame = finalScore;
    } else {
      updatedScores.push({
        date: todayStr,
        punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
        whoAmIGame: finalScore
      } as any);
    }

    onUpdateMember({ ...currentMember, scores: updatedScores });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Quem Sou Eu?"
        instructions={[
          "Leia as dicas sobre um personagem bíblico ou histórico.",
          "Quanto menos dicas você precisar, mais pontos ganha!",
          "Escolha a resposta correta entre as opções.",
          "Você tem 5 personagens para adivinhar."
        ]}
        icon={<Search size={32} className="text-white" />}
      />
      <header className="bg-purple-600 text-white p-6 flex items-center gap-4 shrink-0 pt-10">
        <div className="flex flex-col">
          <h2 className="font-black uppercase tracking-tight text-lg">Quem Sou Eu?</h2>
          <p className="text-[10px] font-bold opacity-80 uppercase">Personagem {currentStep + 1} de {questions.length}</p>
        </div>
        <div className="ml-auto bg-white/20 px-4 py-1 rounded-full font-black text-sm">
          {score} PTS
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {gameState === 'loading' ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <HelpCircle className="animate-spin text-purple-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Personagens...</p>
            </div>
          ) : gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 space-y-6">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <HelpCircle size={24} />
                  <p className="text-xs font-black uppercase tracking-widest">Dicas Reveladas ({revealedClues}/3)</p>
                </div>
                
                <div className="space-y-3">
                  {currentCharacter.clues.slice(0, revealedClues).map((clue, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={idx} 
                      className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-l-4 border-purple-500 text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                      {clue}
                    </motion.div>
                  ))}
                  {revealedClues < 3 && selectedOption === null && (
                    <button 
                      onClick={handleRevealClue}
                      className="w-full py-3 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-600 transition-colors"
                    >
                      Revelar Próxima Dica
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 border-b-4 active:scale-95 flex flex-col items-center gap-2
                        ${selectedOption === null 
                          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-50' 
                          : selectedOption === idx
                            ? isCorrect 
                              ? 'bg-green-500 border-green-700 text-white' 
                              : 'bg-red-500 border-red-700 text-white'
                            : opt.answer === currentCharacter.answer && selectedOption !== null
                              ? 'bg-green-500/20 border-green-500/40 text-green-600'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50'
                        }`}
                    >
                      <User size={20} />
                      {opt.answer}
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
              <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Excelente Memória!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você conhece bem os heróis da fé!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-purple-600">{score} PTS</p>
              </div>
              <button 
                onClick={onBack}
                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
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

export default WhoAmIGame;
