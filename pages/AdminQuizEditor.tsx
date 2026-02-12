
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from '../constants';
import { Edit2, Trash2, Check, X, ChevronDown, Save, Search, Filter, LogOut, ChevronLeft, Plus } from 'lucide-react';

interface AdminQuizEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminQuizEditor: React.FC<AdminQuizEditorProps> = ({ onBack, onLogout }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: 'Desbravadores' as 'Desbravadores' | 'Bíblia',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | 'Desbravadores' | 'Bíblia'>('Todas');

  const brasaoUrl = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  const loadQuestions = () => {
    const custom: QuizQuestion[] = JSON.parse(localStorage.getItem('sentinelas_custom_questions') || '[]');
    const modifiedFixed: QuizQuestion[] = JSON.parse(localStorage.getItem('sentinelas_modified_fixed_questions') || '[]');
    
    const fixedProcessed = QUIZ_QUESTIONS.map(q => {
      const mod = modifiedFixed.find(m => m.id === q.id);
      return mod || q;
    });

    setQuestions([...fixedProcessed, ...custom]);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const saveToStorage = (updatedQuestions: QuizQuestion[]) => {
    const custom = updatedQuestions.filter(q => q.id.startsWith('custom_'));
    const modifiedFixed = updatedQuestions.filter(q => !q.id.startsWith('custom_'));
    
    localStorage.setItem('sentinelas_custom_questions', JSON.stringify(custom));
    localStorage.setItem('sentinelas_modified_fixed_questions', JSON.stringify(modifiedFixed));
    setQuestions(updatedQuestions);
  };

  const handleEditInit = (q: QuizQuestion) => {
    setEditForm({ ...q, options: [...q.options] });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      const newQuestions = questions.map(q => q.id === editForm.id ? editForm : q);
      saveToStorage(newQuestions);
      setEditForm(null);
    } else {
      const custom: QuizQuestion[] = JSON.parse(localStorage.getItem('sentinelas_custom_questions') || '[]');
      const created: QuizQuestion = {
        id: 'custom_' + Date.now(),
        ...newQuestion
      };
      custom.push(created);
      localStorage.setItem('sentinelas_custom_questions', JSON.stringify(custom));
      loadQuestions();
      setNewQuestion({ question: '', category: 'Desbravadores', options: ['', '', '', ''], correctAnswer: 0 });
    }
    setShowModal(false);
    alert('Operação realizada com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Excluir esta pergunta permanentemente?')) return;
    const newQuestions = questions.filter(q => q.id !== id);
    saveToStorage(newQuestions);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-slate-700 text-sm transition-all shadow-inner";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-[#0061f2] text-white px-6 h-24 sticky top-0 z-50 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 mr-3">
            <img src={brasaoUrl} alt="Brasão" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black leading-tight tracking-tight truncate uppercase">Quiz do Clube</h1>
            <p className="text-[10px] sm:text-xs font-medium opacity-80 truncate uppercase">Banco de Questões</p>
          </div>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="flex items-center gap-1.5 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90 flex-shrink-0 ml-2">
            <LogOut size={20} className="rotate-180" />
          </button>
        )}
      </header>

      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-full text-[#0061f2] font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all w-fit">
            <ChevronLeft size={18} strokeWidth={3} /> Voltar
          </button>
          <button 
            onClick={() => { setEditForm(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0061f2] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10" 
              placeholder="Buscar pergunta..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10 appearance-none bg-no-repeat" 
              style={{ backgroundImage: 'none' }}
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value as any)}
            >
              <option value="Todas" className="text-slate-700">Todas</option>
              <option value="Desbravadores" className="text-slate-700">Desbravadores</option>
              <option value="Bíblia" className="text-slate-700">Bíblia</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="space-y-4 pb-24">
          {filteredQuestions.map(q => (
            <div key={q.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 transition-all flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${q.category === 'Bíblia' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{q.category}</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 leading-tight mb-3">{q.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  {q.options.map((opt, idx) => (
                    <p key={idx} className={`text-[10px] truncate ${idx === q.correctAnswer ? 'text-green-600 font-black' : 'text-slate-400 font-medium'}`}>
                      {idx + 1}. {opt} {idx === q.correctAnswer && '✓'}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => handleEditInit(q)} className="p-2.5 bg-blue-50 text-[#0061f2] rounded-xl"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(q.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 font-bold italic">Nenhuma pergunta encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0061f2] uppercase">{editForm ? 'Editar' : 'Nova'} Pergunta</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className={labelClasses}>Texto da Pergunta</label>
                <textarea required className={`${inputClasses} resize-none min-h-[100px]`} value={editForm ? editForm.question : newQuestion.question} onChange={e => editForm ? setEditForm({...editForm, question: e.target.value}) : setNewQuestion({...newQuestion, question: e.target.value})} />
              </div>

              <div className="relative">
                <label className={labelClasses}>Categoria</label>
                <select className={`${inputClasses} appearance-none`} value={editForm ? editForm.category : newQuestion.category} onChange={e => editForm ? setEditForm({...editForm, category: e.target.value as any}) : setNewQuestion({...newQuestion, category: e.target.value as any})}>
                  <option value="Desbravadores" className="text-slate-700">Desbravadores</option>
                  <option value="Bíblia" className="text-slate-700">Bíblia</option>
                </select>
                <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
              </div>

              <div className="space-y-3">
                <p className={labelClasses}>Opções de Resposta</p>
                {(editForm ? editForm.options : newQuestion.options).map((opt, i) => (
                  <div key={i} className="relative">
                    <input 
                      required 
                      className={`${inputClasses} pr-12`} 
                      placeholder={`Opção ${i + 1}`} 
                      value={opt} 
                      onChange={e => {
                        if (editForm) {
                          const opts = [...editForm.options];
                          opts[i] = e.target.value;
                          setEditForm({...editForm, options: opts});
                        } else {
                          const opts = [...newQuestion.options];
                          opts[i] = e.target.value;
                          setNewQuestion({...newQuestion, options: opts});
                        }
                      }} 
                    />
                    {(editForm ? editForm.correctAnswer : newQuestion.correctAnswer) === i && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
                  </div>
                ))}
              </div>

              <div className="relative">
                <label className={labelClasses}>Resposta Correta</label>
                <select className={`${inputClasses} appearance-none`} value={editForm ? editForm.correctAnswer : newQuestion.correctAnswer} onChange={e => editForm ? setEditForm({...editForm, correctAnswer: parseInt(e.target.value)}) : setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})}>
                  {[0,1,2,3].map((i) => <option key={i} value={i} className="text-slate-700">Opção {i + 1}</option>)}
                </select>
                <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
              </div>

              <button type="submit" className="w-full bg-[#0061f2] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> {editForm ? 'SALVAR ALTERAÇÕES' : 'CRIAR PERGUNTA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizEditor;
