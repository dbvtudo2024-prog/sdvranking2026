
import React, { useState, useEffect } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, HelpCircle, MessageSquare, BookOpen, Calendar, Plus, Shuffle, Trophy, Anchor, User, Map, Type, Leaf, HeartPulse } from 'lucide-react';
import { Member, ChatMessage, Devotional, CounselorDB } from '@/types';
import { DatabaseService } from '@/db';

interface AdminManagementProps {
  members: Member[];
  userEmail?: string;
  onBack: () => void;
  onGoToAdminAvisos: () => void;
  onGoToAdminQuiz: () => void;
  onGoToAdminSpecialty: () => void;
  onGoToAdminThreeClues: () => void;
  onGoToAdminSpecialtyStudy: () => void;
  onGoToAdminPuzzle: () => void;
  onGoToAdminWhoAmI: () => void;
  onGoToAdminScrambledVerse: () => void;
  onGoToAdminNatureId: () => void;
  onGoToAdminFirstAid: () => void;
  onGoToAdminSpecialtyTrail: () => void;
  counselors: CounselorDB[];
  onAddCounselor: (name: string) => Promise<void>;
  onUpdateCounselor: (id: string | number, name: string) => Promise<void>;
  onDeleteCounselor: (id: string | number) => Promise<void>;
  onResetRanking: (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues') => Promise<void>;
  quizOverride: boolean;
  onToggleQuizOverride: () => void;
  memoryOverride: boolean;
  onToggleMemoryOverride: () => void;
  specialtyOverride: boolean;
  onToggleSpecialtyOverride: () => void;
  threeCluesOverride: boolean;
  onToggleThreeCluesOverride: () => void;
  puzzleOverride: boolean;
  onTogglePuzzleOverride: () => void;
  knotsOverride: boolean;
  onToggleKnotsOverride: () => void;
  whoAmIOverride: boolean;
  onToggleWhoAmIOverride: () => void;
  specialtyTrailOverride: boolean;
  onToggleSpecialtyTrailOverride: () => void;
  scrambledVerseOverride: boolean;
  onToggleScrambledVerseOverride: () => void;
  natureIdOverride: boolean;
  onToggleNatureIdOverride: () => void;
  firstAidOverride: boolean;
  onToggleFirstAidOverride: () => void;
  isDarkMode?: boolean;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  members,
  userEmail,
  onBack,
  onGoToAdminAvisos,
  onGoToAdminQuiz,
  onGoToAdminSpecialty,
  onGoToAdminThreeClues,
  onGoToAdminSpecialtyStudy,
  onGoToAdminPuzzle,
  onGoToAdminWhoAmI,
  onGoToAdminScrambledVerse,
  onGoToAdminNatureId,
  onGoToAdminFirstAid,
  onGoToAdminSpecialtyTrail,
  counselors = [],
  onAddCounselor,
  onUpdateCounselor,
  onDeleteCounselor,
  onResetRanking,
  quizOverride,
  onToggleQuizOverride,
  memoryOverride,
  onToggleMemoryOverride,
  specialtyOverride,
  onToggleSpecialtyOverride,
  threeCluesOverride,
  onToggleThreeCluesOverride,
  puzzleOverride,
  onTogglePuzzleOverride,
  knotsOverride,
  onToggleKnotsOverride,
  whoAmIOverride,
  onToggleWhoAmIOverride,
  specialtyTrailOverride,
  onToggleSpecialtyTrailOverride,
  scrambledVerseOverride,
  onToggleScrambledVerseOverride,
  natureIdOverride,
  onToggleNatureIdOverride,
  firstAidOverride,
  onToggleFirstAidOverride,
  isDarkMode
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState(false);
  const [editCounselor, setEditCounselor] = useState<CounselorDB | null>(null);
  const [newCounselorName, setNewCounselorName] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [devotionalLink, setDevotionalLink] = useState('');
  const [devotionalTitle, setDevotionalTitle] = useState('Devocional Diário');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScheduledFor, setDevotionalScheduledFor] = useState(new Date().toISOString().slice(0, 16));
  const [isSavingDevotional, setIsSavingDevotional] = useState(false);
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [showDevotionalList, setShowDevotionalList] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [gameAssets, setGameAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  useEffect(() => {
    loadDevotionals();
  }, []);

  const loadAssets = async () => {
    try {
      const assets = await DatabaseService.getGameAssets('knots');
      setGameAssets(assets);
    } catch (err) {
      console.error("Erro ao carregar ativos:", err);
    }
  };

  const handleUpdateAsset = async (id: number) => {
    if (!newAssetUrl.trim()) return;
    setIsSavingAsset(true);
    try {
      await DatabaseService.updateGameAsset(id, newAssetUrl);
      alert("✅ Imagem atualizada!");
      setEditingAsset(null);
      setNewAssetUrl('');
      loadAssets();
    } catch (err) {
      alert("❌ Erro ao atualizar.");
    } finally {
      setIsSavingAsset(false);
    }
  };

  const loadDevotionals = async () => {
    try {
      const data = await DatabaseService.getAllDevotionals();
      setAllDevotionals(data);
    } catch (err) {
      console.error("Erro ao carregar devocionais:", err);
    }
  };

  const handleSaveDevotional = async () => {
    if (!devotionalTitle.trim()) {
      alert("Preencha ao menos o título.");
      return;
    }
    setIsSavingDevotional(true);
    try {
      const scheduledDate = new Date(devotionalScheduledFor);
      const isNow = scheduledDate <= new Date();

      await DatabaseService.createDevotional({
        link: devotionalLink,
        title: devotionalTitle,
        content: devotionalContent,
        scheduled_for: scheduledDate.toISOString()
      });

      alert("✅ Devocional agendado com sucesso!");
      setDevotionalLink('');
      setDevotionalTitle('Devocional Diário');
      setDevotionalContent('');
      loadDevotionals();
    } catch (err) {
      alert("❌ Erro ao salvar devocional.");
    } finally {
      setIsSavingDevotional(false);
    }
  };

  const handleDeleteDevotional = async (id: number) => {
    if (!confirm("Excluir este devocional?")) return;
    try {
      await DatabaseService.deleteDevotional(id);
      loadDevotionals();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const handleResetClick = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'whoami' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid', label: string) => {
    if (!confirm(`CONFIRMAÇÃO 1: Deseja zerar todos os pontos de ${label.toUpperCase()}?`)) return;
    if (!confirm(`⚠️ CONFIRMAÇÃO FINAL: Esta ação vai apagar permanentemente os pontos de ${label} de TODOS os membros. Podemos prosseguir?`)) return;

    setIsResetting(type);
    try {
      await onResetRanking(type);
      alert(`✅ SUCESSO: O ranking de ${label} foi totalmente zerado!`);
    } catch (error) {
      alert('❌ ERRO: Falha ao comunicar com o servidor.');
    } finally {
      setIsResetting(null);
    }
  };

  const handleAddOrUpdateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselorName.trim()) return;
    setIsProcessing(true);
    try {
      if (editCounselor) await onUpdateCounselor(editCounselor.id!, newCounselorName);
      else await onAddCounselor(newCounselorName);
      setNewCounselorName('');
      setEditCounselor(null);
      setShowCounselorModal(false);
    } catch (error) { alert("Erro ao salvar conselheiro."); } finally { setIsProcessing(false); }
  };

