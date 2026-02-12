
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, Member, Score, UserRole } from '../types';
import { ArrowLeft, RefreshCw, Trophy, Lock, Timer, Zap, Shuffle, Calendar } from 'lucide-react';

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
  { type: 'espadas', url: 'https://lh3.googleusercontent.com/d/1a7KjLzygpkka-ryfEuf-uAVDe90aPVEm' }
];

const MemoryGame: React.FC<MemoryGameProps> = ({ user, members, onUpdateMember, onBack, memoryOverride }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.id, user.name]);

  const { isAvailable, hasPlayedToday } = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    // Respeita override do ADM ou Domingo
    const available = isSunday || memoryOverride;
    
    let alreadyPlayed = false;
    if (currentMember) {
      const todayStr = now.toLocaleDateString('pt-BR');
      alreadyPlayed = currentMember.scores.some(s => s.date === todayStr && s.memoryGame !== undefined);
    }
    
    return { isAvailable: available, hasPlayedToday: alreadyPlayed };
  }, [memoryOverride, currentMember]);

  useEffect(() => {
    // Admins podem sempre jogar para testar, Pathfinders obedecem a trava
    if (isAvailable && (!hasPlayedToday || user.role === UserRole.LEADERSHIP)) {
      initializeGame();
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

  const initializeGame = () => {
    const duplicatedCards = [...CARD_IMAGES, ...CARD_IMAGES]
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

  const handleFinish = () => {
    if (currentMember) {
      const newScoreEntry: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        memoryGame: 20
      };
      onUpdateMember({
        ...currentMember,
        scores: [...currentMember.scores, newScoreEntry]
      });
    }
    onBack();
  };

  // Se já jogou e não é ADM, trava.
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

  // Se não está disponível e não é ADM, trava.
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
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-[#FFD700] rounded-[2.5rem] flex items-center justify-center text-[#003366] shadow-xl mb-8"><Trophy size={48} /></div>
        <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase">Excelente!</h2>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full">
           <p className="text-6xl font-black text-[#0061f2]">20 <span className="text-xl">pts</span></p>
        </div>
        <button onClick={handleFinish} className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase shadow-xl">SALVAR PONTOS</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
        <button onClick={initializeGame} className="px-6 py-2.5 bg-[#FFD700] text-[#003366] rounded-2xl font-black uppercase text-[10px] shadow-md"><RefreshCw size={14} className="inline mr-2" /> Reiniciar</button>
      </div>
      <div className="bg-white rounded-[1.5rem] p-4 mb-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-slate-800 font-mono"><Timer size={20} className="text-blue-600" /> {formatTime(seconds)}</div>
        <div className="flex items-center gap-2 font-black text-slate-800"><Shuffle size={18} className="text-blue-500" /> {moves} mov</div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {cards.map((card) => (
          <div key={card.id} onClick={() => handleCardClick(card.id)} className="aspect-square relative cursor-pointer group">
            <div className={`w-full h-full transition-all duration-500 preserve-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
              <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-slate-100 bg-[#f1f5f9] flex items-center justify-center font-black text-xl text-red-500">?</div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-[#6495ED] flex items-center justify-center p-2">
                <img src={card.content} className="w-full h-full object-contain" alt="card" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`.preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};

export default MemoryGame;
