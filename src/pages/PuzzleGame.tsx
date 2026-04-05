
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AuthUser, Member, Score, UserRole, PuzzleImage } from '@/types';
import { DatabaseService } from '@/db';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { ArrowLeft, RefreshCw, Trophy, Lock, Timer, Zap, Shuffle, Calendar, Image as ImageIcon, Puzzle, CheckCircle2 } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';

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
  const [showInstructions, setShowInstructions] = useState(true);
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
    const available = (day >= 0 && day <= 4) || puzzleOverride || isAdmin;

    let played = false;
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
        
        const matchesGame = s.gameId === 'puzzleGame' || (s as any).puzzleGame !== undefined;
        return d >= cycleStart && matchesGame;
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [puzzleOverride, currentMember, isAdmin, cycleStart]);

  if (hasPlayedThisWeek && !isAdmin && !puzzleOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Quebra-Cabeça" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Missão Cumprida!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Você já completou este desafio esta semana. Volte no próximo domingo ao meio-dia!</p>
        </div>
      </div>
    );
  }

  if (!isAvailable && !isAdmin && !puzzleOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Quebra-Cabeça" user={user} onBack={onBack} />
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

  const initializeGame = (image: PuzzleImage) => {
    setSelectedImage(image);
    const initialTiles: Tile[] = [];
    for (let i = 0; i < TILE_COUNT - 1; i++) {
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
    // Find member again to ensure we have latest data
    const memberToUpdate = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    
    if (memberToUpdate) {
      const points = calculatePoints();
      const newScore: Score = {
        type: 'game',
        gameId: 'puzzleGame',
        points: points,
        puzzleGame: points,
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      const updatedScores = [...(memberToUpdate.scores || []), newScore];

      onUpdateMember({
        ...memberToUpdate,
        scores: updatedScores
      });
    }
    onBack();
  };

  const saveScoreToProfile = useCallback(() => {
    // Find member again to ensure we have latest data
    const memberToUpdate = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    
    if (memberToUpdate) {
      const points = calculatePoints();
      const newScore: Score = {
        type: 'game',
        gameId: 'puzzleGame',
        points: points,
        puzzleGame: points,
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      const updatedScores = [...(memberToUpdate.scores || []), newScore];

      onUpdateMember({
        ...memberToUpdate,
        scores: updatedScores
      });
    }
  }, [calculatePoints, members, user.id, user.name, onUpdateMember]);

  useEffect(() => {
    if (isGameOver) {
      saveScoreToProfile();
    }
  }, [isGameOver, saveScoreToProfile]);

  if (hasPlayedThisWeek && !isAdmin && !puzzleOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Quebra-Cabeça" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6"><Lock size={40} /></div>
          <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Concluído</h2>
          <p className="text-slate-500 mb-8 text-sm">Você já completou este desafio esta semana. Volte no próximo sábado!</p>
        </div>
      </div>
    );
  }

  if (!isAvailable && !isAdmin && !puzzleOverride) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Quebra-Cabeça" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#0061f2] mb-6"><Calendar size={40} /></div>
          <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Indisponível</h2>
          <p className="text-slate-500 mb-8 text-sm">Os jogos estão bloqueados hoje. Volte amanhã!</p>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    const points = calculatePoints();
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title="Quebra-Cabeça" user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
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
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            Sua pontuação foi salva automaticamente!
          </p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
        <GameHeader 
          title="Quebra-Cabeça"
          user={user}
          stats={[
            { label: 'Tempo', value: formatTime(seconds) },
            { label: 'Movimentos', value: moves }
          ]}
          onBack={onBack}
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <GameInstructions
            isOpen={showInstructions}
            onStart={() => setShowInstructions(false)}
            title="Quebra-Cabeça"
            instructions={[
              "Escolha uma imagem para começar o desafio.",
              "Deslize as peças para os espaços vazios.",
              "Organize todas as peças na posição correta.",
              "Quanto menos movimentos e tempo, mais pontos!",
              "O jogo termina quando a imagem estiver completa."
            ]}
            icon={<Puzzle size={32} className="text-white" />}
          />
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
                  <img src={formatImageUrl(img.url) || undefined} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      <GameHeader 
        title="Quebra-Cabeça"
        user={user}
        stats={[
          { label: 'Tempo', value: formatTime(seconds) },
          { label: 'Movimentos', value: moves }
        ]}
        onRefresh={() => initializeGame(selectedImage!)}
        onBack={onBack}
      />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative bg-slate-200 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
          style={{ 
            width: 'min(80vw, 260px)', 
            height: 'min(80vw, 260px)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '2px'
          }}
        >
          {Array.from({ length: TILE_COUNT }).map((_, pos) => {
            const tile = tiles.find(t => t.currentPos === pos);
            if (!tile) {
              return <div key={`empty-${pos}`} className="bg-slate-100/50" />;
            }

            const row = Math.floor(tile.id / GRID_SIZE);
            const col = tile.id % GRID_SIZE;

            return (
              <div 
                key={`tile-${tile.id}`}
                onClick={() => handleTileClick(tile.id)}
                className="relative cursor-pointer active:scale-95 transition-transform duration-200 overflow-hidden rounded-lg border border-white/20"
                style={{
                  backgroundImage: `url(${formatImageUrl(selectedImage?.url || '')})`,
                  backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                  backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`,
                  backgroundRepeat: 'no-repeat'
                }}
              >
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
