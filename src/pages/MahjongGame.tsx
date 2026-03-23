
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tent, Compass, Flame, Map, Anchor, HeartPulse, Shield, Sword, 
  Music, Medal, Users, TreePine, Mountain, Sun, Moon, CloudRain,
  Wind, Zap, Thermometer, Stethoscope, ArrowLeft, RefreshCw, Trophy, Clock, Star, CheckCircle2, Home
} from 'lucide-react';
import { AuthUser, Member, Score } from '@/types';
import GameHeader from '@/components/GameHeader';

interface MahjongGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  isDarkMode?: boolean;
  override?: boolean;
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

const MahjongGame: React.FC<MahjongGameProps> = ({ user, members, onUpdateMember, onBack, isDarkMode, override }) => {
  const [level, setLevel] = useState(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [shuffles, setShuffles] = useState(3);
  const [hints, setHints] = useState(3);
  const [hintedPair, setHintedPair] = useState<number[]>([]);
  const [showMilestone, setShowMilestone] = useState<{title: string, msg: string, reward: string} | null>(null);
  const [reachedMilestones, setReachedMilestones] = useState<number[]>([]);

  const currentMember = useMemo(() => 
    members.find(m => m.id === user.id),
  [members, user]);

  const hasPlayedThisWeek = useMemo(() => {
    if (override) return false;
    if (!currentMember?.scores) return false;
    
    const now = new Date();
    const day = now.getDay();
    // Sunday (0) is the start of the week
    const diff = day;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - diff);
    sunday.setHours(0, 0, 0, 0);

    return (currentMember.scores || []).some(s => 
      s.gameId === 'mahjongGame' && new Date(s.date) >= sunday
    );
  }, [currentMember, override]);

  const scoreRef = useRef(score);
  const levelRef = useRef(level);
  const memberRef = useRef(currentMember);

  useEffect(() => {
    scoreRef.current = score;
    levelRef.current = level;
  }, [score, level]);

  useEffect(() => {
    memberRef.current = currentMember;
  }, [currentMember]);

  useEffect(() => {
    const savedLevel = localStorage.getItem(`mahjong_level_${user.id}`);
    const savedScore = localStorage.getItem(`mahjong_score_${user.id}`);
    
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedScore) setScore(parseInt(savedScore));
    
    const handleBeforeUnload = () => {
      saveProgress(levelRef.current, scoreRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Auto-save on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveProgress(levelRef.current, scoreRef.current);
    };
  }, []);

  const saveProgress = (currentLevel: number, currentScore: number) => {
    localStorage.setItem(`mahjong_level_${user.id}`, String(currentLevel));
    localStorage.setItem(`mahjong_score_${user.id}`, String(currentScore));
  };

  const globalProgress = useMemo(() => {
    const levelProgress = tiles.length > 0 ? (tiles.filter(t => t.removed).length / tiles.length) : 0;
    return ((level - 1 + levelProgress) / 100) * 100;
  }, [level, tiles]);

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => level >= m && !reachedMilestones.includes(m));
    
    if (currentMilestone) {
      setReachedMilestones(prev => [...prev, currentMilestone]);
      setShuffles(s => s + 2);
      setHints(h => h + 1);
      
      const messages: Record<number, {title: string, msg: string}> = {
        25: { title: "Iniciante de Elite", msg: "Você dominou o primeiro quarto da jornada!" },
        50: { title: "Mestre do Equilíbrio", msg: "Metade do caminho percorrido com perfeição." },
        75: { title: "Sábio dos Símbolos", msg: "A maestria absoluta está ao seu alcance." },
        100: { title: "Lenda do Mahjong", msg: "Você transcedeu todos os desafios!" }
      };
      
      setShowMilestone({
        ...messages[currentMilestone],
        reward: "+2 Embaralhamentos, +1 Dica"
      });
      
      setTimeout(() => setShowMilestone(null), 4000);
    }
  }, [level, reachedMilestones]);

  const generateLayout = (currentLevel: number): Tile[] => {
    const positions: { r: number; c: number; l: number }[] = [];
    const type = currentLevel % 5;
    
    // Cálculo da quantidade de pedras: Base 24 (12 pares) + 2 pedras (1 par) a cada 10 níveis
    const targetCount = 24 + Math.floor((currentLevel - 1) / 10) * 2;

    // Gerar posições baseadas no tipo de layout
    if (type === 1) { // Rectangle
      const rows = 4;
      const cols = 6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions.push({ r, c, l: 0 });
        }
      }
    } else if (type === 2) { // Pyramid
      // Camada 0: 4x4 (16)
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) positions.push({ r, c, l: 0 });
      // Camada 1: 3x3 (9)
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) positions.push({ r: r + 0.5, c: c + 0.5, l: 1 });
    } else if (type === 3) { // Cross
      for (let i = 0; i < 7; i++) {
        positions.push({ r: 3, c: i, l: 0 });
        if (i !== 3) positions.push({ r: i, c: 3, l: 0 });
      }
      for (let i = 1; i < 6; i++) {
        positions.push({ r: 3, c: i, l: 1 });
        if (i !== 3) positions.push({ r: i, c: 3, l: 1 });
      }
    } else if (type === 4) { // Hollow Square
      for (let i = 0; i < 6; i++) {
        positions.push({ r: 0, c: i, l: 0 });
        positions.push({ r: 5, c: i, l: 0 });
        if (i > 0 && i < 5) {
          positions.push({ r: i, c: 0, l: 0 });
          positions.push({ r: i, c: 5, l: 0 });
        }
      }
    } else { // Clusters
      for (let i = 0; i < 24; i++) {
        positions.push({ r: Math.floor(i / 6), c: i % 6, l: 0 });
      }
    }

    // Ajustar para o targetCount exato do nível
    let finalPositions = [...positions];
    if (finalPositions.length > targetCount) {
      finalPositions = finalPositions.slice(0, targetCount);
    } else {
      // Adicionar pedras extras se o layout base for menor que o necessário
      while (finalPositions.length < targetCount) {
        const last = finalPositions[finalPositions.length - 1] || { r: 0, c: 0, l: 0 };
        finalPositions.push({ 
          r: (last.r + 1) % 6, 
          c: (last.c + 1) % 8, 
          l: last.l 
        });
      }
    }

    // Garantir que o número de pedras seja par
    if (finalPositions.length % 2 !== 0) finalPositions.pop();

    // Reverse Simulation to guarantee solvability
    const tilesWithIcons: Tile[] = finalPositions.map((p, i) => ({
      id: i,
      icon: null as any,
      iconName: '',
      row: p.r,
      col: p.c,
      layer: p.l,
      removed: false
    }));

    const tempTiles = [...tilesWithIcons];
    const iconPool = [...ICONS].sort(() => Math.random() - 0.5);
    let iconIndex = 0;

    const isVerticallyBlocking = (t1: Tile, t2: Tile) => {
      return Math.abs(t1.row - t2.row) < 0.7 && Math.abs(t1.col - t2.col) < 0.7;
    };

    const isSelectableInSimulation = (tile: Tile, currentTiles: Tile[]) => {
      const onTop = currentTiles.some(t => 
        t.id !== tile.id &&
        t.layer > tile.layer && 
        isVerticallyBlocking(t, tile)
      );
      if (onTop) return false;
      const leftBlocked = currentTiles.some(t => 
        t.id !== tile.id &&
        t.layer === tile.layer && 
        t.row === tile.row && 
        t.col === tile.col - 1
      );
      const rightBlocked = currentTiles.some(t => 
        t.id !== tile.id &&
        t.layer === tile.layer && 
        t.row === tile.row && 
        t.col === tile.col + 1
      );
      return !leftBlocked || !rightBlocked;
    };

    const workingSet = [...tilesWithIcons];
    const finalTiles: Tile[] = [];

    while (workingSet.length > 0) {
      const selectable = workingSet.filter(t => isSelectableInSimulation(t, workingSet));
      
      let t1: Tile | undefined;
      let t2: Tile | undefined;

      if (selectable.length >= 2) {
        const idx1 = Math.floor(Math.random() * selectable.length);
        let idx2 = Math.floor(Math.random() * selectable.length);
        while (idx1 === idx2) idx2 = Math.floor(Math.random() * selectable.length);
        t1 = selectable[idx1];
        t2 = selectable[idx2];
      } else {
        // Fallback: Encontrar qualquer par que não se bloqueie verticalmente
        for (let i = 0; i < workingSet.length; i++) {
          for (let j = i + 1; j < workingSet.length; j++) {
            if (!isVerticallyBlocking(workingSet[i], workingSet[j])) {
              t1 = workingSet[i];
              t2 = workingSet[j];
              break;
            }
          }
          if (t1) break;
        }
        if (!t1) {
          t1 = workingSet[0];
          t2 = workingSet[1];
        }
      }

      if (t1 && t2) {
        const icon = iconPool[iconIndex % iconPool.length];
        iconIndex++;
        finalTiles.push({...t1, icon: icon.component, iconName: icon.name});
        finalTiles.push({...t2, icon: icon.component, iconName: icon.name});
        const id1 = t1.id;
        const id2 = t2.id;
        workingSet.splice(workingSet.findIndex(t => t.id === id1), 1);
        workingSet.splice(workingSet.findIndex(t => t.id === id2), 1);
      } else {
        break;
      }
    }
    return finalTiles;
  };

  const initGame = (lvl = 1) => {
    const newTiles = generateLayout(lvl);
    setTiles(newTiles);
    if (lvl === 1) {
      setScore(0);
      setSeconds(0);
      setShuffles(3);
      setHints(3);
    }
    setLevel(lvl);
    setIsGameOver(false);
    setIsStarted(true);
    setSelectedId(null);
    setHintedPair([]);
    saveProgress(lvl, score);
  };

  const handleShuffle = () => {
    if (shuffles <= 0) return;
    
    const remainingTiles = tiles.filter(t => !t.removed);
    const icons = remainingTiles.map(t => ({ name: t.iconName, component: t.icon }));
    const shuffledIcons = [...icons].sort(() => Math.random() - 0.5);
    
    const newTiles = tiles.map(t => {
      if (t.removed) return t;
      const icon = shuffledIcons.pop()!;
      return { ...t, icon: icon.component, iconName: icon.name };
    });
    
    setTiles(newTiles);
    setShuffles(prev => prev - 1);
    setSelectedId(null);
    setHintedPair([]);
  };

  const handleHint = () => {
    if (hints <= 0 || hintedPair.length > 0) return;

    const selectable = tiles.filter(t => !t.removed && isTileSelectable(t));
    for (let i = 0; i < selectable.length; i++) {
      for (let j = i + 1; j < selectable.length; j++) {
        if (selectable[i].iconName === selectable[j].iconName) {
          setHintedPair([selectable[i].id, selectable[j].id]);
          setHints(h => h - 1);
          setTimeout(() => setHintedPair([]), 3000);
          return;
        }
      }
    }
  };

  const checkPossibleMoves = (currentTiles: Tile[]) => {
    const selectable = currentTiles.filter(t => !t.removed && isTileSelectable(t));
    for (let i = 0; i < selectable.length; i++) {
      for (let j = i + 1; j < selectable.length; j++) {
        if (selectable[i].iconName === selectable[j].iconName) return true;
      }
    }
    return false;
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
    
    const onTop = tiles.some(t => 
      !t.removed && 
      t.layer > tile.layer && 
      Math.abs(t.row - tile.row) < 0.7 && 
      Math.abs(t.col - tile.col) < 0.7
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
        setHintedPair([]);
        const newTiles = tiles.map(t => 
          (t.id === firstTile.id || t.id === tile.id) ? { ...t, removed: true } : t
        );
        setTiles(newTiles);
        setScore(s => s + 10);
        setSelectedId(null);
        
        if (newTiles.every(t => t.removed)) {
          if (level < 100) {
            // Save progress on level completion
            saveProgress(level + 1, score + 10);
            
            setTimeout(() => {
              initGame(level + 1);
            }, 1000);
          } else {
            setIsGameOver(true);
          }
        }
      } else {
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
    if (currentMember) {
      const points = Math.max(10, Math.floor(score * 2 - seconds / 10));
      const newScore: Score = {
        type: 'game',
        gameId: 'mahjongGame',
        points: points,
        mahjongGame: points,
        date: new Date().toLocaleDateString('pt-BR')
      };
      onUpdateMember({
        ...currentMember,
        scores: [...(currentMember.scores || []), newScore]
      });
      localStorage.setItem(`mahjong_level_${user.id}`, '1');
      localStorage.setItem(`mahjong_score_${user.id}`, '0');
    }
    onBack();
  };

  const handleExit = () => {
    saveProgress(level, score);
    onBack();
  };

  const layoutInfo = useMemo(() => {
    if (tiles.length === 0) return { offsetX: 0, offsetY: 0, tileWidth: 16, spacingX: 14, spacingY: 16 };
    
    const maxCol = Math.max(...tiles.map(t => t.col));
    const maxRow = Math.max(...tiles.map(t => t.row));
    
    // Base: Tamanho inicial menor para manter padrão entre níveis
    let tileWidth = 10;
    const availableWidth = 92;
    const availableHeight = 85;

    // Fatores de proporção baseados no design original
    const getWidth = (tw: number) => maxCol * (tw * 0.85) + tw;
    const getHeight = (tw: number) => maxRow * (tw * 1.1) + (tw * 1.33);

    // Redução iterativa se necessário para níveis muito densos
    while (tileWidth > 5 && (getWidth(tileWidth) > availableWidth || getHeight(tileWidth) > availableHeight)) {
      tileWidth -= 0.2;
    }

    const spacingX = tileWidth * 0.85;
    const spacingY = tileWidth * 1.1;
    const tileHeight = tileWidth * 1.33;

    return {
      tileWidth,
      spacingX,
      spacingY,
      offsetX: (100 - (maxCol * spacingX + tileWidth)) / 2,
      offsetY: (100 - (maxRow * spacingY + tileHeight)) / 2
    };
  }, [tiles]);

  const progress = useMemo(() => {
    if (tiles.length === 0) return 0;
    const removedCount = tiles.filter(t => t.removed).length;
    return (removedCount / tiles.length) * 100;
  }, [tiles]);

  const noMovesLeft = isStarted && !isGameOver && tiles.some(t => !t.removed) && !checkPossibleMoves(tiles);

  if (hasPlayedThisWeek) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-950">
        <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase mb-2">Missão Cumprida!</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
          Você já completou este desafio esta semana. Volte na próxima segunda!
        </p>
        <button 
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      {isStarted && (
        <GameHeader 
          stats={[
            { label: 'Nível', value: `${level}/100` },
            { label: 'Tempo', value: formatTime(seconds) },
            { label: 'Pontos', value: score }
          ]}
          onRefresh={() => initGame(level)}
        />
      )}

      {isStarted && !isGameOver && (
        <div className="px-4 pt-2 relative">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${globalProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            />
            {/* Marcadores */}
            {[25, 50, 75].map(m => (
              <div 
                key={m}
                className={`absolute top-0 h-full w-0.5 z-10 ${globalProgress >= m ? 'bg-white/50' : 'bg-slate-400/20'}`}
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <div className="flex gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso Global</span>
              <div className="flex gap-2">
                {[25, 50, 75, 100].map(m => (
                  <span key={m} className={`text-[8px] font-bold px-1.5 rounded-full ${level >= m ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Nível {level} / 100 ({Math.round(globalProgress)}%)
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 relative p-4 flex flex-col items-center justify-center overflow-auto">
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl text-center max-w-xs pointer-events-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                  <Star size={40} className="text-white animate-pulse" />
                </div>
                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-1">{showMilestone.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{showMilestone.msg}</p>
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                  <RefreshCw size={14} className="text-blue-600" />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{showMilestone.reward}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isStarted ? (
          <div className="text-center space-y-6 max-w-xs animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20 rotate-12">
              <Medal size={48} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Mahjong 3D</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Combine os pares de símbolos. São 100 níveis de desafio crescente!</p>
            </div>
            <button 
              onClick={() => initGame(level)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              {level > 1 ? `Continuar Nível ${level}` : 'Começar Nível 1'}
            </button>
          </div>
        ) : isGameOver ? (
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-amber-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-400/20">
              <Trophy size={48} className="text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Mestre do Mahjong!</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Você completou os 100 níveis!</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
              <p className="text-5xl font-black text-blue-600 mb-2">{score}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pontos Conquistados</p>
              <div className="mt-4 text-xs font-bold text-slate-500">Tempo Total: {formatTime(seconds)}</div>
            </div>
            <button 
              onClick={handleFinish}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              Salvar e Sair
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
            <div className="relative w-full h-full max-w-2xl max-h-[600px]">
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
                    absolute rounded-lg flex items-center justify-center transition-all cursor-pointer
                    ${tile.removed ? 'pointer-events-none' : ''}
                    ${isTileSelectable(tile) ? 'hover:-translate-y-1 active:scale-95' : 'opacity-40 grayscale'}
                    ${selectedId === tile.id ? 'bg-blue-600 text-white ring-4 ring-blue-400/50' : hintedPair.includes(tile.id) ? 'bg-amber-100 dark:bg-amber-900/40 ring-4 ring-amber-400 animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'}
                  `}
                  style={{
                    width: `${layoutInfo.tileWidth}%`,
                    aspectRatio: '3/4',
                    left: `${layoutInfo.offsetX + tile.col * layoutInfo.spacingX + tile.layer * 0.8}%`,
                    top: `${layoutInfo.offsetY + tile.row * layoutInfo.spacingY - tile.layer * 0.8}%`,
                    boxShadow: !tile.removed ? `
                      ${tile.layer * 2 + 1}px ${tile.layer * 2 + 1}px 0px ${isDarkMode ? '#1e293b' : '#cbd5e1'},
                      ${tile.layer * 2 + 2}px ${tile.layer * 2 + 2}px 0px ${isDarkMode ? '#0f172a' : '#94a3b8'},
                      ${tile.layer * 4 + 4}px ${tile.layer * 4 + 4}px 12px rgba(0,0,0,0.15)
                    ` : 'none',
                    border: !tile.removed ? `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` : 'none',
                  }}
                  onClick={() => handleTileClick(tile)}
                >
                  <div 
                    className="transform transition-transform"
                    style={{ scale: layoutInfo.tileWidth / 16 }}
                  >
                    {tile.icon}
                  </div>
                  {tile.layer > 0 && (
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-400/20 rounded-full" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isStarted && !isGameOver && (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={handleShuffle}
              disabled={shuffles <= 0}
              title="Embaralhar peças"
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 ${
                shuffles > 0 
                  ? 'bg-blue-600 text-white shadow-blue-600/20' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={20} className={shuffles > 0 ? 'animate-spin-slow' : ''} />
              <span className="tabular-nums">{shuffles}</span>
            </button>

            <button
              onClick={handleHint}
              disabled={hints <= 0 || hintedPair.length > 0}
              title="Mostrar uma dica"
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 ${
                hints > 0 && hintedPair.length === 0
                  ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Star size={20} className={hints > 0 ? "text-white" : ""} />
              <span className="tabular-nums">{hints}</span>
            </button>

            <AnimatePresence>
              {noMovesLeft && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                  ⚠️ Sem movimentos possíveis!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Dica: Use o embaralhar se ficar travado
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MahjongGame;
