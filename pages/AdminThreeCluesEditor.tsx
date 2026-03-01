
import React, { useState, useEffect } from 'react';
import { ThreeCluesQuestion } from '../types';
import { THREE_CLUES_DATA } from '../constants';
import { DatabaseService } from '../db';
import { Edit2, Trash2, X, ChevronDown, Save, Search, Plus, Loader2, DownloadCloud } from 'lucide-react';

interface AdminThreeCluesEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminThreeCluesEditor: React.FC<AdminThreeCluesEditorProps> = ({ onBack, onLogout }) => {
  const [questions, setQuestions] = useState<ThreeCluesQuestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<ThreeCluesQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    clues: ['', '', ''],
    answer: '',
    category: 'Geral'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const channel = DatabaseService.subscribeThreeCluesQuestions((data) => {
      setQuestions(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleEditInit = (q: ThreeCluesQuestion) => {
    setEditForm({ ...q, clues: [...q.clues] });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editForm) {
        await DatabaseService.updateThreeCluesQuestion(editForm);
        setEditForm(null);
      } else {
        await DatabaseService.addThreeCluesQuestion(newQuestion);
        setNewQuestion({ clues: ['', '', ''], answer: '', category: 'Geral' });
      }
      setShowModal(false);
      alert('✅ Salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + (error.message || 'Verifique o console'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta pergunta permanentemente?')) return;
    try {
      await DatabaseService.deleteThreeCluesQuestion(id);
    } catch (error) {
      alert('Erro ao deletar questão.');
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.answer || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (q.clues || []).some(c => (c || '').toLowerCase().includes((searchTerm || '').toLowerCase()));
    return matchesSearch;
  });

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-slate-700 text-sm transition-all shadow-inner";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex justify-end items-center gap-4">
          <button 
            onClick={async () => {
              if (!confirm('Importar as 10 questões padrão?')) return;
              setIsSaving(true);
              try {
                const toSeed = THREE_CLUES_DATA.map(q => ({ ...q, category: 'Geral' }));
                await DatabaseService.seedThreeCluesQuestions(toSeed);
                alert('✅ Questões importadas com sucesso!');
              } catch (e: any) { 
                console.error('Erro ao importar:', e);
                alert('❌ Erro ao importar: ' + (e.message || 'Verifique o console')); 
              }
              finally { setIsSaving(false); }
            }}
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

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10" 
              placeholder="Buscar por resposta ou dica..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
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
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-600">{q.category}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight mb-3">Resposta: {q.answer}</h4>
                  <div className="space-y-1">
                    {q.clues.map((clue, idx) => (
                      <p key={idx} className="text-[10px] text-slate-400 font-medium">
                        Dica {idx + 1}: {clue}
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
                <label className={labelClasses}>Resposta</label>
                <input required className={inputClasses} value={editForm ? editForm.answer : newQuestion.answer} onChange={e => editForm ? setEditForm({...editForm, answer: e.target.value}) : setNewQuestion({...newQuestion, answer: e.target.value})} />
              </div>

              <div>
                <label className={labelClasses}>Categoria</label>
                <input required className={inputClasses} value={editForm ? editForm.category : newQuestion.category} onChange={e => editForm ? setEditForm({...editForm, category: e.target.value}) : setNewQuestion({...newQuestion, category: e.target.value})} />
              </div>

              <div className="space-y-3">
                <p className={labelClasses}>Dicas</p>
                {(editForm ? editForm.clues : newQuestion.clues).map((clue, i) => (
                  <div key={i}>
                    <input 
                      required 
                      className={inputClasses} 
                      placeholder={`Dica ${i + 1}`} 
                      value={clue} 
                      onChange={e => {
                        if (editForm) {
                          const clues = [...editForm.clues];
                          clues[i] = e.target.value;
                          setEditForm({...editForm, clues: clues});
                        } else {
                          const clues = [...newQuestion.clues];
                          clues[i] = e.target.value;
                          setNewQuestion({...newQuestion, clues: clues});
                        }
                      }} 
                    />
                  </div>
                ))}
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

export default AdminThreeCluesEditor;
