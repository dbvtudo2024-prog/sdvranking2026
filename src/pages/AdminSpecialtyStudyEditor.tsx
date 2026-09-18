
import React, { useState, useEffect, useRef } from 'react';
import { SpecialtyStudy, SpecialtyStudyQuestion } from '@/types';
import { DatabaseService } from '@/db';
import { Edit2, Trash2, X, Save, Search, Plus, Loader2, FileText, HelpCircle, ArrowLeft, DownloadCloud, Check, Camera, Image as ImageIcon, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SpecialtyDBV } from '@/types';
import { formatImageUrl } from '@/helpers/imageHelpers';
import {
  parseSpecialtyStudiesFromCSVText,
  parseQuestionsFromCSVText,
  generateSpecialtyStudiesCsvTemplate,
  generateQuestionsCsvTemplate
} from '@/utils/specialtyStudyCsv';

interface AdminSpecialtyStudyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

const AdminSpecialtyStudyEditor: React.FC<AdminSpecialtyStudyEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [studies, setStudies] = useState<SpecialtyStudy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<SpecialtyStudy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCsvInputRef = useRef<HTMLInputElement>(null);
  const questionsCsvInputRef = useRef<HTMLInputElement>(null);

  // Estados da importação em lote de Estudos
  const [batchCsvText, setBatchCsvText] = useState('');
  const [batchImportLogs, setBatchImportLogs] = useState<string[]>([]);
  const [batchImportProgress, setBatchImportProgress] = useState<{ current: number; total: number; success: number; error: number } | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

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
    scheduled_for: new Date().toISOString().slice(0, 16),
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
          scheduled_for: new Date().toISOString().slice(0, 16),
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

  const handleDownloadStudiesTemplate = () => {
    const csvContent = generateSpecialtyStudiesCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_estudos_especialidades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQuestionsTemplate = () => {
    const csvContent = generateQuestionsCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_questoes_estudo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBatchCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBatchCsvText(content || '');
      setBatchImportLogs(prev => [...prev, `📄 Arquivo carregado: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`]);
    };
    reader.readAsText(file);
    if (bulkCsvInputRef.current) bulkCsvInputRef.current.value = '';
  };

  const handleProcessBatchStudies = async () => {
    if (!batchCsvText.trim()) {
      alert('Por favor, selecione um arquivo CSV ou cole o conteúdo antes de importar.');
      return;
    }

    setIsProcessingBatch(true);
    setBatchImportLogs(['Iniciando leitura e validação do CSV...']);

    try {
      const parsedStudies = parseSpecialtyStudiesFromCSVText(batchCsvText);
      if (parsedStudies.length === 0) {
        setBatchImportLogs(prev => [...prev, '❌ Nenhum estudo válido pôde ser extraído do CSV. Verifique os cabeçalhos das colunas.']);
        setIsProcessingBatch(false);
        return;
      }

      setBatchImportLogs(prev => [
        ...prev,
        `📋 Encontrado(s) ${parsedStudies.length} estudo(s) no arquivo. Gravando no Supabase e Cloudflare D1...`
      ]);

      setBatchImportProgress({ current: 0, total: parsedStudies.length, success: 0, error: 0 });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < parsedStudies.length; i++) {
        const study = parsedStudies[i];
        const currentIdx = i + 1;
        setBatchImportProgress(prev => prev ? ({ ...prev, current: currentIdx }) : null);

        try {
          await DatabaseService.saveSpecialtyStudy(study);
          successCount++;
          setBatchImportProgress(prev => prev ? ({ ...prev, success: successCount }) : null);
          setBatchImportLogs(prev => [
            ...prev,
            `✅ [${currentIdx}/${parsedStudies.length}] Salvo com sucesso: "${study.name}" (${study.questions?.length || 0} questões)`
          ]);
        } catch (err: any) {
          errorCount++;
          setBatchImportProgress(prev => prev ? ({ ...prev, error: errorCount }) : null);
          setBatchImportLogs(prev => [
            ...prev,
            `❌ [${currentIdx}/${parsedStudies.length}] Erro ao salvar "${study.name}": ${err?.message || err}`
          ]);
        }
      }

      setBatchImportLogs(prev => [
        ...prev,
        `🎉 Concluído: ${successCount} salvos com sucesso, ${errorCount} falhas.`
      ]);

      const freshList = await DatabaseService.getSpecialtyStudies();
      setStudies(freshList);
      alert(`Importação concluída! ${successCount} estudo(s) salvo(s) no banco de dados.`);
    } catch (err: any) {
      console.error('Erro na importação em lote:', err);
      setBatchImportLogs(prev => [...prev, `❌ Erro inesperado: ${err?.message || err}`]);
      alert('Erro ao processar CSV: ' + (err?.message || 'Verifique o console'));
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleQuestionsCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      try {
        const parsed = parseQuestionsFromCSVText(content);
        if (parsed.length === 0) {
          alert('Nenhuma questão válida foi encontrada no CSV. Verifique o modelo de colunas.');
          return;
        }

        const mergedQuestions: SpecialtyStudyQuestion[] = [...parsed];
        while (mergedQuestions.length < 10) {
          mergedQuestions.push({ question: '', options: ['', '', '', ''], correct_answer: 0 });
        }

        if (editForm) {
          setEditForm({ ...editForm, questions: mergedQuestions });
        } else {
          setNewStudy({ ...newStudy, questions: mergedQuestions });
        }

        alert(`✅ ${parsed.length} questão(ões) importada(s) para o formulário!`);
      } catch (err: any) {
        alert('Erro ao processar CSV de questões: ' + (err?.message || 'Arquivo inválido'));
      }
    };
    reader.readAsText(file);
    if (questionsCsvInputRef.current) questionsCsvInputRef.current.value = '';
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
              onClick={handleDownloadStudiesTemplate}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-widest border transition-all active:scale-95 ${isDarkMode ? 'border-slate-700 bg-slate-850 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              title="Baixar modelo de planilha CSV para estudos"
            >
              <Download size={16} className="text-blue-500" /> Modelo CSV
            </button>
            <button 
              onClick={() => {
                setShowBatchImportModal(true);
                setBatchImportLogs([]);
                setBatchImportProgress(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <FileSpreadsheet size={16} /> Importar Estudos CSV
            </button>
            <button 
              onClick={handleSeedHistory}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={16} /> História VT
            </button>
            <button 
              onClick={handleSeedNature}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={16} /> Natureza
            </button>
            <button 
              onClick={() => { setEditForm(null); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0061f2] hover:bg-blue-700 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Plus size={16} /> Adicionar Material
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
            {filteredStudies.map((s, sIdx) => (
              <div key={`admin-study-${s.id || sIdx}-${sIdx}`} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-blue-900/5 transition-all flex items-center justify-between gap-4`}>
                {s.specialty_image_url && (
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-2 shrink-0 shadow-inner border border-slate-100 dark:border-slate-700/50">
                    <img 
                      src={formatImageUrl(s.specialty_image_url)} 
                      alt={s.name}
                      className="w-full h-full object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
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
                        .map((spec, specIdx) => (
                          <button
                            key={spec.id ? `study-spec-${spec.id}-${specIdx}` : `study-spec-${specIdx}`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>URL do PDF (Estudo)</label>
                  <input required className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} placeholder="https://exemplo.com/arquivo.pdf" value={editForm ? editForm.pdfurl : newStudy.pdfurl} onChange={e => editForm ? setEditForm({...editForm, pdfurl: e.target.value}) : setNewStudy({...newStudy, pdfurl: e.target.value})} />
                </div>
                <div>
                  <label className={labelClasses}>Agendar Estudo (Data e Hora)</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} 
                    value={editForm ? (editForm.scheduled_for || '').slice(0, 16) : (newStudy.scheduled_for || '').slice(0, 16)} 
                    onChange={e => {
                      const val = e.target.value;
                      editForm ? setEditForm({...editForm, scheduled_for: val}) : setNewStudy({...newStudy, scheduled_for: val});
                    }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>URL do Vídeo (Opcional)</label>
                  <input className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} placeholder="https://youtube.com/watch?v=..." value={editForm ? editForm.video_url || '' : newStudy.video_url || ''} onChange={e => editForm ? setEditForm({...editForm, video_url: e.target.value}) : setNewStudy({...newStudy, video_url: e.target.value})} />
                </div>
              </div>
              <p className={`text-[9px] mt-2 ml-2 font-bold uppercase tracking-widest italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>* O PDF e o Vídeo devem estar hospedados em links públicos</p>

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="text-amber-500" size={20} />
                    <h4 className={`font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Questões do Quiz (10 Obrigatórias)</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQuestionsTemplate}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      title="Baixar modelo de CSV com colunas de perguntas e alternativas"
                    >
                      <Download size={14} className="text-blue-500" /> Modelo Questões
                    </button>
                    <button
                      type="button"
                      onClick={() => questionsCsvInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95"
                      title="Importar perguntas a partir de uma planilha CSV"
                    >
                      <Upload size={14} /> Importar Questões CSV
                    </button>
                    <input
                      type="file"
                      ref={questionsCsvInputRef}
                      hidden
                      accept=".csv,text/csv,text/plain"
                      onChange={handleQuestionsCsvFileSelected}
                    />
                  </div>
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

      {/* Modal de Importação em Lote de Estudos via CSV */}
      {showBatchImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'} w-full max-w-3xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Importar Estudos em Massa (CSV)</h3>
                  <p className="text-xs text-slate-400 font-medium">Salve múltiplos estudos e seus questionários de uma só vez no banco de dados</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!isProcessingBatch) {
                    setShowBatchImportModal(false);
                    setBatchImportLogs([]);
                    setBatchImportProgress(null);
                  }
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Ações de Arquivo e Modelo */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-850/50 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Planilha ou Arquivo CSV</h4>
                  <p className="text-xs text-slate-500">Selecione um arquivo .csv formatado ou cole o conteúdo logo abaixo.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadStudiesTemplate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    <Download size={14} className="text-indigo-500" /> Baixar Modelo CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkCsvInputRef.current?.click()}
                    disabled={isProcessingBatch}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Upload size={14} /> Selecionar Arquivo .CSV
                  </button>
                  <input 
                    type="file"
                    ref={bulkCsvInputRef}
                    hidden
                    accept=".csv,text/csv,text/plain"
                    onChange={handleBatchCsvFileSelected}
                  />
                </div>
              </div>

              {/* Informação sobre as colunas aceitas */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2">
                <AlertCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Colunas reconhecidas: </span>
                  <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
                    nome, categoria, pdf_url, video_url, imagem, data_agendamento, pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta
                  </code>
                  <p className="mt-1">Se houver várias linhas com o mesmo nome de especialidade, as perguntas serão agrupadas automaticamente no mesmo estudo!</p>
                </div>
              </div>

              {/* Área de texto para colar CSV diretamente */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">
                  Conteúdo CSV (ou cole aqui os dados da planilha):
                </label>
                <textarea
                  className={`w-full h-36 p-3 rounded-xl border text-xs font-mono outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                  placeholder={`nome,categoria,pdf_url,pergunta,opcao_a,opcao_b,opcao_c,opcao_d,resposta_correta\n"Estudo de Nós","Habilidades Manuais","https://exemplo.com/nos.pdf","Qual nó une cabos?","Nó Escota","Nó Direito","Lais de Guia","Catau",0`}
                  value={batchCsvText}
                  onChange={e => setBatchCsvText(e.target.value)}
                  disabled={isProcessingBatch}
                />
              </div>
            </div>

            {/* Barra de Progresso */}
            {batchImportProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Progresso: {batchImportProgress.current} de {batchImportProgress.total}</span>
                  <span className="text-emerald-500">{batchImportProgress.success} salvos / {batchImportProgress.error} erros</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(batchImportProgress.current / Math.max(batchImportProgress.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Caixa de Logs */}
            {batchImportLogs.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relatório da Gravação:</p>
                <div className="h-36 overflow-y-auto p-3 rounded-xl bg-black/80 text-emerald-400 font-mono text-[11px] space-y-1 border border-slate-800">
                  {batchImportLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-300' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchImportModal(false)}
                disabled={isProcessingBatch}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleProcessBatchStudies}
                disabled={isProcessingBatch || !batchCsvText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessingBatch ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {isProcessingBatch ? 'Gravando no Banco...' : 'Gravar Estudos no Banco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialtyStudyEditor;
