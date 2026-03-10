
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tent, Compass, Flame, Map, Anchor, HeartPulse, Shield, Sword, 
  Music, Medal, Users, TreePine, Mountain, Sun, Moon, CloudRain,
  Wind, Zap, Thermometer, Stethoscope, ArrowLeft, RefreshCw, Trophy, Clock
} from 'lucide-react';
import { AuthUser, Member, Score } from '@/types';

interface MahjongGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  isDarkMode?: boolean;
}

interface Tile {
  id: number;
  icon: React.ReactNode;
  iconName: string;
  row: number;
  col: number;
  layer: number;
  removed: boolean;
}

const ICONS = [
  { name: 'Tent', component: <Tent size={24} /> },
  { name: 'Compass', component: <Compass size={24} /> },
  { name: 'Flame', component: <Flame size={24} /> },
  { name: 'Map', component: <Map size={24} /> },
  { name: 'Anchor', component: <Anchor size={24} /> },
  { name: 'HeartPulse', component: <HeartPulse size={24} /> },
  { name: 'Shield', component: <Shield size={24} /> },
  { name: 'Sword', component: <Sword size={24} /> },
  { name: 'Music', component: <Music size={24} /> },
  { name: 'Medal', component: <Medal size={24} /> },
  { name: 'Users', component: <Users size={24} /> },
  { name: 'TreePine', component: <TreePine size={24} /> },
  { name: 'Mountain', component: <Mountain size={24} /> },
  { name: 'Sun', component: <Sun size={24} /> },
  { name: 'Moon', component: <Moon size={24} /> },
  { name: 'CloudRain', component: <CloudRain size={24} /> },
  { name: 'Wind', component: <Wind size={24} /> },
  { name: 'Zap', component: <Zap size={24} /> },
];

