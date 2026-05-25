
import React, { useState, useEffect } from 'react';
import { DatabaseService, supabase } from '@/db';
import { SpecialtyDBV } from '@/types';
import { SPECIALTIES } from '@/constants';
import { Trash2, Edit2, Plus, X, Search, ChevronLeft, Loader2, DownloadCloud, Image as ImageIcon, Wand2, Link, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminSpecialtyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

const AdminSpecialtyEditor: React.FC<AdminSpecialtyEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [specialties, setSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editItem, setEditItem] = useState<SpecialtyDBV | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para sincronização do storage de imagens
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [bucketName, setBucketName] = useState('Imagens');
  const [folderName, setFolderName] = useState('especialidades');
  const [storageFiles, setStorageFiles] = useState<{ name: string; url: string; matchedSpecialtyId?: number }[]>([]);
  const [isScanningStorage, setIsScanningStorage] = useState(false);
  const [storageStatusMessage, setStorageStatusMessage] = useState('');
  const [savingSync, setSavingSync] = useState(false);

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

  const handleScanStorage = async () => {
    setIsScanningStorage(true);
    setStorageStatusMessage('Acessando o bucket do Supabase...');
    setStorageFiles([]);
    
    try {
      // Lista itens do bucket e da pasta
      const { data, error } = await supabase.storage.from(bucketName).list(folderName || '', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setStorageStatusMessage(`Nenhum arquivo encontrado no bucket "${bucketName}" na pasta "${folderName}".`);
        return;
      }

      const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
      const fileItems = data.filter(item => {
        const lowerName = item.name.toLowerCase();
        return imageExtensions.some(ext => lowerName.endsWith(ext));
      });

      if (fileItems.length === 0) {
        setStorageStatusMessage(`Foram listados ${data.length} arquivos, mas nenhum deles é uma imagem válida (.png, .jpg, etc).`);
        return;
      }

      const mapped = fileItems.map(item => {
        const filePath = folderName ? `${folderName}/${item.name}` : item.name;
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl || '';

        // Match inteligente de especialidade baseando-se no nome do arquivo
        const cleanFileName = item.name.toLowerCase()
          .replace(/\.[^/.]+$/, "") // remove extensao
          .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove acentos
          .replace(/[^a-z0-9]/g, ""); // strip

        let bestMatchId: number | undefined = undefined;

        // 1. Tenta correspondência direta do nome
        const directMatch = specialties.find(spec => {
          const cleanSpecName = spec.Nome.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
          return cleanFileName.includes(cleanSpecName) || cleanSpecName.includes(cleanFileName);
        });

        if (directMatch) {
          bestMatchId = directMatch.id;
        } else {
          // 2. Procura com base nas iniciais / códigos que o usuário citou (ex: "HM 024", "HM_002", etc)
          const lowerNameString = item.name.toLowerCase();
          
          bestMatchId = specialties.find(spec => {
            const specLower = spec.Nome.toLowerCase();
            
            // Nós e Amarras -> HM 032 ou HM 017 ou HM 022 ou similar
            if (specLower.includes("nos") && specLower.includes("amarras")) {
              return lowerNameString.includes("hm") && (lowerNameString.includes("32") || lowerNameString.includes("17") || lowerNameString.includes("22"));
            }
            // Acampamento
            if (specLower.includes("acampamento")) {
              return lowerNameString.includes("hm") && lowerNameString.includes("01");
            }
            // Primeiros Socorros
            if (specLower.includes("socorros")) {
              return lowerNameString.includes("hm") && lowerNameString.includes("35") || lowerNameString.includes("so") || lowerNameString.includes("ps");
            }
            // Astronomia
            if (specLower.includes("astronomia")) {
              return lowerNameString.includes("en") && lowerNameString.includes("03") || lowerNameString.includes("astro");
            }
            // Gatos
            if (specLower.includes("gatos") || specLower.includes("gato")) {
              return lowerNameString.includes("gato") || (lowerNameString.includes("en") && lowerNameString.includes("26"));
            }
            // Cães
            if (specLower.includes("caes") || specLower.includes("cães") || specLower.includes("cao")) {
              return lowerNameString.includes("caes") || lowerNameString.includes("dog") || (lowerNameString.includes("en") && lowerNameString.includes("20"));
            }
            // Aves
            if (specLower.includes("aves") || specLower.includes("ave")) {
              return lowerNameString.includes("aves") || lowerNameString.includes("pássaro") || (lowerNameString.includes("en") && lowerNameString.includes("05"));
            }
            // Computação I
            if (specLower.includes("computacao") || specLower.includes("computação")) {
              return lowerNameString.includes("comput") || lowerNameString.includes("ci") || lowerNameString.includes("pc");
            }
            // Culinária I
            if (specLower.includes("culinaria") || specLower.includes("culinária")) {
              return lowerNameString.includes("culin") || lowerNameString.includes("ad") || lowerNameString.includes("coz");
            }
            return false;
          })?.id;
        }

        return {
          name: item.name,
          url: publicUrl,
          matchedSpecialtyId: bestMatchId
        };
      });

      setStorageFiles(mapped);
      setStorageStatusMessage(`Sucesso! Encontradas ${mapped.length} imagens.`);
    } catch (err: any) {
      console.error(err);
      setStorageStatusMessage(`Erro: ${err.message || err}. Verifique as permissões de acesso público do Storage.`);
    } finally {
      setIsScanningStorage(false);
    }
  };

  const handleSaveSync = async () => {
    const itemsToSync = storageFiles.filter(f => f.matchedSpecialtyId !== undefined);
    if (itemsToSync.length === 0) {
      alert("Nenhuma correspondência selecionada. Associe uma especialidade às imagens listadas do storage.");
      return;
    }

    if (!confirm(`Sincronizar caminhos de ${itemsToSync.length} imagem(ns) no banco?`)) {
      return;
    }

    setSavingSync(true);
    let successCount = 0;
    try {
      for (const item of itemsToSync) {
        const spec = specialties.find(s => s.id === item.matchedSpecialtyId);
        if (spec) {
          await DatabaseService.updateSpecialty({
            ...spec,
            Imagem: item.url
          });
          successCount++;
        }
      }
      alert(`✅ Sucesso! ${successCount} especialidade(s) foram atualizadas com o link de imagem do novo storage.`);
      setShowStorageModal(false);
      // Recarrega especialidades de imediato
      const refreshedSpec = await DatabaseService.getSpecialties();
      setSpecialties(refreshedSpec);
    } catch (err: any) {
      alert(`Erro no processo de sincronização: ${err.message || err}`);
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
            onClick={() => {
              setShowStorageModal(true);
              setStorageFiles([]);
              setStorageStatusMessage('');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            <ImageIcon size={16} /> Sincronizar Novo Storage
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
            {filtered.map((s) => (
              <div key={s.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-blue-900/5 flex items-center justify-between gap-4`}>
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
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-800 border bg-slate-800/95 border-slate-700 text-slate-100' : 'bg-white text-slate-800'} w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 flex flex-col max-h-[85vh]`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Wand2 className="text-emerald-500 animate-pulse" size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight">Sincronizador Automático do Storage</h3>
              </div>
              <button onClick={() => setShowStorageModal(false)} className="text-slate-400 hover:text-red-400 p-1"><X size={28} /></button>
            </div>

            <div className="space-y-4 shrink-0">
              <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ao trocar de banco, as especialidades perdem o caminho das imagens. Coloque abaixo o nome do seu <strong>Bucket de Storage</strong> do Supabase e a <strong>Pasta</strong> onde as imagens estão salvas para vinculá-las automaticamente com base na sigla/número ou nome do arquivo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Nome do Bucket</label>
                  <input 
                    className={inputClasses} 
                    placeholder="Ex: Imagens" 
                    value={bucketName} 
                    onChange={e => setBucketName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className={labelClasses}>Pasta do Bucket (Opcional)</label>
                  <input 
                    className={inputClasses} 
                    placeholder="Ex: especialidades" 
                    value={folderName} 
                    onChange={e => setFolderName(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                onClick={handleScanStorage} 
                disabled={isScanningStorage || !bucketName}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-[1.2rem] flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/10 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isScanningStorage ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Escaneando Storage...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Buscar Imagens no Storage
                  </>
                )}
              </button>

              {storageStatusMessage && (
                <div className={`p-4 rounded-[1.5rem] flex items-start gap-2.5 border text-xs font-bold uppercase tracking-wider ${
                  storageStatusMessage.toLowerCase().includes('erro') || storageStatusMessage.toLowerCase().includes('nenhum')
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{storageStatusMessage}</span>
                </div>
              )}
            </div>

            {storageFiles.length > 0 && (
              <div className="flex-1 overflow-y-auto pr-2 gap-3 flex flex-col min-h-0 py-2 border-y border-dashed border-slate-700/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0061f2] block ml-1 mb-1">Mapeamento de Imagens encontradas:</span>
                {storageFiles.map((file, idx) => (
                  <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-slate-50 border-slate-100'} gap-4`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl border p-1 shrink-0 bg-white flex items-center justify-center overflow-hidden">
                        <img src={file.url} className="w-full h-full object-contain" alt={file.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate max-w-[200px]" title={file.name}>{file.name}</p>
                        <span className="text-[9px] font-semibold text-slate-500 truncate block">Novo Link Públicizado pronto</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 hidden md:inline">Vincular a:</span>
                      <select 
                        className={`p-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-700'} max-w-[220px]`}
                        value={file.matchedSpecialtyId || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          const updated = [...storageFiles];
                          updated[idx].matchedSpecialtyId = val;
                          setStorageFiles(updated);
                        }}
                      >
                        <option value="">[ Ignorar / Não vincular ]</option>
                        {specialties.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.Nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {storageFiles.length > 0 && (
              <div className="shrink-0 pt-2 flex gap-4">
                <button 
                  onClick={() => setShowStorageModal(false)}
                  className={`flex-1 py-4 rounded-[1.2rem] text-xs font-black uppercase border ${isDarkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'} transition-all`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveSync}
                  disabled={savingSync}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all border-b-4 border-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingSync ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Sincronizando Banco...
                    </>
                  ) : (
                    <>
                      <Link size={16} />
                      Gravar Vínculos no Banco
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialtyEditor;
