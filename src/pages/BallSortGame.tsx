
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BallSortGameProps {
  onBack: () => void;
  isDarkMode?: boolean;
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

const BallSortGame: React.FC<BallSortGameProps> = ({ onBack, isDarkMode }) => {
  const [tubes, setTubes] = useState<string[][]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [level, setLevel] = useState(1);

  const initGame = useCallback((lvl: number) => {
    const numColors = Math.min(lvl + 2, COLORS.length);
    const numEmptyTubes = 2;
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
    setSelectedTubeIndex(null);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame(level);
  }, [level, initGame]);

  const handleTubeClick = (index: number) => {
    if (isWon) return;

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
        const newTubes = [...tubes];
        newTubes[selectedTubeIndex] = sourceTube.slice(0, -1);
        newTubes[index] = [...targetTube, ballToMove];
        setTubes(newTubes);
        setSelectedTubeIndex(null);
        setMoves(m => m + 1);
        checkWin(newTubes);
      } else {
        setSelectedTubeIndex(index);
      }
    }
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
    setLevel(l => l + 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Organizar Cores</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nível {level} • {moves} Movimentos</p>
        </div>
        <button 
          onClick={() => initGame(level)}
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-700 active:scale-90 transition-all"
        >
          <RotateCcw size={20} className="text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      <div className="flex-1 flex flex-wrap justify-center items-center gap-6 content-center">
        {tubes.map((tube, idx) => (
          <div 
            key={idx}
            onClick={() => handleTubeClick(idx)}
            className={`
              relative w-16 h-48 rounded-b-3xl border-4 cursor-pointer transition-all flex flex-col-reverse items-center p-1
              ${selectedTubeIndex === idx 
                ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/20 scale-105 shadow-lg' 
                : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50'}
            `}
          >
            {tube.map((color, bIdx) => (
              <motion.div
                key={bIdx}
                layoutId={`ball-${idx}-${bIdx}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full mb-1 shadow-inner border-2 border-black/10"
                style={{ backgroundColor: color }}
              />
            ))}
            
            {/* Selected ball preview floating above */}
            {selectedTubeIndex === idx && (
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: -60 }}
                className="absolute top-0 w-12 h-12 rounded-full shadow-lg border-2 border-black/20"
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
