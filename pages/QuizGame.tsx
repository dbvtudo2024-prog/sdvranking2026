
import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../db';
import { AuthUser, Member, Score, QuizQuestion } from '../types';
import { ArrowLeft, Check, X, Trophy, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await DatabaseService.getQuizQuestions();
        const filtered = allQuestions
          .filter(q => q.category === category)
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

  const handleFinish = () => {
    if (member) {
      const newScoreEntry: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        quiz: score,
        quizCategory: category
      };
      
      const updatedMember = {
        ...member,
        scores: [...(member.scores || []), newScoreEntry]
      };
      onUpdateMember(updatedMember);
    }
    onBack();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-[#0061f2]" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Desafio do Banco...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-yellow-200 mb-8">
           <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Fim de Jogo!</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest">Categoria: {category}</p>
        
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 mb-10 w-full">
           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Sua Pontuação</p>
           <p className="text-6xl font-black text-[#0061f2]">{score} <span className="text-xl">pts</span></p>
        </div>

        <button 
          onClick={handleFinish}
          className="w-full bg-[#0061f2] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          SALVAR E VOLTAR
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} /></button>
        <div className="px-5 py-2 bg-blue-50 text-[#0061f2] rounded-full font-black text-[10px] uppercase tracking-widest border border-blue-100">
          Pergunta {currentQuestionIndex + 1} de {(questions || []).length}
        </div>
        <div className="font-black text-[#FFD700] text-lg">{score} pts</div>
      </div>

      {!currentQuestion ? (
        <div className="text-center py-20">
          <p className="text-slate-400 font-black uppercase">Nenhuma pergunta encontrada no banco.</p>
          <button onClick={onBack} className="mt-4 text-blue-500 font-bold">Voltar</button>
        </div>
      ) : (
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center justify-center text-center w-full">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(currentQuestion.options || []).map((option, idx) => {
              let style = "bg-white border-slate-100 text-slate-600";
              if (isAnswered) {
                if (idx === currentQuestion.correct_answer) style = "bg-green-500 border-green-500 text-white";
                else if (idx === selectedOption) style = "bg-red-500 border-red-500 text-white";
                else style = "bg-slate-50 border-slate-50 text-slate-300";
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
  );
};

export default QuizGame;
