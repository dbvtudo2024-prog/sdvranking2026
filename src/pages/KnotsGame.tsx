
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Anchor, Trophy, RefreshCcw } from 'lucide-react';
import { AuthUser, Member } from '@/types';
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

const KnotsGame: React.FC<KnotsGameProps> = ({ user, members, onUpdateMember, onBack }) => {
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
    const currentMember = members.find(m => m.id === user.id);
    if (!currentMember) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const updatedScores = [...(currentMember.scores || [])];
    const todayScoreIndex = updatedScores.findIndex(s => s.date === todayStr);

    const finalScore = score + (isCorrect ? 20 : 0); // Add last question score if correct

    if (todayScoreIndex >= 0) {
      (updatedScores[todayScoreIndex] as any).knotsGame = finalScore;
    } else {
      updatedScores.push({
        date: todayStr,
        punctuality: 0, uniform: 0, material: 0, bible: 0, voluntariness: 0, activities: 0, treasury: 0,
        knotsGame: finalScore
      } as any);
    }

    onUpdateMember({ ...currentMember, scores: updatedScores });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-y-auto custom-scrollbar">
      <header className="bg-blue-600 text-white p-6 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-xl"><ArrowLeft size={20} /></button>
        <div className="flex flex-col">
          <h2 className="font-black uppercase tracking-tight text-lg">Desafio dos Nós</h2>
          <p className="text-[10px] font-bold opacity-80 uppercase">Passo {currentStep + 1} de {questions.length}</p>
        </div>
        <div className="ml-auto bg-white/20 px-4 py-1 rounded-full font-black text-sm">
          {score} PTS
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {gameState === 'playing' ? (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Qual é este nó?</p>
                <div className="w-full aspect-square bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center p-4">
                  <img src={currentKnot.image} alt="Nó" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 border-b-4 active:scale-95 flex items-center justify-between
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
                    {opt.name}
                    {selectedOption === idx && (
                      isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
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
