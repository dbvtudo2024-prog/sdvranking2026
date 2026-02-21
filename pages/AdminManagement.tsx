
import React, { useState, useEffect } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, HelpCircle, MessageSquare, BookOpen, Calendar, Plus } from 'lucide-react';
import { Member, ChatMessage, Devotional } from '../types';
import { CounselorDB, DatabaseService } from '../db';

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
  const [devotionalLink, setDevotionalLink] = useState('');
  const [devotionalTitle, setDevotionalTitle] = useState('Devocional Diário');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScheduledFor, setDevotionalScheduledFor] = useState(new Date().toISOString().slice(0, 16));
  const [isSavingDevotional, setIsSavingDevotional] = useState(false);
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [showDevotionalList, setShowDevotionalList] = useState(false);
  
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  useEffect(() => {
    loadDevotionals();
  }, []);

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

      // Enviar notificação via chat/realtime
      const notificationMsg: ChatMessage = {
        sender_id: 'system_devotional',
        sender_name: 'Ministério Pessoal 📖',
        sender_photo: 'https://api.dicebear.com/7.x/shapes/svg?seed=bible',
        text: isNow 
          ? `✨ NOVO DEVOCIONAL: "${devotionalTitle}" já está disponível! Clique para ler.`
          : `📅 AGENDADO: Novo devocional "${devotionalTitle}" para ${scheduledDate.toLocaleDateString('pt-BR')} às ${scheduledDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}.`,
        unit: 'Geral',
        created_at: new Date().toISOString()
      };
      await DatabaseService.sendMessage(notificationMsg);

      alert("✅ Devocional agendado e notificação enviada!");
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
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
      <div className="p-6 space-y-8 pb-32">
        
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

        {/* 4. GESTÃO DO DEVOCIONAL */}
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6">
           <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
               <BookOpen size={16} className="text-emerald-600" />
               <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Devocional Diário</h3>
             </div>
             <button 
               onClick={() => setShowDevotionalList(!showDevotionalList)}
               className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
             >
               {showDevotionalList ? 'Novo Devocional' : 'Ver Agendados'}
             </button>
           </div>
           
           {!showDevotionalList ? (
             <div className="space-y-4 animate-in fade-in duration-300">
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título do Devocional</label>
                 <input 
                   className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-sm"
                   placeholder="Ex: Momento com Deus"
                   value={devotionalTitle}
                   onChange={e => setDevotionalTitle(e.target.value)}
                 />
               </div>
               
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Link do Vídeo ou Conteúdo</label>
                 <input 
                   className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-sm"
                   placeholder="Link do YouTube ou site"
                   value={devotionalLink}
                   onChange={e => setDevotionalLink(e.target.value)}
                 />
               </div>

               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Texto do Devocional</label>
                 <textarea 
                   rows={4}
                   className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-sm resize-none"
                   placeholder="Escreva a mensagem do dia..."
                   value={devotionalContent}
                   onChange={e => setDevotionalContent(e.target.value)}
                 />
               </div>

               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Agendar Para</label>
                 <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                     type="datetime-local"
                     className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-sm"
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
                   <p className="text-[10px] font-black uppercase tracking-widest">Nenhum devocional agendado</p>
                 </div>
               ) : (
                 allDevotionals.map(dev => (
                   <div key={dev.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                     <div className="min-w-0 flex-1">
                       <p className="text-xs font-black text-slate-700 uppercase truncate">{dev.title}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
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

        {/* 5. LISTA DE CONSELHEIROS */}
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

        {/* 5. ZERAR RANKING (PAINEL MASTER) */}
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
          <div className="bg-white w-full max-sm rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95">
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
