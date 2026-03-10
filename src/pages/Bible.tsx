
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { DatabaseService } from '@/db';
import { Book, ChevronLeft, ChevronRight, Search, List, BookOpen, Loader2, History, Bookmark, Trash2, Share2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

interface BibleProps {
  onGoToReadingPlan: () => void;
  onGoToDevotional: () => void;
  onBackToHome: () => void;
  isDarkMode?: boolean;
}

export interface BibleHandle {
  goBack: () => boolean;
}

interface MarkedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const Bible = forwardRef<BibleHandle, BibleProps>(({ onGoToReadingPlan, onGoToDevotional, onBackToHome, isDarkMode }, ref) => {
  const [view, setView] = useState<'menu' | 'books' | 'chapters' | 'verses' | 'search' | 'marked'>('menu');
  const [books, setBooks] = useState<string[]>([]);
  const [selectedTestament, setSelectedTestament] = useState<'VT' | 'NT'>('VT');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<{Versiculo: number, Texto: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [verseOfDay, setVerseOfDay] = useState<{livro: string, cap: number, ver: number, texto: string} | null>(null);
  const [recentReading, setRecentReading] = useState<{book: string, chapter: number} | null>(null);
  const [markedVerses, setMarkedVerses] = useState<MarkedVerse[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (view === 'verses') {
        setView('chapters');
        return true;
      }
      if (view === 'chapters') {
        setView('books');
        return true;
      }
      if (view === 'books' || view === 'search' || view === 'marked') {
        setView('menu');
        return true;
      }
      return false; // Already at menu, let App handle it
    }
  }));

  useEffect(() => {
    loadBooks();
    loadVerseOfDay();
    loadRecentReading();
    loadMarkedVerses();
  }, []);

  const loadRecentReading = () => {
    const saved = localStorage.getItem('bible_recent_reading');
    if (saved) {
      try {
        setRecentReading(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar leitura recente:", e);
      }
    }
  };

  const loadMarkedVerses = () => {
    const saved = localStorage.getItem('bible_marked_verses');
    if (saved) {
      try {
        setMarkedVerses(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar versículos marcados:", e);
      }
    }
  };

  const toggleMarkVerse = (v: {Versiculo: number, Texto: string}) => {
    const isMarked = markedVerses.some(mv => 
      mv.book === selectedBook && 
      mv.chapter === selectedChapter && 
      mv.verse === v.Versiculo
    );

    let newMarked: MarkedVerse[];
    if (isMarked) {
      newMarked = markedVerses.filter(mv => 
        !(mv.book === selectedBook && mv.chapter === selectedChapter && mv.verse === v.Versiculo)
      );
    } else {
      newMarked = [...markedVerses, {
        book: selectedBook,
        chapter: selectedChapter,
        verse: v.Versiculo,
        text: v.Texto
      }];
    }

    setMarkedVerses(newMarked);
    localStorage.setItem('bible_marked_verses', JSON.stringify(newMarked));
  };

  const removeMarkedVerse = (mv: MarkedVerse) => {
    const newMarked = markedVerses.filter(item => 
      !(item.book === mv.book && item.chapter === mv.chapter && item.verse === mv.verse)
    );
    setMarkedVerses(newMarked);
    localStorage.setItem('bible_marked_verses', JSON.stringify(newMarked));
  };

  const handleShareVerse = (book: string, chapter: number, verse: number, text: string) => {
    const shareText = `📖 *${book} ${chapter}:${verse}*\n\n"${text}"\n\n_Compartilhado via Sentinelas da Verdade_`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const loadVerseOfDay = async () => {
    try {
      const data = await DatabaseService.getVerseOfTheDay();
      if (data) setVerseOfDay(data);
    } catch (err) {
      console.error("Erro ao carregar versículo do dia:", err);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getBibleBooks();
      setBooks(data);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((bookName, index) => {
    // Standard Bible: 39 books in OT, 27 in NT
    if (selectedTestament === 'VT') return index < 39;
    return index >= 39;
  });

  const handleSelectBook = async (book: string) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const data = await DatabaseService.getBibleChapters(book);
      setChapters(data);
      setView('chapters');
    } catch (err) {
      console.error("Erro ao carregar capítulos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = async (chapter: number) => {
    setSelectedChapter(chapter);
    
    // Salvar leitura recente
    const recent = { book: selectedBook, chapter };
    setRecentReading(recent);
    localStorage.setItem('bible_recent_reading', JSON.stringify(recent));

    setLoading(true);
    try {
      const data = await DatabaseService.getBibleVerses(selectedBook, chapter);
      setVerses(data);
      setView('verses');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (err) {
      console.error("Erro ao carregar versículos:", err);
    } finally {
      setLoading(false);
    }
  };

  const jumpToVerse = async (book: string, chapter: number) => {
    setLoading(true);
    try {
      setSelectedBook(book);
      setSelectedChapter(chapter);
      
      // Carregar capítulos para navegação (Anterior/Próximo)
      const chaptersData = await DatabaseService.getBibleChapters(book);
      setChapters(chaptersData);
      
      // Carregar versículos
      const versesData = await DatabaseService.getBibleVerses(book, chapter);
      setVerses(versesData);
      
      // Salvar leitura recente
      const recent = { book, chapter };
      setRecentReading(recent);
      localStorage.setItem('bible_recent_reading', JSON.stringify(recent));
      
      setView('verses');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (err) {
      console.error("Erro ao saltar para versículo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const data = await DatabaseService.searchBible(searchTerm);
      setSearchResults(data);
      setView('search');
    } catch (err) {
      console.error("Erro na busca:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateChapter = async (direction: 'prev' | 'next') => {
    const currentIndex = chapters.indexOf(selectedChapter);
    let nextChapter = selectedChapter;
    
    if (direction === 'prev' && currentIndex > 0) {
      nextChapter = chapters[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < chapters.length - 1) {
      nextChapter = chapters[currentIndex + 1];
    } else {
      return;
    }

    await handleSelectChapter(nextChapter);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-hidden">
      {/* CONTEÚDO PRINCIPAL */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-24 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando...</p>
          </div>
        ) : view === 'menu' ? (
          <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BARRA DE BUSCA NO MENU */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar na Bíblia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-300 transition-colors"
              />
            </form>

            {/* CARD VERSÍCULO DO DIA */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
                    <h3 className="text-amber-400 font-black text-xs uppercase tracking-[0.2em]">Versículo do Dia</h3>
                  </div>
                  {verseOfDay && (
                    <button 
                      onClick={() => handleShareVerse(verseOfDay.livro, verseOfDay.cap, verseOfDay.ver, verseOfDay.texto)}
                      className="p-2 bg-slate-800/50 text-slate-300 rounded-xl hover:text-amber-400 hover:bg-slate-800 transition-all active:scale-90"
                      title="Compartilhar Versículo do Dia"
                    >
                      <Share2 size={16} />
                    </button>
                  )}
                </div>
                {verseOfDay ? (
                  <>
                    <p className="text-lg font-medium leading-relaxed mb-6 italic text-slate-100">
                      "{verseOfDay.texto}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {verseOfDay.livro} {verseOfDay.cap}:{verseOfDay.ver}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-500">Almeida Revista e Corrigida</span>
                    </div>
                  </>
                ) : (
                  <div className="h-20 flex items-center justify-center opacity-20">
                    <Loader2 className="animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* GRID DE ATALHOS */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setView('books')}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-blue-100 dark:hover:border-blue-900 group"
              >
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Book size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Bíblia</span>
              </button>

              <button 
                onClick={onGoToReadingPlan}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-purple-100 dark:hover:border-purple-900 group"
              >
                <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <History size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Plano</span>
              </button>

              <button 
                onClick={onGoToDevotional}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-amber-100 dark:hover:border-amber-900 group"
              >
                <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Devocional</span>
              </button>

              <button 
                onClick={() => setView('marked')}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-emerald-100 dark:hover:border-emerald-900 group"
              >
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Bookmark size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Marcados</span>
              </button>
            </div>

            {/* LEITURA RECENTE */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Leitura Recente</h4>
              {recentReading ? (
                <button 
                  onClick={() => jumpToVerse(recentReading.book, recentReading.chapter)}
                  className="w-full bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 flex items-center justify-between group active:scale-95 transition-all"
                >
                  <div className="text-left">
                    <p className="text-sm font-black text-blue-700 uppercase">{recentReading.book}</p>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Capítulo {recentReading.chapter}</p>
                  </div>
                  <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <ChevronRight size={16} />
                  </div>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                  <BookOpen size={32} className="text-slate-300 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-tight">Nenhuma leitura recente</p>
                </div>
              )}
            </div>
          </div>
        ) : view === 'books' ? (
          <div className="py-4 space-y-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o Livro</h3>
              
              {/* TESTAMENT SELECTOR */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button 
                  onClick={() => setSelectedTestament('VT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTestament === 'VT' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Velho Testamento
                </button>
                <button 
                  onClick={() => setSelectedTestament('NT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTestament === 'NT' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Novo Testamento
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBooks.map((bookName) => (
                <button 
                  key={bookName}
                  onClick={() => handleSelectBook(bookName)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-3xl border-2 border-slate-50 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center active:scale-95 transition-all hover:border-blue-100 dark:hover:border-blue-900"
                >
                  <BookOpen size={20} className="text-blue-200 mb-2" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{bookName}</span>
                </button>
              ))}
            </div>
          </div>
        ) : view === 'chapters' ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedBook} • Capítulos</h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {chapters.map((chapter) => (
                <button 
                  key={chapter}
                  onClick={() => handleSelectChapter(chapter)}
                  className="bg-white dark:bg-slate-800 aspect-square rounded-2xl border-2 border-slate-50 dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-95 transition-all hover:border-blue-100 dark:hover:border-blue-900"
                >
                  <span className="text-sm font-black text-slate-700">{chapter}</span>
                </button>
              ))}
            </div>
          </div>
        ) : view === 'verses' ? (
          <div className="py-6 px-2 space-y-6">
            <div className="flex justify-center items-center mb-4">
              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-sm">{selectedBook} {selectedChapter}</h3>
            </div>
            
            <div className="space-y-4 pb-32">
              {verses.map((v) => {
                const isMarked = markedVerses.some(mv => 
                  mv.book === selectedBook && 
                  mv.chapter === selectedChapter && 
                  mv.verse === v.Versiculo
                );
                return (
                  <div 
                    key={v.Versiculo} 
                    onClick={() => toggleMarkVerse(v)}
                    className={`flex gap-3 group p-2 rounded-xl transition-all cursor-pointer ${isMarked ? 'bg-amber-100/50 dark:bg-amber-900/30 border-l-4 border-amber-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className={`text-[10px] font-black mt-1 shrink-0 w-6 text-right ${isMarked ? 'text-amber-600' : 'text-blue-600'}`}>{v.Versiculo}</span>
                    <p className={`text-base font-medium leading-relaxed ${isMarked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{v.Texto}</p>
                  </div>
                );
              })}
            </div>

            {/* FIXED NAVIGATION BUTTONS */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 flex justify-center gap-4 z-20">
              <button 
                onClick={() => navigateChapter('prev')}
                disabled={chapters.indexOf(selectedChapter) === 0}
                className="flex-1 max-w-[160px] px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-all shadow-sm"
              >
                Anterior
              </button>
              <button 
                onClick={() => navigateChapter('next')}
                disabled={chapters.indexOf(selectedChapter) === chapters.length - 1}
                className="flex-1 max-w-[160px] px-6 py-4 bg-blue-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 disabled:opacity-30 active:scale-95 transition-all"
              >
                Próximo
              </button>
            </div>
          </div>
        ) : view === 'search' ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados para "{searchTerm}"</h3>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum resultado encontrado.</p>
              </div>
            ) : (
              searchResults.map((res, idx) => (
                <button 
                  key={idx}
                  onClick={() => jumpToVerse(res.Livro, res.Capitulo)}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-left active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{res.Livro} {res.Capitulo}:{res.Versiculo}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareVerse(res.Livro, res.Capitulo, res.Versiculo, res.Texto);
                        }}
                        className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors"
                      >
                        <Share2 size={14} />
                      </button>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-3">{res.Texto}</p>
                </button>
              ))
            )}
          </div>
        ) : view === 'marked' ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Versículos Marcados</h3>
            </div>
            {markedVerses.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Bookmark size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum versículo marcado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {markedVerses.map((mv, idx) => (
                  <div 
                    key={idx}
                    className="w-full bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm text-left relative group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <button 
                        onClick={() => jumpToVerse(mv.book, mv.chapter)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        {mv.book} {mv.chapter}:{mv.verse}
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleShareVerse(mv.book, mv.chapter, mv.verse, mv.text)}
                          className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                          title="Compartilhar"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={() => removeMarkedVerse(mv)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{mv.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default Bible;
