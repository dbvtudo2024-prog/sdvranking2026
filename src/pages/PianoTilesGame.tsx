
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, RotateCcw, Trophy, Music, Settings, List } from 'lucide-react';
import GameHeader from '@/components/GameHeader';
import { AuthUser, Member } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import GameInstructions from '@/components/GameInstructions';

interface PianoTilesGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
}

interface Song {
  id: string;
  name: string;
  url: string;
  notes: { time: number; col: number }[];
}

const SONGS: Song[] = [
  {
    id: 'hino',
    name: 'Hino dos Desbravadores',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    notes: [] // Will be generated procedurally
  },
  {
    id: 'brilha',
    name: 'Brilha Brilha Estrelinha',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    notes: []
  },
  {
    id: 'alegria',
    name: 'Ode à Alegria',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    notes: []
  }
];

const PianoTilesGame: React.FC<PianoTilesGameProps> = ({ user, members, onUpdateMember, onBack }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [activeNotes, setActiveNotes] = useState<{ id: number; col: number; time: number; hit: boolean }[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>();
  const lastNoteTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  const ranking = useMemo(() => {
    return members
      .map(m => ({
        name: m.name,
        score: m.scores.reduce((max, s) => Math.max(max, s.pianoTilesGame || 0), 0)
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [members]);

  const startGame = () => {
    setScore(0);
    setActiveNotes([]);
    lastNoteTimeRef.current = 0;
    gameTimeRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    setGameState('playing');
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play().catch(console.error);
    }
  };

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = performance.now();
    const deltaTime = (now - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = now;

    // Speed increases with score
    const speedMultiplier = 1 + Math.floor(score / 10) * 0.1;
    gameTimeRef.current += deltaTime * speedMultiplier;

    const currentTime = gameTimeRef.current;

    // Spawn new notes procedurally
    // Interval decreases as score increases
    const spawnInterval = Math.max(0.3, 0.8 - (Math.floor(score / 20) * 0.05));
    
    if (currentTime > lastNoteTimeRef.current + spawnInterval) {
      const col = Math.floor(Math.random() * 3);
      setActiveNotes(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        col, 
        time: currentTime + 2, // Note will be hit in 2 seconds at base speed
        hit: false 
      }]);
      lastNoteTimeRef.current = currentTime;
    }

    // Check for missed notes
    setActiveNotes(prev => {
      const missed = prev.find(n => !n.hit && n.time < currentTime - 0.1);
      if (missed) {
        setGameState('gameover');
        if (audioRef.current) audioRef.current.pause();
        return prev;
      }
      // Filter out notes that are far gone
      return prev.filter(n => n.time > currentTime - 1);
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastFrameTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, update]);

  const handleColumnClick = (col: number) => {
    if (gameState !== 'playing') return;
    
    const currentTime = gameTimeRef.current;
    
    setActiveNotes(prev => {
      const columnNotes = prev.filter(n => n.col === col && !n.hit);
      const sortedNotes = [...columnNotes].sort((a, b) => a.time - b.time);
      const targetNote = sortedNotes[0];

      if (targetNote) {
        const timeDiff = targetNote.time - currentTime;
        
        // Restaurada a janela de acerto ampliada (de -0.2s até 2.2s)
        // Isso permite clicar em qualquer lugar da coluna onde a nota esteja visível
        if (timeDiff > -0.2 && timeDiff < 2.2) {
          setScore(s => s + 1);
          return prev.map(n => n.id === targetNote.id ? { ...n, hit: true } : n);
        } else {
          setGameState('gameover');
          if (audioRef.current) audioRef.current.pause();
        }
      } else {
        setGameState('gameover');
        if (audioRef.current) audioRef.current.pause();
      }
      return prev;
    });
  };

  const hasSavedScore = useRef(false);

  const saveScore = useCallback(() => {
    if (hasSavedScore.current) return;
    
    const member = members.find(m => m.id === user.id);
    if (member) {
      const today = new Date().toLocaleDateString('pt-BR');
      const newScores = [...member.scores];
      const todayScoreIndex = newScores.findIndex(s => s.date === today);
      
      if (todayScoreIndex >= 0) {
        newScores[todayScoreIndex] = {
          ...newScores[todayScoreIndex],
          pianoTilesGame: Math.max(newScores[todayScoreIndex].pianoTilesGame || 0, score)
        };
      } else {
        newScores.push({
          date: today,
          punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
          pianoTilesGame: score
        });
      }
      hasSavedScore.current = true;
      onUpdateMember({ ...member, scores: newScores });
    }
  }, [score, members, user.id, onUpdateMember]);

  useEffect(() => {
    if (gameState === 'gameover') {
      saveScore();
    } else if (gameState === 'playing') {
      hasSavedScore.current = false;
    }
  }, [gameState, saveScore]);

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden select-none touch-none">
      <audio ref={audioRef} src={selectedSong.url} />
      
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Piano Tiles"
        instructions={[
          "Escolha uma música no menu inicial.",
          "Toque na coluna quando a tecla branca passar pela linha de batida.",
          "O jogo acelera conforme sua pontuação aumenta!",
          "Não deixe nenhuma tecla passar sem ser tocada!",
          "Cuidado para não tocar na coluna errada ou sem teclas."
        ]}
        icon={<Music size={32} className="text-white" />}
      />

      <GameHeader 
        stats={[
          { label: 'Pontos', value: score },
          { label: 'Velocidade', value: `${(1 + Math.floor(score / 10) * 0.1).toFixed(1)}x` }
        ]}
        onRefresh={startGame}
      />

      <main className="flex-1 relative overflow-hidden bg-slate-900">
        {/* Columns Visual & Click Areas */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map(i => (
            <div 
              key={i} 
              onClick={() => handleColumnClick(i)}
              className="flex-1 border-r border-white/5 last:border-0 active:bg-white/10 transition-colors cursor-pointer" 
            />
          ))}
        </div>

        {/* Hit Line Visual */}
        <div className="absolute bottom-[20%] left-0 right-0 h-1 bg-white/20 z-10" />

        {/* Notes */}
        {activeNotes.map(note => {
          const currentTime = gameTimeRef.current;
          // Visual position calculation
          // 20% is the hit line (bottom 20%)
          const row = 80 - (note.time - currentTime) * 40; 
          
          if (row < -20 || row > 120) return null;

          return (
            <motion.div
              key={note.id}
              className={`absolute w-1/3 h-[20%] border border-slate-950 shadow-xl transition-opacity pointer-events-none ${
                note.hit ? 'opacity-0' : 'bg-white'
              }`}
              style={{
                left: `${note.col * 33.33}%`,
                top: `${row}%`,
              }}
            />
          );
        })}

        {/* Menu Overlay */}
        <AnimatePresence>
          {gameState === 'menu' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex flex-col items-center mb-8 mt-4">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl shadow-blue-600/40 rotate-12">
                  <Music size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Piano Tiles</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Song Selection */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <List size={12} /> Escolha a Música
                  </h4>
                  {SONGS.map(song => (
                    <button
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                        selectedSong.id === song.id 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Music size={18} />
                        <span className="font-bold text-sm">{song.name}</span>
                      </div>
                      {selectedSong.id === song.id && <Play size={16} fill="currentColor" />}
                    </button>
                  ))}
                </div>

                {/* Ranking */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> Melhores Pontuações
                  </h4>
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                    {ranking.length > 0 ? (
                      ranking.map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black ${i === 0 ? 'text-yellow-500' : 'text-slate-500'}`}>#{i + 1}</span>
                            <span className="text-sm font-bold text-slate-200">{r.name}</span>
                          </div>
                          <span className="text-sm font-black text-blue-400">{r.score}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-4 italic">Nenhuma pontuação registrada</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="mt-8 w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Play size={20} fill="currentColor" /> COMEÇAR JOGO
              </button>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-red-600/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <Trophy size={40} className="text-red-600" />
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Fim de Jogo!</h3>
              <div className="bg-black/20 p-6 rounded-3xl mb-8 w-full max-w-xs">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Pontuação</p>
                <p className="text-5xl font-black text-white">{score}</p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={startGame}
                  className="w-full bg-white text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw size={20} /> TENTAR NOVAMENTE
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-black/20 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3"
                >
                  <Settings size={20} /> MENU PRINCIPAL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PianoTilesGame;
