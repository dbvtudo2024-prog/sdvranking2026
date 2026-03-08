
import React, { useState, useMemo, useEffect } from 'react';
import { AuthUser, Member, Score, ThreeCluesQuestion } from '@/types';
import { THREE_CLUES_DATA } from '@/constants';
import { DatabaseService } from '@/db';
import { ArrowLeft, Lightbulb, Trophy, Send, CheckCircle2, XCircle, HelpCircle, Info, Loader2, MessageSquare } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';

interface ThreeCluesGameProps {
  user: AuthUser;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onBack: () => void;
  override: boolean;
}

const ThreeCluesGame: React.FC<ThreeCluesGameProps> = ({ user, members, onUpdateMember, onBack, override }) => {
  const [questions, setQuestions] = useState<ThreeCluesQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2 (as 3 dicas)
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await DatabaseService.getThreeCluesQuestions();
        if (data && data.length > 0) {
          setQuestions([...data].sort(() => Math.random() - 0.5).slice(0, 5));
        } else {
          // Fallback para dados locais se o banco estiver vazio
          setQuestions([...THREE_CLUES_DATA].map((q, i) => ({ ...q, id: String(i), category: 'Geral' })).sort(() => Math.random() - 0.5).slice(0, 5) as any);
        }
      } catch (err) {
        console.error("Erro ao carregar questões:", err);
        setQuestions([...THREE_CLUES_DATA].map((q, i) => ({ ...q, id: String(i), category: 'Geral' })).sort(() => Math.random() - 0.5).slice(0, 5) as any);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const currentQ = questions[currentQuestionIdx];

  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Desafio...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <HelpCircle size={60} className="text-slate-200" />
        <h3 className="text-xl font-black text-slate-800 uppercase">Sem Questões</h3>
        <p className="text-slate-400 text-sm">Peça para a liderança cadastrar questões no painel admin.</p>
      </div>
    );
  }

  const handleGuess = () => {
    if (!userInput.trim() || feedback) return;

    const isCorrect = normalize(userInput) === normalize(currentQ.answer);

    if (isCorrect) {
      const points = currentStep === 0 ? 7 : currentStep === 1 ? 5 : 3;
      setScore(prev => prev + points);
      setFeedback('correct');
      
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      if (currentStep < 2) {
        setFeedback('wrong');
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setFeedback(null);
          setUserInput('');
        }, 1000);
      } else {
        setFeedback('wrong');
        setTimeout(() => {
          nextQuestion();
        }, 1500);
      }
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setUserInput('');
    setCurrentStep(0);
    if (currentQuestionIdx < (questions || []).length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    const member = members.find(m => m.id === user.id);
    if (member) {
      const newScore: Score = {
        date: new Date().toLocaleDateString('pt-BR'),
        punctuality: 0,
        uniform: 0,
        material: 0,
        bible: 0,
        voluntariness: 0,
        activities: 0,
        treasury: 0,
        threeCluesGame: score
      };
      onUpdateMember({
        ...member,
        scores: [...(member.scores || []), newScore]
      });
    }
    onBack();
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in-95 duration-500">
        <Trophy size={80} className="text-yellow-400 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 uppercase mb-2">Fim do Jogo!</h2>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 w-full max-w-sm">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Pontuação Final</p>
           <p className="text-6xl font-black text-blue-600">{score} <span className="text-xl">pts</span></p>
        </div>
        <button 
          onClick={handleFinish}
          className="w-full max-w-xs bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          SALVAR E VOLTAR
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in relative">
      <GameInstructions
        isOpen={showInstructions}
        onStart={() => setShowInstructions(false)}
        title="Três Dicas"
        instructions={[
          "Acertou na 1ª dica: 7 pontos",
          "Acertou na 2ª dica: 5 pontos",
          "Acertou na 3ª dica: 3 pontos",
          "Digite sua resposta e clique em enviar.",
          "O jogo termina após 5 palavras."
        ]}
        icon={<MessageSquare size={32} className="text-white" />}
      />
      <header className="bg-blue-600 p-6 pt-12 text-white flex justify-end items-center shadow-lg">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Três Dicas</p>
          <p className="font-black">Questão {currentQuestionIdx + 1}/{(questions || []).length}</p>
        </div>
        <div className="bg-white/20 px-4 py-1.5 rounded-full font-black text-sm">{score} pts</div>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-full space-y-3">
          {Array.from({length: 3}).map((_, i) => (
            <div 
              key={i} 
              className={`p-5 rounded-[1.5rem] border-2 transition-all duration-500 flex items-center gap-4
                ${currentStep >= i 
                  ? 'bg-white border-blue-100 shadow-md text-slate-700 animate-in slide-in-from-left' 
                  : 'bg-slate-100 border-dashed border-slate-200 text-slate-300 opacity-40'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                ${currentStep >= i ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200'}`}>
                {currentStep >= i ? <Lightbulb size={20} /> : <HelpCircle size={20} />}
              </div>
              <p className={`text-sm font-bold leading-tight ${currentStep < i ? 'italic' : ''}`}>
                {currentStep >= i ? currentQ.clues[i] : `Aguardando dica ${i + 1}...`}
              </p>
            </div>
          ))}
        </div>

        <div className="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Digite sua resposta..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleGuess()}
              className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none font-black text-slate-700 transition-all
                ${feedback === 'correct' ? 'border-green-500 bg-green-50' : feedback === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              {feedback === 'correct' && <CheckCircle2 className="text-green-600" size={24} />}
              {feedback === 'wrong' && <XCircle className="text-red-600" size={24} />}
            </div>
          </div>
          
          <button 
            disabled={!userInput.trim() || !!feedback}
            onClick={handleGuess}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={18} /> ENVIAR RESPOSTA
          </button>
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          {currentStep === 0 ? 'VALENDO 7 PONTOS' : currentStep === 1 ? 'VALENDO 5 PONTOS' : 'VALENDO 3 PONTOS'}
        </p>
      </div>
    </div>
  );
};

export default ThreeCluesGame;