const MahjongGame: React.FC<MahjongGameProps> = ({ user, members, onUpdateMember, onBack, isDarkMode }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const initGame = () => {
    const newTiles: Tile[] = [];
    let idCounter = 0;
    
    // We need pairs. Let's create a 8x4 grid (32 tiles) for simplicity, or a more "Mahjong" shape.
    // Layer 0: 6x6 (36 tiles)
    // Layer 1: 4x4 (16 tiles)
    // Total: 52 tiles (26 pairs)
    
    const pairsNeeded = 26;
    const selectedIcons = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const icon = ICONS[i % ICONS.length];
      selectedIcons.push(icon, icon);
    }
    
    // Shuffle icons
    const shuffledIcons = [...selectedIcons].sort(() => Math.random() - 0.5);
    
    // Layer 0 (Bottom)
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (shuffledIcons.length > 0) {
          const icon = shuffledIcons.pop()!;
          newTiles.push({
            id: idCounter++,
            icon: icon.component,
            iconName: icon.name,
            row: r,
            col: c,
            layer: 0,
            removed: false
          });
        }
      }
    }
    
    // Layer 1 (Top)
    for (let r = 1; r < 5; r++) {
      for (let c = 1; c < 5; c++) {
        if (shuffledIcons.length > 0) {
          const icon = shuffledIcons.pop()!;
          newTiles.push({
            id: idCounter++,
            icon: icon.component,
            iconName: icon.name,
            row: r,
            col: c,
            layer: 1,
            removed: false
          });
        }
      }
    }

    setTiles(newTiles);
    setScore(0);
    setSeconds(0);
    setIsGameOver(false);
    setIsStarted(true);
    setSelectedId(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isGameOver) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isGameOver]);

  const isTileSelectable = (tile: Tile) => {
    if (tile.removed) return false;
    
    // A tile is selectable if:
    // 1. No tile is on top of it (higher layer at same or overlapping position)
    // 2. It has at least one side (left or right) free in its own layer
    
    const onTop = tiles.some(t => 
      !t.removed && 
      t.layer > tile.layer && 
      Math.abs(t.row - tile.row) < 1 && 
      Math.abs(t.col - tile.col) < 1
    );
    
    if (onTop) return false;
    
    const leftBlocked = tiles.some(t => 
      !t.removed && 
      t.layer === tile.layer && 
      t.row === tile.row && 
      t.col === tile.col - 1
    );
    
    const rightBlocked = tiles.some(t => 
      !t.removed && 
      t.layer === tile.layer && 
      t.row === tile.row && 
      t.col === tile.col + 1
    );
    
    return !leftBlocked || !rightBlocked;
  };

  const handleTileClick = (tile: Tile) => {
    if (!isTileSelectable(tile)) return;
    
    if (selectedId === null) {
      setSelectedId(tile.id);
    } else {
      if (selectedId === tile.id) {
        setSelectedId(null);
        return;
      }
      
      const firstTile = tiles.find(t => t.id === selectedId)!;
      if (firstTile.iconName === tile.iconName) {
        // Match!
        const newTiles = tiles.map(t => 
          (t.id === firstTile.id || t.id === tile.id) ? { ...t, removed: true } : t
        );
        setTiles(newTiles);
        setScore(s => s + 10);
        setSelectedId(null);
        
        if (newTiles.every(t => t.removed)) {
          setIsGameOver(true);
        }
      } else {
        // No match
        setSelectedId(tile.id);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const member = members.find(m => m.id === user.id);
    if (member) {
      const points = Math.max(10, Math.floor(score * 2 - seconds / 10));
      const newScore: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
        mahjongGame: points
      };
      onUpdateMember({
        ...member,
        scores: [...(member.scores || []), newScore]
      });
    }
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      <header className="bg-white dark:bg-slate-800 p-4 flex items-center justify-between shadow-sm z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-black uppercase tracking-tighter text-slate-800 dark:text-white">Mahjong Desbravador</h2>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(seconds)}</span>
            <span className="flex items-center gap-1"><Trophy size={10} /> {score}</span>
          </div>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
          <RefreshCw size={20} className="text-blue-600" />
        </button>
      </header>

      <main className="flex-1 relative p-4 flex items-center justify-center overflow-auto">
        {!isStarted ? (
          <div className="text-center space-y-6 max-w-xs animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20 rotate-12">
              <Medal size={48} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Mahjong</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Combine os pares de símbolos dos desbravadores para limpar o tabuleiro.</p>
            </div>
            <button 
              onClick={initGame}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              Começar Desafio
            </button>
          </div>
        ) : isGameOver ? (
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-amber-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-400/20">
              <Trophy size={48} className="text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Vitória!</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Você limpou todo o tabuleiro</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
              <p className="text-5xl font-black text-blue-600 mb-2">{score}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pontos Conquistados</p>
              <div className="mt-4 text-xs font-bold text-slate-500">Tempo: {formatTime(seconds)}</div>
            </div>
            <button 
              onClick={handleFinish}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              Salvar e Sair
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-md aspect-square grid grid-cols-6 gap-1">
            {tiles.map(tile => (
              <motion.div
                key={tile.id}
                initial={false}
                animate={{ 
                  scale: tile.removed ? 0 : 1,
                  opacity: tile.removed ? 0 : 1,
                  zIndex: tile.layer * 10 + (selectedId === tile.id ? 5 : 0)
                }}
                className={`
                  relative aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer
                  ${tile.removed ? 'pointer-events-none' : ''}
                  ${isTileSelectable(tile) ? 'hover:scale-105 active:scale-95' : 'opacity-40 grayscale'}
                  ${selectedId === tile.id ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md'}
                  ${tile.layer === 1 ? 'border-2 border-blue-100 dark:border-blue-900/30' : ''}
                `}
                style={{
                  gridRow: tile.row + 1,
                  gridColumn: tile.col + 1,
                  transform: `translate(${tile.layer * 4}px, ${tile.layer * -4}px)`
                }}
                onClick={() => handleTileClick(tile)}
              >
                {tile.icon}
                {tile.layer === 1 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MahjongGame;
