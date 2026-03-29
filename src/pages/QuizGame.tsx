
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DatabaseService } from '@/db';
import { AuthUser, Member, Score, QuizQuestion } from '@/types';
import { Check, X, Trophy, Loader2, HelpCircle } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameHeader from '@/components/GameHeader';

interface QuizGameProps {
  category: 'Desbravadores' | 'Bíblia';
  user: AuthUser;
  member?: Member;
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ category, user, member, onUpdateMember, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await DatabaseService.getQuizQuestions();
        const filtered = (allQuestions || [])
          .filter(q => q && q.category === category)
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setQuestions(filtered);
      } catch (err) {
        console.error("Erro ao buscar questões.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [category]);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    if (optionIndex === (questions[currentQuestionIndex]?.correct_answer ?? -1)) {
      setScore(prev => prev + 2);
    }

    setTimeout(() => {
      if (currentQuestionIndex < (questions || []).length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const saveScoreToProfile = useCallback(() => {
    if (member) {
      const newScore: Score = {
        type: 'game',
        gameId: 'quiz',
        points: score,
        quiz: score,
        quizCategory: category,
        date: new Date().toLocaleDateString('pt-BR')
      };
      onUpdateMember({
        ...member,
        scores: [...(member.scores || []), newScore]
      });
    }
  }, [score, category, member, onUpdateMember]);

  useEffect(() => {
    if (showResult) {
      saveScoreToProfile();
    }
  }, [showResult, saveScoreToProfile]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
        <GameHeader title={`Quiz: ${category}`} user={user} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#0061f2]" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Desafio do Banco...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a]">
        <GameHeader 
          title={`Quiz: ${category}`}
          user={user}
          onBack={onBack}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-500 text-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-yellow-200 mb-8">
             <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Fim de Jogo!</h2>
          <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest">Categoria: {category}</p>
          
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 dark:border-slate-700 mb-10 w-full">
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Sua Pontuação</p>
             <p className="text-6xl font-black text-[#0061f2]">{score} <span className="text-xl">pts</span></p>
          </div>

          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            Sua pontuação foi salva automaticamente!
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <GameHeader 
        title={`Quiz: ${category}`}
        user={user}
        stats={[
          { label: 'Pergunta', value: `${currentQuestionIndex + 1}/${questions.length}` },
          { label: 'Pontos', value: score }
        ]}
        onBack={onBack}
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        <GameInstructions
          isOpen={showInstructions}
          onStart={() => setShowInstructions(false)}
          title={`Quiz: ${category}`}
          instructions={[
            "Responda 10 perguntas aleatórias.",
            "Cada acerto vale 2 pontos.",
            "Você tem tempo ilimitado para pensar.",
            "Ao final, sua pontuação será salva no seu perfil."
          ]}
          icon={<HelpCircle size={32} className="text-white" />}
        />

        {!currentQuestion ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-black uppercase">Nenhuma pergunta encontrada no banco.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 flex items-center justify-center text-center w-full">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-tight">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(currentQuestion.options || []).map((option, idx) => {
                let style = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300";
                if (isAnswered) {
                  if (idx === currentQuestion.correct_answer) style = "bg-green-500 border-green-500 text-white";
                  else if (idx === selectedOption) style = "bg-red-500 border-red-500 text-white";
                  else style = "bg-slate-50 dark:bg-slate-900 border-slate-50 dark:border-slate-900 text-slate-300 dark:text-slate-700";
                } else if (selectedOption === idx) {
                  style = "bg-blue-500 border-blue-500 text-white";
                }

                return (
                  <button 
                    key={`${currentQuestionIndex}-${idx}`}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-5 rounded-2xl border-2 font-bold text-left transition-all active:scale-[0.98] flex justify-between items-center text-sm ${style}`}
                  >
                    <span className="pr-4">{option}</span>
                    {isAnswered && idx === currentQuestion.correct_answer && <Check size={18} className="shrink-0" />}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correct_answer && <X size={18} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
