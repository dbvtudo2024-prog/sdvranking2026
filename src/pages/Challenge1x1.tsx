
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthUser, Member, Challenge1x1, QuizQuestion } from '@/types';
import { QUIZ_QUESTIONS, UNIT_LOGOS } from '@/constants';
import { DatabaseService, supabase } from '@/db';
import { Sword, Users, X, Check, Timer, Trophy, ArrowLeft, Loader2, Zap, Cpu, Medal, User, RotateCcw, Heart, Info, Target, Swords } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';

interface Challenge1x1PageProps {
  user: AuthUser;
  members: Member[];
  onBack: () => void;
  onUpdateMember: (member: Member) => void;
}

const Challenge1x1Page: React.FC<Challenge1x1PageProps> = ({ user, members, onBack, onUpdateMember }) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge1x1 | null>(null);
  const [pendingInvites, setPendingInvites] = useState<Challenge1x1[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [answeredLocal, setAnsweredLocal] = useState(false);
  const [isMachineMode, setIsMachineMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const machineTimerRef = useRef<number | null>(null);
  const myMember = useMemo(() => members.find(m => m.id === user.id), [members, user.id]);

  const duelRanking = useMemo(() => {
    return members
      .map(m => {
        const total = (m.scores || []).reduce((acc, s) => acc + (s.challenge1x1 || 0), 0);
        return { ...m, totalPoints: total };
      })
      .filter(m => m.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, [members]);

  useEffect(() => {
    if (activeChallenge?.status === 'finished' && activeChallenge.winnerId === user.id && myMember) {
      const alreadySaved = (myMember.scores || []).some(s => 
        s.challenge1x1 === 10 && s.date === new Date().toLocaleDateString('pt-BR')
      );
      
      if (!alreadySaved) {
        const points = 10;
        const newScore = { 
          type: 'game',
          gameId: 'challenge1x1',
          date: new Date().toLocaleDateString('pt-BR'), 
          challenge1x1: points,
          points: points
        };
        const updated = {
          ...myMember, 
          scores: [...(myMember.scores || []), newScore]
        };
        onUpdateMember(updated);
      }
    }
  }, [activeChallenge?.status, activeChallenge?.winnerId, user.id, myMember, onUpdateMember]);

  useEffect(() => {
    if (!user.id || isMachineMode) return;

    const channelId = `challenges_lobby_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'challenges' 
      }, (payload) => {
        const data = payload.new as Challenge1x1;
        if (data.challengedId === user.id && data.status === 'pending') {
          setPendingInvites(prev => {
            if (prev.some(p => p.id === data.id)) return prev;
            return [...prev, data];
          });
        }
        if (activeChallenge?.id === data.id || data.challengerId === user.id || data.challengedId === user.id) {
          if (data.status === 'accepted' || data.status === 'playing') {
            setActiveChallenge(data);
            setShowArena(true);
          }
          if (data.status === 'finished') {
            setActiveChallenge(data);
          }
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user.id, activeChallenge, isMachineMode]);

  useEffect(() => {
    if (isMachineMode && showArena && activeChallenge && activeChallenge.status !== 'finished' && !answeredLocal) {
      const thinkingTime = Math.random() * 2000 + 2000;
      machineTimerRef.current = window.setTimeout(() => {
        handleMachineTurn();
      }, thinkingTime);
    }
    return () => { if(machineTimerRef.current) clearTimeout(machineTimerRef.current); };
  }, [isMachineMode, showArena, activeChallenge?.currentQuestion, answeredLocal]);

  const handleMachineTurn = () => {
    if (!activeChallenge || answeredLocal || activeChallenge.status === 'finished') return;

    const isCorrect = Math.random() > 0.4;
    
    if (isCorrect) {
      const newScores = { ...activeChallenge.scores };
      newScores['machine'] = (newScores['machine'] || 0) + 1;
      
      const questionIdx = activeChallenge.currentQuestion;
      const isLastQuestion = questionIdx === 9;
      const machineHasWon = newScores['machine'] >= 5;
      
      const updated: Challenge1x1 = {
        ...activeChallenge,
        scores: newScores,
        currentQuestion: (isLastQuestion || machineHasWon) ? questionIdx : questionIdx + 1,
        status: (isLastQuestion || machineHasWon) ? 'finished' : 'playing',
        lastAnsweredBy: 'machine',
        winnerId: (isLastQuestion || machineHasWon) ? (newScores['machine'] >= 5 ? 'machine' : (newScores[user.id] > newScores['machine'] ? user.id : (newScores['machine'] > newScores[user.id] ? 'machine' : 'draw'))) : undefined
      };
      
      if (!(isLastQuestion || machineHasWon)) {
        updated.lastAnsweredBy = undefined;
      }

      setActiveChallenge(updated);
      setAnsweredLocal(false);
    }
  };

  const handleChallengeMachine = () => {
    setIsMachineMode(true);
    const questionIds = QUIZ_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 10).map(q => q.id);
    const machineChallenge: Challenge1x1 = {
      id: 'machine_' + Date.now(),
      challengerId: user.id,
      challengedId: 'machine',
      challengerName: user.name,
      status: 'playing',
      currentQuestion: 0,
      scores: { [user.id]: 0, 'machine': 0 },
      questionIds: questionIds
    };
    setActiveChallenge(machineChallenge);
    setShowArena(true);
    setAnsweredLocal(false);
  };

  const handleChallenge = async (opponent: Member) => {
    setIsSearching(true);
    setIsMachineMode(false);
    const questionIds = QUIZ_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 10).map(q => q.id);
    const newChallenge: Challenge1x1 = {
      id: Math.random().toString(36).substr(2, 9),
      challengerId: user.id,
      challengedId: opponent.id,
      challengerName: user.name,
      status: 'pending',
      currentQuestion: 0,
      scores: { [user.id]: 0, [opponent.id]: 0 },
      questionIds: questionIds
    };
    await DatabaseService.createChallenge(newChallenge);
    await DatabaseService.broadcastChallenge(newChallenge);
    setActiveChallenge(newChallenge);
    alert(`Desafio enviado para ${opponent.name}! Aguarde ele aceitar.`);
    setIsSearching(false);
  };

  const acceptChallenge = async (challenge: Challenge1x1) => {
    setIsMachineMode(false);
    await DatabaseService.updateChallenge(challenge.id, { status: 'accepted' });
    setActiveChallenge(challenge);
    setPendingInvites(prev => prev.filter(p => p.id !== challenge.id));
    setShowArena(true);
    setAnsweredLocal(false);
  };

  const handleAnswer = async (questionIdx: number, isCorrect: boolean) => {
    if (answeredLocal || !activeChallenge || activeChallenge.status === 'finished') return;
    if (activeChallenge.lastAnsweredBy && activeChallenge.currentQuestion === questionIdx) return;

    setAnsweredLocal(true);
    if(machineTimerRef.current) clearTimeout(machineTimerRef.current);

    if (isCorrect) {
      const newScores = { ...activeChallenge.scores };
      newScores[user.id] = (newScores[user.id] || 0) + 1; 
      
      const isLastQuestion = questionIdx === 9;
      const iHaveWon = newScores[user.id] >= 5;
      const oppId = isMachineMode ? 'machine' : (activeChallenge.challengerId === user.id ? activeChallenge.challengedId : activeChallenge.challengerId);
      
      const nextStatus = (isLastQuestion || iHaveWon) ? 'finished' : 'playing';
      
      let winnerId = undefined;
      if (isLastQuestion || iHaveWon) {
        if (iHaveWon) {
          winnerId = user.id;
        } else {
          const oppScore = newScores[oppId] || 0;
          winnerId = newScores[user.id] > oppScore ? user.id : (oppScore > newScores[user.id] ? oppId : 'draw');
        }
      }

      const updates: Partial<Challenge1x1> = {
        scores: newScores,
        currentQuestion: (isLastQuestion || iHaveWon) ? questionIdx : questionIdx + 1,
        status: nextStatus as any,
        lastAnsweredBy: user.id,
        winnerId: winnerId
      };

      if (isMachineMode && !(isLastQuestion || iHaveWon)) {
        updates.lastAnsweredBy = undefined;
      }

      if (isMachineMode) {
        setActiveChallenge({ ...activeChallenge, ...updates });
        setTimeout(() => setAnsweredLocal(false), 300);
      } else {
        await DatabaseService.updateChallenge(activeChallenge.id, updates);
        setTimeout(() => setAnsweredLocal(false), 500);
      }
    } else {
      setTimeout(() => setAnsweredLocal(false), 1000);
    }
  };

  const currentQuestionData = useMemo(() => {
    if (!activeChallenge) return null;
    const qId = activeChallenge.questionIds[activeChallenge.currentQuestion];
    return QUIZ_QUESTIONS.find(q => q.id === qId);
  }, [activeChallenge]);

  const renderHearts = (hitsTaken: number) => {
    const hearts = [];
    const maxLives = 5;
    for (let i = 0; i < maxLives; i++) {
      const isFull = i < (maxLives - hitsTaken);
      hearts.push(
        <Heart 
          key={i} 
          size={16} 
          className={`transition-all duration-300 ${isFull ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} 
        />
      );
    }
    return <div className="flex gap-1 mt-1">{hearts}</div>;
  };

  if (showArena && activeChallenge && currentQuestionData) {
    const oppId = isMachineMode ? 'machine' : (activeChallenge.challengerId === user.id ? activeChallenge.challengedId : activeChallenge.challengerId);
    
    const myHitsDone = activeChallenge.scores[user.id] || 0;
    const oppHitsDone = activeChallenge.scores[oppId] || 0;

    if (activeChallenge.status === 'finished') {
      const handleRematch = () => {
        if (isMachineMode) {
          handleChallengeMachine();
        } else {
          const opponentMember = members.find(m => m.id === oppId);
          if (opponentMember) {
            handleChallenge(opponentMember);
            setShowArena(false);
          }
        }
      };

      return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
          <GameHeader title="Duelo 1x1" user={user} onBack={onBack} />
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500 overflow-y-auto">
            <Trophy size={80} className="text-yellow-400 mb-6" />
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">Fim do Duelo!</h2>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-sm space-y-4">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Você</p>
                  <div className="flex gap-0.5 mt-1 mb-2">
                     {Array.from({length: 5}).map((_, i) => (
                       <Heart key={i} size={10} className={i < (5 - oppHitsDone) ? 'text-red-500 fill-red-500' : 'text-slate-200'} />
                     ))}
                  </div>
                  <p className="text-3xl font-black text-blue-600">{5 - oppHitsDone}</p>
                </div>
                <div className="text-slate-200 font-black text-xl">X</div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">{isMachineMode ? 'Robô' : 'Oponente'}</p>
                  <div className="flex gap-0.5 mt-1 mb-2">
                     {Array.from({length: 5}).map((_, i) => (
                       <Heart key={i} size={10} className={i < (5 - myHitsDone) ? 'text-red-500 fill-red-500' : 'text-slate-200'} />
                     ))}
                  </div>
                  <p className="text-3xl font-black text-red-600">{5 - myHitsDone}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
                <p className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-lg">
                  {activeChallenge.winnerId === user.id ? 'VOCÊ VENCEU! 🏆' : activeChallenge.winnerId === 'draw' ? 'EMPATE! 🤝' : 'VOCÊ PERDEU! 💀'}
                </p>
                {activeChallenge.winnerId === user.id && (
                  <p className="text-blue-600 font-black text-[10px] uppercase mt-1 tracking-widest">+10 PONTOS DE BÔNUS!</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
              <button 
                onClick={handleRematch}
                className="w-full bg-yellow-400 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw size={20} /> REVANCHE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader 
          title="Duelo 1x1"
          user={user}
          stats={[
            { label: 'Pergunta', value: `${activeChallenge.currentQuestion + 1}/10` }
          ]}
          onBack={onBack}
        />
        
        <div className="p-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-800 flex justify-between items-center shadow-sm shrink-0">
          <div className="flex flex-col items-center flex-1">
             <span className="text-[7px] font-black uppercase text-slate-400 mb-0.5">VOCÊ</span>
             {renderHearts(oppHitsDone)}
          </div>
          
          <div className="flex flex-col items-center px-3 border-x border-slate-100 dark:border-slate-700">
             <span className="text-[10px] font-black text-slate-800 dark:text-white">PLACAR</span>
          </div>

          <div className="flex flex-col items-center flex-1">
             <span className="text-[7px] font-black uppercase text-slate-400 mb-0.5">{isMachineMode ? 'ROBÔ' : 'OPONENTE'}</span>
             {renderHearts(myHitsDone)}
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 flex flex-col justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-blue-100 w-full">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{width: `${(activeChallenge.currentQuestion + 1) * 10}%`}}></div>
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight">
              {currentQuestionData.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(currentQuestionData.options || []).map((opt, idx) => (
              <button 
                key={idx}
                disabled={answeredLocal}
                onClick={() => handleAnswer(activeChallenge.currentQuestion, idx === currentQuestionData.correct_answer)}
                className={`w-full p-5 rounded-2xl border-2 font-bold text-left transition-all active:scale-[0.98] flex justify-between items-center
                  ${answeredLocal ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-400'}`}
              >
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
             <Zap size={14} className="text-yellow-500" /> {isMachineMode ? 'O ROBÔ ESTÁ ANALISANDO...' : 'ACERTE PARA TIRAR VIDA DO ADVERSÁRIO'}
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      <GameHeader 
        title="Duelo 1x1"
        user={user}
        stats={activeChallenge ? [
          { label: 'Status', value: activeChallenge.status === 'playing' ? 'Em Combate' : 'Aguardando' }
        ] : []}
        onBack={onBack}
      />
      
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <GameInstructions
          isOpen={showInstructions}
          onStart={() => setShowInstructions(false)}
          title="Duelo 1x1"
          instructions={[
            "Cada duelista começa com 5 corações (vidas).",
            "Sempre que você acertar uma pergunta, retira 1 vida do oponente.",
            "Ganha quem zerar a vida do outro.",
            "O vencedor recebe +10 pontos extras no ranking.",
            "Responda o mais rápido possível!"
          ]}
          icon={<Swords size={32} className="text-white" />}
        />

        <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
           <Cpu size={120} className="absolute -right-10 -bottom-10 text-white/5 group-hover:scale-110 transition-transform duration-700" />
           <div className="relative z-10">
              <h3 className="text-lg font-black uppercase tracking-tight mb-1">Duelo com a IA</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Nenhum amigo online? Desafie o robô!</p>
              <button 
                onClick={handleChallengeMachine}
                className="bg-yellow-400 text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap size={16} fill="currentColor" /> DESAFIAR ROBÔ
              </button>
           </div>
        </div>

        {pendingInvites.length > 0 && (
          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2 flex items-center gap-2">
               <Zap size={14} /> Convites de Duelo
             </h3>
             {pendingInvites.map(invite => (
               <div key={invite.id} className="bg-blue-600 p-4 rounded-3xl text-white flex items-center justify-between shadow-xl animate-in slide-in-from-left duration-300">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-70 uppercase">Desafiado por:</span>
                    <span className="font-black text-sm">{invite.challengerName}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptChallenge(invite)} className="bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase">ACEITAR</button>
                    <button onClick={() => setPendingInvites(p => p.filter(x => x.id !== invite.id))} className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">RECUSAR</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
            <Users size={14} /> Desafiar Membro
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {members.filter(m => m.id !== user.id).map(member => (
              <div key={member.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300" />}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{member.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.unit}</p>
                  </div>
                </div>
                <button 
                  disabled={isSearching}
                  onClick={() => handleChallenge(member)}
                  className="bg-blue-50 text-blue-600 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 group-hover:shadow-lg shadow-blue-500/20"
                >
                  <Sword size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
           <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-2 flex items-center gap-2 mb-4">
             <Trophy size={14} /> Top Duelistas da Arena
           </h3>
           <div className="space-y-2">
              {duelRanking.length > 0 ? duelRanking.map((ranked, index) => (
                <div key={ranked.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-50 shadow-sm flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {index + 1}º
                    </div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {ranked.photoUrl ? <img src={ranked.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-300 mx-auto mt-2.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-800 text-[10px] sm:text-xs uppercase leading-tight mb-0.5">{ranked.name}</p>
                      <div className="flex items-center gap-1">
                        <img src={UNIT_LOGOS[ranked.unit] || UNIT_LOGOS[user.unit!] || undefined} className="w-3 h-3 object-contain" />
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{ranked.unit}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-blue-600 leading-none">{ranked.totalPoints}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Duelo Pts</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">Nenhum duelo registrado</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Challenge1x1Page;
