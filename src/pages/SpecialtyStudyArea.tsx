
import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { AuthUser, Member, SpecialtyStudy, Score, UserRole } from '@/types';
import { DatabaseService } from '@/db';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { ArrowLeft, FileText, HelpCircle, Trophy, BookOpen, CheckCircle2, XCircle, ChevronRight, Loader2, Play, Info, Clock } from 'lucide-react';

interface SpecialtyStudyAreaProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  onStudyStateChange?: (studyName: string | null) => void;
  isDarkMode?: boolean;
}

export interface SpecialtyStudyHandle {
  goBack: () => boolean;
}

const SpecialtyStudyArea = forwardRef<SpecialtyStudyHandle, SpecialtyStudyAreaProps>(({ user, members, onUpdateMember, onBack, onStudyStateChange, isDarkMode }, ref) => {
  const [studies, setStudies] = useState<SpecialtyStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<SpecialtyStudy | null>(null);
  const [mode, setMode] = useState<'list' | 'study' | 'quiz' | 'result'>('list');
  
  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  // Study Timer State
  const STUDY_TIME_SECONDS = 300; // 5 minutes
  const [studyTimer, setStudyTimer] = useState(STUDY_TIME_SECONDS);
  const [studyTimeCompleted, setStudyTimeCompleted] = useState(false);

  const isAdmin = user.role === UserRole.LEADERSHIP || user.email === 'ronaldoSonic@gmail.com';

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (mode === 'result') {
        setMode('list');
        return true;
      }
      if (mode === 'quiz') {
        setMode('study');
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
    let interval: NodeJS.Timeout;
    if (mode === 'study' && !studyTimeCompleted && studyTimer > 0) {
      if (isAdmin) {
        setStudyTimeCompleted(true);
        setStudyTimer(0);
        return;
      }
      interval = setInterval(() => {
        setStudyTimer(prev => {
          if (prev <= 1) {
            setStudyTimeCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, studyTimeCompleted, studyTimer]);

  useEffect(() => {
    if (onStudyStateChange) {
      onStudyStateChange(mode !== 'list' && selectedStudy ? selectedStudy.name : null);
    }
  }, [mode, selectedStudy, onStudyStateChange]);

  useEffect(() => {
    const sub = DatabaseService.subscribeSpecialtyStudies((data) => {
      setStudies(data);
      setLoading(false);
    });
    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  const formatPdfUrl = (url: string) => {
    if (!url) return '';
    
    // Google Drive links
    if (url.includes('drive.google.com')) {
      // Handle /file/d/ID/view or /file/d/ID/edit
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
      // Handle ?id=ID
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
      }
    }
    
    return url;
  };

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id);
  }, [members, user.id]);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const lockoutStatus = useMemo(() => {
    if (!currentMember || !selectedStudy) return { isLocked: false, message: '', remainingTime: '' };

    const studyScores = (currentMember.scores || [])
      .filter(s => s.specialtyStudyId === selectedStudy.id)
      .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

    if (studyScores.length === 0) return { isLocked: false, message: '', remainingTime: '' };

    const lastScore = studyScores[0];
    const lastDate = parseDate(lastScore.date);
    const now = new Date();
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const scoreValue = lastScore.specialtyStudyScore || 0;

    if (scoreValue >= 9) {
      return { isLocked: true, message: 'Você já concluiu esta especialidade com excelência!', remainingTime: 'CONCLUÍDO' };
    }

    if (scoreValue >= 7) {
      const waitDays = 7;
      if (diffDays < waitDays) {
        const remaining = waitDays - diffDays;
        const days = Math.floor(remaining);
        const hours = Math.floor((remaining - days) * 24);
        return { 
          isLocked: true, 
          message: 'Você tirou uma nota boa, mas precisa esperar para refazer o teste.', 
          remainingTime: `${days}d ${hours}h` 
        };
      }
    } else {
      const waitDays = 30;
      if (diffDays < waitDays) {
        const remaining = waitDays - diffDays;
        const days = Math.floor(remaining);
        const hours = Math.floor((remaining - days) * 24);
        return { 
          isLocked: true, 
          message: 'Estude mais o material! Você poderá refazer o teste em breve.', 
          remainingTime: `${days}d ${hours}h` 
        };
      }
    }

    return { isLocked: false, message: '', remainingTime: '' };
  }, [currentMember, selectedStudy]);

  const handleStartStudy = (study: SpecialtyStudy) => {
    setSelectedStudy(study);
    setMode('study');
    setStudyTimer(STUDY_TIME_SECONDS);
    setStudyTimeCompleted(false);
  };

  const handleStartQuiz = () => {
    setMode('quiz');
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
  };

  const handleAnswer = (optionIdx: number) => {
    if (!selectedStudy) return;
    const newAnswers = [...userAnswers, optionIdx];
    setUserAnswers(newAnswers);
    
    const questions = Array.isArray(selectedStudy.questions) 
      ? selectedStudy.questions 
      : (selectedStudy.questions ? Object.values(selectedStudy.questions) : []);
    
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Calculate Score
      let correctCount = 0;
      newAnswers.forEach((ans, idx) => {
        const q = questions[idx] as any;
        const correctAnswer = q.correct_answer !== undefined ? q.correct_answer : q.correctAnswer;
        if (q && ans === correctAnswer) {
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
        type: 'game',
        gameId: 'specialtyStudy',
        date: new Date().toLocaleDateString('pt-BR'),
        points: score,
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
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in">
        <div className="p-6 space-y-4 overflow-y-auto pb-32">
          <div className="grid grid-cols-1 gap-4">
            {studies.map(s => {
              const alreadyDone = currentMember?.scores?.some(score => score.specialtyStudyId === s.id);
              const bestScore = currentMember?.scores?.filter(score => score.specialtyStudyId === s.id).reduce((max, curr) => Math.max(max, curr.specialtyStudyScore || 0), 0);

              return (
                <div key={`study-item-${s.id}`} className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-lg shadow-blue-900/5 flex items-center justify-between group active:scale-[0.98] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 dark:bg-blue-900/30 text-blue-600">{s.category || 'Geral'}</span>
                      {alreadyDone && <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-green-100 dark:bg-green-900/30 text-green-600">Concluído</span>}
                    </div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">{s.name}</h4>
                    {alreadyDone && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Trophy size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Melhor Nota: {bestScore}/10</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleStartStudy(s)}
                    className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"
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
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex flex-col md:flex-row">
          {/* Imagem da Especialidade no Lado Esquerdo */}
          {selectedStudy.specialty_image_url && (
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-900 flex items-center justify-center p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 shrink-0 max-h-[30vh] md:max-h-none overflow-hidden">
              <div className="relative group scale-75 md:scale-100">
                <div className="absolute -inset-4 bg-blue-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                  src={formatImageUrl(selectedStudy.specialty_image_url)} 
                  alt={selectedStudy.name}
                  className="w-32 h-32 md:w-full md:h-auto object-contain relative z-10 drop-shadow-2xl animate-in zoom-in-95 duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 relative">
            <iframe 
              src={formatPdfUrl(selectedStudy.pdfurl)} 
              className="w-full h-full border-none"
              title="Material de Estudo"
              allow="autoplay"
            />
            
            {/* Temporizador Flutuante Compacto */}
            {!studyTimeCompleted && !lockoutStatus.isLocked && (
              <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 px-3 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    <Clock size={16} className="text-[#FFD700] animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estudo</span>
                    <span className="text-[#FFD700] text-sm font-black leading-none">
                      {Math.floor(studyTimer / 60)}:{(studyTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Ação Compacto */}
          <div className="absolute bottom-8 inset-x-0 flex justify-center px-6 pointer-events-none z-50">
            <div className="pointer-events-auto w-full max-w-xs">
              {lockoutStatus.isLocked ? (
                <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 p-4 rounded-[2rem] text-center shadow-2xl">
                  <p className="text-white text-[8px] font-black uppercase tracking-widest mb-1 opacity-70">{lockoutStatus.message}</p>
                  <p className="text-red-500 text-lg font-black">{lockoutStatus.remainingTime}</p>
                </div>
              ) : studyTimeCompleted && (
                <button 
                  onClick={handleStartQuiz}
                  className="w-full bg-[#FFD700] text-[#003366] py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-white animate-in zoom-in-95"
                >
                  <HelpCircle size={18} /> INICIAR TESTE FINAL
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && selectedStudy) {
    const questions = Array.isArray(selectedStudy.questions) 
      ? selectedStudy.questions 
      : (selectedStudy.questions ? Object.values(selectedStudy.questions) : []);
    
    const currentQ = questions[currentQuestionIdx] as any;
    
    if (!currentQ) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-[#0f172a]">
          <XCircle className="text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase">Erro no Quiz</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Não foi possível carregar as perguntas deste estudo.</p>
          <button onClick={() => setMode('study')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">VOLTAR</button>
        </div>
      );
    }

    // Handle both 'options' and 'alternatives' from DB
    const rawOptions = currentQ.options || currentQ.alternatives || [];
    const options = Array.isArray(rawOptions) 
      ? rawOptions 
      : (rawOptions ? Object.values(rawOptions) : []);

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in">
        <div className="p-6 flex-1 flex flex-col items-center justify-start space-y-8 overflow-y-auto">
          <div className="w-full bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Questão {currentQuestionIdx + 1} de {questions.length}</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
              {currentQ.question}
            </h3>
          </div>

          <div className="w-full space-y-3 pb-10">
            {options.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma alternativa encontrada</p>
              </div>
            ) : (
              options.map((opt: any, idx: number) => (
                <button 
                  key={`${currentQuestionIdx}-${idx}`}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] text-left font-bold text-slate-700 dark:text-slate-200 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all active:scale-[0.98] flex items-center gap-4 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 text-sm">{String(opt || '')}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result' && selectedStudy) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95 duration-500 bg-slate-50 dark:bg-[#0f172a]">
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 ${score >= 7 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
          {score >= 7 ? <Trophy size={48} /> : <Info size={48} />}
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase mb-2">
          {score >= 7 ? 'Parabéns!' : 'Continue Estudando!'}
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-10">
          Você concluiu o teste de {selectedStudy.name}
        </p>

        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 mb-10 w-full max-w-sm">
           <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Sua Nota Final</p>
           <p className={`text-7xl font-black ${score >= 7 ? 'text-green-600' : 'text-amber-600'}`}>{score}</p>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 mt-2">de 10 pontos possíveis</p>
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
