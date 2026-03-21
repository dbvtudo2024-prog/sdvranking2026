
import React, { useState, useRef, useMemo } from 'react';
import { UnitName, Member, UserRole, Score } from '@/types';
import { getClassByAge, SCORE_CATEGORIES, UNIT_LOGOS, LEADERSHIP_CLASSES, LEADERSHIP_ROLES, PATHFINDER_CLASSES } from '@/constants';
import { Trash2, Edit2, X, History, Plus, Minus, Camera, ChevronDown, Check, Calendar } from 'lucide-react';

interface UnitDetailProps {
  unitName: UnitName;
  members: Member[];
  onBack: () => void;
  onLogout: () => void;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string | number) => void;
  role: UserRole;
  userName?: string;
  counselorList?: string[];
  isDarkMode?: boolean;
}

const UnitDetail: React.FC<UnitDetailProps> = ({ 
  unitName, 
  members, 
  onAddMember, 
  onUpdateMember, 
  onDeleteMember,
  role,
  counselorList = [],
  isDarkMode
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberForPoints, setSelectedMemberForPoints] = useState<Member | null>(null);
  const [selectedMemberIdForHistory, setSelectedMemberIdForHistory] = useState<string | null>(null);
  const [newScore, setNewScore] = useState<Partial<Score>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [editingScoreIndex, setEditingScoreIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLiderancaUnit = unitName === UnitName.LIDERANCA;
  const isUserLeadership = role === UserRole.LEADERSHIP;

  const [formData, setFormData] = useState({
    name: '',
    age: isLiderancaUnit ? 16 : 10,
    className: '',
    joinedAt: new Date().toISOString().split('T')[0],
    counselor: '',
    photoUrl: ''
  });

  const filteredMembers = useMemo(() => {
    return (members || []).filter(m => m.unit === unitName);
  }, [members, unitName]);

  const historyMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberIdForHistory);
  }, [members, selectedMemberIdForHistory]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (isEdit && editingMember) setEditingMember({ ...editingMember, photoUrl: url });
        else setFormData(prev => ({ ...prev, photoUrl: url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Digite o nome do membro.');
    if (!formData.className) return alert('Escolha uma classe.');
    if (!formData.counselor) return alert(`Escolha a ${isLiderancaUnit ? 'função' : 'conselheiro'}.`);

    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      role: isLiderancaUnit ? UserRole.LEADERSHIP : UserRole.PATHFINDER,
      age: formData.age,
      className: formData.className, 
      joinedAt: formData.joinedAt,
      counselor: formData.counselor,
      unit: unitName,
      scores: [],
      photoUrl: formData.photoUrl
    };
    onAddMember(newMember);
    setShowAddModal(false);
    setFormData({ 
      name: '', 
      age: isLiderancaUnit ? 16 : 10, 
      className: '', 
      joinedAt: new Date().toISOString().split('T')[0], 
      counselor: '', 
      photoUrl: '' 
    });
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setIsEditing(false);
    setEditingMember(null);
    setShowAddModal(false);
  };

  const adjustPoints = (id: string, delta: number) => {
    setNewScore(prev => {
      const currentVal = (prev[id as keyof Score] as number) || 0;
      const step = 10;
      return { ...prev, [id]: Math.max(0, currentVal + (delta * step)) };
    });
  };

  const handleSaveScore = () => {
    if (!selectedMemberForPoints) return;
    let finalDate = newScore.date || new Date().toLocaleDateString('pt-BR');
    if (finalDate.includes('-')) finalDate = finalDate.split('-').reverse().join('/');
    
    // Bloqueio de data duplicada (Exceto se estiver editando a mesma entrada)
    const dateAlreadyExists = selectedMemberForPoints.scores.some((s, idx) => 
      s.date === finalDate && (editingScoreIndex === null || idx !== editingScoreIndex)
    );
    if (dateAlreadyExists) return alert(`Já existe pontuação lançada na data ${finalDate}.`);

    const scoreEntry: Score = {
      date: finalDate,
      punctuality: Number(newScore.punctuality) || 0,
      uniform: Number(newScore.uniform) || 0,
      material: Number(newScore.material) || 0,
      bible: Number(newScore.bible) || 0,
      voluntariness: Number(newScore.voluntariness) || 0,
      activities: Number(newScore.activities) || 0,
      treasury: Number(newScore.treasury) || 0,
    };

    let updatedScores = [...selectedMemberForPoints.scores];
    if (editingScoreIndex !== null) {
      updatedScores[editingScoreIndex] = scoreEntry;
    } else {
      updatedScores.push(scoreEntry);
    }

    onUpdateMember({ ...selectedMemberForPoints, scores: updatedScores });
    setSelectedMemberForPoints(null);
    setEditingScoreIndex(null);
    setNewScore({ date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteScore = (member: Member, index: number) => {
    if (!confirm('Deseja excluir esta pontuação permanentemente?')) return;
    const updatedScores = member.scores.filter((_, i) => i !== index);
    onUpdateMember({ ...member, scores: updatedScores });
  };

  const handleEditScore = (member: Member, index: number) => {
    const scoreToEdit = member.scores[index];
    // Converte data DD/MM/AAAA para AAAA-MM-DD para o input
    const [d, m, y] = scoreToEdit.date.split('/');
    const dateForInput = `${y}-${m}-${d}`;
    
    setNewScore({ ...scoreToEdit, date: dateForInput });
    setEditingScoreIndex(index);
    setSelectedMemberForPoints(member);
    setSelectedMemberIdForHistory(null); // Fecha o histórico
  };

  const calculateWeeklyTotal = (member: Member) => {
    if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
    return member.scores.reduce((acc, curr) => {
      return acc + 
        (Number(curr.punctuality) || 0) + 
        (Number(curr.uniform) || 0) + 
        (Number(curr.material) || 0) + 
        (Number(curr.bible) || 0) + 
        (Number(curr.voluntariness) || 0) + 
        (Number(curr.activities) || 0) + 
        (Number(curr.treasury) || 0);
    }, 0);
  };

  const calculateScoreTotal = (s: Score) => (Number(s.punctuality) || 0) + (Number(s.uniform) || 0) + (Number(s.material) || 0) + (Number(s.bible) || 0) + (Number(s.voluntariness) || 0) + (Number(s.activities) || 0) + (Number(s.treasury) || 0);

  const labelClasses = "text-[12px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5 block ml-1";
  const inputClasses = "w-full p-3.5 bg-white dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-700 rounded-[0.8rem] text-[#1e293b] dark:text-slate-100 outline-none focus:border-[#2563eb] font-semibold transition-all text-sm shadow-sm";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-y-auto">
      <div className="p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8 bg-white/50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm min-h-[80px]">
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 px-2">
            <img src={UNIT_LOGOS[unitName]} alt="Brasão" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            <span className="font-black text-base sm:text-xl text-slate-600 dark:text-slate-300">{filteredMembers.length} {isLiderancaUnit ? 'Líderes' : 'Desbravadores'}</span>
          </div>
          {isUserLeadership && (
            <button onClick={() => { setIsEditing(false); setEditingMember(null); setShowAddModal(true); }} className="bg-[#0061f2] text-white p-4 rounded-full sm:rounded-2xl font-black shadow-xl active:scale-95 transition-all">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredMembers.map(member => (
            <div key={member.id} onClick={() => isUserLeadership && setSelectedMemberForPoints(member)} className="bg-white dark:bg-slate-800 p-6 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group">
              <div className="flex gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 pt-1 pr-14">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight mb-1">{member.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase">{member.age} anos • {member.className || 'Liderança'}</p>
                  <p className="text-[10px] text-[#0061f2] font-black uppercase tracking-wider mb-4">
                    {isLiderancaUnit ? member.counselor : (member.counselor ? `Conselheiro: ${member.counselor}` : 'Sem Conselheiro')}
                  </p>
                </div>
                <div className="absolute top-6 right-6 font-black text-[#0061f2] text-lg">
                   {calculateWeeklyTotal(member)} pts
                </div>
                <div className="absolute bottom-5 right-6 flex gap-1">
                   <button onClick={(e) => { e.stopPropagation(); setSelectedMemberIdForHistory(member.id); }} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><History size={18} /></button>
                   {isUserLeadership && (
                     <>
                       <button onClick={(e) => { e.stopPropagation(); setEditingMember(member); setIsEditing(true); setShowAddModal(true); }} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Edit2 size={18} /></button>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm(`Deseja excluir ${member.name}?`)) onDeleteMember(member.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                     </>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PONTOS */}
      {selectedMemberForPoints && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0061f2] uppercase tracking-tight">
                {editingScoreIndex !== null ? 'Editar Pontos' : 'Lançar Pontos'}
              </h3>
              <button onClick={() => { setSelectedMemberForPoints(null); setEditingScoreIndex(null); setNewScore({ date: new Date().toISOString().split('T')[0] }); }} className="text-slate-300 hover:text-slate-500"><X size={28} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Data da Pontuação</label>
                <input type="date" className={inputClasses} value={newScore.date} onChange={e => setNewScore({...newScore, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SCORE_CATEGORIES.map(cat => (
                  <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{cat.label}</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => adjustPoints(cat.id, -1)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 active:scale-90"><Minus size={18} /></button>
                      <span className="w-12 text-center font-black text-lg text-[#0061f2]">{newScore[cat.id as keyof Score] || 0}</span>
                      <button onClick={() => adjustPoints(cat.id, 1)} className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[#0061f2] active:scale-90"><Plus size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveScore} className="w-full bg-[#0061f2] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2">
                <Check size={20} strokeWidth={3} /> {editingScoreIndex !== null ? 'ATUALIZAR PONTUAÇÃO' : 'SALVAR PONTUAÇÃO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO - AGORA COM EDIT/EXCLUIR */}
      {selectedMemberIdForHistory && historyMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img src={historyMember.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${historyMember.id}`} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black text-[#0f172a] dark:text-slate-100 uppercase truncate max-w-[200px]">{historyMember.name}</h3>
              </div>
              <button onClick={() => setSelectedMemberIdForHistory(null)} className="text-slate-300 hover:text-slate-500"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Histórico de Pontuações</p>
              {historyMember.scores.filter(s => calculateScoreTotal(s) > 0).length > 0 ? (
                [...historyMember.scores]
                  .filter(s => calculateScoreTotal(s) > 0)
                  .reverse()
                  .map((s, idx) => {
                    // Encontra o índice original para edição/exclusão correta
                    const originalIndex = historyMember.scores.findIndex(os => os === s);
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-5 rounded-[2rem] shadow-sm flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[#0061f2] uppercase">{s.date}</span>
                          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{calculateScoreTotal(s)} pts</span>
                        </div>
                        {isUserLeadership && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditScore(historyMember, originalIndex)} className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl active:scale-90 transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteScore(historyMember, originalIndex)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-xl active:scale-90 transition-all"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-20 opacity-30">
                  <History size={48} className="mx-auto mb-2" />
                  <p className="font-black uppercase tracking-widest text-xs">Sem histórico</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD/EDIT MEMBRO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0f172a] dark:text-slate-100">{isEditing ? 'Editar Membro' : 'Novo Membro'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={isEditing ? handleUpdateMemberSubmit : handleAddMemberSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-2 mb-2">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-28 h-28 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-900 relative group"
                >
                  {isEditing ? (
                    editingMember?.photoUrl ? <img src={editingMember.photoUrl} className="w-full h-full object-cover" /> : <Camera size={28} className="text-slate-400 dark:text-slate-600" />
                  ) : (
                    formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <Camera size={28} className="text-slate-400 dark:text-slate-600" />
                  )}
                  <input type="file" ref={fileInputRef} hidden onChange={(e) => handlePhotoUpload(e, isEditing)} accept="image/*" />
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Clique para alterar foto</p>
              </div>

              <div>
                <label className={labelClasses}>Nome Completo</label>
                <input 
                  required 
                  className={inputClasses} 
                  placeholder="Digite o nome" 
                  value={isEditing ? editingMember?.name : formData.name} 
                  onChange={e => isEditing ? setEditingMember({...editingMember!, name: e.target.value}) : setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Idade</label>
                  <div className="relative">
                    <select 
                      className={`${inputClasses} appearance-none`} 
                      value={isEditing ? editingMember?.age : formData.age} 
                      onChange={e => {
                        const age = parseInt(e.target.value);
                        if (!isLiderancaUnit) {
                          if (isEditing) setEditingMember({...editingMember!, age, className: getClassByAge(age)});
                          else setFormData({...formData, age, className: getClassByAge(age)});
                        } else {
                          if (isEditing) setEditingMember({...editingMember!, age});
                          else setFormData({...formData, age});
                        }
                      }}
                    >
                      {/* Liderança até 70 anos */}
                      {Array.from({length: isLiderancaUnit ? 55 : 6}, (_, i) => (isLiderancaUnit ? 16 : 10) + i).map(a => (
                        <option key={a} value={a}>{a} anos</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Classe</label>
                  <div className="relative">
                    <select 
                      className={`${inputClasses} appearance-none`} 
                      value={isEditing ? editingMember?.className : formData.className} 
                      onChange={e => isEditing ? setEditingMember({...editingMember!, className: e.target.value}) : setFormData({...formData, className: e.target.value})}
                    >
                      <option value="">Escolher Classe</option>
                      {isLiderancaUnit ? LEADERSHIP_CLASSES.map(c => <option key={c} value={c}>{c}</option>) : PATHFINDER_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Data de Entrada</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className={inputClasses} 
                    value={isEditing ? editingMember?.joinedAt : formData.joinedAt} 
                    onChange={e => isEditing ? setEditingMember({...editingMember!, joinedAt: e.target.value}) : setFormData({...formData, joinedAt: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{isLiderancaUnit ? 'Função' : 'Conselheiro'}</label>
                <div className="relative">
                  <select 
                    required 
                    className={`${inputClasses} appearance-none`} 
                    value={isEditing ? editingMember?.counselor : formData.counselor} 
                    onChange={e => isEditing ? setEditingMember({...editingMember!, counselor: e.target.value}) : setFormData({...formData, counselor: e.target.value})}
                  >
                    <option value="">Escolher {isLiderancaUnit ? 'Função' : 'Conselheiro'}</option>
                    {isLiderancaUnit ? LEADERSHIP_ROLES.map(r => <option key={r} value={r}>{r}</option>) : counselorList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#2563eb] text-white py-4 rounded-[0.8rem] font-bold text-sm shadow-lg hover:bg-blue-700 active:scale-95 transition-all mt-2"
              >
                {isEditing ? 'Atualizar Dados' : 'Adicionar Membro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDetail;
