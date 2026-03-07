
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/db';
import { PuzzleImage } from '@/types';
import { PUZZLE_IMAGES_DATA } from '@/constants';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, DownloadCloud, Search, Check } from 'lucide-react';
import { SpecialtyDBV } from '@/types';

interface AdminPuzzleEditorProps {
  onBack: () => void;
  onLogout: () => void;
  isDarkMode?: boolean;
}

const AdminPuzzleEditor: React.FC<AdminPuzzleEditorProps> = ({ onBack, onLogout, isDarkMode }) => {
  const [images, setImages] = useState<PuzzleImage[]>([]);
  const [newImage, setNewImage] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [availableSpecialties, setAvailableSpecialties] = useState<SpecialtyDBV[]>([]);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');

  useEffect(() => {
    const sub = DatabaseService.subscribePuzzleImages(setImages);
    DatabaseService.getSpecialties().then(setAvailableSpecialties);
    return () => { sub.unsubscribe(); };
  }, []);

  const handleSelectSpecialty = (spec: SpecialtyDBV) => {
    setNewImage({
      title: spec.Nome,
      url: spec.Imagem || ''
    });
    setShowSpecialtyPicker(false);
    setSpecialtySearch('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.title.trim() || !newImage.url.trim()) {
      alert('Preencha o título e a URL da imagem.');
      return;
    }

    setLoading(true);
    try {
      await DatabaseService.addPuzzleImage(newImage);
      setNewImage({ title: '', url: '' });
      alert('Imagem adicionada com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta imagem?')) return;
    try {
      await DatabaseService.deletePuzzleImage(id);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir imagem.');
    }
  };

  const inputClasses = `w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-700'} border rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-medium transition-all text-sm`;
  const labelClasses = `text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} uppercase ml-2 tracking-widest mb-1 block`;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} p-8 rounded-[2.5rem] border shadow-xl shadow-blue-900/5`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-gray-800'} text-sm uppercase tracking-widest flex items-center gap-2`}>
              <Plus size={18} className="text-[#0061f2]" /> Nova Imagem para Quebra-Cabeça
            </h3>
            <button 
              onClick={async () => {
                if (!confirm('Importar as imagens padrão?')) return;
                setLoading(true);
                try {
                  await DatabaseService.seedPuzzleImages(PUZZLE_IMAGES_DATA);
                  alert('✅ Imagens importadas com sucesso!');
                } catch (e: any) { 
                  console.error('Erro ao importar:', e);
                  alert('❌ Erro ao importar: ' + (e.message || 'Verifique o console')); 
                }
                finally { setLoading(false); }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <DownloadCloud size={18} /> Importar Padrão
            </button>
          </div>
          
          <form onSubmit={handleAdd} className="space-y-5">
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
                      .map(spec => (
                        <button
                          key={spec.id}
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

            <div>
              <label className={labelClasses}>Título da Imagem</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  className={`${inputClasses} pl-12`}
                  placeholder="Ex: Acampamento 2024"
                  value={newImage.title}
                  onChange={e => setNewImage({...newImage, title: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>URL da Imagem</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  className={`${inputClasses} pl-12`}
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={newImage.url}
                  onChange={e => setNewImage({...newImage, url: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0061f2] text-white py-5 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.15em] text-sm disabled:opacity-50"
            >
              {loading ? 'ADICIONANDO...' : 'ADICIONAR IMAGEM'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className={`font-black ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} text-[10px] uppercase tracking-[0.2em] ml-2`}>Imagens Cadastradas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map(img => (
              <div key={img.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} p-4 rounded-[2rem] border shadow-sm flex flex-col gap-3`}>
                <div className={`aspect-video rounded-xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-100'}`}>
                  <img src={formatImageUrl(img.url) || undefined} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center px-2">
                  <p className={`font-black text-xs uppercase truncate flex-1 mr-2 ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>{img.title}</p>
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className={`p-2 transition-all rounded-xl ${isDarkMode ? 'bg-red-900/30 text-red-400 hover:text-red-500' : 'bg-red-50 text-red-400 hover:text-red-600'}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <div className={`text-center py-12 rounded-[2.5rem] border border-dashed ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className={`${isDarkMode ? 'text-slate-500' : 'text-gray-400'} text-xs font-bold uppercase`}>Nenhuma imagem cadastrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPuzzleEditor;
