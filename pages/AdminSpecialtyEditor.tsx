
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService, SpecialtyDBV } from '../db';
import { Medal, Trash2, Edit2, Plus, X, Search, ChevronLeft, Save, LogOut, FileText, Loader2 } from 'lucide-react';

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
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<SpecialtyDBV>>({
    ID: '', Nome: '', Questoes: '', Sigla: '', Imagem: '', Categoria: '', Nivel: '', Ano: '', Origem: '', Like: false, Cor: ''
  });

  const brasaoUrl = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  useEffect(() => {
    const channel = DatabaseService.subscribeSpecialties((data) => {
      setSpecialties(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataToImport: SpecialtyDBV[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
          const entry: any = {};
          
          headers.forEach((header, index) => {
            const val = values[index];
            if (header === 'Like') {
              entry[header] = val?.toLowerCase() === 'true';
            } else {
              entry[header] = val || '';
            }
          });

          if (entry.Nome) {
            dataToImport.push({
              ID: String(entry.ID || ''),
              Nome: String(entry.Nome || ''),
              Questoes: String(entry.Questoes || ''),
              Sigla: String(entry.Sigla || ''),
              Imagem: String(entry.Imagem || ''),
              Categoria: String(entry.Categoria || ''),
              Nivel: String(entry.Nivel || ''),
              Ano: String(entry.Ano || ''),
              Origem: String(entry.Origem || ''),
              Like: !!entry.Like,
              Cor: String(entry.Cor || '')
            } as SpecialtyDBV);
          }
        }

        if (dataToImport.length > 0) {
          await DatabaseService.importSpecialtiesCSV(dataToImport);
          alert(`${dataToImport.length} registros importados com sucesso.`);
        }
      } catch (err) {
        console.error(err);
        alert("Erro no arquivo CSV. Verifique o formato.");
      } finally {
        setIsSaving(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, Like: !!formData.Like } as SpecialtyDBV;
      if (editItem?.id) {
        await DatabaseService.updateSpecialty({ ...payload, id: editItem.id });
      } else {
        await DatabaseService.addSpecialty(payload);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ ID: '', Nome: '', Questoes: '', Sigla: '', Imagem: '', Categoria: '', Nivel: '', Ano: '', Origem: '', Like: false, Cor: '' });
    } catch (err) {
      alert("Erro ao salvar dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = specialties.filter(s => 
    s.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.Categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2";
  const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* CABEÇALHO ESTABILIZADO */}
      <header className="bg-[#0061f2] text-white px-6 h-20 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={brasaoUrl} alt="Logo" className="w-10 h-10 object-contain shrink-0" />
          <div className="truncate">
            <h1 className="text-base font-black uppercase tracking-tight truncate">Especialidades DBV</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest truncate">Tabela: EspecialidadesDBV</p>
          </div>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout} 
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 ml-2"
            title="Sair"
          >
            <LogOut size={20} className="rotate-180" />
          </button>
        )}
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[#0061f2] font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
          >
            <ChevronLeft size={16} strokeWidth={3} /> Voltar
          </button>
          
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={csvInputRef} 
              onChange={handleCSVImport} 
            />
            <button 
              onClick={() => csvInputRef.current?.click()}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
              Importar CSV
            </button>
            <button 
              onClick={() => { 
                setEditItem(null); 
                setFormData({ ID: '', Nome: '', Questoes: '', Sigla: '', Imagem: '', Categoria: '', Nivel: '', Ano: '', Origem: '', Like: false, Cor: '' }); 
                setShowModal(true); 
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0061f2] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95"
            >
              <Plus size={16} /> Nova
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full p-3.5 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-[#0061f2]/20 font-bold text-slate-700 text-sm pl-11 shadow-sm" 
            placeholder="Pesquisar especialidade..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#0061f2]" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Banco de Dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-20">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center justify-between gap-4 transition-transform active:scale-[0.99]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 p-2 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                    <img 
                      src={s.Imagem} 
                      className="w-full h-full object-contain" 
                      alt={s.Nome} 
                      onError={(e) => (e.currentTarget.src = "https://api.iconify.design/fluent-emoji:medal.svg")} 
                    />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{s.Nome}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.Categoria || 'Geral'} • {s.ID}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => { setEditItem(s); setFormData(s); setShowModal(true); }} 
                    className="p-2.5 bg-blue-50 text-[#0061f2] rounded-xl active:scale-90 transition-transform"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Remover esta especialidade permanentemente?')) DatabaseService.deleteSpecialty(s.id!); }} 
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-transform"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Medal size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nenhuma especialidade cadastrada</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0061f2] uppercase tracking-tight">
                {editItem ? 'Editar Especialidade' : 'Novo Registro'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full sm:col-span-1">
                <label className={labelClasses}>ID Texto (D1, D2...)</label>
                <input required className={inputClasses} value={formData.ID} onChange={e => setFormData({...formData, ID: e.target.value})} />
              </div>
              <div className="col-span-full sm:col-span-1">
                <label className={labelClasses}>Nome da Especialidade</label>
                <input required className={inputClasses} value={formData.Nome} onChange={e => setFormData({...formData, Nome: e.target.value})} />
              </div>
              <div className="col-span-full">
                <label className={labelClasses}>URL da Imagem</label>
                <input required className={inputClasses} value={formData.Imagem} onChange={e => setFormData({...formData, Imagem: e.target.value})} />
              </div>
              <div>
                <label className={labelClasses}>Categoria</label>
                <input className={inputClasses} value={formData.Categoria} onChange={e => setFormData({...formData, Categoria: e.target.value})} />
              </div>
              <div>
                <label className={labelClasses}>Nível</label>
                <input className={inputClasses} value={formData.Nivel} onChange={e => setFormData({...formData, Nivel: e.target.value})} />
              </div>
              <div>
                <label className={labelClasses}>Sigla</label>
                <input className={inputClasses} value={formData.Sigla} onChange={e => setFormData({...formData, Sigla: e.target.value})} />
              </div>
              <div>
                <label className={labelClasses}>Ano Oficial</label>
                <input className={inputClasses} value={formData.Ano} onChange={e => setFormData({...formData, Ano: e.target.value})} />
              </div>
              
              <div className="col-span-full pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full bg-[#0061f2] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-[#0052cc] transition-colors active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Sincronizar com Tabela
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
