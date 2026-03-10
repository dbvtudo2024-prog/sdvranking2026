
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, Member, Score, UserRole } from '@/types';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { ArrowLeft, RefreshCw, Trophy, Lock, Timer, Zap, Shuffle, Calendar, Brain } from 'lucide-react';
import GameHeader from '@/components/GameHeader';
import GameInstructions from '@/components/GameInstructions';

interface MemoryGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  memoryOverride: boolean;
}

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: string;
}

const CARD_IMAGES = [
  { type: 'biblia', url: 'https://api.iconify.design/fluent-emoji:open-book.svg' },
  { type: 'estrela', url: 'https://api.iconify.design/fluent-emoji:star.svg' },
  { type: 'camping', url: 'https://api.iconify.design/fluent-emoji:tent.svg' },
  { type: 'alvo', url: 'https://api.iconify.design/fluent-emoji:bullseye.svg' },
  { type: 'aguia', url: 'https://lh3.googleusercontent.com/d/1dW1BIYPCcyzT2S2j_6P3L4pN0OeYy3Nk' }, 
  { type: 'trofeu', url: 'https://api.iconify.design/fluent-emoji:trophy.svg' },
  { type: 'fogo', url: 'https://api.iconify.design/fluent-emoji:fire.svg' },
  { type: 'espadas', url: 'https://lh3.googleusercontent.com/d/1a7KjLzygpkka-ryfEuf-uAVDe90aPVEm' },
  { type: 'ancora', url: 'https://api.iconify.design/fluent-emoji:anchor.svg' },
  { type: 'bussola', url: 'https://api.iconify.design/fluent-emoji:compass.svg' },
  { type: 'mapa', url: 'https://api.iconify.design/fluent-emoji:world-map.svg' },
  { type: 'lanterna', url: 'https://api.iconify.design/fluent-emoji:flashlight.svg' },
  { type: 'mochila', url: 'https://api.iconify.design/fluent-emoji:backpack.svg' },
  { type: 'corda', url: 'https://api.iconify.design/fluent-emoji:knot.svg' },
  { type: 'primeiros-socorros', url: 'https://api.iconify.design/fluent-emoji:medical-kit.svg' },
  { type: 'apito', url: 'https://api.iconify.design/fluent-emoji:whistle.svg' }
];

