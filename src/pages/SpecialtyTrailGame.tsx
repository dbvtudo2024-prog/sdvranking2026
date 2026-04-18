
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Map, Trophy, ChevronRight, Star, RefreshCcw, Flag, Lock } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import GameStatsBar from '@/components/GameStatsBar';
import { AuthUser, Member, QuizQuestion, UserRole } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface SpecialtyTrailGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onAwardBadge?: (badgeId: string) => void;
  onBack: () => void;
  override: boolean;
}

const SpecialtyTrailGame: React.FC<SpecialtyTrailGameProps> = ({ user, members, onUpdateMember, onAwardBadge, onBack, override }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentPos, setCurrentPos] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stepResults, setStepResults] = useState<(boolean | null)[]>(new Array(6).fill(null));

  const totalSteps = 6;

  useEffect(() => {
    DatabaseService.getQuizQuestions().then(data => {
      const specialtyQuestions = data.filter(q => q.category === 'Especialidades');
      if (specialtyQuestions.length > 0) {
        setAllQuestions(specialtyQuestions);
        setGameState('playing');
      } else {
        setGameState('finished');
      }
    });
  }, []);

  const questions = useMemo(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, totalSteps);
  }, [allQuestions]);

  const currentQuestion = questions[currentPos];

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === currentQuestion.correct_answer;
    setIsCorrect(correct);
    
    const newResults = [...stepResults];
    newResults[currentPos] = correct;
    setStepResults(newResults);

    if (correct) setScore(prev => prev + 25);

    setTimeout(() => {
      if (currentPos < totalSteps - 1) {
        setCurrentPos(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('finished');
        saveScore();
      }
    }, 1500);
  };

  const saveScore = () => {
    // Find member again to ensure we have latest data
    const memberToUpdate = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!memberToUpdate) return;

    const todayStr = new Date().toISOString();
    const updatedScores = [...(memberToUpdate.scores || [])];

    const finalScore = score;

    // AWARD BADGE - Skill (Explorador de Trilhas)
    if (finalScore >= 60 && onAwardBadge) { // 6 questions * 10 pts = 60
      onAwardBadge('explorador_trilhas');
    }

    updatedScores.push({
      type: 'game',
      gameId: 'specialtyTrailGame',
      date: new Date().toLocaleDateString('pt-BR'),
      points: finalScore,
      specialtyTrailGame: finalScore
    });

    onUpdateMember({ ...memberToUpdate, scores: updatedScores });
  };

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';

  const cycleStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const start = new Date(now);
    if (day === 0 && hour < 12) {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(now.getDate() - day);
    }
    start.setHours(12, 0, 0, 0);
    return start;
  }, []);

  const { isAvailable, hasPlayedThisWeek } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // Standard availability: Sunday (0) to Thursday (4)
    const available = (day >= 0 && day <= 4) || override || isAdmin;

    let played = false;
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    
    if (currentMember && !isAdmin) {
      played = (currentMember.scores || []).some(s => {
        const scoreDate = new Date(s.date);
        
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
        
        const matchesGame = s.gameId === 'specialtyTrailGame' || (s as any).specialtyTrailGame !== undefined;
        return d >= cycleStart && matchesGame;
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name, cycleStart]);

  if (!isAvailable && !isAdmin && !override) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Trilha de Especialidades" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Indisponível</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Os jogos estão bloqueados hoje. Volte no domingo ao meio-dia!</p>
        </div>
      </div>
    );
  }

  if (hasPlayedThisWeek && !isAdmin && !override) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Trilha de Especialidades" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Concluído</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Você já completou este desafio esta semana. Volte no próximo domingo ao meio-dia!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      <GameHeader 
        title="Trilha"
        user={user}
        onBack={onBack}
        stats={[
          { label: 'Progresso', value: `${Math.round((currentPos / totalSteps) * 100)}%` },
          { label: 'Pontos', value: score }
        ]}
      />
      <GameStatsBar stats={[
        { label: 'Progresso', value: `${Math.round((currentPos / totalSteps) * 100)}%` },
        { label: 'Pontos', value: score }
      ]} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        onBack={onBack}
        title="Trilha das Especialidades"
        instructions={[
          "Percorra a trilha respondendo perguntas sobre especialidades.",
          "Cada acerto faz você avançar uma casa.",
          "Chegue ao final da trilha para conquistar a pontuação máxima!",
          "O jogo termina quando você completa os 6 passos da trilha."
        ]}
        icon={<Flag size={32} className="text-white" />}
      />

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        {/* BOARD VISUAL */}
        <div className="w-full flex justify-between items-center px-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-all duration-500 
                ${i === currentPos 
                  ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                  : stepResults[i] === true
                    ? 'bg-green-500 text-white'
                    : stepResults[i] === false
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                }`}>
                {i === currentPos ? <Star size={14} className="animate-pulse" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${i < currentPos ? (stepResults[i] ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-100 dark:bg-slate-900'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'loading' ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCcw className="animate-spin text-emerald-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Trilha...</p>
            </div>
          ) : gameState === 'playing' ? (
            <motion.div 
              key={currentPos}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Map size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{currentQuestion.question}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt, idx) => (
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
                          : idx === currentQuestion.correct_answer && selectedOption !== null
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
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Trilha Concluída!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você é um mestre das especialidades!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-emerald-600">{score} PTS</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
};

export default SpecialtyTrailGame;
