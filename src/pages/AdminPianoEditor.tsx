
import React, { useState, useEffect } from 'react';
import { Music, Plus, Trash2, ArrowLeft, Loader2, Check, X, Play } from 'lucide-react';
import { PianoSong } from '@/types';
import { DatabaseService } from '@/db';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPianoEditorProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

const AdminPianoEditor: React.FC<AdminPianoEditorProps> = ({ onBack, isDarkMode }) => {
  const [songs, setSongs] = useState<PianoSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const sub = DatabaseService.subscribePianoSongs(setSongs);
    setLoading(false);
    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    
    setIsSaving(true);
    try {
      await DatabaseService.addPianoSong({
        name: newName,
        url: newUrl
      });
      setNewName('');
      setNewUrl('');
      setShowAddModal(false);
      alert("✅ Música adicionada com sucesso!");
    } catch (err) {
      alert("❌ Erro ao adicionar música.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta música?")) return;
    try {
      await DatabaseService.deletePianoSong(id);
    } catch (err) {
      alert("❌ Erro ao excluir música.");
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-hidden`}>
      <header className={`p-6 flex items-center gap-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} shrink-0`}>
        <button onClick={onBack} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-500'} transition-colors`}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} uppercase tracking-tight`}>Músicas do Piano</h2>
          <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>Gerenciar trilhas sonoras</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-xl shadow-blue-600/20 uppercase text-xs tracking-widest active:scale-95 transition-all"
        >
          <Plus size={24} /> ADICIONAR NOVA MÚSICA
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-black uppercase tracking-widest text-xs">Carregando músicas...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
            <Music size={60} className="mb-4 text-blue-600" />
            <p className="font-black uppercase tracking-widest text-xs">Nenhuma música cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {songs.map(song => (
              <div 
                key={song.id}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[2.5rem] border shadow-sm flex items-center justify-between group`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'} flex items-center justify-center text-blue-600 shrink-0`}>
                    <Music size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase text-sm truncate`}>{song.name}</h4>
                    <p className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest truncate`}>{song.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <a href={song.url} target="_blank" rel="noopener noreferrer" className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all">
                     <Play size={18} fill="currentColor" />
                   </a>
                   <button 
                    onClick={() => handleDeleteSong(song.id)}
                    className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 flex flex-col`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>Nova Música</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleAddSong} className="space-y-5">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Nome da Música</label>
                  <input 
                    required
                    className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm`}
                    placeholder="Ex: Hino dos Desbravadores"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Link do MP3 (URL)</label>
                  <input 
                    required
                    className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm`}
                    placeholder="https://exemplo.com/musica.mp3"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  ADICIONAR MÚSICA
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPianoEditor;
