
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/db';
import { SpecialtyDBV } from '@/types';
import { SPECIALTIES } from '@/constants';
import { Trash2, Edit2, Plus, X, Search, ChevronLeft, Loader2, DownloadCloud } from 'lucide-react';

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
        <div className="flex items-center justify-end gap-3">
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
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <DownloadCloud size={16} /> Importar Padrão
          </button>
          <button onClick={() => { setEditItem(null); setFormData({ ID: '', Nome: '', Imagem: '', Categoria: '', Like: false }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#0061f2] text-white rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all">
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
    </div>
  );
};

export default AdminSpecialtyEditor;
