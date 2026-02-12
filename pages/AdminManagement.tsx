
import React, { useState } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, ChevronLeft, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, HelpCircle, Lock, Unlock, Plus } from 'lucide-react';
import { Member } from '../types';
import { CounselorDB } from '../db';

interface AdminManagementProps {
  members: Member[];
  userEmail?: string;
  onBack: () => void;
  onGoToAdminAvisos: () => void;
  onGoToAdminQuiz: () => void;
  onGoToAdminSpecialty: () => void;
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
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  members,
  userEmail,
  onBack,
  onGoToAdminAvisos,
  onGoToAdminQuiz,
  onGoToAdminSpecialty,
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
  onToggleThreeCluesOverride
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [editCounselor, setEditCounselor] = useState<CounselorDB | null>(null);
  const [newCounselorName, setNewCounselorName] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  const handleResetClick = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues', label: string) => {
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
      className={`aspect-[3/4] rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all border shadow-sm active:scale-95
        ${active 
          ? 'bg-green-500 border-green-600 text-white shadow-green-200 shadow-md' 
          : 'bg-[#f8faff] border-slate-50 text-slate-300'}`}
    >
      <Icon size={26} strokeWidth={active ? 3 : 2} />
      <div className="text-center">
        <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{label}:</p>
        <p className={`text-[7px] font-black uppercase tracking-widest ${active ? 'text-green-100' : 'text-slate-300'}`}>
          {active ? 'Liberado' : 'Bloqueado'}
        </p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* HEADER IGUAL À IMAGEM */}
      <header className="bg-[#0061f2] text-white px-6 h-28 flex items-center gap-4 shadow-lg shrink-0">
        <img src={LOGO_APP} alt="Brasão" className="w-14 h-14 object-contain" />
        <div>
          <h1 className="text-lg font-black uppercase tracking-tight leading-none">Gestão Administrativa</h1>
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Painel de Controle • Desde 1997</p>
        </div>
      </header>

      <div className="p-6 space-y-8 overflow-y-auto flex-1 pb-32">
        {/* BOTÃO VOLTAR IGUAL À IMAGEM */}
        <button onClick={onBack} className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-100 rounded-full text-[#0061f2] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/5 active:scale-95 transition-all w-fit">
          <ChevronLeft size={16} strokeWidth={4} /> Voltar ao Perfil
        </button>

        {/* 1. MURAL E EQUIPE */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6">
           <div className="flex items-center gap-2 px-2">
             <ShieldAlert size={16} className="text-[#0061f2]" />
             <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Mural e Equipe</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <button onClick={onGoToAdminAvisos} className="bg-[#FFD700] text-[#003366] py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all">
                <BellRing size={24} /> GERENCIAR AVISOS
              </button>
              <button onClick={() => { setEditCounselor(null); setNewCounselorName(''); setShowCounselorModal(true); }} className="bg-blue-50 text-[#0061f2] py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border border-blue-100 uppercase text-xs tracking-widest active:scale-95 transition-all">
                <UserPlus size={24} /> ADICIONAR CONSELHEIRO
              </button>
           </div>
        </div>

        {/* 2. GESTÃO DE JOGOS */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6">
           <div className="flex items-center gap-2 px-2">
             <Medal size={16} className="text-[#0061f2]" />
             <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Gestão de Jogos</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <button onClick={onGoToAdminQuiz} className="bg-[#0061f2] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all">
                <ListFilter size={24} /> EDITAR QUIZ & QUESTÕES
              </button>
              <button onClick={onGoToAdminSpecialty} className="bg-slate-50 text-slate-600 py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border border-slate-100 uppercase text-xs tracking-widest active:scale-95 transition-all">
                <Medal size={24} /> EDITAR ESPECIALIDADES
              </button>
           </div>
        </div>

        {/* 3. LISTA DE CONSELHEIROS OFICIAL (DESIGN DA IMAGEM) */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6">
          <div className="flex justify-between items-center px-2 mb-2">
            <div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Lista de</h3>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Conselheiros</h3>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Oficial</h3>
            </div>
            <div className="bg-blue-50 px-4 py-3 rounded-3xl text-[#0061f2] flex flex-col items-center leading-none">
              <span className="text-xs font-black">{counselors.length}</span>
              <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">Cadastrados</span>
            </div>
          </div>

          <div className="space-y-3">
            {counselors.map(c => (
              <div key={c.id} className="bg-white border border-slate-50 rounded-[1.8rem] p-6 shadow-sm flex items-center justify-between group">
                <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{c.name}</span>
                <div className="flex gap-4">
                  <button onClick={() => { setEditCounselor(c); setNewCounselorName(c.name); setShowCounselorModal(true); }} className="text-blue-300 hover:text-blue-600 transition-colors">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => { if(confirm('Excluir?')) onDeleteCounselor(c.id!); }} className="text-red-200 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LIBERAÇÃO MANUAL DE JOGOS (DESIGN DA IMAGEM) */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-8">
          <h3 className="text-center text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Liberação Manual de Jogos</h3>
          
          <div className="grid grid-cols-4 gap-2">
            <GameLockButton label="Quiz" active={quizOverride} onToggle={onToggleQuizOverride} icon={Zap} />
            <GameLockButton label="Memória" active={memoryOverride} onToggle={onToggleMemoryOverride} icon={Gamepad2} />
            <GameLockButton label="Espec." active={specialtyOverride} onToggle={onToggleSpecialtyOverride} icon={Medal} />
            <GameLockButton label="3 Dicas" active={threeCluesOverride} onToggle={onToggleThreeCluesOverride} icon={HelpCircle} />
          </div>
        </div>

        {/* 5. PAINEL MASTER (DESIGN DA IMAGEM) */}
        {userEmail === ADMIN_MASTER_EMAIL && (
          <div className="bg-[#fff1f1] p-10 rounded-[3.5rem] border border-red-100 shadow-xl shadow-red-900/5 space-y-6 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                <AlertTriangle size={20} strokeWidth={3} />
                <h4 className="text-[12px] font-black uppercase tracking-[0.15em]">Zerar Rankings (Master)</h4>
              </div>
              <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-8 text-center leading-tight">Esta área é visível apenas para você. Ações irreversíveis.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button disabled={!!isResetting} onClick={() => handleResetClick('members', 'Membros')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === 'members' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  Zerar Membros
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('quiz', 'Quiz')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === 'quiz' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  Zerar Quiz
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('memory', 'Memória')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === 'memory' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  Zerar Memória
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('specialty', 'Especialidade')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === 'specialty' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  Zerar Especialidade
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('1x1', 'Arena 1x1')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === '1x1' ? <Loader2 className="animate-spin" size={20} /> : <Sword size={20} />} 
                  Zerar Arena 1x1
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('threeclues', 'Três Dicas')} className="bg-white text-red-600 border border-red-100 p-6 rounded-[2rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all">
                  {isResetting === 'threeclues' ? <Loader2 className="animate-spin" size={20} /> : <HelpCircle size={20} />} 
                  Zerar 3 Dicas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA ADICIONAR/EDITAR CONSELHEIROS */}
      {showCounselorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editCounselor ? 'Editar' : 'Novo'} Conselheiro</h3>
              <button onClick={() => setShowCounselorModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddOrUpdateCounselor} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome do Conselheiro</label>
                <input 
                  required
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 text-sm shadow-inner"
                  placeholder="Ex: JOÃO GABRIEL"
                  value={newCounselorName}
                  onChange={e => setNewCounselorName(e.target.value.toUpperCase())}
                />
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#0061f2] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                SALVAR CONSELHEIRO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
