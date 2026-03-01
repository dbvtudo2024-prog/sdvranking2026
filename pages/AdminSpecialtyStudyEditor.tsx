
import React, { useState, useEffect } from 'react';
import { SpecialtyStudy, SpecialtyStudyQuestion } from '../types';
import { DatabaseService } from '../db';
import { Edit2, Trash2, X, Save, Search, Plus, Loader2, FileText, HelpCircle, ArrowLeft } from 'lucide-react';

interface AdminSpecialtyStudyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminSpecialtyStudyEditor: React.FC<AdminSpecialtyStudyEditorProps> = ({ onBack, onLogout }) => {
  const [studies, setStudies] = useState<SpecialtyStudy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<SpecialtyStudy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emptyQuestion: SpecialtyStudyQuestion = {
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0
  };

  const [newStudy, setNewStudy] = useState<Omit<SpecialtyStudy, 'id'>>({
    name: '',
    pdf_url: '',
    puzzle_image_url: '',
    category: 'Geral',
    questions: Array(10).fill(null).map(() => ({ ...emptyQuestion, options: ['', '', '', ''] }))
  });

  useEffect(() => {
    const channel = DatabaseService.subscribeSpecialtyStudies((data) => {
      setStudies(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleEditInit = (s: SpecialtyStudy) => {
    setEditForm({ ...s, questions: s.questions.map(q => ({ ...q, options: [...q.options] })) });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editForm) {
        await DatabaseService.updateSpecialtyStudy(editForm);
        alert('✅ Estudo atualizado!');
      } else {
        await DatabaseService.addSpecialtyStudy(newStudy);
        alert('✅ Estudo criado!');
        setNewStudy({
          name: '',
          pdf_url: '',
          puzzle_image_url: '',
          category: 'Geral',
          questions: Array(10).fill(null).map(() => ({ ...emptyQuestion, options: ['', '', '', ''] }))
        });
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + (error.message || 'Verifique o console'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este material de estudo permanentemente?')) return;
    try {
      await DatabaseService.deleteSpecialtyStudy(id);
    } catch (error) {
      alert('Erro ao deletar material.');
    }
  };

  const filteredStudies = studies.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-slate-700 text-sm transition-all shadow-inner";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Materiais de Estudo</h2>
          <button 
            onClick={() => { setEditForm(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0061f2] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> Adicionar Material
          </button>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm transition-all pl-10" 
              placeholder="Buscar por nome ou categoria..." 
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudies.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 transition-all flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-600">{s.category}</span>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-amber-100 text-amber-600">10 Questões</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight mb-1">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mb-3">PDF: {s.pdf_url}</p>
                  <div className="flex items-center gap-2 text-[#0061f2]">
                    <FileText size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Material de Estudo</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleEditInit(s)} className="p-2.5 bg-blue-50 text-[#0061f2] rounded-xl active:scale-90"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-90"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {filteredStudies.length === 0 && (
              <div className="col-span-full text-center py-20 opacity-30">
                <Search size={48} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum material encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0061f2] uppercase">{editForm ? 'Editar' : 'Novo'} Material de Estudo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Nome da Especialidade</label>
                  <input required className={inputClasses} value={editForm ? editForm.name : newStudy.name} onChange={e => editForm ? setEditForm({...editForm, name: e.target.value}) : setNewStudy({...newStudy, name: e.target.value})} />
                </div>
                <div>
                  <label className={labelClasses}>Categoria</label>
                  <input required className={inputClasses} value={editForm ? editForm.category : newStudy.category} onChange={e => editForm ? setEditForm({...editForm, category: e.target.value}) : setNewStudy({...newStudy, category: e.target.value})} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>URL do PDF (Estudo)</label>
                <input required className={inputClasses} placeholder="https://exemplo.com/arquivo.pdf" value={editForm ? editForm.pdf_url : newStudy.pdf_url} onChange={e => editForm ? setEditForm({...editForm, pdf_url: e.target.value}) : setNewStudy({...newStudy, pdf_url: e.target.value})} />
                <p className="text-[9px] text-slate-400 mt-2 ml-2 font-bold uppercase tracking-widest italic">* O PDF deve estar hospedado em um link público (Google Drive, Dropbox, etc)</p>
              </div>

              <div>
                <label className={labelClasses}>URL da Imagem para Quebra-Cabeça (Opcional)</label>
                <input className={inputClasses} placeholder="https://exemplo.com/imagem.jpg" value={editForm ? editForm.puzzle_image_url || '' : newStudy.puzzle_image_url || ''} onChange={e => editForm ? setEditForm({...editForm, puzzle_image_url: e.target.value}) : setNewStudy({...newStudy, puzzle_image_url: e.target.value})} />
                <p className="text-[9px] text-slate-400 mt-2 ml-2 font-bold uppercase tracking-widest italic">* Se fornecida, o desbravador terá um desafio extra de quebra-cabeça</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="text-amber-500" size={20} />
                  <h4 className="font-black text-slate-800 uppercase tracking-tight">Questões do Quiz (10 Obrigatórias)</h4>
                </div>
                
                <div className="space-y-8">
                  {(editForm ? editForm.questions : newStudy.questions).map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-lg bg-[#0061f2] text-white flex items-center justify-center font-black text-xs">{qIdx + 1}</span>
                        <input 
                          required 
                          className="flex-1 bg-transparent border-b-2 border-slate-200 outline-none focus:border-[#0061f2] font-bold text-slate-700 text-sm p-1" 
                          placeholder="Pergunta" 
                          value={q.question} 
                          onChange={e => {
                            const newQs = [...(editForm ? editForm.questions : newStudy.questions)];
                            newQs[qIdx].question = e.target.value;
                            editForm ? setEditForm({...editForm, questions: newQs}) : setNewStudy({...newStudy, questions: newQs});
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`correct-${qIdx}`} 
                              checked={q.correct_answer === oIdx} 
                              onChange={() => {
                                const newQs = [...(editForm ? editForm.questions : newStudy.questions)];
                                newQs[qIdx].correct_answer = oIdx;
                                editForm ? setEditForm({...editForm, questions: newQs}) : setNewStudy({...newStudy, questions: newQs});
                              }}
                            />
                            <input 
                              required 
                              className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-600 outline-none focus:border-[#0061f2]" 
                              placeholder={`Opção ${oIdx + 1}`} 
                              value={opt} 
                              onChange={e => {
                                const newQs = [...(editForm ? editForm.questions : newStudy.questions)];
                                newQs[qIdx].options[oIdx] = e.target.value;
                                editForm ? setEditForm({...editForm, questions: newQs}) : setNewStudy({...newStudy, questions: newQs});
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-[#0061f2] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {editForm ? 'SALVAR ALTERAÇÕES' : 'CRIAR MATERIAL DE ESTUDO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialtyStudyEditor;
