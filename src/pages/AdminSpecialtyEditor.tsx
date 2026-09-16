
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/db';
import { SpecialtyDBV } from '@/types';
import { SPECIALTIES } from '@/constants';
import { Trash2, Edit2, Plus, X, Search, ChevronLeft, Loader2, DownloadCloud, Image as ImageIcon, Wand2, Link, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminSpecialtyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

const ImageCellPreview: React.FC<{ src: string }> = ({ src }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    const img = new Image();
    img.src = src;
    img.referrerPolicy = "no-referrer";
    img.onload = () => setStatus('success');
    img.onerror = () => setStatus('error');
  }, [src]);

  return (
    <div className="relative w-10 h-10 rounded-lg border bg-white p-0.5 flex items-center justify-center overflow-hidden mx-auto shrink-0 group">
      {status === 'loading' && (
        <Loader2 className="animate-spin text-slate-400" size={14} />
      )}
      {status === 'success' && (
        <>
          <img src={src} className="w-full h-full object-contain" alt="" referrerPolicy="no-referrer" />
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-slate-900 rounded-full ring-1 ring-emerald-500/50" title="Link funcional no seu Storage!" />
        </>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center text-red-500 w-full h-full bg-red-500/5">
          <X size={14} className="opacity-60" />
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 border border-white dark:border-slate-900 rounded-full ring-1 ring-red-500/50" title="Link inativo ou arquivo inexistente no Storage" />
        </div>
      )}
    </div>
  );
};

