
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, Member, Score, UserRole } from '../types';
import { ArrowLeft, RefreshCw, Trophy, Lock, Timer, Zap, Shuffle, Calendar } from 'lucide-react';

interface MemoryGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
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

const MemoryGame: React.FC<MemoryGameProps> = ({ user, members, onUpdateMember, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const timerRef = useRef<number | null>(null);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.id, user.name]);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const isSunday = now.getDay() === 0;
      const override = localStorage.getItem('sentinelas_memory_override') === 'true';
      const isLeadership = user.role === UserRole.LEADERSHIP;
      
      setIsAdminUnlocked(override);
      
      // Disponível se: For Domingo OU Tiver Override OU For Liderança
      const available = isSunday || override || isLeadership;
      setIsAvailable(available);

      if (currentMember) {
        const todayStr = now.toLocaleDateString('pt-BR');
        const alreadyPlayed = currentMember.scores.some(s => s.date === todayStr && s.memoryGame !== undefined);
        setHasPlayedToday(alreadyPlayed);
        
        // Só inicia o jogo automaticamente se estiver disponível E não tiver jogado ainda
        if (available && !alreadyPlayed) {
          initializeGame();
        }
      } else {
        // Para admins sem registro de membro, apenas inicia
        if (available) initializeGame();
      }
      setIsVerifying(false);
    };

    checkStatus();
    return () => stopTimer();
  }, [currentMember, user.role]);

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
    if (user.role === UserRole.PATHFINDER && hasPlayedToday && !isAdminUnlocked) {
      onBack();
      return;
    }

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

      // Consome o override após jogar, se for o caso
      if (isAdminUnlocked) {
        localStorage.removeItem('sentinelas_memory_override');
      }
    }
    onBack();
  };

  const getTimeToUnlock = () => {
    const now = new Date();
    if (now.getDay() === 0) return "Hoje";
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    const diff = nextSunday.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days}d`;
  };

  if (isVerifying) return null;

  // TELA DE JÁ JOGOU
  if (hasPlayedToday && !isAdminUnlocked && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Limite Diário</h2>
        <p className="text-slate-500 font-medium mb-8 text-sm">Você já jogou hoje e seus pontos foram salvos. Volte no próximo domingo!</p>
        <button onClick={onBack} className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">VOLTAR</button>
      </div>
    );
  }

  // TELA DE BLOQUEADO (NÃO É DOMINGO E NÃO TEM OVERRIDE)
  if (!isAvailable && user.role === UserRole.PATHFINDER) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in duration-500 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[#0061f2] mb-6">
          <Calendar size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Aguarde o Domingo</h2>
        <p className="text-slate-500 font-medium mb-8 text-sm">
          O Jogo da Memória abre automaticamente aos domingos (00:00).<br/>
          Faltam aproximadamente {getTimeToUnlock()} para liberar!
        </p>
        <button onClick={onBack} className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">VOLTAR</button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 bg-[#FFD700] rounded-[2.5rem] flex items-center justify-center text-[#003366] shadow-xl shadow-yellow-200 mb-8">
           <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Excelente Memória!</h2>
        <div className="flex gap-4 mb-8">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tempo: {formatTime(seconds)}</p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Movimentos: {moves}</p>
        </div>
        
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 mb-10 w-full">
           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Pontos Ganhos</p>
           <p className="text-6xl font-black text-[#0061f2]">20 <span className="text-xl">pts</span></p>
        </div>

        <button 
          onClick={handleFinish}
          className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          SALVAR PONTOS
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={initializeGame}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#FFD700] text-[#003366] rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all"
        >
          <RefreshCw size={14} strokeWidth={3} />
          Reiniciar Jogo
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] p-4 mb-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer size={20} className="text-blue-600" />
          <span className="text-lg font-black text-slate-800 font-mono">{formatTime(seconds)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Shuffle size={18} className="text-blue-500" />
          <span className="text-sm font-black text-slate-800">{moves} mov</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-500" />
          <span className="text-sm font-black text-slate-800">20 pts</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8 perspective-1000">
        {cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className="aspect-square relative cursor-pointer"
            style={{ 
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s'
            }}
          >
            <div 
              className={`absolute inset-0 w-full h-full preserve-3d transition-transform duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
            >
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-sm flex items-center justify-center border-2 border-slate-100 bg-[#f1f5f9]"
              >
                 <span className="text-4xl font-black text-red-500 select-none drop-shadow-sm">?</span>
              </div>
              
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-md flex items-center justify-center border-2 border-transparent bg-[#6495ED] overflow-hidden"
              >
                 <img src={card.content} className="w-3/4 h-3/4 object-contain filter drop-shadow-sm" alt="card" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto opacity-10 text-center pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sentinelas da Verdade</p>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default MemoryGame;
