
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Undo2, RotateCcw, Trophy, Info, CheckCircle2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, Member, UserRole } from '@/types';
import GameHeader from '@/components/GameHeader';

interface BallSortGameProps {
  onBack: () => void;
  isDarkMode?: boolean;
  user: AuthUser | null;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  override?: boolean;
}

const COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

const TUBE_CAPACITY = 4;
const LEVELS_TO_COMPLETE = 3;

const BallSortGame: React.FC<BallSortGameProps> = ({ onBack, isDarkMode, user, members, onUpdateMember, override }) => {
  const [tubes, setTubes] = useState<string[][]>([]);
  const [history, setHistory] = useState<string[][][]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  const currentMember = useMemo(() => 
    members.find(m => m.id === user?.id || m.name.toLowerCase().trim() === user?.name.toLowerCase().trim()),
  [members, user]);

  const isAdmin = user?.role === UserRole.LEADERSHIP || user?.email === 'ronaldosonic@gmail.com';

  const hasPlayedThisWeek = useMemo(() => {
    if (override || isAdmin) return false;
    if (!currentMember?.scores) return false;
    
    const now = new Date();
    const day = now.getDay();
    // Sunday (0) is the start of the week
    const diff = day;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - diff);
    sunday.setHours(0, 0, 0, 0);

    return (currentMember.scores || []).some(s => {
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
      
      return d >= sunday && (s.gameId === 'ballSortGame' || (s as any).ballSortGame !== undefined);
    });
  }, [currentMember, override, isAdmin]);

  const initGame = useCallback((lvl: number) => {
    const numColors = Math.min(lvl + 2, COLORS.length);
    const numEmptyTubes = 1;
    const totalTubes = numColors + numEmptyTubes;
    
    let allBalls: string[] = [];
    for (let i = 0; i < numColors; i++) {
      for (let j = 0; j < TUBE_CAPACITY; j++) {
        allBalls.push(COLORS[i]);
      }
    }

    // Shuffle balls
    for (let i = allBalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]];
    }

    const newTubes: string[][] = [];
    for (let i = 0; i < numColors; i++) {
      newTubes.push(allBalls.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
    }
    for (let i = 0; i < numEmptyTubes; i++) {
      newTubes.push([]);
    }

    setTubes(newTubes);
    setHistory([]);
    setSelectedTubeIndex(null);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    if (!hasPlayedThisWeek) {
      initGame(level);
    }
  }, [level, initGame, hasPlayedThisWeek]);

  const handleTubeClick = (index: number) => {
    if (isWon || isFinished) return;

    if (selectedTubeIndex === null) {
      if (tubes[index].length > 0) {
        setSelectedTubeIndex(index);
      }
    } else {
      if (selectedTubeIndex === index) {
        setSelectedTubeIndex(null);
        return;
      }

      const sourceTube = tubes[selectedTubeIndex];
      const targetTube = tubes[index];
      const ballToMove = sourceTube[sourceTube.length - 1];

      const canMove = targetTube.length < TUBE_CAPACITY && 
                     (targetTube.length === 0 || targetTube[targetTube.length - 1] === ballToMove);

      if (canMove) {
        const newTubes = tubes.map(t => [...t]);
        newTubes[selectedTubeIndex] = sourceTube.slice(0, -1);
        newTubes[index] = [...targetTube, ballToMove];
        
        setHistory(prev => [...prev, tubes.map(t => [...t])]);
        setTubes(newTubes);
        setSelectedTubeIndex(null);
        setMoves(m => m + 1);
        checkWin(newTubes);
      } else {
        setSelectedTubeIndex(index);
      }
    }
  };

  const undo = () => {
    if (history.length === 0 || isWon || isFinished) return;
    const previousState = history[history.length - 1];
    setTubes(previousState);
    setHistory(prev => prev.slice(0, -1));
    setMoves(m => m + 1);
    setSelectedTubeIndex(null);
  };

  const checkWin = (currentTubes: string[][]) => {
    const won = currentTubes.every(tube => 
      tube.length === 0 || (tube.length === TUBE_CAPACITY && tube.every(ball => ball === tube[0]))
    );
    if (won) {
      setIsWon(true);
    }
  };

  const nextLevel = () => {
    if (level >= LEVELS_TO_COMPLETE) {
      handleFinish();
    } else {
      setLevel(l => l + 1);
    }
  };

  const handleFinish = () => {
    const memberToUpdate = members.find(m => m.id === user?.id || m.name.toLowerCase().trim() === user?.name.toLowerCase().trim());
    if (!memberToUpdate) return;

    const points = 50; // Pontos fixos por completar o desafio semanal
    const todayStr = new Date().toISOString();
    const updatedScores = [...(memberToUpdate.scores || [])];

    updatedScores.push({
      type: 'game',
      gameId: 'ballSortGame',
      date: new Date().toLocaleDateString('pt-BR'),
      points: points,
      ballSortGame: points
    });

    onUpdateMember({ ...memberToUpdate, scores: updatedScores });
    setIsFinished(true);
    setIsWon(false);
  };

  if (hasPlayedThisWeek) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Organizador de Cores" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Missão Cumprida!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
            Você já completou este desafio esta semana. Volte na próxima segunda!
          </p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Organizador de Cores" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <Trophy size={48} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase mb-2">Parabéns!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
            Você completou todos os níveis e ganhou 50 pontos!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      <GameHeader 
        title="Organizador de Cores"
        user={user}
        stats={[
          { label: 'Nível', value: `${level} / ${LEVELS_TO_COMPLETE}` },
          { label: 'Movimentos', value: moves }
        ]}
        onRefresh={() => initGame(level)}
        onBack={onBack}
      />
      
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-end gap-2 mb-4">
          <button 
            onClick={undo}
            disabled={history.length === 0}
            className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-700 active:scale-90 transition-all disabled:opacity-30 disabled:grayscale"
            title="Desfazer"
          >
            <Undo2 size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

      <div className="flex-1 flex flex-nowrap justify-start sm:justify-center items-center gap-6 sm:gap-10 content-center max-w-full mx-auto px-4 py-12 overflow-x-auto custom-scrollbar">
        {tubes.map((tube, idx) => (
          <div 
            key={idx}
            onClick={() => handleTubeClick(idx)}
            className={`
              relative w-16 sm:w-20 h-44 sm:h-56 rounded-b-[2rem] border-4 cursor-pointer transition-all flex flex-col-reverse items-center p-1.5
              ${selectedTubeIndex === idx 
                ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20 scale-105 shadow-xl -translate-y-4' 
                : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-slate-400'}
            `}
          >
            {tube.map((color, bIdx) => (
              <motion.div
                key={bIdx}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 sm:w-14 h-12 sm:h-14 rounded-full mb-1 shadow-inner border-2 border-black/10"
                style={{ backgroundColor: color }}
              />
            ))}
            
            {/* Selected ball preview floating above */}
            {selectedTubeIndex === idx && tube.length > 0 && (
              <motion.div 
                layoutId={`selected-ball-${idx}`}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -70, opacity: 1 }}
                className="absolute top-0 w-12 sm:w-14 h-12 sm:h-14 rounded-full shadow-2xl border-2 border-black/20 z-10"
                style={{ backgroundColor: tube[tube.length - 1] }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border-2 border-blue-100 dark:border-blue-800 flex items-start gap-3">
        <Info size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
        <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
          Organize todas as bolas da mesma cor no mesmo tubo. Toque em um tubo para selecionar a bola do topo e em outro para movê-la.
        </p>
      </div>
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl border-4 border-yellow-400"
            >
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Incrível!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
                Nível {level} concluído em {moves} movimentos!
              </p>
              <button 
                onClick={nextLevel}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Próximo Nível
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BallSortGame;
