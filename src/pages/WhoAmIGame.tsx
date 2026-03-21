
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, User, Trophy, HelpCircle, ChevronRight, Search, Lock, RefreshCw } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import { AuthUser, Member, UserRole } from '@/types';
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

const WhoAmIGame: React.FC<WhoAmIGameProps> = ({ user, members, onUpdateMember, onBack, override }) => {
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
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!currentMember) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const updatedScores = [...(currentMember.scores || [])];
    const finalScore = score;

    updatedScores.push({
      type: 'game',
      gameId: 'whoAmIGame',
      date: new Date().toLocaleDateString('pt-BR'),
      whoAmIGame: finalScore
    });

    onUpdateMember({ ...currentMember, scores: updatedScores });
  };

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
            return d >= cycleStart && ((s as any).whoAmIGame !== undefined || s.gameId === 'whoAmIGame');
          }
          return false;
        }
        return scoreDate >= cycleStart && ((s as any).whoAmIGame !== undefined || s.gameId === 'whoAmIGame');
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name]);

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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6 bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Concluído</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Você já completou este desafio esta semana. Volte no próximo sábado!</p>
        </div>
        <button onClick={onBack} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-slate-800 p-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Personagem</span>
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
        title="Quem Sou Eu?"
        instructions={[
          "Leia as dicas sobre um personagem bíblico ou histórico.",
          "Quanto menos dicas você precisar, mais pontos ganha!",
          "Escolha a resposta correta entre as opções.",
          "Você tem 5 personagens para adivinhar."
        ]}
        icon={<Search size={32} className="text-white" />}
      />

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

              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between text-left
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
                      <div className="flex items-center gap-3">
                        <User size={18} className="shrink-0" />
                        <span>{opt.answer}</span>
                      </div>
                      {selectedOption === idx && (
                        isCorrect ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />
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
