
import React, { useState, useRef, useMemo } from 'react';
import { UnitName, Member, UserRole, Score } from '../types';
import { getClassByAge, SCORE_CATEGORIES, UNIT_LOGOS, LEADERSHIP_ROLES } from '../constants';
import { ArrowLeft, Trash2, Edit2, X, History, Shield, LogOut, Plus, Minus, Camera, ChevronDown, Award, Brain, Gamepad2, Sword } from 'lucide-react';

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

  const currentMemberInHistory = useMemo(() => {
    return members.find(m => m.id === selectedMemberIdForHistory) || null;
  }, [members, selectedMemberIdForHistory]);

  const dynamicCounselors = useMemo(() => {
    return members
      .filter(m => m.counselor === 'Conselheiro (a)' || m.counselor === 'Conselheiro (a) Associado (a)')
      .map(m => m.name)
      .sort();
  }, [members]);

  const [formData, setFormData] = useState({
    name: '',
    age: isLiderancaUnit ? 18 : 10,
    joinedAt: new Date().toISOString().split('T')[0],
    counselor: '',
    photoUrl: ''
  });

  const filteredMembers = useMemo(() => {
    return (members || []).filter(m => m.unit === unitName);
  }, [members, unitName]);

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

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Digite o nome do membro.');

    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      role: isLiderancaUnit ? UserRole.LEADERSHIP : UserRole.PATHFINDER,
      age: formData.age,
      className: isLiderancaUnit ? '' : getClassByAge(formData.age), 
      joinedAt: formData.joinedAt,
      counselor: formData.counselor || (isLiderancaUnit ? 'Liderança' : 'Nenhum'),
      unit: unitName,
      scores: [],
      photoUrl: formData.photoUrl
    };
    onAddMember(newMember);
    setShowAddModal(false);
    setFormData({ name: '', age: isLiderancaUnit ? 18 : 10, joinedAt: new Date().toISOString().split('T')[0], counselor: '', photoUrl: '' });
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setIsEditing(false);
    setEditingMember(null);
  };

  const handleEditScoreInit = (member: Member, index: number) => {
    const score = member.scores[index];
    let dateForInput = score.date;
    if (dateForInput.includes('/')) {
      const [d, m, y] = dateForInput.split('/');
      dateForInput = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    setNewScore({ ...score, date: dateForInput });
    setEditingScoreIndex(index);
    setSelectedMemberForPoints(member);
    setSelectedMemberIdForHistory(null);
  };

  const adjustPoints = (id: string, delta: number) => {
    setNewScore(prev => {
      const currentVal = (prev[id as keyof Score] as number) || 0;
      const newVal = Math.max(0, currentVal + delta);
      return { ...prev, [id]: newVal };
    });
  };

  const handleSaveScore = () => {
    if (!selectedMemberForPoints) return;
    let finalDate = newScore.date || new Date().toLocaleDateString('pt-BR');
    if (finalDate.includes('-')) {
      finalDate = finalDate.split('-').reverse().join('/');
    }
    const scoreEntry: Score = {
      date: finalDate,
      punctuality: Number(newScore.punctuality) || 0,
      uniform: Number(newScore.uniform) || 0,
      material: Number(newScore.material) || 0,
      bible: Number(newScore.bible) || 0,
      voluntariness: Number(newScore.voluntariness) || 0,
      activities: Number(newScore.activities) || 0,
      treasury: Number(newScore.treasury) || 0,
      quiz: Number(newScore.quiz) || 0,
      quizCategory: newScore.quizCategory,
      memoryGame: Number(newScore.memoryGame) || 0,
      specialtyGame: Number(newScore.specialtyGame) || 0,
      challenge1x1: Number(newScore.challenge1x1) || 0
    };
    let updatedScores = Array.isArray(selectedMemberForPoints.scores) ? [...selectedMemberForPoints.scores] : [];
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

  const calculateScoreTotal = (s: Score) => {
    const basicTotal = (Number(s.punctuality) || 0) + 
           (Number(s.uniform) || 0) + 
           (Number(s.material) || 0) + 
           (Number(s.bible) || 0) + 
           (Number(s.voluntariness) || 0) + 
           (Number(s.activities) || 0) + 
           (Number(s.treasury) || 0);

    if (isLiderancaUnit) return basicTotal;

    return basicTotal +
           (Number(s.quiz) || 0) +
           (Number(s.memoryGame) || 0) +
           (Number(s.specialtyGame) || 0) +
           (Number(s.challenge1x1) || 0);
  };

  const calculateWeeklyTotal = (member: Member) => {
    const currentScores = Array.isArray(member.scores) ? member.scores : [];
    return currentScores.reduce((acc, curr) => {
        return acc + (
            (Number(curr.punctuality) || 0) + 
            (Number(curr.uniform) || 0) + 
            (Number(curr.material) || 0) + 
            (Number(curr.bible) || 0) + 
            (Number(curr.voluntariness) || 0) + 
            (Number(curr.activities) || 0) + 
            (Number(curr.treasury) || 0)
        );
    }, 0);
  };

  const processedHistoryScores = useMemo(() => {
    if (!currentMemberInHistory) return [];
    
    let list = currentMemberInHistory.scores.map((s, idx) => ({ ...s, originalIndex: idx }));

    if (isLiderancaUnit) {
      list = list.filter(s => calculateScoreTotal(s) > 0);
      
      const grouped: Record<string, typeof list[0]> = {};
      list.forEach(item => {
        if (!grouped[item.date]) {
          grouped[item.date] = { ...item };
        } else {
          grouped[item.date].punctuality = (Number(grouped[item.date].punctuality) || 0) + (Number(item.punctuality) || 0);
          grouped[item.date].uniform = (Number(grouped[item.date].uniform) || 0) + (Number(item.uniform) || 0);
          grouped[item.date].material = (Number(grouped[item.date].material) || 0) + (Number(item.material) || 0);
          grouped[item.date].bible = (Number(grouped[item.date].bible) || 0) + (Number(item.bible) || 0);
          grouped[item.date].voluntariness = (Number(grouped[item.date].voluntariness) || 0) + (Number(item.voluntariness) || 0);
          grouped[item.date].activities = (Number(grouped[item.date].activities) || 0) + (Number(item.activities) || 0);
          grouped[item.date].treasury = (Number(grouped[item.date].treasury) || 0) + (Number(item.treasury) || 0);
        }
      });
      list = Object.values(grouped);
    }
    
    return list.sort((a,b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });
  }, [currentMemberInHistory, isLiderancaUnit]);

  const labelClasses = "text-[13px] font-bold text-slate-800 mb-1.5 block ml-1";
  const inputClasses = "w-full p-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] font-medium transition-all text-sm placeholder:text-slate-400";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-[#0061f2] px-6 h-24 flex items-center justify-between shadow-lg z-10 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button onClick={onBack} className="text-white active:scale-90 transition-transform flex-shrink-0 p-2">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black text-white leading-tight truncate">{unitName}</h2>
            <p className="text-[10px] sm:text-xs text-white/80 font-bold uppercase truncate">{userName} • {role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-white active:scale-90 transition-transform p-3 hover:bg-white/20 rounded-2xl flex-shrink-0 ml-2">
          <LogOut size={20} strokeWidth={2.5} className="rotate-180" />
          <span className="font-bold text-xs">Sair</span>
        </button>
      </div>

      <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm min-h-[80px]">
          <div className="flex items-center gap-4 text-slate-400 px-2">
            {UNIT_LOGOS[unitName] && <img src={UNIT_LOGOS[unitName]} alt="Brasão" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />}
            <span className="font-black text-base sm:text-xl text-slate-600">{filteredMembers.length} {isLiderancaUnit ? 'Líderes' : 'Desbravadores'}</span>
          </div>
          {isUserLeadership && (
            <button onClick={() => setShowAddModal(true)} className="bg-[#0061f2] text-white p-3 sm:p-4 rounded-full sm:rounded-2xl font-black flex items-center justify-center shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
              <Plus size={24} strokeWidth={3} />
              <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-widest">ADICIONAR</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {filteredMembers.map(member => (
            <div key={member.id} onClick={() => isUserLeadership && setSelectedMemberForPoints(member)} className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                  {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt="Avatar" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 pt-1 pr-14">
                  <h3 className="text-xl font-black text-slate-800 truncate">{member.name}</h3>
                  <p className="text-sm text-slate-500 font-bold mb-4">{member.age} anos • {member.className || 'Liderança'}</p>
                  <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-slate-400"><Shield size={14} className="opacity-50 flex-shrink-0" /><span className="text-[10px] font-bold truncate">{isLiderancaUnit ? 'Função' : 'Cons'}: {member.counselor}</span></div></div>
                </div>
                <div className="absolute top-6 right-6"><div className="bg-[#FFD700] text-[#003366] px-5 py-2 rounded-full font-black text-xs shadow-lg border-2 border-white">{calculateWeeklyTotal(member)} pts</div></div>
                <div className="absolute bottom-5 right-6 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedMemberIdForHistory(member.id); }} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><History size={20} /></button>
                  {isUserLeadership && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingMember(member); setIsEditing(true); }} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Edit2 size={20} /></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir membro?')) onDeleteMember(member.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-md rounded-[2rem] p-6 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-[22px] font-black text-[#0f172a] tracking-tight">Novo Membro</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddMemberSubmit} className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-32 h-32 rounded-full border-2 border-dashed border-[#cbd5e1] flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-[#f8fafc] group transition-colors hover:border-[#2563eb]"
                >
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={32} className="text-[#64748b] mb-1 group-hover:text-[#2563eb] transition-colors" />
                  )}
                  <input type="file" ref={fileInputRef} hidden onChange={(e) => handlePhotoUpload(e)} />
                </div>
                <p className="text-[12px] font-medium text-slate-500">Clique para adicionar foto</p>
              </div>

              <div>
                <label className={labelClasses}>Nome Completo</label>
                <input required className={inputClasses} placeholder="Digite o nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={labelClasses}>Idade</label>
                  <select 
                    className={`${inputClasses} appearance-none bg-no-repeat pr-10`}
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    value={formData.age} 
                    onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                  >
                    {isLiderancaUnit ? (
                      Array.from({ length: 50 }, (_, i) => i + 16).map(age => <option key={age} value={age}>{age}</option>)
                    ) : (
                      [10, 11, 12, 13, 14, 15].map(age => <option key={age} value={age}>{age}</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Classe</label>
                  <input 
                    readOnly 
                    className={`${inputClasses} bg-slate-50 text-slate-400 border-slate-100 cursor-default`} 
                    value={isLiderancaUnit ? 'Liderança' : (getClassByAge(formData.age) || 'Escolha idade')} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Data de Entrada</label>
                <div className="relative">
                   <input type="date" className={inputClasses} value={formData.joinedAt} onChange={e => setFormData({...formData, joinedAt: e.target.value})} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>{isLiderancaUnit ? 'Função' : 'Conselheiro'}</label>
                <div className="relative">
                  <select 
                    className={`${inputClasses} appearance-none pr-10`}
                    value={formData.counselor} 
                    onChange={e => setFormData({...formData, counselor: e.target.value})}
                  >
                    <option value="">{isLiderancaUnit ? 'Selecione a função' : 'Nome do conselheiro'}</option>
                    {isLiderancaUnit ? (
                      LEADERSHIP_ROLES.map(role => <option key={role} value={role}>{role}</option>)
                    ) : (
                      dynamicCounselors.map(c => <option key={c} value={c}>{c}</option>)
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#2563eb] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg active:scale-95 transition-all mt-4">
                Adicionar Membro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PONTUAR */}
      {selectedMemberForPoints && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-black text-[#0061f2] uppercase">Lançar Pontos</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedMemberForPoints.name}</p>
              </div>
              <button onClick={() => setSelectedMemberForPoints(null)} className="text-slate-300 hover:text-slate-500 transition-colors p-2">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Data do Lançamento</label>
                <input type="date" className={inputClasses} value={newScore.date} onChange={e => setNewScore({...newScore, date: e.target.value})} />
              </div>

              <div className="flex flex-col gap-2">
                {SCORE_CATEGORIES.map(cat => (
                  <div key={cat.id} className="bg-slate-50 py-2.5 px-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
                    <span className="font-black text-slate-700 uppercase text-[11px] tracking-tight">{cat.label}</span>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => adjustPoints(cat.id, -10)}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm active:scale-90 hover:border-[#0061f2] hover:text-[#0061f2] transition-all"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>
                      
                      <div className="w-10 text-center">
                        <span className="text-lg font-black text-[#0061f2]">{newScore[cat.id as keyof Score] || 0}</span>
                      </div>
                      
                      <button 
                        onClick={() => adjustPoints(cat.id, 10)}
                        className="w-9 h-9 rounded-full bg-[#0061f2] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSaveScore} 
                className="w-full bg-[#0061f2] text-white py-5 rounded-[2.5rem] font-black uppercase shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm tracking-widest border-b-4 border-blue-800"
              >
                SALVAR PONTUAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO - LIDERANÇA FILTRADA SEM CARGO */}
      {currentMemberInHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-[#0061f2] uppercase tracking-tight">
                  {isLiderancaUnit ? 'HISTÓRICO - LIDERANÇA' : 'HISTÓRICO DE PONTOS'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[250px]">
                  {currentMemberInHistory.name}
                </p>
              </div>
              <button onClick={() => setSelectedMemberIdForHistory(null)} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                <X size={28} />
              </button>
            </div>
            
            <div className="space-y-4">
              {processedHistoryScores.length > 0 ? (
                processedHistoryScores.map((s, i) => {
                  const totalScore = calculateScoreTotal(s);
                  const hasGames = !isLiderancaUnit && !!(s.quiz || s.memoryGame || s.specialtyGame || s.challenge1x1);

                  return (
                    <div key={`${currentMemberInHistory.id}-${s.date}-${i}`} className="bg-[#f8fafc] py-5 px-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                      {hasGames && (
                          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-20"></div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-slate-800">{s.date}</p>
                          </div>
                          <p className="text-xl font-black text-[#0061f2] uppercase tracking-tight mt-1">
                            {totalScore} <span className="text-[10px]">PONTOS ADICIONADOS</span>
                          </p>
                        </div>
                        {isUserLeadership && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditScoreInit(currentMemberInHistory, s.originalIndex)} 
                              className="p-3 text-[#0061f2] hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation();
                                if(confirm('Excluir este registro permanentemente?')) {
                                  const updatedScores = [...currentMemberInHistory.scores].filter((_, idx) => idx !== s.originalIndex);
                                  onUpdateMember({ ...currentMemberInHistory, scores: updatedScores }); 
                                }
                              }} 
                              className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                        {Number(s.punctuality) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Pontualidade: {s.punctuality}</span>}
                        {Number(s.uniform) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Uniforme: {s.uniform}</span>}
                        {Number(s.material) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Material: {s.material}</span>}
                        {Number(s.bible) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Bíblia: {s.bible}</span>}
                        {Number(s.voluntariness) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Voluntariedade: {s.voluntariness}</span>}
                        {Number(s.activities) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Atividades: {s.activities}</span>}
                        {Number(s.treasury) > 0 && <span className="text-[9px] bg-white border border-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black">Tesouraria: {s.treasury}</span>}
                        
                        {!isLiderancaUnit && (
                          <>
                            {Number(s.quiz) > 0 && (
                                <span className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1">
                                    <Brain size={10} /> Quiz {s.quizCategory}: {s.quiz}
                                </span>
                            )}
                            {Number(s.memoryGame) > 0 && (
                                <span className="text-[9px] bg-blue-400 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1">
                                    <Gamepad2 size={10} /> Memória: {s.memoryGame}
                                </span>
                            )}
                            {Number(s.specialtyGame) > 0 && (
                                <span className="text-[9px] bg-amber-500 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1">
                                    <Award size={10} /> Especialidade: {s.specialtyGame}
                                </span>
                            )}
                            {Number(s.challenge1x1) > 0 && (
                                <span className="text-[9px] bg-red-500 text-white px-3 py-1.5 rounded-full font-black flex items-center gap-1">
                                    <Sword size={10} /> Duelo 1x1: {s.challenge1x1}
                                </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] italic">Nenhum registro encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO MEMBRO */}
      {isEditing && editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black text-[#0061f2] uppercase">Editar Membro</h3><button onClick={() => setIsEditing(false)} className="text-slate-300"><X size={28} /></button></div>
            <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
              <div className="flex justify-center mb-6"><div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden">{editingMember.photoUrl ? <img src={editingMember.photoUrl} className="w-full h-full object-cover" /> : <Camera size={32} className="text-slate-300" />}<input type="file" ref={fileInputRef} hidden onChange={(e) => handlePhotoUpload(e, true)} /></div></div>
              <div><label className={labelClasses}>Nome Completo</label><input required className={inputClasses} value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClasses}>Idade</label><input type="number" className={inputClasses} value={editingMember.age} onChange={e => { const age = parseInt(e.target.value); setEditingMember({...editingMember, age, className: isLiderancaUnit ? '' : getClassByAge(age)}); }} /></div>
                <div><label className={labelClasses}>{isLiderancaUnit ? 'Função' : 'Conselheiro'}</label>
                  <select className={inputClasses} value={editingMember.counselor} onChange={e => setEditingMember({...editingMember, counselor: e.target.value})}>
                    <option value="">Selecionar</option>
                    {isLiderancaUnit ? LEADERSHIP_ROLES.map(role => <option key={role} value={role}>{role}</option>) : dynamicCounselors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all">ATUALIZAR DADOS</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDetail;
