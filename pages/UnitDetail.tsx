
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
      className: isLiderancaUnit ? '' : getClassByAge(formData.age), 
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

  // CALCULA APENAS PONTOS SEMANAIS (CONSISTENTE COM RANKING GERAL)
  const calculateWeeklyTotal = (member: Member) => {
    const currentScores = Array.isArray(member.scores) ? member.scores : [];
    return currentScores.reduce((acc, curr) => {
      return acc + 
        (curr.punctuality || 0) + 
        (curr.uniform || 0) + 
        (curr.material || 0) + 
        (curr.bible || 0) + 
        (curr.voluntariness || 0) + 
        (curr.activities || 0) + 
        (curr.treasury || 0);
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
                    {calculateWeeklyTotal(member)} pts
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
      {/* ... Resto do componente permanece igual ... */}
    </div>
  );
};

export default UnitDetail;
