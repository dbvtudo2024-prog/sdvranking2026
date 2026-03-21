
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Anchor, Trophy, RefreshCcw, Hash, Lock, RefreshCw } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';
import { AuthUser, Member, UserRole } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseService } from '@/db';

interface KnotsGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const KNOTS_DATA = [
  { name: 'Lais de Guia', image: 'https://www.animatedknots.com/assets/images/bowline.jpg', description: 'Usado para formar uma alça fixa na extremidade de uma corda.' },
  { name: 'Escota', image: 'https://www.animatedknots.com/assets/images/sheet-bend.jpg', description: 'Usado para unir duas cordas de espessuras diferentes.' },
  { name: 'Direito', image: 'https://www.animatedknots.com/assets/images/square-knot.jpg', description: 'Usado para unir duas cordas de mesma espessura.' },
  { name: 'Catau', image: 'https://www.animatedknots.com/assets/images/sheepshank.jpg', description: 'Usado para encurtar uma corda ou isolar uma parte danificada.' },
  { name: 'Volta do Fiel', image: 'https://www.animatedknots.com/assets/images/clove-hitch-post.jpg', description: 'Usado para prender uma corda a um poste ou tronco.' },
  { name: 'Oito', image: 'https://www.animatedknots.com/assets/images/figure-8-knot.jpg', description: 'Um nó de retenção simples para evitar que a corda deslize.' },
];

const KnotsGame: React.FC<KnotsGameProps> = ({ user, members, onUpdateMember, onBack, override }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [knots, setKnots] = useState(KNOTS_DATA);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assets = await DatabaseService.getGameAssets('knots');
        if (assets && assets.length > 0) {
          const dynamicKnots = assets.map(a => ({
            name: a.name,
            image: a.url,
            description: 'Carregado do banco de dados'
          }));
          setKnots(dynamicKnots);
        }
      } catch (err) {
        console.error("Erro ao carregar ativos dinâmicos:", err);
      }
    };
    loadAssets();
  }, []);

  const questions = useMemo(() => {
    return [...knots].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [knots]);

  const currentKnot = questions[currentStep];

  const options = useMemo(() => {
    if (!currentKnot) return [];
    const others = knots.filter(k => k.name !== currentKnot.name);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffledOthers, currentKnot].sort(() => Math.random() - 0.5);
  }, [currentKnot, knots]);

  const resetGame = () => {
    setCurrentStep(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = options[index].name === currentKnot.name;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 20);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setGameState('finished');
        saveScore();
      }
    }, 1500);
  };

  const saveScore = () => {
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    if (!currentMember) return;

    const newScore = {
      gameId: 'knotsGame',
      points: score,
      date: new Date().toISOString()
    };

    const updatedScores = [...(currentMember.scores || []), newScore];

    onUpdateMember({ ...currentMember, scores: updatedScores });
  };

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldosonic@gmail.com';

  const { isAvailable, hasPlayedThisWeek } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // Aberto de Domingo (0) até Quinta (4).
    // Bloqueado na Sexta (5) e Sábado (6).
    const isGameDay = day >= 0 && day <= 4;
    const available = isGameDay || override || isAdmin;
    
    // O ciclo começa no Domingo (0).
    const diff = day;
    const cycleStart = new Date(now);
    cycleStart.setDate(now.getDate() - diff);
    cycleStart.setHours(0, 0, 0, 0);

    let played = false;
    const currentMember = members.find(m => m.id === user.id || m.name.toLowerCase().trim() === user.name.toLowerCase().trim());
    
    if (currentMember && !isAdmin) {
      played = (currentMember.scores || []).some(s => {
        const scoreDate = new Date(s.date);
        if (isNaN(scoreDate.getTime())) {
          const parts = s.date.split('/');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            return d >= cycleStart && s.gameId === 'knotsGame';
          }
          return false;
        }
        return scoreDate >= cycleStart && s.gameId === 'knotsGame';
      });
    }
    
    return { isAvailable: available, hasPlayedThisWeek: played };
  }, [override, isAdmin, members, user.id, user.name]);

  if (!isAvailable && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6 bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Indisponível</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Os jogos estão bloqueados hoje. Volte amanhã!</p>
        </div>
        <button onClick={onBack} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Voltar</button>
      </div>
    );
  }

  if (hasPlayedThisWeek && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6 bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Concluído</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Você já completou este desafio esta semana. Volte no próximo sábado!</p>
        </div>
        <button onClick={onBack} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-slate-800 p-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Questão</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono leading-none">{currentStep + 1}/{questions.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pontos</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono leading-none">{score}</span>
          </div>
        </div>
        <button 
          onClick={resetGame}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Desafio dos Nós"
        instructions={[
          "Observe a imagem do nó ou amarra.",
          "Identifique o nome correto entre as opções.",
          "Cada acerto demonstra sua habilidade em pioneiria!",
          "O jogo termina após 5 nós."
        ]}
        icon={<Hash size={32} className="text-white" />}
      />

      <main className="flex-1 p-4 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl flex flex-col md:flex-row gap-4 items-start justify-center"
            >
              <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 p-3 rounded-[2rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qual é este nó?</p>
                <div className="w-full max-w-[180px] aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                  <img src={currentKnot.image} alt="Nó" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="w-full md:w-1/2 grid grid-cols-1 gap-3">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between text-left
                      ${selectedOption === null 
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50' 
                        : selectedOption === idx
                          ? isCorrect 
                            ? 'bg-green-500 border-green-700 text-white' 
                            : 'bg-red-500 border-red-700 text-white'
                          : opt.name === currentKnot.name && selectedOption !== null
                            ? 'bg-green-500/20 border-green-500/40 text-green-600'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50'
                      }`}
                  >
                    <span className="flex-1">{opt.name}</span>
                    {selectedOption === idx && (
                      isCorrect ? <CheckCircle2 size={20} className="shrink-0 ml-2" /> : <XCircle size={20} className="shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-6"
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Desafio Concluído!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Você dominou a arte dos nós!</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 w-full p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pontuação Final</p>
                <p className="text-4xl font-black text-blue-600">{score} PTS</p>
              </div>
              <button 
                onClick={onBack}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                VOLTAR PARA A CENTRAL
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default KnotsGame;
