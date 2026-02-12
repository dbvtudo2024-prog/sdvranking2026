
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService, SpecialtyDB } from '../db';
import { Medal, Trash2, Edit2, Plus, X, Search, ChevronLeft, Save, LogOut, Upload, Link as LinkIcon, Camera, Loader2 } from 'lucide-react';

interface AdminSpecialtyEditorProps {
  onBack: () => void;
  onLogout?: () => void;
}

const AdminSpecialtyEditor: React.FC<AdminSpecialtyEditorProps> = ({ onBack, onLogout }) => {
  const [specialties, setSpecialties] = useState<SpecialtyDB[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editItem, setEditItem] = useState<SpecialtyDB | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brasaoUrl = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  useEffect(() => {
    const channel = DatabaseService.subscribeSpecialties((data) => {
      setSpecialties(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Por favor, adicione uma imagem ou URL.");
      return;
    }

    setIsSaving(true);
    try {
      if (editItem) {
        await DatabaseService.updateSpecialty({ 
          id: editItem.id, 
          name: formData.name, 
          image: formData.image 
        });
      } else {
        await DatabaseService.addSpecialty({
          id: `spec-${Date.now()}`,
          name: formData.name,
          image: formData.image
        });
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ name: '', image: '' });
    } catch (err) {
      alert("Erro ao salvar especialidade no banco.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta especialidade permanentemente?")) return;
    try {
      await DatabaseService.deleteSpecialty(id);
    } catch (err) {
      alert("Erro ao excluir do banco.");
    }
  };

  const handleEditInit = (item: SpecialtyDB) => {
    setEditItem(item);
    setFormData({ name: item.name, image: item.image });
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = specialties.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-[#0061f2] text-white px-6 h-24 sticky top-0 z-50 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1">
          <img src={brasaoUrl} alt="Brasão" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 mr-3 object-contain" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black leading-tight tracking-tight truncate uppercase">Especialidades</h1>
            <p className="text-[10px] sm:text-xs font-medium opacity-80 truncate uppercase">Banco de Dados Ativo</p>
          </div>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <LogOut size={20} className="rotate-180" />
          </button>
        )}
      </header>

      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto pb-24">
        <div className="flex justify-between items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-full text-[#0061f2] font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all"
          >
            <ChevronLeft size={18} strokeWidth={3} /> Voltar
          </button>
          <button 
            onClick={() => { setEditItem(null); setFormData({name: '', image: ''}); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-[#0061f2] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> Adicionar Nova
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full p-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#0061f2] font-medium text-sm transition-all pl-10 shadow-sm" 
            placeholder="Buscar no banco de dados..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#0061f2]" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase">Sincronizando Banco...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <div key={s.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 flex items-center justify-center overflow-hidden border border-slate-100">
                      <img src={s.image} className="w-full h-full object-contain" alt={s.name} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate uppercase">{s.name}</h4>
                      <p className="text-[9px] font-bold text-slate-300 uppercase">Salvo no Supabase</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditInit(s)} className="p-2.5 bg-blue-50 text-[#0061f2] rounded-xl hover:bg-blue-100 transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic font-medium">Nenhuma especialidade encontrada no banco.</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0061f2] uppercase">{editItem ? 'Editar' : 'Nova'} Especialidade</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={labelClasses}>Nome da Especialidade</label>
                <input 
                  required 
                  className={inputClasses} 
                  placeholder="Ex: Primeiros Socorros"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className={labelClasses}>Imagem (Brasão)</label>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-contain" alt="Preview" />
                    ) : (
                      <Camera size={40} className="text-slate-300" />
                    )}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-black uppercase"
                    >
                      <Upload size={20} className="mb-1" />
                      Alterar
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload size={16} /> Enviar Arquivo
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <LinkIcon size={14} />
                  </div>
                  <input 
                    className={`${inputClasses} pl-10`} 
                    placeholder="Ou cole a URL da imagem..." 
                    value={formData.image.startsWith('data:') ? '' : formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-2">
                 <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                 >
                   {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                   {editItem ? 'Salvar Alterações' : 'Salvar no Banco'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialtyEditor;
