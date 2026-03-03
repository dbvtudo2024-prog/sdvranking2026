
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { QUIZ_QUESTIONS } from '@/constants';
import { DatabaseService } from '@/db';
import { Edit2, Trash2, Check, X, ChevronDown, Save, Search, Filter, ChevronLeft, Plus, DownloadCloud, Loader2 } from 'lucide-react';

interface AdminQuizEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminQuizEditor: React.FC<AdminQuizEditorProps> = ({ onBack, onLogout }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: 'Desbravadores' as 'Desbravadores' | 'Bíblia',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | 'Desbravadores' | 'Bíblia'>('Todas');

  useEffect(() => {
    const channel = DatabaseService.subscribeQuizQuestions((data) => {
      setQuestions(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleEditInit = (q: QuizQuestion) => {
    setEditForm({ ...q, options: [...(q.options || [])] });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editForm) {
        await DatabaseService.updateQuizQuestion(editForm);
        setEditForm(null);
      } else {
        await DatabaseService.addQuizQuestion(newQuestion);
        setNewQuestion({ question: '', category: 'Desbravadores', options: ['', '', '', ''], correctAnswer: 0 });
      }
      setShowModal(false);
    } catch (error) {
      alert('Erro ao salvar questão no banco.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta pergunta permanentemente do banco de dados?')) return;
    try {
      await DatabaseService.deleteQuizQuestion(id);
    } catch (error) {
      alert('Erro ao deletar questão.');
    }
  };

  const handleSeedQuestions = async () => {
    if (!confirm('Deseja enviar as 20 questões padrão para o banco de dados?')) return;
    setIsSaving(true);
    try {
      const questionsToSeed = QUIZ_QUESTIONS.map(({ id, ...q }) => q);
      await DatabaseService.seedQuizQuestions(questionsToSeed);
      alert('Questões enviadas com sucesso!');
    } catch (error) {
      alert('Erro ao enviar questões.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.question || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-slate-700 text-sm transition-all shadow-inner";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex flex-wrap justify-end items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={handleSeedQuestions}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={18} /> Importar Padrão
            </button>
            <button 
              onClick={() => { setEditForm(null); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0061f2] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <Plus size={18} /> Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10" 
              placeholder="Buscar pergunta no banco..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10 appearance-none" 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value as any)}
            >
              <option value="Todas">Todas</option>
              <option value="Desbravadores">Desbravadores</option>
              <option value="Bíblia">Bíblia</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
             <Loader2 className="animate-spin text-[#0061f2]" size={40} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Banco de Dados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(q => (
              <div key={q.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 transition-all flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${q.category === 'Bíblia' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{q.category}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight mb-3">{q.question}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {(q.options || []).map((opt, idx) => (
                      <p key={idx} className={`text-[10px] truncate ${idx === q.correctAnswer ? 'text-green-600 font-black' : 'text-slate-400 font-medium'}`}>
                        {idx + 1}. {opt} {idx === q.correctAnswer && '✓'}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleEditInit(q)} className="p-2.5 bg-blue-50 text-[#0061f2] rounded-xl active:scale-90"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-90"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <Search size={48} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma pergunta encontrada</p>
              </div>
            )}
          </div>
        )}
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
                  <option value="Desbravadores">Desbravadores</option>
                  <option value="Bíblia">Bíblia</option>
                </select>
                <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
              </div>

              <div className="space-y-3">
                <p className={labelClasses}>Opções de Resposta</p>
                {(editForm ? (editForm.options || []) : (newQuestion.options || [])).map((opt, i) => (
                  <div key={i} className="relative">
                    <input 
                      required 
                      className={`${inputClasses} pr-12`} 
                      placeholder={`Opção ${i + 1}`} 
                      value={opt} 
                      onChange={e => {
                        if (editForm) {
                          const opts = [...(editForm.options || [])];
                          opts[i] = e.target.value;
                          setEditForm({...editForm, options: opts});
                        } else {
                          const opts = [...(newQuestion.options || [])];
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
                  {[0,1,2,3].map((i) => <option key={i} value={i}>Opção {i + 1}</option>)}
                </select>
                <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-[#0061f2] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {editForm ? 'SALVAR ALTERAÇÕES' : 'CRIAR PERGUNTA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizEditor;
