import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  LayoutGrid, 
  Trophy, 
  ShieldCheck, 
  Gamepad2, 
  BookOpen, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  X, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pin
} from 'lucide-react';
import { AuthUser } from '@/types';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { motion, AnimatePresence } from 'motion/react';

interface DesktopSidebarProps {
  user: AuthUser;
  currentPage: string;
  setCurrentPage: (page: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  user,
  currentPage,
  setCurrentPage,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Estado para saber se o menu lateral está fixado (inicia false se não salvo)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('sentinelas_sidebar_pinned') === 'true';
  });

  // Inicia fechado por padrão, a não ser que esteja fixado pelo usuário nos ajustes
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('sentinelas_sidebar_pinned') === 'true';
  });

  // Fechar ao clicar fora quando o menu estiver expandido e NÃO estiver fixado
  useEffect(() => {
    if (!isExpanded || isPinned) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Se o modal de ajustes estiver aberto, ignorar cliques dentro do modal
      if (isSettingsOpen) return;

      const target = event.target as Node;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setIsExpanded(false);
      }
    };

    // Usar 'mousedown' e 'touchstart' para capturar o clique fora
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded, isPinned, isSettingsOpen]);

  const handleTogglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    localStorage.setItem('sentinelas_sidebar_pinned', String(nextPinned));
    if (nextPinned) {
      setIsExpanded(true);
    }
  };

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'units', label: 'Unidades', icon: LayoutGrid },
    { id: 'ranking', label: 'Rank', icon: Trophy },
    { id: 'badges', label: 'Insígnias', icon: ShieldCheck },
    { id: 'games', label: 'Jogos', icon: Gamepad2 },
    { id: 'specialty_study', label: 'Estudo', icon: BookOpen },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const handleConfirmLogout = () => {
    setIsSettingsOpen(false);
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      {/* SIDEBAR CONTAINER (Apenas versão PC - md:flex) */}
      <aside 
        ref={sidebarRef}
        onClick={() => {
          // Toda a área do menu lateral é clicável para expandir quando fechado
          if (!isExpanded) {
            setIsExpanded(true);
          }
        }}
        className={`hidden md:flex flex-col shrink-0 h-full border-r z-40 select-none overflow-hidden transition-all duration-300 ease-in-out relative ${
          isExpanded 
            ? 'w-64 lg:w-72 shadow-xl' 
            : 'w-20 cursor-pointer hover:border-blue-400/50 dark:hover:border-blue-500/50'
        } ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl' 
            : 'bg-white border-slate-100 text-slate-800 shadow-sm'
        }`}
        title={!isExpanded ? "Clique em qualquer lugar para expandir o menu lateral" : undefined}
      >
        {/* 1. BRASÃO NO TOPO E CONTROLE DE EXPANSÃO */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 shrink-0 relative transition-all">
          {isExpanded ? (
            <div className="pt-4 pb-3 px-6 flex flex-col items-center justify-center relative">
              {/* Botão para recolher (quando não fixado) ou indicar fixação posicionado no canto superior direito */}
              {!isPinned ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                  title="Recolher menu lateral"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePin();
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0061f2] dark:text-blue-400 hover:opacity-80 transition-all cursor-pointer"
                  title="Menu fixado (clique para desafixar)"
                >
                  <Pin size={16} className="rotate-45" />
                </button>
              )}

              {/* Brasão Original Centralizado com Texto abaixo exatamente como antes */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage('home');
                }}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
                title="Ir para o Início"
              >
                <div className="relative">
                  <img 
                    src={LOGO_APP} 
                    alt="Brasão do Clube Sentinelas da Verdade" 
                    className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#0061f2] dark:text-blue-400 text-center">
                  Sentinelas da Verdade
                </span>
              </button>
            </div>
          ) : (
            /* Área superior no estado recolhido */
            <div
              className="w-full py-4 px-2 flex flex-col items-center justify-center gap-2 group transition-all duration-200"
            >
              <div className="relative">
                <img 
                  src={LOGO_APP} 
                  alt="Brasão do Clube Sentinelas da Verdade" 
                  className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#0061f2] group-hover:text-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm">
                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}
        </div>

        {/* 2. PERFIL DO USUÁRIO */}
        <div className={`p-2 my-1.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shrink-0 transition-all ${
          isExpanded ? 'mx-3 flex items-center gap-3' : 'mx-2 flex flex-col items-center'
        }`}>
          <button
            onClick={(e) => {
              if (!isExpanded) {
                setIsExpanded(true);
              } else {
                e.stopPropagation();
                setCurrentPage('profile');
              }
            }}
            className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#0061f2]/30 shadow-sm shrink-0 active:scale-95 transition-transform group cursor-pointer"
            title={user.name}
          >
            {user.photoUrl ? (
              <img 
                src={formatImageUrl(user.photoUrl)} 
                alt={user.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#0061f2] dark:text-blue-400 font-black">
                <User size={20} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {isExpanded && (
            <div className="flex-1 min-w-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage('profile');
                }}
                className="text-left w-full truncate font-black text-xs uppercase tracking-tight hover:text-[#0061f2] dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                {user.name}
              </button>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-950 text-[#0061f2] dark:text-blue-300 truncate max-w-[130px]">
                  {user.unit || 'Clube'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. ITENS DE NAVEGAÇÃO */}
        <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={`sidebar-nav-${item.id}`}
                onClick={(e) => {
                  if (!isExpanded) {
                    setIsExpanded(true);
                    setCurrentPage(item.id);
                  } else {
                    e.stopPropagation();
                    setCurrentPage(item.id);
                  }
                }}
                className={`w-full flex items-center rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  isExpanded ? 'gap-3 px-4 py-2.5 text-left' : 'justify-center p-3'
                } ${
                  isActive
                    ? 'bg-[#0061f2] text-white shadow-lg shadow-blue-500/25 dark:bg-blue-600'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                      : 'text-slate-600 hover:text-[#0061f2] hover:bg-blue-50/60'
                }`}
                title={item.label}
              >
                <Icon size={isExpanded ? 19 : 21} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {isExpanded && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <span className={`${isExpanded ? 'ml-auto' : 'absolute bottom-1'} w-1.5 h-1.5 rounded-full bg-white animate-pulse`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* 4. BASE DO MENU: AJUSTES */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <button
            onClick={(e) => {
              if (!isExpanded) {
                setIsExpanded(true);
              } else {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }
            }}
            className={`w-full flex items-center rounded-2xl font-black text-xs uppercase tracking-wider border transition-all active:scale-[0.98] cursor-pointer ${
              isExpanded ? 'justify-between px-4 py-2.5' : 'justify-center p-3'
            } ${
              isDarkMode
                ? 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700 hover:text-slate-900'
            }`}
            title="Abrir Ajustes"
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
              <Settings size={19} className="text-[#0061f2] dark:text-blue-400 shrink-0" />
              {isExpanded && <span>Ajustes</span>}
            </div>
            {isExpanded && <span className="text-[10px] font-bold text-slate-400">Opções</span>}
          </button>
        </div>
      </aside>

      {/* MODAL DE AJUSTES */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-md rounded-[2.5rem] shadow-2xl border-2 p-6 relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-blue-950/40' 
                  : 'bg-white border-slate-100 text-slate-900 shadow-slate-300/50'
              }`}
            >
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#0061f2] dark:text-blue-400 flex items-center justify-center">
                    <Settings size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">Ajustes</h3>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Preferências e conta
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setShowLogoutConfirm(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="py-6 space-y-4">
                {/* BOTÃO 1: FIXAR MENU LATERAL (SOLICITADO PELO USUÁRIO) */}
                <div
                  onClick={handleTogglePin}
                  className={`flex items-center justify-between p-4 sm:p-5 rounded-[2.2rem] border-2 cursor-pointer transition-all duration-300 select-none active:scale-[0.99] ${
                    isPinned 
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#0061f2]/40 dark:border-blue-700/50 shadow-md shadow-blue-500/10' 
                      : isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 shadow-sm' 
                        : 'bg-slate-50/90 border-slate-200/80 hover:border-blue-200 shadow-sm'
                  }`}
                  title="Fixar ou recolher automaticamente o menu lateral"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isPinned 
                        ? 'bg-[#0061f2] text-white shadow-md shadow-blue-500/30' 
                        : isDarkMode 
                          ? 'bg-slate-700/60 text-slate-300' 
                          : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      <Pin size={22} className={isPinned ? 'rotate-45' : ''} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#002f6c]'}`}>
                        Fixar Menu Lateral
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {isPinned ? 'Sempre Aberto no PC' : 'Inicia Fechado (Recolhido)'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div 
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                      isPinned 
                        ? 'bg-[#0061f2] shadow-md shadow-blue-500/20' 
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <div 
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                        isPinned ? 'translate-x-6' : 'translate-x-0'
                      }`} 
                    />
                  </div>
                </div>

                {/* BOTÃO 2: MODO DE EXIBIÇÃO */}
                <div
                  onClick={onToggleDarkMode}
                  className={`flex items-center justify-between p-4 sm:p-5 rounded-[2.2rem] border-2 cursor-pointer transition-all duration-300 select-none active:scale-[0.99] ${
                    isDarkMode 
                      ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 shadow-lg shadow-black/20' 
                      : 'bg-slate-50/90 border-slate-200/80 hover:border-blue-200 shadow-sm'
                  }`}
                  title="Alternar Modo de Exibição"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isDarkMode 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-amber-100/90 text-amber-500 shadow-sm'
                    }`}>
                      {isDarkMode ? <Moon size={24} strokeWidth={2.5} /> : <Sun size={24} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-[#002f6c]'}`}>
                        Modo de Exibição
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {isDarkMode ? 'Escuro Ativado' : 'Claro Ativado'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div 
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                      isDarkMode 
                        ? 'bg-amber-500 shadow-md shadow-amber-500/20' 
                        : 'bg-slate-200'
                    }`}
                  >
                    <div 
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-0'
                      }`} 
                    />
                  </div>
                </div>

                {/* Linha Divisória */}
                <hr className="border-slate-100 dark:border-slate-800" />

                {/* BOTÃO 3: SAIR DA CONTA */}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                    Sessão
                  </span>

                  {!showLogoutConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 cursor-pointer"
                    >
                      <LogOut size={18} strokeWidth={2.5} />
                      <span>Sair da Conta</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900/50 space-y-3">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Tem certeza que deseja sair?
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShowLogoutConfirm(false)}
                          className="py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmLogout}
                          className="py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                        >
                          Sim, Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-2 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Sentinelas da Verdade • Versão PC
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesktopSidebar;
