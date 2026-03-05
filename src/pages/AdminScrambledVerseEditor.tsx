
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/db';
import { Edit2, Trash2, X, ChevronDown, Save, Search, Plus, Loader2, Type } from 'lucide-react';

interface ScrambledVerse {
  id: string;
  text: string;
  title: string;
  created_at?: string;
}

interface AdminScrambledVerseEditorProps {
  onBack: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

const AdminScrambledVerseEditor: React.FC<AdminScrambledVerseEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [verses, setVerses] = useState<ScrambledVerse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<ScrambledVerse | null>(null);
  const [newVerse, setNewVerse] = useState({
    text: '',
    title: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const channel = DatabaseService.subscribeScrambledVerses((data) => {
      setVerses(data);
      setLoading(false);
    });
    return () => { if(channel) channel.unsubscribe(); };
  }, []);

  const handleEditInit = (v: ScrambledVerse) => {
    setEditForm({ ...v });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editForm) {
        await DatabaseService.updateScrambledVerse(editForm);
        setEditForm(null);
      } else {
        await DatabaseService.addScrambledVerse(newVerse);
        setNewVerse({ text: '', title: '' });
      }
      setShowModal(false);
      alert('✅ Salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar: ' + (error.message || 'Verifique o console'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este versículo permanentemente?')) return;
    try {
      await DatabaseService.deleteScrambledVerse(id);
    } catch (error) {
      alert('Erro ao deletar versículo.');
    }
  };

  const filteredVerses = verses.filter(v => {
    const matchesSearch = (v.text || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (v.title || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSearch;
  });

  const inputClasses = `w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'} border-2 rounded-2xl outline-none focus:border-amber-500 focus:bg-white font-bold text-sm transition-all shadow-inner`;
  const labelClasses = `text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-2 block ml-2`;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-hidden`}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto pb-32">
        <div className="flex justify-between items-center">
           <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Editor: Versículo Embaralhado</h2>
           <button 
            onClick={() => { setEditForm(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-3 sticky top-0 z-10 border`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`} size={18} />
            <input 
              className={`w-full p-3 border rounded-xl outline-none focus:border-amber-500 font-bold text-sm transition-all pl-10 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-700'}`} 
              placeholder="Buscar por versículo ou título..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
             <Loader2 className={`animate-spin ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} size={40} />
             <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Sincronizando Banco de Dados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVerses.map(v => (
              <div key={v.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2rem] border shadow-xl shadow-amber-900/5 transition-all flex justify-between items-start gap-4`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>Versículo</span>
                  </div>
                  <h4 className={`text-sm font-black leading-tight mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{v.title}</h4>
                  <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{v.text}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => handleEditInit(v)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(v.id)} className={`p-2.5 rounded-xl active:scale-90 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {filteredVerses.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <Type size={48} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum versículo encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-black uppercase ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{editForm ? 'Editar' : 'Novo'} Versículo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 p-2"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className={labelClasses}>Título / Referência</label>
                <input required className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'}`} placeholder="Ex: Salmo 119:105" value={editForm ? editForm.title : newVerse.title} onChange={e => editForm ? setEditForm({...editForm, title: e.target.value}) : setNewVerse({...newVerse, title: e.target.value})} />
              </div>

              <div>
                <label className={labelClasses}>Texto do Versículo</label>
                <textarea required rows={4} className={`${inputClasses} ${isDarkMode ? 'focus:bg-slate-900' : 'focus:bg-white'} resize-none`} placeholder="Digite o versículo completo..." value={editForm ? editForm.text : newVerse.text} onChange={e => editForm ? setEditForm({...editForm, text: e.target.value}) : setNewVerse({...newVerse, text: e.target.value})} />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-amber-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                {editForm ? 'SALVAR ALTERAÇÕES' : 'CRIAR VERSÍCULO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScrambledVerseEditor;
