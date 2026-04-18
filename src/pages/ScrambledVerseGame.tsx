
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Type, Trophy, RefreshCcw, Undo2, Book, Lock } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import GameStatsBar from '@/components/GameStatsBar';
import { AuthUser, Member, UserRole, BadgeLevel, UserStats } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface ScrambledVerse {
  id: string;
  text: string;
  title: string;
}

interface ScrambledVerseGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onAwardBadge?: (badgeId: string, level: BadgeLevel) => void;
  onUpdateStats?: (stats: Partial<UserStats>) => void;
  onBack: () => void;
  override: boolean;
}

const ScrambledVerseGame: React.FC<ScrambledVerseGameProps> = ({ user, members, onUpdateMember, onAwardBadge, onUpdateStats, onBack, override }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [verses, setVerses] = useState<ScrambledVerse[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  useEffect(() => {
        DatabaseService.getScrambledVerses().then(data => {
          if (data && data.length > 0) {
            // Shuffle and take only 5 verses
            const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 5);
            setVerses(shuffled);
            setGameState('playing');
          } else {
            // Fallback or empty state
            setGameState('finished');
          }
        }).catch(err => {
          console.error("Erro ao carregar versículos:", err);
          setGameState('finished');
        });
  }, []);

  const currentVerse = useMemo(() => {
    const v = verses[currentStep];
    return {
      text: v?.text || '',
      title: v?.title || ''
    };
  }, [verses, currentStep]);
  
  const originalWords = useMemo(() => {
    return currentVerse.text.split(/\s+/).filter(w => w.trim().length > 0);
  }, [currentVerse]);

  const scrambledWords = useMemo(() => {
    return [...originalWords].sort(() => Math.random() - 0.5);
  }, [originalWords]);

  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    setAvailableWords(scrambledWords);
    setSelectedWords([]);
  }, [scrambledWords]);

  const handleWordClick = (word: string, index: number) => {
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);

    // Check if finished
    if (originalWords.length > 0 && newSelected.length === originalWords.length) {
      const isCorrect = newSelected.join(' ') === originalWords.join(' ');
      if (isCorrect) {
        setScore(prev => prev + 20);
        setTimeout(() => {
          if (currentStep < verses.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            setGameState('finished');
            saveScore();
          }
        }, 1000);
      } else {
        // Increment errors
        setTotalErrors(prev => prev + 1);
        // Reset if wrong
        setTimeout(() => {
          setSelectedWords([]);
          setAvailableWords(scrambledWords);
        }, 1000);
      }
    }
  };

  const handleUndo = () => {
    if (selectedWords.length === 0) return;
    const lastWord = selectedWords[selectedWords.length - 1];
    setSelectedWords(prev => prev.slice(0, -1));
    setAvailableWords(prev => [...prev, lastWord]);
  };

  const saveScore = () => {
    // Find member again to ensure we have latest data
    const memberToUpdate = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!memberToUpdate) return;

    if (onUpdateStats) onUpdateStats({ totalVerses: 1 });

    const todayStr = new Date().toISOString();
    const updatedScores = [...(memberToUpdate.scores || [])];

    const finalScore = score;

    // AWARD BADGE - Wisdom (Escriba Veloz)
    // Bronze: Completar, Prata: Máx 1 erro, Ouro: Sem erros
    if (onAwardBadge) {
      if (totalErrors === 0 && finalScore >= 100) onAwardBadge('escriba_veloz', BadgeLevel.GOLD);
      else if (totalErrors <= 1 && finalScore >= 100) onAwardBadge('escriba_veloz', BadgeLevel.SILVER);
      else if (finalScore >= 20) onAwardBadge('escriba_veloz', BadgeLevel.BRONZE);
    }

    updatedScores.push({
      type: 'game',
      gameId: 'scrambledVerseGame',
      date: new Date().toLocaleDateString('pt-BR'),
      points: finalScore,
      scrambledVerseGame: finalScore
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
        
        const matchesGame = s.gameId === 'scrambledVerseGame' || (s as any).scrambledVerseGame !== undefined;
        return d >= cycleStart && matchesGame;
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name, cycleStart]);

  if (!isAvailable && !isAdmin && !override) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Versículo" user={user} onBack={onBack} />
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
        <GameHeader title="Versículo" user={user} onBack={onBack} />
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <GameHeader 
        title="Versículo"
        user={user}
        onBack={onBack}
        stats={[
          { label: 'Progresso', value: `${currentStep + 1}/${verses.length}` },
          { label: 'Referência', value: currentVerse.title },
          { label: 'Pontos', value: score }
        ]}
      />
      <GameStatsBar stats={[
        { label: 'Referência', value: currentVerse.title },
        { label: 'Progresso', value: `${currentStep + 1}/${verses.length}` },
        { label: 'Pontos', value: score }
      ]} />
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        onBack={onBack}
        title="Versículo Embaralhado"
        instructions={[
          "As palavras de um versículo bíblico estão fora de ordem.",
          "Toque nas palavras na sequência correta para montá-lo.",
          "Se errar, use o botão de desfazer para tentar novamente.",
          "O jogo termina após 5 versículos."
        ]}
        icon={<Book size={32} className="text-white" />}
      />

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        {/* Progress Bar */}
        {gameState === 'playing' && verses.length > 0 && (
          <div className="w-full max-w-md h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / verses.length) * 100}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {gameState === 'loading' ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCcw className="animate-spin text-blue-500" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Versículos...</p>
            </div>
          ) : gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-md flex flex-col gap-8"
            >
              {/* REFERENCE HINT */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Onde está na Bíblia?</p>
                <div className="flex items-center gap-3 px-8 py-3 bg-amber-50 dark:bg-amber-900/30 rounded-full border-2 border-amber-100 dark:border-amber-800 shadow-sm animate-pulse">
                  <Book size={18} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-base font-black text-amber-700 dark:text-amber-300 uppercase tracking-tight">{currentVerse.title}</span>
                </div>
              </div>

              {/* SELECTED WORDS AREA */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 min-h-[160px] flex flex-wrap gap-2 content-start relative">
                {selectedWords.length === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 font-black uppercase text-[10px] tracking-widest">Toque nas palavras abaixo</p>
                )}
                {selectedWords.map((word, idx) => (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={idx} 
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm border border-blue-100 dark:border-blue-800"
                  >
                    {word}
                  </motion.span>
                ))}
                {selectedWords.length > 0 && (
                  <button onClick={handleUndo} className="absolute bottom-4 right-4 p-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <Undo2 size={18} />
                  </button>
                )}
              </div>

              {/* AVAILABLE WORDS AREA */}
              <div className="flex flex-wrap justify-center gap-3">
                {availableWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleWordClick(word, idx)}
                    className="px-5 py-3 bg-white dark:bg-slate-800 border-2 border-b-4 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200 active:scale-90 transition-all shadow-sm hover:bg-slate-50"
                  >
                    {word}
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
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Palavra Guardada!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você memorizou os versículos com perfeição!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-blue-600">{score} PTS</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ScrambledVerseGame;