  const GameLockButton = ({ label, active, onToggle, icon: Icon }: any) => (
    <button 
      onClick={onToggle}
      className={`w-full ${active 
        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-500') 
        : (isDarkMode ? 'bg-slate-900/50 text-slate-500 border-slate-800' : 'bg-white text-slate-400 border-slate-100')} 
        aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm border uppercase text-[9px] font-black tracking-widest active:scale-95 transition-all`}
    >
      <Icon size={22} />
      {label}
      <span className="text-[7px] opacity-70">{active ? 'LIBERADO' : 'BLOQUEADO'}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-y-auto`}>
      <div className="p-6 space-y-8 pb-32">
        
        {/* 1. LIBERAÇÃO MANUAL DE JOGOS */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-8 border backdrop-blur-sm`}>
          <div className="flex flex-col items-center gap-1">
            <h3 className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[11px] font-black uppercase tracking-[0.25em]`}>Controle de Acesso</h3>
            <p className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Liberação Manual de Jogos</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <GameLockButton label="Quiz" active={quizOverride} onToggle={onToggleQuizOverride} icon={Zap} />
            <GameLockButton label="Memória" active={memoryOverride} onToggle={onToggleMemoryOverride} icon={Gamepad2} />
            <GameLockButton label="Espec." active={specialtyOverride} onToggle={onToggleSpecialtyOverride} icon={Medal} />
            <GameLockButton label="3 Dicas" active={threeCluesOverride} onToggle={onToggleThreeCluesOverride} icon={HelpCircle} />
            <GameLockButton label="Quebra-C" active={puzzleOverride} onToggle={onTogglePuzzleOverride} icon={Shuffle} />
            <GameLockButton label="Nós" active={knotsOverride} onToggle={onToggleKnotsOverride} icon={Anchor} />
            <GameLockButton label="Quem Sou" active={whoAmIOverride} onToggle={onToggleWhoAmIOverride} icon={User} />
            <GameLockButton label="Trilha" active={specialtyTrailOverride} onToggle={onToggleSpecialtyTrailOverride} icon={Map} />
            <GameLockButton label="Versículo" active={scrambledVerseOverride} onToggle={onToggleScrambledVerseOverride} icon={Type} />
            <GameLockButton label="Natureza" active={natureIdOverride} onToggle={onToggleNatureIdOverride} icon={Leaf} />
            <GameLockButton label="Socorro" active={firstAidOverride} onToggle={onToggleFirstAidOverride} icon={HeartPulse} />
          </div>
        </div>

        {/* 2. MURAL E EQUIPE */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6 border backdrop-blur-sm`}>
           <div className="flex items-center gap-2 px-2">
             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
               <ShieldAlert size={16} />
             </div>
             <h3 className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Mural e Equipe</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <button onClick={onGoToAdminAvisos} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}>
                <BellRing size={24} /> GERENCIAR AVISOS
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setEditCounselor(null); setNewCounselorName(''); setShowCounselorModal(true); }} className={`${isDarkMode ? 'bg-slate-900/50 text-blue-400 border-blue-900/30' : 'bg-blue-50/50 text-[#0061f2] border-blue-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <UserPlus size={22} /> CONSELHEIROS
                </button>
                <button onClick={() => { setShowDevotionalList(false); setShowDevotionalModal(true); }} className={`${isDarkMode ? 'bg-slate-900/50 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50/50 text-emerald-600 border-emerald-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <BookOpen size={22} /> DEVOCIONAIS
                </button>
              </div>
           </div>
        </div>

        {/* 3. GESTÃO DE JOGOS */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6 border backdrop-blur-sm`}>
           <div className="flex items-center gap-2 px-2">
             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
               <Trophy size={16} />
             </div>
             <h3 className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Gestão de Jogos</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              <button onClick={onGoToAdminQuiz} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}>
                <ListFilter size={24} /> EDITAR QUIZ & QUESTÕES
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onGoToAdminSpecialty} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Medal size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> ESPECIALIDADES
                </button>
                <button onClick={onGoToAdminThreeClues} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <HelpCircle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> 3 DICAS
                </button>
                <button onClick={onGoToAdminSpecialtyStudy} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <BookOpen size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> ESTUDO (PDF)
                </button>
                <button onClick={onGoToAdminPuzzle} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Shuffle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> QUEBRA-CABEÇA
                </button>
                <button onClick={onGoToAdminWhoAmI} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <User size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> QUEM SOU EU?
                </button>
                <button onClick={onGoToAdminScrambledVerse} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Shuffle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> VERSÍCULO
                </button>
                <button onClick={onGoToAdminNatureId} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Leaf size={22} className={isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} /> NATUREZA
                </button>
                <button onClick={onGoToAdminFirstAid} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <HeartPulse size={22} className={isDarkMode ? 'text-red-500' : 'text-red-600'} /> 1º SOCORROS
                </button>
                <button onClick={onGoToAdminSpecialtyTrail} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Map size={22} className={isDarkMode ? 'text-blue-500' : 'text-blue-600'} /> TRILHA ESPECIAL.
                </button>
              </div>
              <button 
                onClick={() => { loadAssets(); setShowAssetsModal(true); }} 
                className={`w-full ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' : 'bg-blue-50 text-blue-600 border-blue-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}
              >
                <Zap size={24} /> GERENCIAR IMAGENS (ASSETS)
              </button>
           </div>
        </div>
        {/* 5. ZERAR RANKING (PAINEL MASTER) */}
        {userEmail === ADMIN_MASTER_EMAIL && (
          <div className={`${isDarkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-[#fff1f1] border-red-100'} p-10 rounded-[3.5rem] border shadow-xl shadow-red-900/5 space-y-6 mt-6`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                <AlertTriangle size={20} strokeWidth={3} />
                <h4 className={`text-[12px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Zerar Rankings (Master)</h4>
              </div>
              <p className={`text-[9px] font-black ${isDarkMode ? 'text-red-800' : 'text-red-400'} uppercase tracking-widest mb-8 text-center leading-tight`}>Esta área é visível apenas para você. Ações irreversíveis.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button disabled={!!isResetting} onClick={() => handleResetClick('members', 'Membros')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'members' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Membros
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('quiz', 'Quiz')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'quiz' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Quiz
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('memory', 'Memória')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'memory' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Memória
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('specialty', 'Especialidade')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'specialty' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Especialidade
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('1x1', 'Arena 1x1')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === '1x1' ? <Loader2 className="animate-spin" size={20} /> : <Sword size={20} />} 
                  </div>
                  Zerar Arena 1x1
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('threeclues', 'Três Dicas')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'threeclues' ? <Loader2 className="animate-spin" size={20} /> : <HelpCircle size={20} />} 
                  </div>
                  Zerar 3 Dicas
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('natureid', 'Natureza')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'natureid' ? <Loader2 className="animate-spin" size={20} /> : <Leaf size={20} />} 
                  </div>
                  Zerar Natureza
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('firstaid', 'Socorros')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'firstaid' ? <Loader2 className="animate-spin" size={20} /> : <HeartPulse size={20} />} 
                  </div>
                  Zerar Socorros
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('specialtytrail', 'Trilha')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'specialtytrail' ? <Loader2 className="animate-spin" size={20} /> : <Map size={20} />} 
                  </div>
                  Zerar Trilha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA ADICIONAR/EDITAR CONSELHEIROS */}
      {showCounselorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>{editCounselor ? 'Editar' : 'Novo'} Conselheiro</h3>
              <button onClick={() => setShowCounselorModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddOrUpdateCounselor} className="space-y-5 shrink-0">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Nome do Conselheiro</label>
                <input 
                  required
                  autoFocus
                  className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-sm shadow-inner`}
                  placeholder="Ex: JOÃO GABRIEL"
                  value={newCounselorName}
                  onChange={e => setNewCounselorName(e.target.value.toUpperCase())}
                />
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  {editCounselor ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              <h4 className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest ml-2`}>Conselheiros Cadastrados ({counselors.length})</h4>
              {counselors.length === 0 ? (
                <p className="text-center py-8 text-slate-300 text-[10px] font-black uppercase">Nenhum conselheiro cadastrado</p>
              ) : (
                counselors.map(c => (
                  <div key={`modal-counselor-${c.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4 flex items-center justify-between group`}>
                    <span className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-xs uppercase tracking-tight`}>{c.name}</span>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditCounselor(c); setNewCounselorName(c.name); }} className="text-blue-300 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if(confirm('Excluir?')) onDeleteCounselor(c.id!); }} className="text-red-200 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA GESTÃO DE DEVOCIONAIS */}
      {showDevotionalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-emerald-600" />
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>Gestão de Devocionais</h3>
              </div>
              <button onClick={() => setShowDevotionalModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>

            <div className={`flex p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xl shrink-0`}>
              <button 
                onClick={() => setShowDevotionalList(false)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!showDevotionalList ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'text-slate-400'}`}
              >
                Novo Devocional
              </button>
              <button 
                onClick={() => setShowDevotionalList(true)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${showDevotionalList ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'text-slate-400'}`}
              >
                Ver Agendados
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!showDevotionalList ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Título do Devocional</label>
                    <input 
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                      placeholder="Ex: Momento com Deus"
                      value={devotionalTitle}
                      onChange={e => setDevotionalTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Link do Vídeo ou Conteúdo</label>
                    <input 
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                      placeholder="Link do YouTube ou site"
                      value={devotionalLink}
                      onChange={e => setDevotionalLink(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Texto do Devocional</label>
                    <textarea 
                      rows={4}
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm resize-none`}
                      placeholder="Escreva a mensagem do dia..."
                      value={devotionalContent}
                      onChange={e => setDevotionalContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Agendar Para</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="datetime-local"
                        className={`w-full p-4 pl-12 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                        value={devotionalScheduledFor}
                        onChange={e => setDevotionalScheduledFor(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveDevotional}
                    disabled={isSavingDevotional}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSavingDevotional ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                    AGENDAR DEVOCIONAL
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {allDevotionals.length === 0 ? (
                    <div className="py-10 text-center opacity-30">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nenhum devocional agendado</p>
                    </div>
                  ) : (
                    allDevotionals.map(dev => (
                      <div key={`modal-devotional-${dev.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4 flex items-center justify-between`}>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase leading-tight`}>{dev.title}</p>
                          <p className={`text-[8px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mt-0.5`}>
                            {new Date(dev.scheduled_for).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteDevotional(dev.id!)}
                          className="p-2 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL PARA GESTÃO DE ASSETS (IMAGENS) */}
      {showAssetsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-blue-600" />
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>Imagens dos Jogos</h3>
              </div>
              <button onClick={() => setShowAssetsModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>

            <p className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest leading-relaxed`}>
              Aqui você pode trocar os links das imagens que aparecem nos jogos. Use links diretos (que terminam em .jpg ou .png).
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {gameAssets.length === 0 ? (
                <div className="py-10 text-center opacity-30">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nenhuma imagem encontrada na tabela game_assets</p>
                </div>
              ) : (
                gameAssets.map(asset => (
                  <div key={`asset-${asset.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-3xl p-5 space-y-4`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-tight`}>{asset.name}</p>
                        <p className={`text-[8px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest truncate`}>{asset.game_type}</p>
                      </div>
                      <button 
                        onClick={() => { setEditingAsset(asset); setNewAssetUrl(asset.url); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>

                    {editingAsset?.id === asset.id && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                        <input 
                          className={`w-full p-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-700'} border rounded-xl text-xs font-bold`}
                          placeholder="Cole o novo link da imagem aqui..."
                          value={newAssetUrl}
                          onChange={e => setNewAssetUrl(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateAsset(asset.id)}
                            disabled={isSavingAsset}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            {isSavingAsset ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} SALVAR
                          </button>
                          <button 
                            onClick={() => setEditingAsset(null)}
                            className={`px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}
                          >
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
