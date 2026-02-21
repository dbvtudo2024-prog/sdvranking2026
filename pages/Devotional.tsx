
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../db';
import { Loader2, BookOpen, ExternalLink, ChevronLeft, History, Share2 } from 'lucide-react';
import { Devotional as DevotionalType } from '../types';

interface DevotionalProps {
  onBack: () => void;
}

const Devotional: React.FC<DevotionalProps> = ({ onBack }) => {
  const [devotional, setDevotional] = useState<DevotionalType | null>(null);
  const [history, setHistory] = useState<DevotionalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const handleShare = () => {
    if (!devotional) return;
    const dateStr = new Date(devotional.scheduled_for).toLocaleDateString('pt-BR');
    const text = `📖 *DEVOCIONAL DIÁRIO: ${devotional.title.toUpperCase()}*\n\n${devotional.content || ''}\n\n🔗 *Link:* ${devotional.link || 'Acesse no App'}\n\n🗓️ _Data: ${dateStr}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadDevotional();
  }, []);

  const loadDevotional = async () => {
    setLoading(true);
    try {
      const current = await DatabaseService.getDevotional();
      setDevotional(current);
      const past = await DatabaseService.getDevotionalHistory(10);
      setHistory(past);
    } catch (err) {
      console.error("Erro ao carregar devocional:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (dev: DevotionalType) => {
    setDevotional(dev);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to extract YouTube ID if it's a YouTube link
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {showHistory ? 'Histórico de Devocionais' : 'Devocional de Hoje'}
          </h3>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-2xl active:scale-95 transition-all"
          >
            <History size={14} />
            {showHistory ? 'Ver Atual' : 'Histórico'}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando...</p>
          </div>
        ) : showHistory ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {history.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <p className="text-sm font-black uppercase tracking-widest">Nenhum histórico disponível</p>
              </div>
            ) : (
              history.map(dev => (
                <button 
                  key={dev.id}
                  onClick={() => handleSelectFromHistory(dev)}
                  className="w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-700 uppercase leading-tight">{dev.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {new Date(dev.scheduled_for).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-slate-300 group-hover:text-blue-500 rotate-180 transition-colors" />
                </button>
              ))
            )}
          </div>
        ) : !devotional ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
            <BookOpen size={48} className="text-slate-300" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-tight">Nenhum devocional disponível hoje.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">{devotional.title}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {new Date(devotional.scheduled_for).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button 
                  onClick={handleShare}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl active:scale-90 transition-all border border-slate-100 shadow-sm"
                  title="Compartilhar no WhatsApp"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* VIDEO EMBED OR LINK */}
              {devotional.link && (
                <div className="aspect-video w-full bg-slate-100 rounded-[2rem] overflow-hidden shadow-inner border border-slate-100 mb-8">
                  {devotional.link.includes('youtube') || devotional.link.includes('youtu.be') ? (
                    <iframe 
                      src={getEmbedUrl(devotional.link)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <ExternalLink size={40} className="text-slate-300" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">O conteúdo está disponível em um link externo.</p>
                      <a 
                        href={devotional.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                      >
                        Acessar Conteúdo
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* TEXT CONTENT */}
              {devotional.content && (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {devotional.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Devotional;
