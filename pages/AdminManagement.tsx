
import React, { useState } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, ChevronLeft, X, ShieldAlert, Medal } from 'lucide-react';

interface AdminManagementProps {
  onBack: () => void;
  onGoToAdminAvisos: () => void;
  onGoToAdminQuiz: () => void;
  onGoToAdminSpecialty: () => void;
  onAddCounselor: (name: string) => void;
  quizOverride: boolean;
  onToggleQuizOverride: () => void;
  memoryOverride: boolean;
  onToggleMemoryOverride: () => void;
  specialtyOverride: boolean;
  onToggleSpecialtyOverride: () => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  onBack,
  onGoToAdminAvisos,
  onGoToAdminQuiz,
  onGoToAdminSpecialty,
  onAddCounselor,
  quizOverride,
  onToggleQuizOverride,
  memoryOverride,
  onToggleMemoryOverride,
  specialtyOverride,
  onToggleSpecialtyOverride
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [newCounselorName, setNewCounselorName] = useState('');
  
  const brasaoUrl = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  const inputClasses = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <header className="bg-[#0061f2] text-white px-6 h-28 flex flex-col justify-center shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={brasaoUrl} alt="Brasão" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight leading-none">Gestão Administrativa</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Painel de Controle • Líder</p>
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
              <button onClick={() => setShowCounselorModal(true)} className="w-full bg-blue-50 text-[#0061f2] py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-sm border border-blue-100 hover:bg-blue-100 transition-all text-xs uppercase tracking-widest">
                <UserPlus size={20} /> NOVOS CONSELHEIROS
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
      </div>

      {showCounselorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black text-[#0061f2] uppercase">Novo Conselheiro</h3><button onClick={() => setShowCounselorModal(false)} className="text-slate-400 p-2"><X size={24} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); onAddCounselor(newCounselorName); setNewCounselorName(''); setShowCounselorModal(false); }} className="space-y-4">
              <input required autoFocus className={inputClasses} placeholder="Nome do Conselheiro" value={newCounselorName} onChange={e => setNewCounselorName(e.target.value)} />
              <button type="submit" className="w-full bg-[#0061f2] text-white py-4 px-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 text-sm">SALVAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
