
import React, { useState, useEffect, useRef } from 'react';
import { SpecialtyStudy, SpecialtyStudyQuestion } from '@/types';
import { DatabaseService } from '@/db';
import { Edit2, Trash2, X, Save, Search, Plus, Loader2, FileText, HelpCircle, ArrowLeft, DownloadCloud, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { SpecialtyDBV } from '@/types';
import { formatImageUrl } from '@/helpers/imageHelpers';

interface AdminSpecialtyStudyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

const AdminSpecialtyStudyEditor: React.FC<AdminSpecialtyStudyEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [studies, setStudies] = useState<SpecialtyStudy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<SpecialtyStudy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyQuestion: SpecialtyStudyQuestion = {
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0
  };

  const [newStudy, setNewStudy] = useState<Omit<SpecialtyStudy, 'id'>>({
    name: '',
    pdfurl: '',
    specialty_image_url: '',
    category: 'Geral',
    questions: Array(10).fill(null).map(() => ({ ...emptyQuestion, options: ['', '', '', ''] }))
  });

  useEffect(() => {
    const channel = DatabaseService.subscribeSpecialtyStudies((data) => {
      setStudies(data);
      setLoading(false);
    });

    DatabaseService.getSpecialties().then(setAvailableSpecialties);

    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleEditInit = (s: SpecialtyStudy) => {
    setEditForm({ ...s, questions: (s.questions || []).map(q => ({ ...q, options: [...(q.options || [])] })) });
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
          pdfurl: '',
          specialty_image_url: '',
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

  const handleSeedHistory = async () => {
    if (!confirm('Deseja importar o estudo "História do Velho Testamento"?')) return;
    setIsSaving(true);
    try {
      await DatabaseService.seedHistoryStudy();
      alert('✅ Estudo importado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao importar estudo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedNature = async () => {
    if (!confirm('Deseja importar o estudo "Estudo da Natureza"?')) return;
    setIsSaving(true);
    try {
      await DatabaseService.seedNatureStudy();
      alert('✅ Estudo importado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao importar estudo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSpecialty = (spec: SpecialtyDBV) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        name: spec.Nome,
        category: spec.Categoria,
        specialty_image_url: spec.Imagem || editForm.specialty_image_url
      });
    } else {
      setNewStudy({
        ...newStudy,
        name: spec.Nome,
        category: spec.Categoria,
        specialty_image_url: spec.Imagem || newStudy.specialty_image_url
      });
    }
    setShowSpecialtyPicker(false);
    setSpecialtySearch('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 in Firestore/Supabase
        alert('A imagem é muito grande. Por favor, escolha uma imagem com menos de 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (editForm) {
          setEditForm({ ...editForm, specialty_image_url: base64String });
        } else {
          setNewStudy({ ...newStudy, specialty_image_url: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredStudies = studies.filter(s => 
    (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
    (s.category || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const inputClasses = `w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'} border-2 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-sm transition-all shadow-inner`;
  const labelClasses = `text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-2 block ml-2`;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-hidden`}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Materiais de Estudo</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleSeedHistory}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={18} /> Importar História VT
            </button>
            <button 
              onClick={handleSeedNature}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={18} /> Importar Natureza
            </button>
            <button 
              onClick={() => { setEditForm(null); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0061f2] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <Plus size={18} /> Adicionar Material
            </button>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10 border`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`} size={18} />
            <input 
              className={`w-full p-3 border rounded-xl outline-none focus:border-[#0061f2] font-bold text-sm transition-all pl-10 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'}`} 
              placeholder="Buscar por nome ou categoria..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
             <Loader2 className={`animate-spin ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`} size={40} />
             <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Sincronizando Banco de Dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudies.map(s => (
              <div key={`admin-study-${s.id}`} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-blue-900/5 transition-all flex justify-between items-start gap-4`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{s.category}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>10 Questões</span>
                  </div>
                  <h4 className={`text-sm font-black leading-tight mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{s.name}</h4>
                  <p className={`text-[10px] font-medium truncate mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>PDF: {s.pdfurl}</p>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`}>
                    <FileText size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Material de Estudo</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleEditInit(s)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-[#0061f2]'}`}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}><Trash2 size={16} /></button>
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
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-4xl rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-black uppercase ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`}>{editForm ? 'Editar' : 'Novo'} Material de Estudo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                  className={`w-full p-4 flex items-center justify-between border-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-100 text-[#0061f2]'}`}
                >
                  <span>Puxar de EspecialidadesDBV</span>
                  <Search size={16} />
                </button>

                {showSpecialtyPicker && (
                  <div className={`absolute top-full left-0 right-0 mt-2 z-[300] rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="p-3 border-b border-slate-700">
                      <input 
                        className={`w-full p-2 rounded-lg text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-700'}`}
                        placeholder="Pesquisar especialidade..."
                        autoFocus
                        value={specialtySearch}
                        onChange={e => setSpecialtySearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {availableSpecialties
                        .filter(s => s.Nome.toLowerCase().includes(specialtySearch.toLowerCase()))
                        .map(spec => (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => handleSelectSpecialty(spec)}
                            className={`w-full p-3 text-left flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-colors border-b last:border-0 ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`}
                          >
                            {spec.Imagem && <img src={spec.Imagem} className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />}
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-tight">{spec.Nome}</p>
                              <p className="text-[8px] opacity-60 uppercase">{spec.Categoria}</p>
                            </div>
                            <Check size={14} className="opacity-0 group-hover:opacity-100" />
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Nome da Especialidade</label>
                  <input required className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} value={editForm ? editForm.name : newStudy.name} onChange={e => editForm ? setEditForm({...editForm, name: e.target.value}) : setNewStudy({...newStudy, name: e.target.value})} />
                </div>
                <div>
                  <label className={labelClasses}>Categoria</label>
                  <input required className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} value={editForm ? editForm.category : newStudy.category} onChange={e => editForm ? setEditForm({...editForm, category: e.target.value}) : setNewStudy({...newStudy, category: e.target.value})} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>URL do PDF (Estudo)</label>
                <input required className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} placeholder="https://exemplo.com/arquivo.pdf" value={editForm ? editForm.pdfurl : newStudy.pdfurl} onChange={e => editForm ? setEditForm({...editForm, pdfurl: e.target.value}) : setNewStudy({...newStudy, pdfurl: e.target.value})} />
                <p className={`text-[9px] mt-2 ml-2 font-bold uppercase tracking-widest italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>* O PDF deve estar hospedado em um link público (Google Drive, Dropbox, etc)</p>
              </div>

              <div>
                <label className={labelClasses}>Imagem da Especialidade</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
                  >
                    {(editForm ? editForm.specialty_image_url : newStudy.specialty_image_url) ? (
                      <img 
                        src={formatImageUrl(editForm ? editForm.specialty_image_url! : newStudy.specialty_image_url!)} 
                        className="w-full h-full object-contain p-2" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Camera size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Plus className="text-white" size={24} />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ou cole o link da imagem:</p>
                    <input 
                      className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      value={editForm ? editForm.specialty_image_url || '' : newStudy.specialty_image_url || ''} 
                      onChange={e => editForm ? setEditForm({...editForm, specialty_image_url: e.target.value}) : setNewStudy({...newStudy, specialty_image_url: e.target.value})} 
                    />
                  </div>
                </div>
                <p className={`text-[9px] mt-2 ml-2 font-bold uppercase tracking-widest italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>* Recomendado: Imagem quadrada com fundo transparente (PNG)</p>
              </div>

              <div className={`border-t pt-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="text-amber-500" size={20} />
                  <h4 className={`font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Questões do Quiz (10 Obrigatórias)</h4>
                </div>
                
                <div className="space-y-8">
                  {((editForm ? editForm.questions : newStudy.questions) || []).map((q, qIdx) => (
                    <div key={qIdx} className={`p-6 rounded-[2rem] border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-lg bg-[#0061f2] text-white flex items-center justify-center font-black text-xs">{qIdx + 1}</span>
                        <input 
                          required 
                          className={`flex-1 bg-transparent border-b-2 outline-none focus:border-[#0061f2] font-bold text-sm p-1 ${isDarkMode ? 'border-slate-700 text-slate-100' : 'border-slate-200 text-slate-700'}`} 
                          placeholder="Pergunta" 
                          value={q.question} 
                          onChange={e => {
                            const currentQs = editForm ? editForm.questions : newStudy.questions;
                            const newQs = [...(currentQs || [])];
                            newQs[qIdx] = { ...newQs[qIdx], question: e.target.value };
                            editForm ? setEditForm({...editForm, questions: newQs}) : setNewStudy({...newStudy, questions: newQs});
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`correct-${qIdx}`} 
                              checked={q.correct_answer === oIdx} 
                              onChange={() => {
                                const currentQs = editForm ? editForm.questions : newStudy.questions;
                                const newQs = [...(currentQs || [])];
                                newQs[qIdx] = { ...newQs[qIdx], correct_answer: oIdx };
                                editForm ? setEditForm({...editForm, questions: newQs}) : setNewStudy({...newStudy, questions: newQs});
                              }}
                            />
                            <input 
                              required 
                              className={`flex-1 border rounded-xl p-2 text-xs font-bold outline-none focus:border-[#0061f2] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`} 
                              placeholder={`Opção ${oIdx + 1}`} 
                              value={opt} 
                              onChange={e => {
                                const currentQs = editForm ? editForm.questions : newStudy.questions;
                                const newQs = [...(currentQs || [])];
                                const newOpts = [...(newQs[qIdx].options || ['', '', '', ''])];
                                newOpts[oIdx] = e.target.value;
                                newQs[qIdx] = { ...newQs[qIdx], options: newOpts };
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
