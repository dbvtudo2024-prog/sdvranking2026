
import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { Megaphone, Users, Trophy, Gamepad2, MessageCircle, ShieldCheck, User, LayoutGrid, BookOpen } from 'lucide-react';

interface HomeProps {
  announcements: Announcement[];
  onNavigate: (page: any) => void;
}

const Home: React.FC<HomeProps> = ({ announcements, onNavigate }) => {
  const [currentAvisoIndex, setCurrentAvisoIndex] = useState(0);
  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  useEffect(() => {
    if (announcements && announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentAvisoIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [announcements]);

  const Shortcut = ({ icon: Icon, label, page, color }: { icon: any, label: string, page: string, color: string }) => (
    <button 
      onClick={() => onNavigate(page)}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-50 active:scale-95 transition-all"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-24 animate-in fade-in duration-500">
      {/* BRASÃO DO CLUBE AO TOPO */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 bg-white rounded-b-[3rem] shadow-xl shadow-blue-900/5 relative">
        <button 
          onClick={() => onNavigate('profile')}
          className="absolute top-8 right-8 p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 transition-all border border-slate-100 shadow-sm"
        >
          <User size={24} />
        </button>
        <img src={LOGO_APP} alt="Brasão do Clube" className="w-32 h-32 object-contain drop-shadow-2xl" />
        <h1 className="mt-4 text-xl font-black text-slate-800 uppercase tracking-tighter">Sentinelas da Verdade</h1>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Clube de Desbravadores</p>
      </div>

      {/* MURAL DE AVISOS */}
      <div className="px-6 mt-8">
        <div className="bg-[#0061f2] rounded-[2.5rem] p-6 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-white/10 rotate-12 pointer-events-none">
            <Megaphone size={80} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-white" />
                <h3 className="text-white text-[11px] font-black uppercase tracking-widest">Mural de Avisos</h3>
              </div>
              {announcements.length > 1 && (
                <div className="flex gap-1">
                  {announcements.map((_, idx) => (
                    <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentAvisoIndex ? 'w-3 bg-white' : 'w-1 bg-white/30'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="relative h-28">
              {announcements.length > 0 ? (
                announcements.map((aviso, idx) => (
                  <div 
                    key={aviso.id} 
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === currentAvisoIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
                  >
                    <div className="bg-white rounded-2xl p-4 h-full flex flex-col justify-center shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-black text-slate-800 uppercase truncate pr-2">{aviso.title}</p>
                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{aviso.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight font-medium line-clamp-2">{aviso.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 h-full flex items-center justify-center">
                  <p className="text-[10px] text-white/60 italic font-bold uppercase">Nenhum aviso importante.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ÍCONES DE ATALHOS */}
      <div className="px-6 mt-10">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Acesso Rápido</h3>
        <div className="grid grid-cols-3 gap-4">
          <Shortcut icon={LayoutGrid} label="Unidades" page="units" color="#0061f2" />
          <Shortcut icon={BookOpen} label="Bíblia" page="bible" color="#8b5cf6" />
          <Shortcut icon={Trophy} label="Ranking" page="ranking" color="#f59e0b" />
          <Shortcut icon={MessageCircle} label="Chat" page="chat" color="#10b981" />
          <Shortcut icon={ShieldCheck} label="Líderes" page="leadership" color="#6366f1" />
          <Shortcut icon={Gamepad2} label="Jogos" page="games" color="#ec4899" />
        </div>
      </div>
    </div>
  );
};

export default Home;
