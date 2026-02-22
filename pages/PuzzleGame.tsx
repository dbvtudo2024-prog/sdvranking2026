
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, Member, Score, UserRole, PuzzleImage } from '../types';
import { DatabaseService } from '../db';
import { ArrowLeft, RefreshCw, Trophy, Lock, Timer, Zap, Shuffle, Calendar, Image as ImageIcon } from 'lucide-react';

interface PuzzleGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  puzzleOverride: boolean;
}

interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
}

const GRID_SIZE = 4; // 4x4 grid
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

const PuzzleGame: React.FC<PuzzleGameProps> = ({ user, members, onUpdateMember, onBack, puzzleOverride }) => {
  const [images, setImages] = useState<PuzzleImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<PuzzleImage | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const { isAvailable, hasPlayedToday } = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const available = isSunday || puzzleOverride;
    
    let alreadyPlayed = false;
    if (currentMember) {
      const todayStr = now.toLocaleDateString('pt-BR');
      alreadyPlayed = (currentMember.scores || []).some(s => s.date === todayStr && s.puzzleGame !== undefined);
    }
    
    return { isAvailable: available, hasPlayedToday: alreadyPlayed };
  }, [puzzleOverride, currentMember]);

  useEffect(() => {
    const sub = DatabaseService.subscribePuzzleImages(setImages);
    return () => {
      sub.unsubscribe();
      stopTimer();
    };
  }, []);

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shuffleTiles = (array: Tile[]) => {
    const shuffled = [...array];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i].currentPos, shuffled[j].currentPos] = [shuffled[j].currentPos, shuffled[i].currentPos];
    }
    
    // Check if solvable (simplified: just shuffle until solvable or just use a few random moves)
    // For sliding puzzles, a random permutation might not be solvable.
    // Better approach: start from solved state and make N random valid moves.
    return shuffled;
  };

  const initializeGame = (image: PuzzleImage) => {
    setSelectedImage(image);
    const initialTiles: Tile[] = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      initialTiles.push({ id: i, currentPos: i, correctPos: i });
    }
    
    // Start from solved state and perform random moves to ensure solvability
    let currentTiles = [...initialTiles];
    let emptyPos = TILE_COUNT - 1;
    
    for (let i = 0; i < 100; i++) {
      const neighbors = getNeighbors(emptyPos);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap empty with neighbor
      const tileIdx = currentTiles.findIndex(t => t.currentPos === randomNeighbor);
      currentTiles[tileIdx].currentPos = emptyPos;
      emptyPos = randomNeighbor;
    }

    setTiles(currentTiles);
    setMoves(0);
    setSeconds(0);
    setIsGameOver(false);
    setIsStarted(true);
    startTimer();
  };

  const getNeighbors = (pos: number) => {
    const neighbors = [];
    const row = Math.floor(pos / GRID_SIZE);
    const col = pos % GRID_SIZE;

    if (row > 0) neighbors.push(pos - GRID_SIZE); // Up
    if (row < GRID_SIZE - 1) neighbors.push(pos + GRID_SIZE); // Down
    if (col > 0) neighbors.push(pos - 1); // Left
    if (col < GRID_SIZE - 1) neighbors.push(pos + 1); // Right

    return neighbors;
  };

  const handleTileClick = (tileId: number) => {
    if (isGameOver || !isStarted) return;

    const tileIdx = tiles.findIndex(t => t.id === tileId);
    const tile = tiles[tileIdx];
    const emptyPos = getEmptyPos();

    if (isAdjacent(tile.currentPos, emptyPos)) {
      const newTiles = [...tiles];
      newTiles[tileIdx].currentPos = emptyPos;
      setTiles(newTiles);
      setMoves(prev => prev + 1);
      
      if (checkWin(newTiles)) {
        setIsGameOver(true);
        stopTimer();
      }
    }
  };

  const getEmptyPos = () => {
    const occupiedPositions = tiles.map(t => t.currentPos);
    for (let i = 0; i < TILE_COUNT; i++) {
      if (!occupiedPositions.includes(i)) return i;
    }
    return -1;
  };

  const isAdjacent = (pos1: number, pos2: number) => {
    const row1 = Math.floor(pos1 / GRID_SIZE);
    const col1 = pos1 % GRID_SIZE;
    const row2 = Math.floor(pos2 / GRID_SIZE);
    const col2 = pos2 % GRID_SIZE;

    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const checkWin = (currentTiles: Tile[]) => {
    return currentTiles.every(t => t.currentPos === t.correctPos);
  };

  const calculatePoints = () => {
    const basePoints = 50;
    const idealMoves = 80;
    const idealTime = 180;
    
    const moveEfficiency = Math.max(0.5, idealMoves / Math.max(1, moves));
    const timeEfficiency = Math.max(0.5, idealTime / Math.max(1, seconds));
    
    const multiplier = (moveEfficiency + timeEfficiency) / 2;
    return Math.max(15, Math.floor(basePoints * multiplier * 1.5));
  };

  const handleFinish = () => {
    if (currentMember) {
      const points = calculatePoints();
      const newScoreEntry: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        puzzleGame: points
      };
      
      const updatedScores = Array.isArray(currentMember.scores) ? [...currentMember.scores, newScoreEntry] : [newScoreEntry];

      onUpdateMember({
        ...currentMember,
        scores: updatedScores
      });
    }
    onBack();
  };

  if (hasPlayedToday && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6"><Lock size={40} /></div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Limite Diário</h2>
        <p className="text-slate-500 mb-8 text-sm">Você já jogou hoje. Volte no próximo domingo!</p>
        <button onClick={onBack} className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">VOLTAR</button>
      </div>
    );
  }

  if (!isAvailable && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#0061f2] mb-6"><Calendar size={40} /></div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Aguarde o Domingo</h2>
        <p className="text-slate-500 mb-8 text-sm">O jogo abre automaticamente aos domingos.</p>
        <button onClick={onBack} className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">VOLTAR</button>
      </div>
    );
  }

  if (isGameOver) {
    const points = calculatePoints();
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-[#FFD700] rounded-[2.5rem] flex items-center justify-center text-[#003366] shadow-xl mb-8"><Trophy size={48} /></div>
        <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase">Incrível!</h2>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full">
           <p className="text-6xl font-black text-[#0061f2]">{points} <span className="text-xl">pts</span></p>
           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2">Quebra-Cabeça Concluído</p>
           <div className="mt-4 flex justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
             <span>Tempo: {formatTime(seconds)}</span>
             <span>Movimentos: {moves}</span>
           </div>
        </div>
        <button onClick={handleFinish} className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase shadow-xl">SALVAR PONTOS</button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 p-6 overflow-y-auto">
        <div className="flex items-center mb-10">
          <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
          <h2 className="ml-4 text-xl font-black text-slate-800 uppercase">Quebra-Cabeça</h2>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 pb-10">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#0061f2] mx-auto mb-4">
              <Shuffle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase">Escolha uma Imagem</h3>
            <p className="text-slate-400 text-sm font-medium">Resolva o desafio para ganhar pontos!</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {images.map(img => (
              <button 
                key={img.id}
                onClick={() => initializeGame(img)}
                className="w-full bg-white border-2 border-slate-100 p-4 rounded-[2rem] shadow-xl shadow-blue-900/5 flex items-center gap-4 group active:scale-95 transition-all"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={img.url} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Desafio</p>
                  <h4 className="text-lg font-black text-slate-800 uppercase truncate">{img.title}</h4>
                  <p className="text-slate-400 text-xs font-bold">Grid 4x4 • 50 Pontos Base</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Zap size={20} />
                </div>
              </button>
            ))}
            {images.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <ImageIcon className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-slate-400 text-xs font-bold uppercase">Nenhuma imagem disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={() => setIsStarted(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
        <button onClick={() => initializeGame(selectedImage!)} className="px-6 py-2.5 bg-[#FFD700] text-[#003366] rounded-2xl font-black uppercase text-[10px] shadow-md"><RefreshCw size={14} className="inline mr-2" /> Reiniciar</button>
      </div>
      
      <div className="bg-white rounded-[1.5rem] p-4 mb-4 shadow-sm border border-slate-100 flex items-center justify-between mx-2">
        <div className="flex items-center gap-2 font-black text-slate-800 font-mono"><Timer size={20} className="text-blue-600" /> {formatTime(seconds)}</div>
        <div className="flex items-center gap-2 font-black text-slate-800"><Shuffle size={18} className="text-blue-500" /> {moves} mov</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative bg-slate-200 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
          style={{ 
            width: 'min(90vw, 400px)', 
            height: 'min(90vw, 400px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '2px'
          }}
        >
          {Array.from({ length: TILE_COUNT }).map((_, pos) => {
            const tile = tiles.find(t => t.currentPos === pos);
            if (!tile || (tile.id === TILE_COUNT - 1 && !isGameOver)) {
              return <div key={pos} className="bg-slate-100/50" />;
            }

            const row = Math.floor(tile.id / GRID_SIZE);
            const col = tile.id % GRID_SIZE;

            return (
              <div 
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                className="relative cursor-pointer active:scale-95 transition-transform duration-200 overflow-hidden"
              >
                <img 
                  src={selectedImage?.url} 
                  referrerPolicy="no-referrer"
                  className="absolute max-w-none"
                  style={{
                    width: `${GRID_SIZE * 100}%`,
                    height: `${GRID_SIZE * 100}%`,
                    left: `-${col * 100}%`,
                    top: `-${row * 100}%`,
                    objectFit: 'cover'
                  }}
                />
                <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dica: Clique nas peças adjacentes ao espaço vazio para movê-las</p>
      </div>
    </div>
  );
};

export default PuzzleGame;