const AdminSpecialtyEditor: React.FC<AdminSpecialtyEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [specialties, setSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editItem, setEditItem] = useState<SpecialtyDBV | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para sincronização do storage de imagens
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [savingSync, setSavingSync] = useState(false);

  // Estados para o Gerenciador de Imagens Inteligente / Edição em Massa
  const [bulkBaseUrl, setBulkBaseUrl] = useState('');
  const [inferredFromDB, setInferredFromDB] = useState('');
  const [bulkPattern, setBulkPattern] = useState<string>('imagem_sigla');
  const [customPattern, setCustomPattern] = useState('imagem@[NOME_HIFENS]');
  const [bulkExtension, setBulkExtension] = useState('png');
  const [bulkUseCategory, setBulkUseCategory] = useState(true);
  const [bulkCategoryNormalization, setBulkCategoryNormalization] = useState<'none' | 'no-accents' | 'hyphens' | 'underscores'>('none');
  const [bulkEditMap, setBulkEditMap] = useState<{ [id: number]: string }>({});
  const [bulkSearch, setBulkSearch] = useState('');

  const [formData, setFormData] = useState<Partial<SpecialtyDBV>>({
    ID: '', Nome: '', Imagem: '', Categoria: '', Like: false
  });

  useEffect(() => {
    const channel = DatabaseService.subscribeSpecialties((data) => {
      setSpecialties(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const getNormalizedCategory = (category: string, type: 'none' | 'no-accents' | 'hyphens' | 'underscores') => {
    if (!category) return '';
    let processed = category;
    if (type !== 'none') {
      const withoutAccents = category.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      if (type === 'no-accents') {
        processed = withoutAccents;
      } else {
        let base = withoutAccents.toLowerCase();
        if (type === 'hyphens') {
          base = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        } else if (type === 'underscores') {
          base = base.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        }
        processed = base;
      }
    }
    
    // Codifica caracteres especiais do nome da pasta para serem válidos em URLs (ex: espaços para %20)
    const parts = processed.split('/').map(part => encodeURIComponent(part));
    const finalCategory = parts.join('/');
    return finalCategory.endsWith('/') ? finalCategory : `${finalCategory}/`;
  };

  const getNormalizedName = (
    spec: SpecialtyDBV, 
    type: string, 
    ext: string
  ) => {
    const normalizedExtension = ext.startsWith('.') ? ext : `.${ext}`;
    
    // Obtém o código / ID mais representativo do modelo (Preferimos o ID sobre o Sigla, e limpamos hífens/espaços)
    let rawSigla = spec.ID || spec.Sigla || '';
    rawSigla = rawSigla.replace(/[^a-zA-Z0-9]/g, '');
    const siglaLower = rawSigla.toLowerCase();
    const siglaUpper = rawSigla.toUpperCase();

    // Função interna para obter o sequencial dinâmico correto por categoria
    const getSequentialCode = (sObj: SpecialtyDBV) => {
      const cat = sObj.Categoria || 'Geral';
      
      // Abreviação padrão da categoria (Sigla)
      let abbrev = 'gr';
      const normCat = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      if (normCat.includes('natureza')) {
        abbrev = 'en'; // Estudo da Natureza
      } else if (normCat.includes('recreativa')) {
        abbrev = 'ar'; // Atividades Recreativas
      } else if (normCat.includes('domestica') || (normCat.includes('manual') && normCat.includes('arte'))) {
        abbrev = 'ad'; // Atividades Domésticas
      } else if (normCat.includes('missionaria')) {
        abbrev = 'am'; // Atividades Missionárias
      } else if (normCat.includes('habilidade') || normCat.includes('manual')) {
        abbrev = 'hm'; // Habilidades Manuais
      } else if (normCat.includes('ciencia') || normCat.includes('saude') || normCat.includes('saúde')) {
        abbrev = 'sa'; // Saúde e Ciência / Saúde
      } else if (normCat.includes('comercio') || normCat.includes('economia')) {
        abbrev = 'co'; // Comércio e Economia
      } else if (normCat.includes('tecnologia') || normCat.includes('computa')) {
        abbrev = 'ci'; // Ciência e Tecnologia
      } else {
        const cleaned = normCat.replace(/[^a-z]/g, '');
        abbrev = cleaned.substring(0, 2) || 'sp';
      }
      
      const sameCategory = specialties
        .filter(s => (s.Categoria || 'Geral') === cat)
        .sort((a, b) => a.Nome.localeCompare(b.Nome, 'pt-BR'));
        
      const index = sameCategory.findIndex(s => s.id === sObj.id);
      const num = String(index !== -1 ? index + 1 : 1).padStart(3, '0');
      return `${abbrev}${num}`;
    };

    let filename = '';
    if (type === 'sigla') {
      filename = `${siglaLower}${normalizedExtension}`;
    } else if (type === 'sigla_upper') {
      filename = `${siglaUpper}${normalizedExtension}`;
    } else if (type === 'imagem_sigla') {
      filename = `imagem@${siglaLower}${normalizedExtension}`;
    } else if (type === 'imagem_nome_hyphens') {
      const norm = spec.Nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const base = norm.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      filename = `imagem@${base}${normalizedExtension}`;
    } else if (type === 'imagem_nome_underscores') {
      const norm = spec.Nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const base = norm.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      filename = `imagem@${base}${normalizedExtension}`;
    } else if (type === 'imagem_nome_none') {
      const norm = spec.Nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const base = norm.replace(/[^a-z0-9]/g, '');
      filename = `imagem@${base}${normalizedExtension}`;
    } else if (type === 'imagem_sequencial') {
      const seq = getSequentialCode(spec);
      filename = `imagem@${seq}${normalizedExtension}`;
    } else if (type === 'sequencial') {
      const seq = getSequentialCode(spec);
      filename = `${seq}${normalizedExtension}`;
    } else if (type === 'sequencial_upper') {
      const seq = getSequentialCode(spec).toUpperCase();
      filename = `${seq}${normalizedExtension}`;
    } else if (type === 'exact') {
      filename = `${spec.Nome}${normalizedExtension}`;
    } else if (type === 'custom') {
      const normName = spec.Nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const nameHyphens = normName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const nameUnderscores = normName.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const nameSeco = normName.replace(/[^a-z0-9]/g, '');
      
      const catNorm = (spec.Categoria || 'Geral').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const catHyphens = catNorm.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const catUnderscores = catNorm.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      
      const seqCode = getSequentialCode(spec);
      const seqNum = seqCode.replace(/[^0-9]/g, '');
      
      let res = customPattern;
      res = res.replace(/\[NOME_HIFENS\]/g, nameHyphens);
      res = res.replace(/\[NOME_SUBLINHADO\]/g, nameUnderscores);
      res = res.replace(/\[NOME_SECO\]/g, nameSeco);
      res = res.replace(/\[NOME\]/g, spec.Nome);
      res = res.replace(/\[SIGLA\]/g, siglaLower);
      res = res.replace(/\[SIGLA_UPPER\]/g, siglaUpper);
      res = res.replace(/\[CATEGORIA_HIFENS\]/g, catHyphens);
      res = res.replace(/\[CATEGORIA_SUBLINHADO\]/g, catUnderscores);
      res = res.replace(/\[SEQUENCIAL\]/g, seqNum);
      res = res.replace(/\[SIGLA_SEQUENCIAL\]/g, seqCode);
      res = res.replace(/\[SIGLA_SEQUENCIAL_UPPER\]/g, seqCode.toUpperCase());
      res = res.replace(/\[ID\]/g, String(spec.id || ''));
      
      filename = `${res}${normalizedExtension}`;
    } else {
      const norm = spec.Nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      let base = norm;
      if (type === 'none') {
        base = norm.replace(/[^a-z0-9]/g, '');
      } else if (type === 'hyphens') {
        base = norm.replace(/[^a-z0-9]+/g, '-');
      } else if (type === 'underscores') {
        base = norm.replace(/[^a-z0-9]+/g, '_');
      }
      filename = `${base}${normalizedExtension}`;
    }

    // Codifica caracteres especiais do nome do arquivo para URL
    const parts = filename.split('/').map(part => encodeURIComponent(part));
    return parts.join('/');
  };

  const openStorageModal = () => {
    let inferred = '';
    const sWithImg = specialties.find(s => s.Imagem && s.Imagem.startsWith('http'));
    if (sWithImg && sWithImg.Imagem) {
      const lastSlash = sWithImg.Imagem.lastIndexOf('/');
      if (lastSlash !== -1) {
        inferred = sWithImg.Imagem.substring(0, lastSlash + 1);
        const parts = inferred.split('/');
        if (parts.length > 2) {
          const penultime = decodeURIComponent(parts[parts.length - 2]);
          const isCategory = specialties.some(s => s.Categoria && s.Categoria.toLowerCase() === penultime.toLowerCase());
          if (isCategory) {
            inferred = parts.slice(0, parts.length - 2).join('/') + '/';
          }
        }
      }
    }
    
    setInferredFromDB(inferred);
    setBulkBaseUrl(inferred || 'https://raw.githubusercontent.com/membros-dbv/especialidades/main/');
    
    const initialMap: { [id: number]: string } = {};
    specialties.forEach(spec => {
      if (spec.id) {
        initialMap[spec.id] = spec.Imagem || '';
      }
    });
    setBulkEditMap(initialMap);
    
    setShowStorageModal(true);
  };

  const handleApplyPatternToAll = () => {
    const updated = { ...bulkEditMap };
    specialties.forEach(spec => {
      if (spec.id) {
        const base = bulkBaseUrl.trim().endsWith('/') ? bulkBaseUrl.trim() : `${bulkBaseUrl.trim()}/`;
        
        let categoryPath = '';
        if (bulkUseCategory && spec.Categoria) {
          categoryPath = getNormalizedCategory(spec.Categoria, bulkCategoryNormalization);
        }
        
        const filename = getNormalizedName(spec, bulkPattern, bulkExtension);
        updated[spec.id] = `${base}${categoryPath}${filename}`;
      }
    });
    setBulkEditMap(updated);
  };

  const handleSaveBulkLinks = async () => {
    setSavingSync(true);
    let successCount = 0;
    try {
      for (const spec of specialties) {
        if (spec.id && bulkEditMap[spec.id] !== undefined) {
          const newUrl = bulkEditMap[spec.id];
          if (newUrl !== spec.Imagem) {
            await DatabaseService.updateSpecialty({
              ...spec,
              Imagem: newUrl
            });
            successCount++;
          }
        }
      }
      alert(`✅ Sucesso! ${successCount} especialidade(s) foram atualizadas com os novos caminhos de imagem.`);
      setShowStorageModal(false);
      const refreshedSpec = await DatabaseService.getSpecialties();
      setSpecialties(refreshedSpec);
    } catch (err: any) {
      alert(`Erro no processo de sincronização em massa: ${err.message || err}`);
    } finally {
      setSavingSync(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, Like: !!formData.Like } as SpecialtyDBV;
      
      if (editItem?.id) {
        await DatabaseService.updateSpecialty({ ...payload, id: editItem.id });
        setSpecialties(prev => prev.map(s => s.id === editItem.id ? { ...s, ...payload } : s));
      } else {
        await DatabaseService.addSpecialty(payload);
        setSpecialties(prev => [...prev, { ...payload, id: Date.now() }]);
      }
      
      setShowModal(false);
    } catch (err) { 
      alert("Erro ao salvar dados."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir permanentemente esta especialidade?')) return;
    try {
      setSpecialties(prev => prev.filter(s => s.id !== id));
      await DatabaseService.deleteSpecialty(id);
    } catch (err) {
      alert("Erro ao excluir especialidade.");
    }
  };

  const filtered = specialties.filter(s => s.Nome?.toLowerCase().includes(searchTerm.toLowerCase()));

  const labelClasses = `text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-1 block ml-2`;
  const inputClasses = `w-full p-3 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'} border rounded-xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-sm`;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} overflow-hidden`}>
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto pb-32">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button 
            onClick={openStorageModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            <ImageIcon size={16} /> Vincular Imagens em Massa
          </button>
          <button 
            onClick={async () => {
              if (!confirm('Importar as especialidades padrão?')) return;
              setIsSaving(true);
              try {
                await DatabaseService.seedSpecialties(SPECIALTIES);
                alert('✅ Especialidades importadas com sucesso!');
              } catch (e: any) { 
                console.error('Erro ao importar:', e);
                alert('❌ Erro ao importar: ' + (e.message || 'Verifique o console')); 
              }
              finally { setIsSaving(false); }
            }}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <DownloadCloud size={16} /> Importar Padrão
          </button>
          <button 
            onClick={() => { setEditItem(null); setFormData({ ID: '', Nome: '', Imagem: '', Categoria: '', Like: false }); setShowModal(true); }} 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0061f2] text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} /> Nova Especialidade
          </button>
        </div>

        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
          <input className={`w-full p-3.5 border rounded-[1.5rem] outline-none font-bold text-sm pl-11 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-700'}`} placeholder="Pesquisar especialidade..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <Loader2 className={`animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Carregando Banco...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((s, sIdx) => (
              <div key={s.id ? `spec-${s.id}-${sIdx}` : `spec-idx-${sIdx}`} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-blue-900/5 flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl p-2 flex items-center justify-center border shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <img src={s.Imagem || undefined} className="w-full h-full object-contain" alt={s.Nome} />
                  </div>
                  <div className="truncate">
                    <h4 className={`text-sm font-black truncate uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{s.Nome}</h4>
                    <span className={`text-[9px] font-bold uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Categoria: {s.Categoria || 'Geral'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditItem(s); setFormData(s); setShowModal(true); }} className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-900 text-slate-500 hover:text-blue-400' : 'bg-slate-50 text-slate-400 hover:text-blue-600'}`}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(s.id!)} className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:text-red-500' : 'bg-red-50 text-red-400 hover:text-red-600'}`}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="text-center py-20 opacity-30">
                <Search size={48} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma especialidade</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-5 animate-in zoom-in-95`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-black uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{editItem ? 'Editar' : 'Nova'} Especialidade</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
               <div><label className={labelClasses}>Nome da Especialidade</label><input required className={inputClasses} value={formData.Nome} onChange={e => setFormData({...formData, Nome: e.target.value})} /></div>
               <div><label className={labelClasses}>Imagem URL (PNG)</label><input required className={inputClasses} value={formData.Imagem} onChange={e => setFormData({...formData, Imagem: e.target.value})} /></div>
               <div><label className={labelClasses}>Categoria</label><input className={inputClasses} value={formData.Categoria} onChange={e => setFormData({...formData, Categoria: e.target.value})} /></div>
               <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all mt-4 border-b-4 border-blue-800">
                 {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'SALVAR NO BANCO'}
               </button>
            </form>
          </div>
        </div>
      )}

      {showStorageModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-800 border bg-slate-850/95 border-slate-700 text-slate-100' : 'bg-white text-slate-800'} w-full max-w-4xl rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 animate-in zoom-in-95 flex flex-col max-h-[96vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Wand2 className="text-blue-500 animate-pulse" size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight">Gerenciador de Imagens e Vínculos</h3>
              </div>
              <button onClick={() => setShowStorageModal(false)} className="text-slate-400 hover:text-red-400 p-1"><X size={28} /></button>
            </div>

            {/* Conteúdo do Gerenciador de Imagens Inteligente */}
            <div className="flex flex-col flex-1 min-h-0 space-y-4">
                <div className={`p-5 rounded-[1.8rem] ${isDarkMode ? 'bg-slate-900/70 border border-slate-805 bg-slate-950/20' : 'bg-slate-50 border border-slate-200/60'} space-y-4 shrink-0`}>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs shrink-0">i</span>
                    <p className="text-xs font-semibold leading-relaxed text-slate-400">
                      Configure a estrutura de URL com o caminho das pastas de categoria e arquivos do seu bucket. 
                      Clique em <strong className="text-blue-500 uppercase pb-0.5 border-b border-blue-500/30">"Aplicar Padrão"</strong> para preencher as linhas de forma automatizada. 
                      Você pode ajustar e colar links manualmente na tabela para as que derem erro!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* URL Base */}
                    <div className="md:col-span-8">
                      <label className={labelClasses}>URL Base do seu Repositório de Imagens / CDN</label>
                      <input 
                        className={inputClasses}
                        placeholder="Ex: https://meu-cdn.com/imagens/especialidades/"
                        value={bulkBaseUrl}
                        onChange={e => setBulkBaseUrl(e.target.value)}
                      />
                      
                      {/* Atalhos rápidos */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Atalhos:</span>
                        {inferredFromDB && (
                          <button
                            type="button"
                            onClick={() => setBulkBaseUrl(inferredFromDB)}
                            className="px-2.5 py-1 text-[9px] font-black uppercase bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all border border-blue-500/20"
                          >
                            🔄 Restaurar URL Padrão do Banco
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Extensão */}
                    <div className="md:col-span-4">
                      <label className={labelClasses}>Extensão das Fotos</label>
                      <input 
                        className={inputClasses}
                        placeholder="Ex: png"
                        value={bulkExtension}
                        onChange={e => setBulkExtension(e.target.value)}
                      />
                    </div>

                    {/* Checkbox de Categoria */}
                    <div className="md:col-span-3 flex flex-col justify-end">
                      <label className={`flex items-center gap-2 px-2.5 py-3 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 cursor-pointer transition-all select-none ${isDarkMode ? 'bg-slate-900/30' : 'bg-white'}`}>
                        <input 
                          type="checkbox"
                          className="rounded text-[#0061f2] focus:ring-[#0061f2] h-4 w-4 cursor-pointer"
                          checked={bulkUseCategory}
                          onChange={e => setBulkUseCategory(e.target.checked)}
                        />
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Incluir Categoria nas Subpastas</span>
                      </label>
                    </div>

                    {/* Formato de Categoria */}
                    <div className="md:col-span-3">
                      <label className={`${labelClasses} ${!bulkUseCategory && 'opacity-30'}`}>Formatação da Categoria</label>
                      <select 
                        disabled={!bulkUseCategory}
                        className={`${inputClasses} disabled:opacity-30`}
                        value={bulkCategoryNormalization}
                        onChange={e => setBulkCategoryNormalization(e.target.value as any)}
                      >
                        <option value="none">Original com %20 (Ex: "Artes%20e%20Habilidades%20Manuais")</option>
                        <option value="no-accents">Sem Acentos com %20 (Ex: "Ciencia%20e%20Tecnologia")</option>
                        <option value="hyphens">Hífens (Ex: "estudo-da-natureza")</option>
                        <option value="underscores">Sublinhados (Ex: "estudo_da_natureza")</option>
                      </select>
                    </div>

                    {/* Padrão do Nome do Arquivo */}
                    <div className="md:col-span-4">
                      <label className={labelClasses}>Nome de Arquivo das Fotos no Bucket</label>
                      <select 
                        className={inputClasses}
                        value={bulkPattern}
                        onChange={e => setBulkPattern(e.target.value)}
                      >
                        <option value="imagem_sequencial">🔢 imagem@sequencial (Ex: imagem@en001.png) [Recomendado]</option>
                        <option value="sequencial">🔢 sequencial (Ex: en001.png)</option>
                        <option value="sequencial_upper">🔢 SEQUENCIAL MAIÚSCULO (Ex: EN001.png)</option>
                        <option value="imagem_sigla">🏷️ imagem@sigla (Ex: imagem@ad.png)</option>
                        <option value="sigla">🏷️ sigla (Ex: ad.png)</option>
                        <option value="sigla_upper">🏷️ SIGLA MAIÚSCULA (Ex: AD.png)</option>
                        <option value="imagem_nome_hyphens">📌 imagem@nome-hifens (Ex: imagem@arte-de-acampar.png)</option>
                        <option value="imagem_nome_underscores">📌 imagem@nome_sublinhado (Ex: imagem@arte_de_acampar.png)</option>
                        <option value="imagem_nome_none">📌 imagem@nomesemespaco (Ex: imagem@artedeacampar.png)</option>
                        <option value="hyphens">🔗 nome-com-hifens (Ex: arte-de-acampar.png)</option>
                        <option value="underscores">🔗 nome_com_sublinhados (Ex: arte_de_acampar.png)</option>
                        <option value="none">🔗 nomecompletosemespaco (Ex: artedeacampar.png)</option>
                        <option value="exact">📝 Nome Original do Banco (Ex: Arte de Acampar.png)</option>
                        <option value="custom">✍️ Padrão Personalizado (Placeholders...)</option>
                      </select>
                    </div>

                    {/* Botão Aplicar */}
                    <div className="md:col-span-2">
                      <button 
                        type="button"
                        onClick={handleApplyPatternToAll}
                        className="w-full bg-[#0061f2] hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider py-4 rounded-xl shadow-md active:scale-95 transition-all text-center border-b-2 border-blue-800"
                      >
                        Aplicar Padrão
                      </button>
                    </div>

                    {/* Input de Padrão Personalizado */}
                    {bulkPattern === 'custom' && (
                      <div className="col-span-12 mt-2 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                        <label className={labelClasses}>
                          Máscara do Nome do Arquivo (Placeholders suportados: 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[NOME]</span>, 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[NOME_HIFENS]</span>, 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[NOME_SUBLINHADO]</span>, 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[NOME_SECO]</span>, 
                          <span className="text-blue-500 font-mono text-[10px] mx-1 font-bold">[SIGLA_SEQUENCIAL]</span> (Ex: en001), 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[SEQUENCIAL]</span> (Ex: 001), 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[SIGLA]</span>, 
                          <span className="text-blue-500 font-mono text-[9px] mx-1 font-black">[CATEGORIA_HIFENS]</span>)
                        </label>
                        <input
                          className={inputClasses}
                          value={customPattern}
                          onChange={e => setCustomPattern(e.target.value)}
                          placeholder="Ex: imagem@[NOME_HIFENS] ou imagem@[SIGLA_SEQUENCIAL]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status informativo do indicador em tempo real */}
                <div className={`p-3 rounded-xl flex flex-wrap gap-2 items-center justify-between text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-900/40 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-500'}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></span>
                    <span>Bolinha Verde = Imagem ativa no servidor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-red-500/10"></span>
                    <span>Bolinha Vermelha = Imagem Não Encontrada (404)</span>
                  </div>
                  <span className="hidden sm:inline text-slate-500">Total: {specialties.length} especialidades</span>
                </div>

                {/* Filtro rápido da planilha */}
                <div className="relative shrink-0">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
                  <input 
                    className={`w-full p-2.5 border rounded-xl outline-none font-bold text-xs pl-10 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`} 
                    placeholder="Filtrar tabela por nome de especialidade..." 
                    value={bulkSearch} 
                    onChange={e => setBulkSearch(e.target.value)} 
                  />
                </div>

                {/* Tabela planilha responsive scrollable */}
                <div className="h-[350px] md:h-auto md:flex-1 overflow-y-auto border border-slate-700/30 rounded-[1.5rem] min-h-0 bg-slate-950/20 shrink-0 md:shrink">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'bg-slate-100/50 text-slate-600'} font-black tracking-wider uppercase text-[8px]`}>
                        <th className="p-3 w-16 text-center">Prévia</th>
                        <th className="p-3 w-56 text-left">Especialidade (Banco)</th>
                        <th className="p-3 text-left">Link da Imagem (Pode colar de qualquer site!)</th>
                        <th className="p-3 w-20 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialties
                        .filter(spec => spec.Nome.toLowerCase().includes(bulkSearch.toLowerCase()))
                        .map((spec, specIdx) => (
                          <tr key={spec.id ? `spec-row-${spec.id}-${specIdx}` : `spec-row-${specIdx}`} className={`border-b ${isDarkMode ? 'border-slate-800 hover:bg-slate-900/40 text-slate-300' : 'hover:bg-slate-50 text-slate-700'} transition-all`}>
                            <td className="p-2 text-center">
                              <ImageCellPreview src={bulkEditMap[spec.id!] || ''} />
                            </td>
                            <td className="p-2 truncate max-w-[200px]" title={spec.Nome}>
                              <div className="font-black text-xs leading-none">{spec.Nome}</div>
                              <span className="text-[8px] opacity-50 mt-1 block">Sigla: {spec.Sigla || spec.ID || 'N/A'} • Categoria: {spec.Categoria || 'Geral'}</span>
                            </td>
                            <td className="p-2">
                              <input 
                                className={`w-full p-2 rounded-lg text-xs font-mono font-bold border ${isDarkMode ? 'bg-slate-900 border-slate-850 focus:border-blue-500 text-slate-200' : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800'} outline-none`}
                                value={bulkEditMap[spec.id!] || ''}
                                placeholder="Coloque um link aqui (URL da imagem)"
                                onChange={(e) => {
                                  setBulkEditMap(prev => ({
                                    ...prev,
                                    [spec.id!]: e.target.value
                                  }));
                                }}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button"
                                onClick={() => {
                                  setBulkEditMap(prev => ({
                                    ...prev,
                                    [spec.id!]: ''
                                  }));
                                }}
                                className="text-red-400 hover:text-red-500 font-bold hover:underline"
                              >
                                Limpar
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="shrink-0 pt-2 flex gap-4">
                  <button 
                    onClick={() => setShowStorageModal(false)}
                    className={`flex-1 py-4 rounded-[1.2rem] text-xs font-black uppercase border ${isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'} transition-all`}
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={handleSaveBulkLinks}
                    disabled={savingSync}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all border-b-4 border-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingSync ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Salvando Alterações...
                      </>
                    ) : (
                      <>
                        <Link size={16} />
                        Gravar Links das Imagens
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminSpecialtyEditor;
