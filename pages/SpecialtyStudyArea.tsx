
import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { AuthUser, Member, SpecialtyStudy, Score } from '../types';
import { DatabaseService } from '../db';
import { ArrowLeft, FileText, HelpCircle, Trophy, BookOpen, CheckCircle2, XCircle, ChevronRight, Loader2, Play, Info } from 'lucide-react';

interface SpecialtyStudyAreaProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
}

export interface SpecialtyStudyHandle {
  goBack: () => boolean;
}

const SpecialtyStudyArea = forwardRef<SpecialtyStudyHandle, SpecialtyStudyAreaProps>(({ user, members, onUpdateMember, onBack }, ref) => {
  const [studies, setStudies] = useState<SpecialtyStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<SpecialtyStudy | null>(null);
  const [mode, setMode] = useState<'list' | 'study' | 'quiz' | 'result'>('list');
  
  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (mode === 'result') {
        setMode('list');
        return true;
      }
      if (mode === 'quiz') {
        if (confirm('Sair do teste? Seu progresso será perdido.')) {
          setMode('study');
        }
        return true;
      }
      if (mode === 'study') {
        setMode('list');
        return true;
      }
      return false; // Let App handle it
    }
  }));

  useEffect(() => {
    const loadStudies = async () => {
      try {
        const data = await DatabaseService.getSpecialtyStudies();
        setStudies(data);
      } catch (err) {
        console.error("Erro ao carregar estudos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStudies();
  }, []);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id);
  }, [members, user.id]);

  const handleStartStudy = (study: SpecialtyStudy) => {
    setSelectedStudy(study);
    setMode('study');
  };

  const handleStartQuiz = () => {
    setMode('quiz');
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...userAnswers, optionIdx];
    setUserAnswers(newAnswers);
    
    if (currentQuestionIdx < 9) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate Score
      let correctCount = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === selectedStudy!.questions[idx].correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setMode('result');
    }
  };

  const handleFinish = () => {
    if (currentMember && selectedStudy) {
      const newScore: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        specialtyStudyScore: score,
        specialtyStudyId: selectedStudy.id,
        specialtyStudyName: selectedStudy.name
      };
      onUpdateMember({
        ...currentMember,
        scores: [...(currentMember.scores || []), newScore]
      });
    }
    setMode('list');
    setSelectedStudy(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Materiais...</p>
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        <div className="p-6 space-y-4 overflow-y-auto pb-32">
          <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-900/5 flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm leading-tight">Central de Especialidades</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estude o PDF e faça o teste final</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {studies.map(s => {
              const alreadyDone = currentMember?.scores?.some(score => score.specialtyStudyId === s.id);
              const bestScore = currentMember?.scores?.filter(score => score.specialtyStudyId === s.id).reduce((max, curr) => Math.max(max, curr.specialtyStudyScore || 0), 0);

              return (
                <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-blue-900/5 flex items-center justify-between group active:scale-[0.98] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-600">{s.category}</span>
                      {alreadyDone && <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-green-100 text-green-600">Concluído</span>}
                    </div>
                    <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">{s.name}</h4>
                    {alreadyDone && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Trophy size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Melhor Nota: {bestScore}/10</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleStartStudy(s)}
                    className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"
                  >
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
              );
            })}
            {studies.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <HelpCircle size={48} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum material disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'study' && selectedStudy) {
    return (
      <div className="flex flex-col h-full bg-slate-900 animate-in fade-in">
        <div className="flex-1 bg-slate-800 relative overflow-hidden">
          <iframe 
            src={selectedStudy.pdfUrl} 
            className="w-full h-full border-none"
            title="Material de Estudo"
          />
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-900 to-transparent flex justify-center">
            <button 
              onClick={handleStartQuiz}
              className="bg-[#FFD700] text-[#003366] px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center gap-3"
            >
              <HelpCircle size={18} /> INICIAR TESTE FINAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && selectedStudy) {
    const currentQ = selectedStudy.questions[currentQuestionIdx];
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in fade-in">
        <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="w-full bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">
              {currentQ.question}
            </h3>
          </div>

          <div className="w-full space-y-3">
            {currentQ.options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-left font-bold text-slate-700 hover:border-blue-600 hover:bg-blue-50 transition-all active:scale-[0.98] flex items-center gap-4 group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result' && selectedStudy) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95 duration-500 bg-slate-50">
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 ${score >= 7 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
          {score >= 7 ? <Trophy size={48} /> : <Info size={48} />}
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 uppercase mb-2">
          {score >= 7 ? 'Parabéns!' : 'Continue Estudando!'}
        </h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">
          Você concluiu o teste de {selectedStudy.name}
        </p>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full max-w-sm">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Sua Nota Final</p>
           <p className={`text-7xl font-black ${score >= 7 ? 'text-green-600' : 'text-amber-600'}`}>{score}</p>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2">de 10 pontos possíveis</p>
        </div>

        <button 
          onClick={handleFinish}
          className="w-full max-w-xs bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          SALVAR PONTUAÇÃO
        </button>
      </div>
    );
  }

  return null;
});

export default SpecialtyStudyArea;
