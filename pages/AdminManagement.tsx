
import React, { useState } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, ChevronLeft, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check } from 'lucide-react';
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
  onResetRanking: (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1') => Promise<void>;
  quizOverride: boolean;
  onToggleQuizOverride: () => void;
  memoryOverride: boolean;
  onToggleMemoryOverride: () => void;
  specialtyOverride: boolean;
  onToggleSpecialtyOverride: () => void;
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
  onToggleSpecialtyOverride
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [editCounselor, setEditCounselor] = useState<CounselorDB | null>(null);
  const [newCounselorName, setNewCounselorName] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  const inputClasses = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";

  const handleResetClick = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1', label: string) => {
    const confirm1 = confirm(`CONFIRMAÇÃO 1: Deseja zerar todos os pontos de ${label.toUpperCase()}?`);
    if (!confirm1) return;
    
    const confirm2 = confirm(`⚠️ CONFIRMAÇÃO FINAL: Esta ação vai apagar permanentemente os pontos de ${label} de TODOS os membros no banco de dados. Podemos prosseguir?`);
    if (!confirm2) return;

    setIsResetting(type);
    try {
      await onResetRanking(type);
      alert(`✅ SUCESSO: O ranking de ${label} foi totalmente zerado!`);
    } catch (error) {
      console.error("Erro no reset:", error);
      alert('❌ ERRO: Falha ao comunicar com o servidor. Tente novamente.');
    } finally {
      setIsResetting(null);
    }
  };

  const handleAddOrUpdateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselorName.trim()) return;

    setIsProcessing(true);
    try {
      if (editCounselor) {
        await onUpdateCounselor(editCounselor.id!, newCounselorName);
      } else {
        await onAddCounselor(newCounselorName);
      }
      setNewCounselorName('');
      setEditCounselor(null);
      setShowCounselorModal(false);
    } catch (error) {
      alert("Erro ao salvar conselheiro.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCounselorClick = async (id: string | number) => {
    if (!confirm("Excluir este conselheiro da lista oficial?")) return;
    try {
      await onDeleteCounselor(id);
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-[#0061f2] text-white px-6 h-28 flex flex-col justify-center shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={LOGO_APP} alt="Brasão" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight leading-none">Gestão Administrativa</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Painel de Controle • Desde 1997</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-full text-[#0061f2] font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all w-fit"
        >
          <ChevronLeft size={18} strokeWidth={3} />
          Voltar ao Perfil
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-4">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-[#0061f2]" /> Mural e Equipe
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={onGoToAdminAvisos} className="w-full bg-[#FFD700] text-[#003366] py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-widest">
                <BellRing size={20} /> GERENCIAR AVISOS
              </button>
              <button onClick={() => { setEditCounselor(null); setNewCounselorName(''); setShowCounselorModal(true); }} className="w-full bg-blue-50 text-[#0061f2] py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-sm border border-blue-100 hover:bg-blue-100 transition-all text-xs uppercase tracking-widest">
                <UserPlus size={20} /> ADICIONAR CONSELHEIRO
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-4">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Medal size={14} className="text-[#0061f2]" /> Gestão de Jogos
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={onGoToAdminQuiz} className="w-full bg-[#0061f2] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-md transition-all text-xs uppercase tracking-widest">
                <ListFilter size={18} /> EDITAR QUIZ & QUESTÕES
              </button>
              <button onClick={onGoToAdminSpecialty} className="w-full bg-slate-50 text-slate-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-sm border border-slate-100 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest mt-1">
                <Medal size={18} /> EDITAR ESPECIALIDADES
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE CONSELHEIROS */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lista de Conselheiros Oficial</h3>
             <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">{counselors.length} Cadastrados</span>
          </div>
          <div className="space-y-2">
            {counselors.length > 0 ? counselors.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <span className="font-bold text-slate-700 text-sm uppercase">{c.name}</span>
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => { setEditCounselor(c); setNewCounselorName(c.name); setShowCounselorModal(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                    onClick={() => handleDeleteCounselorClick(c.id!)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhum conselheiro registrado</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-6">
          <div className="text-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Liberação Manual de Jogos</h4>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={onToggleQuizOverride} className={`w-full h-32 rounded-3xl font-black flex flex-col items-center justify-center gap-2 transition-all shadow-sm border-2 ${quizOverride ? 'bg-green-500 text-white border-green-400' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                <Zap size={20} className="shrink-0" />
                <span className="text-[9px] uppercase tracking-widest text-center px-1">QUIZ:<br/>{quizOverride ? 'LIBERADO' : 'BLOQUEADO'}</span>
              </button>
              <button onClick={onToggleMemoryOverride} className={`w-full h-32 rounded-3xl font-black flex flex-col items-center justify-center gap-2 transition-all shadow-sm border-2 ${memoryOverride ? 'bg-green-500 text-white border-green-400' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                <Gamepad2 size={20} className="shrink-0" />
                <span className="text-[9px] uppercase tracking-widest text-center px-1">MEMÓRIA:<br/>{memoryOverride ? 'LIBERADO' : 'BLOQUEADO'}</span>
              </button>
              <button onClick={onToggleSpecialtyOverride} className={`w-full h-32 rounded-3xl font-black flex flex-col items-center justify-center gap-2 transition-all shadow-sm border-2 ${specialtyOverride ? 'bg-green-500 text-white border-green-400' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                <Medal size={20} className="shrink-0" />
                <span className="text-[9px] uppercase tracking-widest text-center px-1">ESPEC.:<br/>{specialtyOverride ? 'LIBERADO' : 'BLOQUEADO'}</span>
              </button>
            </div>
          </div>
        </div>

        {userEmail === ADMIN_MASTER_EMAIL && (
          <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 shadow-xl shadow-red-900/5 space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={20} />
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">Zerar Rankings (Master)</h4>
              </div>
              <p className="text-[10px] text-red-400 font-bold uppercase mb-6">Esta área é visível apenas para você. Ações irreversíveis.</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <button 
                  disabled={!!isResetting}
                  onClick={() => handleResetClick('members', 'Membros (Semanal)')}
                  className="bg-white text-red-600 border border-red-200 p-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 min-h-[90px]"
                >
                  {isResetting === 'members' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  {isResetting === 'members' ? 'Limpando...' : 'Zerar Membros'}
                </button>
                <button 
                  disabled={!!isResetting}
                  onClick={() => handleResetClick('quiz', 'Quiz')}
                  className="bg-white text-red-600 border border-red-200 p-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 min-h-[90px]"
                >
                  {isResetting === 'quiz' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  {isResetting === 'quiz' ? 'Limpando...' : 'Zerar Quiz'}
                </button>
                <button 
                  disabled={!!isResetting}
                  onClick={() => handleResetClick('memory', 'Jogo da Memória')}
                  className="bg-white text-red-600 border border-red-200 p-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 min-h-[90px]"
                >
                  {isResetting === 'memory' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  {isResetting === 'memory' ? 'Limpando...' : 'Zerar Memória'}
                </button>
                <button 
                  disabled={!!isResetting}
                  onClick={() => handleResetClick('specialty', 'Especialidade')}
                  className="bg-white text-red-600 border border-red-200 p-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 min-h-[90px]"
                >
                  {isResetting === 'specialty' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  {isResetting === 'specialty' ? 'Limpando...' : 'Zerar Especialidade'}
                </button>
                <button 
                  disabled={!!isResetting}
                  onClick={() => handleResetClick('1x1', 'Arena 1x1')}
                  className="bg-white text-red-600 border border-red-200 p-4 rounded-2xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 min-h-[90px]"
                >
                  {isResetting === '1x1' ? <Loader2 className="animate-spin" size={18} /> : <Sword size={18} />}
                  {isResetting === '1x1' ? 'Limpando...' : 'Zerar Arena 1x1'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCounselorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-[#0061f2] uppercase">{editCounselor ? 'Editar Conselheiro' : 'Novo Conselheiro'}</h3>
               <button onClick={() => setShowCounselorModal(false)} className="text-slate-400 p-2"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddOrUpdateCounselor} className="space-y-4">
              <input required autoFocus className={inputClasses} placeholder="Nome do Conselheiro" value={newCounselorName} onChange={e => setNewCounselorName(e.target.value)} />
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-[#0061f2] text-white py-4 px-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {editCounselor ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR OFICIALMENTE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
