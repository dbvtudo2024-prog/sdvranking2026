
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../db';
import { PuzzleImage } from '../types';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface AdminPuzzleEditorProps {
  onBack: () => void;
  onLogout: () => void;
}

const AdminPuzzleEditor: React.FC<AdminPuzzleEditorProps> = ({ onBack, onLogout }) => {
  const [images, setImages] = useState<PuzzleImage[]>([]);
  const [newImage, setNewImage] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = DatabaseService.subscribePuzzleImages(setImages);
    return () => { sub.unsubscribe(); };
  }, []);

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

  const inputClasses = "w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-medium text-gray-700 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest mb-1 block";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
          <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus size={18} className="text-[#0061f2]" /> Nova Imagem para Quebra-Cabeça
          </h3>
          
          <form onSubmit={handleAdd} className="space-y-5">
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
          <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2">Imagens Cadastradas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map(img => (
              <div key={img.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-3">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                  <img src={img.url} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center px-2">
                  <p className="font-black text-gray-800 text-xs uppercase truncate flex-1 mr-2">{img.title}</p>
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-all bg-red-50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs font-bold uppercase">Nenhuma imagem cadastrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPuzzleEditor;
