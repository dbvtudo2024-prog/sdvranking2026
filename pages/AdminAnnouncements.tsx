
import React, { useState } from 'react';
import { Announcement } from '../types';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  onAdd: (a: Announcement) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({ announcements, onAdd, onDelete, onBack }) => {
  const [newAviso, setNewAviso] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAviso.title.trim() || !newAviso.content.trim()) {
      alert('Preencha o título e o conteúdo do aviso.');
      return;
    }

    const a: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: newAviso.title,
      date: newAviso.date.split('-').reverse().join('/'),
      content: newAviso.content
    };

    onAdd(a);
    setNewAviso({
      title: '',
      date: new Date().toISOString().split('T')[0],
      content: ''
    });
    alert('Aviso adicionado com sucesso!');
  };

  const inputClasses = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0061f2] outline-none font-medium text-gray-700 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest mb-1 block";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
          <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Plus size={18} className="text-[#0061f2]" /> Novo Aviso
          </h3>
          
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className={labelClasses}>Título do Aviso</label>
              <input 
                className={inputClasses}
                placeholder="Ex: Reunião Extraordinária"
                value={newAviso.title}
                onChange={e => setNewAviso({...newAviso, title: e.target.value})}
              />
            </div>

            <div>
              <label className={labelClasses}>Data do Evento/Aviso</label>
              <input 
                type="date"
                className={inputClasses}
                value={newAviso.date}
                onChange={e => setNewAviso({...newAviso, date: e.target.value})}
              />
            </div>

            <div>
              <label className={labelClasses}>Conteúdo / Mensagem</label>
              <textarea 
                rows={3}
                className={`${inputClasses} resize-none`}
                placeholder="Digite aqui os detalhes..."
                value={newAviso.content}
                onChange={e => setNewAviso({...newAviso, content: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#0061f2] text-white py-5 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.15em] text-sm"
            >
              POSTAR AVISO
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2">Avisos Postados</h3>
          {announcements.map(a => (
            <div key={a.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-[#0061f2] text-xs uppercase truncate">{a.title}</p>
                  <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    {a.date}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{a.content}</p>
              </div>
              <button 
                onClick={() => { if(confirm('Excluir aviso?')) onDelete(a.id); }}
                className="p-2 text-red-400 hover:text-red-600 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
