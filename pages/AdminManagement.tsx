
import React, { useState } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, ChevronLeft, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, HelpCircle, Lock, Unlock, Plus, Database, DownloadCloud, MessageSquare } from 'lucide-react';
import { Member, ChatMessage } from '../types';
import { CounselorDB, DatabaseService } from '../db';
import { QUIZ_QUESTIONS, SPECIALTIES } from '../constants';

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
  const [isMigrating, setIsMigrating] = useState(false);
  
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  const handleTestNotification = async () => {
    setIsProcessing(true);
    const testMsg: ChatMessage = {
      senderId: 'system_bot',
      senderName: 'Robô do Clube 🤖',
      senderPhoto: 'https://api.dicebear.com/7.x/bottts/svg?seed=sentinelas',
      text: 'Olá! Esta é uma mensagem de teste para verificar as notificações em tempo real! 🚀',
      unit: 'Geral',
      created_at: new Date().toISOString()
    };

    try {
      await DatabaseService.sendMessage(testMsg);
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      alert("ERRO SUPABASE: " + (error.message || "Verifique o console para detalhes"));
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleSeedQuiz = async () => {
    if (!confirm('Isso enviará as 20 questões iniciais do app para o banco de dados. Deseja continuar?')) return;
    setIsMigrating(true);
    try {
      const questionsToSeed = QUIZ_QUESTIONS.map(({ id, ...q }) => q);
      await DatabaseService.seedQuizQuestions(questionsToSeed);
      alert('✅ Quiz sincronizado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao enviar questões. Verifique se a tabela quiz_questions existe.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSeedSpecialties = async () => {
    if (!confirm('Isso enviará as 12 especialidades padrão para o banco de dados. Deseja continuar?')) return;
    setIsMigrating(true);
    try {
      const specsToSeed = SPECIALTIES.map(s => ({
        ID: String(Math.floor(Math.random() * 1000)),
        Nome: s.name,
        Imagem: s.image,
        Questoes: '',
        Sigla: '',
        Categoria: 'Geral',
        Nivel: '1',
        Ano: '2024',
        Origem: 'Local',
        Like: false,
        Cor: ''
      }));
      await DatabaseService.seedSpecialties(specsToSeed);
      alert('✅ Especialidades sincronizadas com sucesso!');
    } catch (error) {
      alert('❌ Erro ao enviar especialidades. Verifique se a tabela EspecialidadesDBV existe.');
    } finally {
      setIsMigrating(false);
    }
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
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
      <div className="p-6 space-y-8 pb-32">
        
        {/* LABORATÓRIO DE TESTES */}
        <div className="bg-[#e0f2fe] rounded-[3rem] p-8 border-2 border-[#bae6fd] shadow-xl shadow-blue-500/10 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Zap size={16} className="text-[#0369a1]" />
            <h3 className="text-[#0369a1] text-[10px] font-black uppercase tracking-[0.2em]">Laboratório de Testes</h3>
          </div>
          <p className="text-[10px] font-bold text-[#0ea5e9] uppercase px-2 leading-tight">Use este botão para simular a chegada de uma nova mensagem e testar as notificações do app.</p>
          <button 
            onClick={handleTestNotification}
            disabled={isProcessing}
            className="w-full bg-[#0ea5e9] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase text-[10px] tracking-widest"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
            SIMULAR MENSAGEM (TESTAR NOTIFICAÇÃO)
          </button>
        </div>

        {/* 1. LIBERAÇÃO MANUAL DE JOGOS */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-8">
          <h3 className="text-center text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Liberação Manual de Jogos</h3>
          
          <div className="grid grid-cols-4 gap-2">
            <GameLockButton label="Quiz" active={quizOverride} onToggle={onToggleQuizOverride} icon={Zap} />
            <GameLockButton label="Memória" active={memoryOverride} onToggle={onToggleMemoryOverride} icon={Gamepad2} />
            <GameLockButton label="Espec." active={specialtyOverride} onToggle={onToggleSpecialtyOverride} icon={Medal} />
            <GameLockButton label="3 Dicas" active={threeCluesOverride} onToggle={onToggleThreeCluesOverride} icon={HelpCircle} />
          </div>
        </div>

        {/* 2. MURAL E EQUIPE */}
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

        {/* 3. GESTÃO DE JOGOS */}
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

        {/* 4. LISTA DE CONSELHEIROS */}
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

        {/* 5. MANUTENÇÃO E MIGRAÇÃO */}
        {userEmail === ADMIN_MASTER_EMAIL && (
          <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-200 shadow-xl shadow-amber-900/5 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Database size={16} className="text-amber-600" />
              <h3 className="text-amber-700 text-[10px] font-black uppercase tracking-[0.2em]">Manutenção e Migração</h3>
            </div>
            <p className="text-[9px] font-bold text-amber-600 uppercase px-2">Envie os dados padrões do código para o seu banco de dados Supabase.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                disabled={isMigrating}
                onClick={handleSeedQuiz}
                className="bg-white text-amber-600 border border-amber-200 py-4 rounded-2xl font-black flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              >
                {isMigrating ? <Loader2 className="animate-spin" size={18} /> : <DownloadCloud size={18} />}
                Migrar Questões
              </button>
              <button 
                disabled={isMigrating}
                onClick={handleSeedSpecialties}
                className="bg-white text-amber-600 border border-amber-200 py-4 rounded-2xl font-black flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              >
                {isMigrating ? <Loader2 className="animate-spin" size={18} /> : <DownloadCloud size={18} />}
                Migrar Especialidades
              </button>
            </div>
          </div>
        )}

        {/* 6. ZERAR RANKING (PAINEL MASTER) */}
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
