
import React, { useState, useEffect } from 'react';
import { DatabaseService, SpecialtyDBV } from '../db';
import { Trash2, Edit2, Plus, X, Search, ChevronLeft, LogOut, Loader2 } from 'lucide-react';

interface AdminSpecialtyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminSpecialtyEditor: React.FC<AdminSpecialtyEditorProps> = ({ onBack, onLogout }) => {
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
      if (editItem?.id) await DatabaseService.updateSpecialty({ ...payload, id: editItem.id });
      else await DatabaseService.addSpecialty(payload);
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
      await DatabaseService.deleteSpecialty(id);
    } catch (err) {
      alert("Erro ao excluir especialidade.");
    }
  };

  const filtered = specialties.filter(s => s.Nome?.toLowerCase().includes(searchTerm.toLowerCase()));

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2";
  const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 text-sm";

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => { setEditItem(null); setFormData({ ID: '', Nome: '', Imagem: '', Categoria: '', Like: false }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#0061f2] text-white rounded-2xl font-black text-[10px] uppercase shadow-md">
            <Plus size={16} /> Nova Especialidade
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="w-full p-3.5 bg-white border border-slate-100 rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm pl-11 shadow-sm" placeholder="Pesquisar especialidade..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Banco...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-20">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100 shrink-0">
                    <img src={s.Imagem} className="w-full h-full object-contain" alt={s.Nome} />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{s.Nome}</h4>
                    <span className="text-[9px] font-bold text-blue-500 uppercase">Categoria: {s.Categoria || 'Geral'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditItem(s); setFormData(s); setShowModal(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(s.id!)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:text-red-600 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CADASTRO/EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-blue-600 uppercase">{editItem ? 'Editar' : 'Nova'} Especialidade</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
               <div><label className={labelClasses}>Nome da Especialidade</label><input required className={inputClasses} value={formData.Nome} onChange={setFormData({...formData, Nome: e.target.value})} /></div>
               <div><label className={labelClasses}>Imagem URL (PNG)</label><input required className={inputClasses} value={formData.Imagem} onChange={setFormData({...formData, Imagem: e.target.value})} /></div>
               <div><label className={labelClasses}>Categoria</label><input className={inputClasses} value={formData.Categoria} onChange={setFormData({...formData, Categoria: e.target.value})} /></div>
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
