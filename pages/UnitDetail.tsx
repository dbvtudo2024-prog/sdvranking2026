
import React, { useState, useRef, useMemo } from 'react';
import { UnitName, Member, UserRole, Score } from '../types';
import { getClassByAge, SCORE_CATEGORIES, UNIT_LOGOS } from '../constants';
import { ArrowLeft, Trash2, Edit2, X, PlusCircle, Check, History, Calendar, Shield, LogOut, Plus, Camera, ChevronDown } from 'lucide-react';

interface UnitDetailProps {
  unitName: UnitName;
  members: Member[];
  onBack: () => void;
  onLogout: () => void;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  role: UserRole;
  userName?: string;
  counselorList?: string[];
}

const UnitDetail: React.FC<UnitDetailProps> = ({ 
  unitName, 
  members, 
  onBack, 
  onLogout,
  onAddMember, 
  onUpdateMember, 
  onDeleteMember,
  role,
  userName = "Usuário",
  counselorList = []
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberForPoints, setSelectedMemberForPoints] = useState<Member | null>(null);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<Member | null>(null);
  const [newScore, setNewScore] = useState<Partial<Score>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [editingScoreIndex, setEditingScoreIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: 10,
    joinedAt: new Date().toISOString().split('T')[0],
    counselor: '',
    photoUrl: ''
  });

  const isLiderancaUnit = unitName === UnitName.LIDERANCA;

  const filteredMembers = useMemo(() => {
    if (isLiderancaUnit) {
      return (members || []).filter(m => m.role === UserRole.LEADERSHIP);
    }
    return (members || []).filter(m => m.role === UserRole.PATHFINDER);
  }, [members, isLiderancaUnit]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (isEdit && editingMember) {
          setEditingMember({ ...editingMember, photoUrl: url });
        } else {
          setFormData(prev => ({ ...prev, photoUrl: url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      role: isLiderancaUnit ? UserRole.LEADERSHIP : UserRole.PATHFINDER,
      age: formData.age,
      className: isLiderancaUnit ? '' : getClassByAge(formData.age), // Inicia vazio para liderança
      joinedAt: formData.joinedAt,
      counselor: formData.counselor || (isLiderancaUnit ? 'Liderança' : 'Nenhum'),
      unit: unitName,
      scores: [],
      photoUrl: formData.photoUrl
    };
    onAddMember(newMember);
    setShowAddModal(false);
    setFormData({ name: '', age: 10, joinedAt: new Date().toISOString().split('T')[0], counselor: '', photoUrl: '' });
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setIsEditing(false);
    setEditingMember(null);
  };

  const handleSaveScore = () => {
    if (!selectedMemberForPoints) return;
    
    let finalDate = newScore.date || new Date().toLocaleDateString('pt-BR');
    if (finalDate.includes('-')) {
      finalDate = finalDate.split('-').reverse().join('/');
    }

    const scoreEntry: Score = {
      date: finalDate,
      punctuality: newScore.punctuality || 0,
      uniform: newScore.uniform || 0,
      material: newScore.material || 0,
      bible: newScore.bible || 0,
      voluntariness: newScore.voluntariness || 0,
      activities: newScore.activities || 0,
      treasury: newScore.treasury || 0,
      quiz: newScore.quiz,
      quizCategory: newScore.quizCategory,
      memoryGame: newScore.memoryGame,
      specialtyGame: newScore.specialtyGame
    };

    let updatedScores = [...(selectedMemberForPoints.scores || [])];
    if (editingScoreIndex !== null) {
      updatedScores[editingScoreIndex] = scoreEntry;
    } else {
      updatedScores.push(scoreEntry);
    }

    const updated = {
      ...selectedMemberForPoints,
      scores: updatedScores
    };

    onUpdateMember(updated);
    setSelectedMemberForPoints(null);
    setEditingScoreIndex(null);
    setNewScore({ date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteScore = (member: Member, index: number) => {
    if (!confirm('Deseja excluir esta pontuação permanentemente?')) return;
    const currentScores = Array.isArray(member.scores) ? member.scores : [];
    const updatedScores = currentScores.filter((_, i) => i !== index);
    const updated = { ...member, scores: updatedScores };
    onUpdateMember(updated);
    setSelectedMemberForHistory(updated);
  };

  const handleEditScoreInit = (member: Member, index: number) => {
    const currentScores = Array.isArray(member.scores) ? member.scores : [];
    const scoreToEdit = currentScores[index];
    if (!scoreToEdit) return;

    let isoDate = scoreToEdit.date;
    if (isoDate.includes('/')) {
      isoDate = isoDate.split('/').reverse().join('-');
    }

    setSelectedMemberForHistory(null);
    setSelectedMemberForPoints(member);
    setNewScore({ ...scoreToEdit, date: isoDate });
    setEditingScoreIndex(index);
  };

  const calculateTotal = (member: Member) => {
    const currentScores = Array.isArray(member.scores) ? member.scores : [];
    return currentScores.reduce((acc, curr) => {
      return acc + 
        (curr.punctuality || 0) + 
        (curr.uniform || 0) + 
        (curr.material || 0) + 
        (curr.bible || 0) + 
        (curr.voluntariness || 0) + 
        (curr.activities || 0) + 
        (curr.treasury || 0) +
        (curr.quiz || 0) +
        (curr.memoryGame || 0) +
        (curr.specialtyGame || 0);
    }, 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '---';
      if (dateStr.includes('/')) return dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const labelClasses = "text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest mb-1.5 block";
  const inputClasses = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-[#0061f2] font-bold appearance-none";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-[#0061f2] px-6 h-24 flex items-center justify-between shadow-lg z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button onClick={onBack} className="text-white active:scale-90 transition-transform flex-shrink-0 p-2">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-white leading-tight truncate">{unitName}</h2>
            <p className="text-[10px] sm:text-xs text-white/80 font-bold uppercase truncate">
              {userName} • {role}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 text-white active:scale-90 transition-transform p-3 hover:bg-white/20 rounded-2xl flex-shrink-0 ml-2"
        >
          <LogOut size={20} strokeWidth={2.5} className="rotate-180" />
          <span className="font-bold text-xs sm:text-sm">Sair</span>
        </button>
      </div>

      <div className="p-4 sm:p-8 lg:p-12 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm min-h-[80px]">
          <div className="flex items-center gap-4 text-slate-400 px-2">
            {UNIT_LOGOS[unitName] && (
              <img 
                src={UNIT_LOGOS[unitName]} 
                alt="Brasão Unidade" 
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-md" 
              />
            )}
            <span className="font-black text-base sm:text-xl text-slate-600">{filteredMembers.length} {isLiderancaUnit ? 'Líderes' : 'Desbravadores'}</span>
          </div>
          {role === UserRole.LEADERSHIP && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#0061f2] text-white p-3 sm:p-4 rounded-full sm:rounded-2xl font-black flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              title="Adicionar Membro"
            >
              <Plus size={24} strokeWidth={3} />
              <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-widest">ADICIONAR</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {filteredMembers.map(member => (
            <div 
              key={member.id}
              onClick={() => role === UserRole.LEADERSHIP && setSelectedMemberForPoints(member)}
              className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1 pr-14">
                  <h3 className="text-xl font-black text-slate-800 truncate">{member.name}</h3>
                  <p className="text-sm text-slate-500 font-bold mb-4">
                    {member.age} anos • {member.className || '---'}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Shield size={14} className="opacity-50 flex-shrink-0" />
                      {/* Corrigida exibição: se for líder, mostra o Cargo salvo em counselor */}
                      <span className="text-[10px] sm:text-xs font-bold truncate">
                        {isLiderancaUnit ? `Cargo: ${member.counselor}` : `Cons: ${member.counselor}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} className="opacity-50 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs font-bold truncate">{formatDate(member.joinedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 right-6">
                  <div className="bg-[#FFD700] text-[#003366] px-5 py-2 rounded-full font-black text-xs sm:text-sm shadow-lg shadow-yellow-500/20 border-2 border-white">
                    {calculateTotal(member)} pts
                  </div>
                </div>

                <div className="absolute bottom-5 right-6 flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedMemberForHistory(member); }}
                    className="p-2 text-slate-300 hover:text-[#0061f2] transition-all active:scale-90"
                    title="Histórico"
                  >
                    <History size={20} />
                  </button>
                  {role === UserRole.LEADERSHIP && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingMember(member); setIsEditing(true); }}
                        className="p-2 text-slate-300 hover:text-[#0061f2] transition-all active:scale-90"
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Excluir membro?')) onDeleteMember(member.id); }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-all active:scale-90"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(showAddModal || isEditing) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[3rem] p-8 sm:p-12 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-[#0061f2] uppercase tracking-tight">
                {isEditing ? 'Editar Perfil' : 'Novo Membro'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setIsEditing(false); }} className="text-slate-400 p-2"><X size={28} /></button>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer overflow-hidden relative group"
              >
                {(isEditing ? editingMember?.photoUrl : formData.photoUrl) ? (
                  <img src={isEditing ? editingMember?.photoUrl : formData.photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-slate-400 group-hover:text-[#0061f2] transition-colors" />
                )}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alterar foto</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, isEditing)} />
            </div>

            <form onSubmit={isEditing ? handleUpdateMember : handleAddMember} className="space-y-5">
              <div>
                <label className={labelClasses}>Nome Completo</label>
                <input required className={inputClasses} value={isEditing ? editingMember?.name : formData.name} onChange={e => isEditing ? setEditingMember({...editingMember!, name: e.target.value}) : setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Idade</label>
                  <input type="number" min="10" max="60" required className={inputClasses} value={isEditing ? editingMember?.age : formData.age} onChange={e => {
                    const age = parseInt(e.target.value);
                    if (isEditing) setEditingMember({...editingMember!, age, className: isLiderancaUnit ? editingMember?.className : getClassByAge(age)});
                    else setFormData({...formData, age});
                  }} />
                </div>
                <div>
                  <label className={labelClasses}>Classe / Cargo</label>
                  <input readOnly className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 font-bold" value={isLiderancaUnit ? (isEditing ? (editingMember?.className || '---') : 'Liderança') : getClassByAge(isEditing ? (editingMember?.age || 10) : formData.age)} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Data de Entrada</label>
                <input type="date" required className={inputClasses} value={isEditing ? editingMember?.joinedAt : formData.joinedAt} onChange={e => isEditing ? setEditingMember({...editingMember!, joinedAt: e.target.value}) : setFormData({...formData, joinedAt: e.target.value})} />
              </div>
              {/* Para líderes cadastrados manualmente, o campo 'counselor' serve como cargo */}
              <div className="relative">
                <label className={labelClasses}>{isLiderancaUnit ? 'Cargo / Função' : 'Conselheiro(a)'}</label>
                {isLiderancaUnit ? (
                   <input required className={inputClasses} value={isEditing ? editingMember?.counselor : formData.counselor} onChange={e => isEditing ? setEditingMember({...editingMember!, counselor: e.target.value}) : setFormData({...formData, counselor: e.target.value})} placeholder="Ex: Diretor, Secretário..." />
                ) : (
                  <>
                    <select 
                      required 
                      className={inputClasses} 
                      value={isEditing ? editingMember?.counselor : formData.counselor} 
                      onChange={e => isEditing ? setEditingMember({...editingMember!, counselor: e.target.value}) : setFormData({...formData, counselor: e.target.value})}
                    >
                      <option value="" disabled>Selecionar Conselheiro</option>
                      {(counselorList || []).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 bottom-4 text-slate-400 pointer-events-none" size={20} />
                  </>
                )}
              </div>
              <button type="submit" className="w-full bg-[#0061f2] text-white py-5 px-4 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm mt-4">
                {isEditing ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedMemberForPoints && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl h-[90vh] rounded-t-[3.5rem] p-6 sm:p-10 overflow-y-auto shadow-2xl border-t border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                   {selectedMemberForPoints.photoUrl ? (
                     <img src={selectedMemberForPoints.photoUrl} className="w-full h-full object-cover" />
                   ) : (
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMemberForPoints.id}`} alt="Avatar" className="w-full h-full object-cover" />
                   )}
                 </div>
                 <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    {editingScoreIndex !== null ? 'Corrigir Pontos' : 'Lançar Pontos'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest">{selectedMemberForPoints.name}</p>
                 </div>
              </div>
              <button onClick={() => { setSelectedMemberForPoints(null); setEditingScoreIndex(null); setNewScore({ date: new Date().toISOString().split('T')[0] }); }} className="p-2 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-4 shadow-inner mb-8">
                <div>
                  <label className={labelClasses}>Data da Atividade</label>
                  <input 
                    type="date" 
                    className={inputClasses} 
                    value={newScore.date} 
                    onChange={e => setNewScore(prev => ({...prev, date: e.target.value}))} 
                  />
                </div>

                <h4 className="font-black text-[#0061f2] text-[10px] uppercase tracking-widest flex items-center gap-2 mt-6 mb-2">
                  <PlusCircle size={18} />
                  CRITÉRIOS DE ATIVIDADE
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1">
                  {SCORE_CATEGORIES.filter(cat => cat.id !== 'quiz' && cat.id !== 'memoryGame' && cat.id !== 'specialtyGame').map(cat => (
                    <div key={cat.id} className="flex items-center justify-between py-1.5 border-b border-slate-200/50">
                      <span className="text-xs sm:text-sm font-bold text-slate-600">{cat.label}</span>
                      <div className="flex items-center gap-3">
                         <button 
                          onClick={() => setNewScore(prev => ({...prev, [cat.id]: Math.max(0, (prev[cat.id as keyof Score] as number || 0) - 10)}))}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl font-black text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm active:scale-90 text-sm">-</button>
                         <span className="w-8 text-center font-black text-[#0061f2] text-lg">{(newScore[cat.id as keyof Score] as number) || 0}</span>
                         <button 
                          onClick={() => setNewScore(prev => ({...prev, [cat.id]: (prev[cat.id as keyof Score] as number || 0) + 10}))}
                          className="w-10 h-10 flex items-center justify-center bg-[#FFD700] rounded-xl font-black text-[#003366] hover:brightness-110 shadow-sm active:scale-90 text-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleSaveScore}
                  className="w-full bg-[#0061f2] text-white py-5 px-4 rounded-[3rem] font-black flex items-center justify-center gap-4 hover:bg-[#0052cc] active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/30 mt-6 uppercase tracking-[0.2em] text-xs sm:text-sm"
                >
                  <Check size={24} strokeWidth={3} /> {editingScoreIndex !== null ? 'ATUALIZAR' : 'CONFIRMAR LANÇAMENTO'}
                </button>
            </div>
          </div>
        </div>
      )}

      {selectedMemberForHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-t-[3.5rem] p-8 sm:p-12 overflow-y-auto shadow-2xl border-t border-slate-100">
            <div className="flex justify-between items-start mb-10 sticky top-0 bg-white pb-6 z-10">
              <div className="flex gap-4 items-center">
                 <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 flex-shrink-0">
                    <History size={32} />
                 </div>
                 <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">Histórico</h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest">{selectedMemberForHistory.name}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedMemberForHistory(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><X size={28} /></button>
            </div>

            <div className="space-y-6 pb-20">
              {(selectedMemberForHistory.scores || []).length === 0 && (
                <div className="text-center py-20 text-slate-300">
                  <p className="font-bold italic">Nenhum ponto registrado.</p>
                </div>
              )}
              {(selectedMemberForHistory.scores || [])
                .slice()
                .reverse()
                .map((s, idx) => {
                  const originalIndex = selectedMemberForHistory.scores.indexOf(s);
                  const total = (s.punctuality || 0) + (s.uniform || 0) + (s.material || 0) + (s.bible || 0) + (s.voluntariness || 0) + (s.activities || 0) + (s.treasury || 0) + (s.quiz || 0) + (s.memoryGame || 0) + (s.specialtyGame || 0);
                  
                  return (
                    <div key={idx} className="p-8 border border-slate-100 rounded-[3rem] bg-slate-50/50 space-y-6 shadow-sm relative overflow-hidden group">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-3">
                           <Calendar size={18} className="text-blue-500" />
                           Atividade • {s.date}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="bg-[#0061f2] text-white px-5 py-2 rounded-full font-black text-xs sm:text-sm">
                            +{total} pts
                          </span>
                          {role === UserRole.LEADERSHIP && (
                            <div className="flex gap-2">
                               <button onClick={() => handleEditScoreInit(selectedMemberForHistory, originalIndex)} className="p-2.5 bg-white text-slate-400 hover:text-blue-500 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90">
                                  <Edit2 size={16} />
                               </button>
                               <button onClick={() => handleDeleteScore(selectedMemberForHistory, originalIndex)} className="p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-200/50">
                        <p className="flex justify-between">PONT: <span className="text-[#0061f2] font-black">{s.punctuality}</span></p>
                        <p className="flex justify-between">UNIF: <span className="text-[#0061f2] font-black">{s.uniform}</span></p>
                        <p className="flex justify-between">MAT: <span className="text-[#0061f2] font-black">{s.material}</span></p>
                        <p className="flex justify-between">BÍB: <span className="text-[#0061f2] font-black">{s.bible}</span></p>
                        <p className="flex justify-between">VOL: <span className="text-[#0061f2] font-black">{s.voluntariness}</span></p>
                        <p className="flex justify-between">ATIV: <span className="text-[#0061f2] font-black">{s.activities}</span></p>
                        <p className="flex justify-between">TESO: <span className="text-[#0061f2] font-black">{s.treasury}</span></p>
                        {s.quiz !== undefined && <p className="flex justify-between text-blue-600">QUIZ: <span className="font-black">{s.quiz}</span></p>}
                        {s.memoryGame !== undefined && <p className="flex justify-between text-blue-600">MEM: <span className="font-black">{s.memoryGame}</span></p>}
                        {s.specialtyGame !== undefined && <p className="flex justify-between text-blue-600">ESP: <span className="font-black">{s.specialtyGame}</span></p>}
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDetail;
