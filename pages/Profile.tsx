
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthUser, UserRole, UnitName, Member } from '../types';
import { getClassByAge, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_ROLES } from '../constants';
import { Save, User as UserIcon, Camera, ChevronDown, Trophy, BookOpen, Medal, ShieldCheck, Check, Shield, X, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileProps {
  user: AuthUser;
  members: Member[];
  onUpdateUser: (user: AuthUser, member?: Member) => void;
  onLogout: () => void;
  onGoToAdminManagement?: () => void;
  counselorList?: string[];
  onUpdateMember?: (member: Member) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  members, 
  onUpdateUser, 
  onLogout, 
  onGoToAdminManagement,
  counselorList = [],
  onUpdateMember
}) => {
  const [formData, setFormData] = useState<AuthUser>({ ...user });
  const [showToast, setShowToast] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const currentMember = useMemo(() => {
    return members.find(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase());
  }, [members, user.name, user.id]);

  const quizStats = useMemo(() => {
    if (!currentMember) return { total: 0, completed: 0, bestDesbravadores: 0, bestBiblia: 0, history: [] };
    const quizScores = (currentMember.scores || []).filter(s => s.quizCategory !== undefined);
    return { 
      total: quizScores.reduce((acc, s) => acc + (s.quiz || 0), 0), 
      completed: quizScores.length,
      bestDesbravadores: Math.max(0, ...quizScores.filter(s => s.quizCategory === 'Desbravadores').map(s => s.quiz || 0)),
      bestBiblia: Math.max(0, ...quizScores.filter(s => s.quizCategory === 'Bíblia').map(s => s.quiz || 0)),
      history: quizScores.slice().reverse() 
    };
  }, [currentMember]);

  const specialtyStudyStats = useMemo(() => {
    if (!currentMember) return { completed: 0, history: [] };
    const specialtyScores = (currentMember.scores || []).filter(s => s.specialtyStudyId !== undefined);
    return {
      completed: specialtyScores.length,
      history: specialtyScores.slice().reverse()
    };
  }, [currentMember]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const validAge = parseInt(formData.age as any);
    const updatedFormData = { ...formData, name: formData.name.trim(), age: isNaN(validAge) ? formData.age : validAge };

    let updatedMember: Member | undefined = undefined;
    if (currentMember) {
      updatedMember = {
        ...currentMember,
        name: updatedFormData.name,
        age: updatedFormData.age || 0,
        className: updatedFormData.className || '',
        unit: updatedFormData.unit || currentMember.unit,
        counselor: formData.role === UserRole.LEADERSHIP ? updatedFormData.funcao || currentMember.counselor : (updatedFormData.counselor || currentMember.counselor),
        photoUrl: updatedFormData.photoUrl,
        role: updatedFormData.role
      };
    }
    onUpdateUser(updatedFormData, updatedMember);
    setShowToast(true);
    setShowEditModal(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const inputClasses = "w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-slate-700 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-[#94a3b8] uppercase ml-2 tracking-widest mb-1.5 block";
  const isLeadership = formData.role === UserRole.LEADERSHIP;

  return (
    <div className="h-full overflow-y-auto pb-32 animate-in fade-in duration-500 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="px-4 pt-8 space-y-6">
        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 border border-green-500">
              <Check size={16} strokeWidth={4} /> Perfil Atualizado!
            </div>
          </div>
        )}

        {/* CABEÇALHO COM NOME E UNIDADE ABAIXO DA FOTO */}
        <div className="text-center py-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-[#0061f2] to-[#0052cc] rounded-[2.5rem] mx-auto flex items-center justify-center text-white border-4 border-white shadow-2xl overflow-hidden">
              {formData.photoUrl ? <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserIcon size={64} />}
            </div>
          </div>
          
          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-black text-[#0061f2] tracking-tight uppercase leading-tight">{formData.name}</h2>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <Shield size={12} className="text-slate-300" />
              {formData.unit || 'Sem Unidade'}
            </div>
          </div>
          
          {isLeadership && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button onClick={onGoToAdminManagement} className="w-full max-w-xs bg-white border-2 border-[#0061f2] text-[#0061f2] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:bg-[#0061f2] hover:text-white transition-all active:scale-95 inline-flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> GESTÃO ADMINISTRATIVA
              </button>
              
              <button 
                onClick={() => {
                  setFormData({ ...user });
                  setShowEditModal(true);
                }}
                className="w-full max-w-xs bg-[#0061f2] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-[#0052cc] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings size={16} /> EDITAR PERFIL
              </button>

              <button 
                onClick={onLogout}
                className="w-full max-w-xs bg-white border-2 border-red-100 text-red-500 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> SAIR DA CONTA
              </button>
            </div>
          )}

          {!isLeadership && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <button 
                onClick={() => {
                  setFormData({ ...user });
                  setShowEditModal(true);
                }}
                className="w-full max-w-xs bg-[#0061f2] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-[#0052cc] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings size={16} /> EDITAR PERFIL
              </button>

              <button 
                onClick={onLogout}
                className="w-full max-w-xs bg-white border-2 border-red-100 text-red-500 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> SAIR DA CONTA
              </button>
            </div>
          )}
        </div>

        {/* ESPECIALIDADES CONCLUÍDAS */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-8">
          <div className="flex items-center gap-3">
            <Medal className="text-amber-500" size={24} />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Especialidades Concluídas</h3>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center justify-center text-center">
            <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-2">Total de Especialidades</p>
            <p className="text-3xl font-black text-amber-600 mb-2">{specialtyStudyStats.completed}</p>
            <ShieldCheck size={20} className="text-amber-200" />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-2">Histórico de Estudos</p>
            {specialtyStudyStats.history.length > 0 ? (
              <div className="space-y-3">
                {specialtyStudyStats.history.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-[11px] font-black text-slate-700 uppercase truncate mb-0.5">
                        {s.specialtyStudyName || 'Especialidade'}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.date}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl font-black text-xs ${Number(s.specialtyStudyScore) >= 7 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {s.specialtyStudyScore}/10
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma Especialidade Concluída</p>
              </div>
            )}
          </div>
        </div>

        {/* DESEMPENHO NO QUIZ - RESTAURADO COM MELHORES PONTUAÇÕES */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-blue-900/5 space-y-8">
          <div className="flex items-center gap-3">
            <Trophy className="text-[#FFD700]" size={24} />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Desempenho no Quiz</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f0f7ff] p-6 rounded-[2rem] border border-blue-50 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Pontos Totais</p>
              <p className="text-3xl font-black text-[#0061f2] mb-2">{quizStats.total}</p>
              <Medal size={20} className="text-blue-200" />
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Quizzes</p>
              <p className="text-3xl font-black text-slate-700 mb-2">{quizStats.completed}</p>
              <BookOpen size={20} className="text-slate-200" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-2">Melhores Pontuações</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/50 p-5 rounded-[2rem] border border-amber-100 flex flex-col">
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Desbravadores</p>
                <p className="text-2xl font-black text-amber-700">{quizStats.bestDesbravadores} pts</p>
              </div>
              <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100 flex flex-col">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Bíblia</p>
                <p className="text-2xl font-black text-blue-700">{quizStats.bestBiblia} pts</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-2">Histórico Recente</p>
            {quizStats.history.length > 0 ? (
              <div className="space-y-3">
                {quizStats.history.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <p className="text-[11px] font-black text-slate-600 uppercase">{s.quizCategory} • {s.date}</p>
                    </div>
                    <p className="text-sm font-black text-[#0061f2]">+{s.quiz} pts</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum Registro de Quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center py-10 opacity-20"><p className="text-[8px] font-black uppercase tracking-[0.5em]">v2.2.3 • Seção Restaurada</p></div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false);
                setFormData({ ...user }); // Reset on close
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0061f2] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Settings size={20} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Editar Perfil</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({ ...user }); // Reset on close
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {/* FOTO NO MODAL */}
                <div className="text-center">
                  <div className="relative inline-block group">
                    <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-gradient-to-br from-[#0061f2] to-[#0052cc] rounded-[2.5rem] mx-auto flex items-center justify-center text-white border-4 border-white shadow-2xl cursor-pointer overflow-hidden group-hover:opacity-90 transition-opacity">
                      {formData.photoUrl ? <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <UserIcon size={64} />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-[#FFD700] p-2.5 rounded-2xl border-4 border-white shadow-lg text-[#0061f2] hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </div>
                  <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Toque para alterar a foto</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Nome Completo</label>
                    <input className={inputClasses} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClasses}>Cargo</label>
                      <select className={`${inputClasses} appearance-none`} value={formData.role} onChange={e => {
                        const newRole = e.target.value as UserRole;
                        setFormData({ ...formData, role: newRole, funcao: '', unit: newRole === UserRole.LEADERSHIP ? UnitName.LIDERANCA : formData.unit, className: '' });
                      }}>
                        <option value={UserRole.PATHFINDER}>Desbravador</option>
                        <option value={UserRole.LEADERSHIP}>Liderança</option>
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                      <label className={labelClasses}>Função</label>
                      <select className={`${inputClasses} appearance-none`} value={formData.funcao || ''} onChange={e => setFormData({...formData, funcao: e.target.value})}>
                        <option value="" disabled>Selecionar</option>
                        {formData.role === UserRole.LEADERSHIP ? LEADERSHIP_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>) : PATHFINDER_ROLES.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Idade</label>
                      <input type="number" className={inputClasses} value={formData.age || ''} onChange={e => {
                        const val = parseInt(e.target.value);
                        const newAge = isNaN(val) ? 0 : val;
                        const newClass = formData.role === UserRole.PATHFINDER ? getClassByAge(newAge) : formData.className;
                        setFormData({...formData, age: newAge, className: newClass});
                      }} />
                    </div>
                    <div className="relative">
                      <label className={labelClasses}>Classe</label>
                      {isLeadership ? (
                        <>
                          <select className={`${inputClasses} appearance-none`} value={formData.className || ''} onChange={e => setFormData({...formData, className: e.target.value})}>
                            <option value="">Nenhuma</option>
                            {LEADERSHIP_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                        </>
                      ) : (
                        <div className={`${inputClasses} bg-slate-50/50 flex items-center`}><span className="truncate">{getClassByAge(formData.age || 0)}</span></div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClasses}>Unidade</label>
                      <select className={`${inputClasses} appearance-none`} value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value as UnitName})}>
                        <option value={UnitName.AGUIA_DOURADA}>Águia Dourada</option>
                        <option value={UnitName.GUERREIROS}>Guerreiros</option>
                        <option value={UnitName.LIDERANCA}>Liderança</option>
                      </select>
                      <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative">
                       <label className={labelClasses}>{isLeadership ? 'Setor' : 'Conselheiro(a)'}</label>
                       {isLeadership ? ( <input className={inputClasses} value="Diretoria" readOnly /> ) : (
                         <>
                           <select className={`${inputClasses} appearance-none`} value={formData.counselor || ''} onChange={e => setFormData({...formData, counselor: e.target.value})}>
                             <option value="" disabled>Selecionar</option>
                             {counselorList.map(name => <option key={name} value={name}>{name}</option>)}
                           </select>
                           <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={18} />
                         </>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button onClick={handleSave} className="w-full bg-[#0061f2] text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs border-b-4 border-blue-800">
                  <Save size={18} /> SALVAR ALTERAÇÕES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