const MemoryGame: React.FC<MemoryGameProps> = ({ user, members, onUpdateMember, onBack, memoryOverride }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
  }, [members, user.id, user.name]);

  const { isAvailable, hasPlayedToday } = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const available = isSunday || memoryOverride;
    
    let alreadyPlayed = false;
    if (currentMember) {
      const todayStr = now.toLocaleDateString('pt-BR');
      alreadyPlayed = (currentMember.scores || []).some(s => s.date === todayStr && s.memoryGame !== undefined);
    }
    
    return { isAvailable: available, hasPlayedToday: alreadyPlayed };
  }, [memoryOverride, currentMember]);

  useEffect(() => {
    if (isAvailable && (!hasPlayedToday || user.role === UserRole.LEADERSHIP)) {
      // Don't auto-initialize, let user pick difficulty
    }
    return () => stopTimer();
  }, [isAvailable, hasPlayedToday, user.role]);

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

  const initializeGame = (diff: 'easy' | 'normal' | 'hard') => {
    setDifficulty(diff);
    const pairCount = diff === 'easy' ? 4 : diff === 'normal' ? 8 : 12;
    const selectedImages = CARD_IMAGES.slice(0, pairCount);
    
    const duplicatedCards = [...selectedImages, ...selectedImages]
      .sort(() => Math.random() - 0.5)
      .map((img, index) => ({
        id: index,
        content: img.url,
        type: img.type,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(duplicatedCards);
    setFlippedCards([]);
    setMoves(0);
    setSeconds(0);
    setIsGameOver(false);
    startTimer();
  };

  const handleCardClick = (id: number) => {
    if (disabled || cards[id].isFlipped || cards[id].isMatched || isGameOver) return;
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(prev => prev + 1);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (flipped: number[]) => {
    const [first, second] = flipped;
    if (cards[first].type === cards[second].type) {
      const newCards = [...cards];
      newCards[first].isMatched = true;
      newCards[second].isMatched = true;
      setCards(newCards);
      setFlippedCards([]);
      setDisabled(false);
      if (newCards.every(card => card.isMatched)) {
        setIsGameOver(true);
        stopTimer();
      }
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const calculatePoints = () => {
    if (!difficulty) return 0;
    const basePoints = difficulty === 'easy' ? 10 : difficulty === 'normal' ? 20 : 30;
    const idealMoves = difficulty === 'easy' ? 6 : difficulty === 'normal' ? 14 : 22;
    const idealTime = difficulty === 'easy' ? 15 : difficulty === 'normal' ? 40 : 70;
    
    // Multiplier based on moves and time efficiency
    const moveEfficiency = Math.max(0.5, idealMoves / moves);
    const timeEfficiency = Math.max(0.5, idealTime / seconds);
    
    // Combining efficiencies for a final multiplier
    const multiplier = (moveEfficiency + timeEfficiency) / 2;
    
    // Final points with a small boost for performance
    return Math.max(5, Math.floor(basePoints * multiplier * 1.3));
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
        memoryGame: points
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
      </div>
    );
  }

  if (!isAvailable && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#0061f2] mb-6"><Calendar size={40} /></div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Aguarde o Domingo</h2>
        <p className="text-slate-500 mb-8 text-sm">O jogo abre automaticamente aos domingos.</p>
      </div>
    );
  }

  if (isGameOver) {
    const points = calculatePoints();
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-[#FFD700] rounded-[2.5rem] flex items-center justify-center text-[#003366] shadow-xl mb-8"><Trophy size={48} /></div>
        <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase">Excelente!</h2>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full">
           <p className="text-6xl font-black text-[#0061f2]">{points} <span className="text-xl">pts</span></p>
           <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${
             difficulty === 'easy' ? 'text-emerald-500' : 
             difficulty === 'normal' ? 'text-amber-500' : 
             'text-red-500'
           }`}>
             Nível: {difficulty === 'easy' ? 'Fácil' : difficulty === 'normal' ? 'Médio' : 'Difícil'}
           </p>
           <div className="mt-4 flex justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
             <span>Tempo: {formatTime(seconds)}</span>
             <span>Movimentos: {moves}</span>
           </div>
        </div>
        <button onClick={handleFinish} className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase shadow-xl">SALVAR PONTOS</button>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 p-6 overflow-y-auto">
        <GameInstructions
          isOpen={showInstructions}
          onStart={() => setShowInstructions(false)}
          title="Jogo da Memória"
          instructions={[
            "Escolha o nível de dificuldade (Fácil, Médio ou Difícil).",
            "Encontre todos os pares de cartas iguais.",
            "Cada par encontrado soma pontos ao seu perfil.",
            "Você tem um limite diário de partidas.",
            "Tente ser o mais rápido possível!"
          ]}
          icon={<Brain size={32} className="text-white" />}
        />
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 uppercase">Jogo da Memória</h2>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-6 pb-10">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#0061f2] mx-auto mb-4">
              <Zap size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase">Escolha o Nível</h3>
            <p className="text-slate-400 text-sm font-medium">Quanto maior a dificuldade, mais pontos você ganha!</p>
          </div>

          <button 
            onClick={() => initializeGame('easy')}
            className="w-full bg-emerald-600 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/20 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Iniciante</p>
              <h4 className="text-lg sm:text-xl font-black text-white uppercase">Fácil</h4>
              <p className="text-emerald-500/80 text-xs font-bold bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-1">8 Cartas • Pontos Variáveis</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <Shuffle size={20} />
            </div>
          </button>

          <button 
            onClick={() => initializeGame('normal')}
            className="w-full bg-amber-400 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/20 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">Intermediário</p>
              <h4 className="text-lg sm:text-xl font-black text-amber-900 uppercase">Médio</h4>
              <p className="text-amber-900/60 text-xs font-bold bg-black/5 px-2 py-0.5 rounded-lg inline-block mt-1">16 Cartas • Pontos Variáveis</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/5 flex items-center justify-center text-amber-900/30 group-hover:bg-black/10 group-hover:text-amber-900 transition-colors">
              <RefreshCw size={20} />
            </div>
          </button>

          <button 
            onClick={() => initializeGame('hard')}
            className="w-full bg-red-600 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-red-900/20 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Desafio</p>
              <h4 className="text-lg sm:text-xl font-black text-white uppercase">Difícil</h4>
              <p className="text-red-100/60 text-xs font-bold bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-1">24 Cartas • Pontos Variáveis</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/40 group-hover:bg-white/20 group-hover:text-white transition-colors">
              <Zap size={20} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      <GameHeader 
        stats={[
          { label: 'Tempo', value: formatTime(seconds) },
          { label: 'Movimentos', value: moves }
        ]}
        onRefresh={() => initializeGame(difficulty)}
      />
      <div className="flex-1 overflow-y-auto px-2 pb-10 pt-4">
        <div className={`grid ${difficulty === 'easy' ? 'grid-cols-2 max-w-[280px] mx-auto' : 'grid-cols-4'} gap-2 sm:gap-3`}>
          {cards.map((card) => (
            <div key={card.id} onClick={() => handleCardClick(card.id)} className="aspect-square relative cursor-pointer group">
              <div className={`w-full h-full transition-all duration-500 preserve-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                <div className={`absolute inset-0 backface-hidden rounded-xl border-2 flex items-center justify-center font-black text-lg sm:text-xl ${
                  difficulty === 'easy' ? 'bg-emerald-500 text-white border-emerald-600' :
                  difficulty === 'normal' ? 'bg-amber-400 text-amber-900 border-amber-500' :
                  'bg-red-600 text-white border-red-700'
                }`}>?</div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-[#6495ED] flex items-center justify-center p-1.5 sm:p-2">
                  <img src={formatImageUrl(card.content)} className="w-full h-full object-contain" alt="card" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`.preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};

export default MemoryGame;
