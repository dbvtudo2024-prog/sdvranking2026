
import React, { useState, useEffect } from 'react';
import { QuizQuestion, SpecialtyDBV } from '@/types';
import { QUIZ_QUESTIONS } from '@/constants';
import { DatabaseService } from '@/db';
import { Edit2, Trash2, Check, X, ChevronDown, Save, Search, Filter, ChevronLeft, Plus, DownloadCloud, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminQuizEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  initialCategory?: 'Todas' | 'Desbravadores' | 'Bíblia' | 'Natureza' | 'Primeiros Socorros' | 'Especialidades';
}

const AdminQuizEditor: React.FC<AdminQuizEditorProps> = ({ onBack, onLogout, isDarkMode, initialCategory = 'Todas' }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState<QuizQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: (initialCategory !== 'Todas' ? initialCategory : 'Desbravadores') as 'Desbravadores' | 'Bíblia' | 'Natureza' | 'Primeiros Socorros' | 'Especialidades',
    options: ['', '', '', ''],
    correctAnswer: 0,
    image_url: '',
    tip: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todas' | 'Desbravadores' | 'Bíblia' | 'Natureza' | 'Primeiros Socorros' | 'Especialidades'>(initialCategory);
  
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');

  useEffect(() => {
    const channel = DatabaseService.subscribeQuizQuestions((data) => {
      setQuestions(data);
      setLoading(false);
    });
    
    DatabaseService.getSpecialties().then(setAvailableSpecialties);
    
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
        setNewQuestion({ question: '', category: 'Desbravadores', options: ['', '', '', ''], correctAnswer: 0, image_url: '', tip: '' });
      }
      setShowModal(false);
    } catch (error: any) {
      alert(`Erro ao salvar questão no banco: ${error.message || 'Erro desconhecido'}`);
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
    if (!confirm('Deseja enviar as questões padrão (incluindo Natureza, Socorros e Especialidades) para o banco de dados?')) return;
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

  const generateWithAI = async (specialtyName: string) => {
    if (!specialtyName) return;
    setIsGenerating(true);
    try {
      // Tenta pegar de várias fontes possíveis de ambiente
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        // Se estiver no ambiente do AI Studio e sem chave, tenta abrir o seletor
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await window.aistudio.openSelectKey();
          }
        } else {
          throw new Error("Chave de API (GEMINI_API_KEY) não configurada. Se estiver no Vercel, adicione-a às variáveis de ambiente.");
        }
      }

      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Gere 5 perguntas de múltipla escolha para a especialidade de Desbravadores: "${specialtyName}". 
        Retorne APENAS o JSON puro, sem blocos de código markdown.
        Formato: um array de objetos com as propriedades: 
        "question" (string), "options" (array de 4 strings), "correctAnswer" (number 0-3), "tip" (string curta).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER },
                tip: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "tip"]
            }
          }
        }
      });

      const text = response.text || '';
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let generated;
      try {
        generated = JSON.parse(cleanedText);
      } catch (e) {
        console.error("Erro ao parsear JSON da IA:", text);
        throw new Error("A resposta da IA não veio em um formato JSON válido.");
      }

      if (generated && Array.isArray(generated) && generated.length > 0) {
        const questionsToSave = generated.map((q: any) => ({
          ...q,
          category: 'Especialidades'
        }));
        await DatabaseService.seedQuizQuestions(questionsToSave);
        alert(`✅ ${generated.length} questões geradas e salvas para ${specialtyName}!`);
      } else {
        throw new Error("A IA não gerou nenhuma questão válida.");
      }
    } catch (error: any) {
      console.error("Erro AI:", error);
      const errorMsg = error.message || "";
      if (errorMsg.includes("API_KEY") || errorMsg.includes("key") || errorMsg.includes("403")) {
        alert("Erro: Chave de API do Gemini não encontrada, inválida ou sem permissão. Verifique as variáveis de ambiente (GEMINI_API_KEY).");
      } else {
        alert(`Erro ao gerar questões com IA: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setIsGenerating(false);
      setShowSpecialtyPicker(false);
    }
  };

  const filteredQuestions = (questions || []).filter(q => {
    if (!q) return false;
    const matchesSearch = (q.question || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const inputClasses = `w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'} border-2 rounded-2xl outline-none focus:border-[#0061f2] focus:bg-white font-bold text-sm transition-all shadow-inner`;
  const labelClasses = `text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-2 block ml-2`;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-hidden`}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Banco de Questões</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} 
                Gerar p/ Especialidade
              </button>

              {showSpecialtyPicker && (
                <div className={`absolute top-full right-0 mt-2 w-72 z-[150] rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
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
                          onClick={() => generateWithAI(spec.Nome)}
                          className={`w-full p-3 text-left flex items-center gap-3 hover:bg-indigo-600 hover:text-white transition-colors border-b last:border-0 ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`}
                        >
                          {spec.Imagem && <img src={spec.Imagem} className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />}
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-tight">{spec.Nome}</p>
                            <p className="text-[8px] opacity-60 uppercase">{spec.Categoria}</p>
                          </div>
                          <Wand2 size={14} className="opacity-40" />
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

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

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10 border`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`} size={18} />
            <input 
              className={`w-full p-3 border rounded-xl outline-none focus:border-[#0061f2] font-bold text-sm transition-all pl-10 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'}`} 
              placeholder="Buscar pergunta no banco..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="relative min-w-[150px]">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`} size={16} />
            <select 
              className={`w-full p-3 border rounded-xl outline-none focus:border-[#0061f2] font-bold text-sm transition-all pl-10 appearance-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'}`} 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value as any)}
            >
              <option value="Todas">Todas</option>
              <option value="Desbravadores">Desbravadores</option>
              <option value="Bíblia">Bíblia</option>
              <option value="Natureza">Natureza</option>
              <option value="Primeiros Socorros">Primeiros Socorros</option>
              <option value="Especialidades">Especialidades</option>
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
            {filteredQuestions.map(q => {
              if (!q) return null;
              return (
                <div key={q.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-blue-900/5 transition-all flex justify-between items-start gap-4`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${q.category === 'Bíblia' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600') : (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600')}`}>{q.category}</span>
                    </div>
                    <h4 className={`text-sm font-black leading-tight mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{q.question}</h4>
                    {q.image_url && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-700">
                        <img src={q.image_url} alt="Questão" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {(q.options || []).map((opt, idx) => (
                        <p key={idx} className={`text-[10px] truncate ${idx === q.correctAnswer ? 'text-green-500 font-black' : (isDarkMode ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium')}`}>
                          {idx + 1}. {opt} {idx === q.correctAnswer && '✓'}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleEditInit(q)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-[#0061f2]'}`}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(q.id)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
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
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-black uppercase ${isDarkMode ? 'text-blue-400' : 'text-[#0061f2]'}`}>{editForm ? 'Editar' : 'Nova'} Pergunta</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className={labelClasses}>Texto da Pergunta</label>
                <textarea required className={`${inputClasses} resize-none min-h-[100px] ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} value={editForm ? editForm.question : newQuestion.question} onChange={e => editForm ? setEditForm({...editForm, question: e.target.value}) : setNewQuestion({...newQuestion, question: e.target.value})} />
              </div>

              <div className="relative">
                <label className={labelClasses}>Categoria</label>
                <select className={`${inputClasses} appearance-none ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} value={editForm ? editForm.category : newQuestion.category} onChange={e => editForm ? setEditForm({...editForm, category: e.target.value as any}) : setNewQuestion({...newQuestion, category: e.target.value as any})}>
                  <option value="Desbravadores">Desbravadores</option>
                  <option value="Bíblia">Bíblia</option>
                  <option value="Natureza">Natureza</option>
                  <option value="Primeiros Socorros">Primeiros Socorros</option>
                  <option value="Especialidades">Especialidades</option>
                </select>
                <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
              </div>

              <div>
                <label className={labelClasses}>URL da Imagem (Opcional)</label>
                <input className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} placeholder="https://exemplo.com/imagem.jpg" value={editForm ? (editForm as any).image_url || '' : newQuestion.image_url} onChange={e => editForm ? setEditForm({...editForm, image_url: e.target.value} as any) : setNewQuestion({...newQuestion, image_url: e.target.value})} />
              </div>

              <div>
                <label className={labelClasses}>Dica / Explicação (Opcional)</label>
                <textarea className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'} resize-none`} rows={2} placeholder="Explique por que esta é a resposta correta..." value={editForm ? (editForm as any).tip || '' : newQuestion.tip} onChange={e => editForm ? setEditForm({...editForm, tip: e.target.value} as any) : setNewQuestion({...newQuestion, tip: e.target.value})} />
              </div>

              <div className="space-y-3">
                <p className={labelClasses}>Opções de Resposta</p>
                {(editForm ? (editForm.options || []) : (newQuestion.options || [])).map((opt, i) => (
                  <div key={i} className="relative">
                    <input 
                      required 
                      className={`${inputClasses} pr-12 ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} 
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
                <select className={`${inputClasses} appearance-none ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} value={editForm ? editForm.correctAnswer : newQuestion.correctAnswer} onChange={e => editForm ? setEditForm({...editForm, correctAnswer: parseInt(e.target.value)}) : setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})}>
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
