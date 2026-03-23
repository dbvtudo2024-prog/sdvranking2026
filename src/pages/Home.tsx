
import React, { useState, useEffect } from 'react';
import { Announcement, AuthUser } from '@/types';
import { Megaphone, Users, Trophy, Gamepad2, MessageCircle, ShieldCheck, User, LayoutGrid, BookOpen, Share2 } from 'lucide-react';
import { formatImageUrl } from '@/helpers/imageHelpers';

interface HomeProps {
  announcements: Announcement[];
  onNavigate: (page: any) => void;
  isDarkMode?: boolean;
  user: AuthUser;
}

const Home: React.FC<HomeProps> = ({ announcements, onNavigate, isDarkMode = false, user }) => {
  const [currentAvisoIndex, setCurrentAvisoIndex] = useState(0);
  const LOGO_APP = "https://lhcobtexredrovjbxaew.supabase.co/storage/v1/object/public/Imagens/app/brasao3d.PNG";

  const handleShare = (aviso: Announcement) => {
    const text = `📢 *AVISO DO CLUBE: ${aviso.title.toUpperCase()}*\n\n${aviso.content}\n\n🗓️ _Postado em: ${aviso.date}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

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
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] shadow-lg border active:scale-95 transition-all ${isDarkMode ? 'bg-dark-card border-dark-border shadow-blue-900/10' : 'bg-white border-slate-50 shadow-slate-200/50'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-full overflow-y-auto pb-24 animate-in fade-in duration-500 ${isDarkMode ? 'bg-dark-bg' : 'bg-slate-50'}`}>
      {/* BRASÃO DO CLUBE AO TOPO */}
      <div className={`flex flex-col items-center justify-center pt-12 pb-8 landscape:pt-4 landscape:pb-4 rounded-b-[3rem] shadow-xl relative ${isDarkMode ? 'bg-dark-card shadow-blue-900/10' : 'bg-white shadow-blue-900/5'}`}>
        <button 
          onClick={() => onNavigate('profile')}
          className={`absolute top-8 right-8 landscape:top-4 landscape:right-4 w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl active:scale-90 transition-all border shadow-sm overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
        >
          {user.photoUrl ? (
            <img 
              src={formatImageUrl(user.photoUrl)} 
              alt="Perfil" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={24} />
          )}
        </button>
        <img 
          src={LOGO_APP} 
          alt="Brasão do Clube" 
          className="w-32 h-32 landscape:w-16 landscape:h-16 object-contain drop-shadow-2xl" 
          referrerPolicy="no-referrer"
        />
        <h1 className={`mt-4 landscape:mt-1 text-xl landscape:text-sm font-black uppercase tracking-tighter ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Sentinelas da Verdade</h1>
        <p className="text-[10px] landscape:hidden font-bold text-blue-600 uppercase tracking-[0.3em]">Clube de Desbravadores</p>
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

            <div className="relative h-48">
              {announcements.length > 0 ? (
                announcements.map((aviso, idx) => (
                  <div 
                    key={aviso.id} 
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === currentAvisoIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
                  >
                    <div className={`rounded-2xl p-5 h-full flex flex-col justify-start shadow-sm relative group overflow-y-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <button 
                        onClick={() => handleShare(aviso)}
                        className={`absolute right-3 top-3 p-2 transition-colors z-20 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-100 hover:text-blue-600'}`}
                        title="Compartilhar no WhatsApp"
                      >
                        <Share2 size={16} />
                      </button>
                      <div className="flex flex-col mb-2 pr-8">
                        <p className={`text-sm font-black uppercase leading-tight mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{aviso.title}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md w-fit ${isDarkMode ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'}`}>{aviso.date}</span>
                      </div>
                      <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{aviso.content}</p>
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
          <Shortcut icon={Users} label="Desbravadores" page="pathfinders" color="#f43f5e" />
          <Shortcut icon={Gamepad2} label="Jogos" page="games" color="#ec4899" />
          <Shortcut icon={BookOpen} label="Estudo" page="specialty_study" color="#059669" />
        </div>
      </div>
    </div>
  );
};

export default Home;
