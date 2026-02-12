
import React, { useState } from 'react';
import { Member, UnitName } from '../types';
import { UNIT_LOGOS } from '../constants';
import { Trophy, Medal, Star, User, Shield, Brain, Gamepad2, LayoutGrid, Sword, HelpCircle } from 'lucide-react';

interface RankingProps {
  members: Member[];
}

type TabType = 'members' | 'units' | 'quiz' | 'memory' | 'specialty' | 'threeclues';

const Ranking: React.FC<RankingProps> = ({ members }) => {
  const [tab, setTab] = useState<TabType>('members');

  const calculateWeeklyTotal = (member: Member) => {
    if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
    return member.scores.reduce((acc, curr) => {
      if (!curr) return acc;
      return acc + (Number(curr.punctuality) || 0) + (Number(curr.uniform) || 0) + (Number(curr.material) || 0) + (Number(curr.bible) || 0) + (Number(curr.voluntariness) || 0) + (Number(curr.activities) || 0) + (Number(curr.treasury) || 0);
    }, 0);
  };

  const calculateSpecific = (member: Member, key: 'quiz' | 'memoryGame' | 'specialtyGame' | 'threeCluesGame') => {
    if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
    return member.scores.reduce((acc, curr) => {
      if (!curr) return acc;
      const points = Number((curr as any)[key]);
      return acc + (isNaN(points) ? 0 : points);
    }, 0);
  };

  const getSortedData = () => {
    const currentMembers = Array.isArray(members) ? [...members] : [];
    switch (tab) {
      case 'quiz': return currentMembers.sort((a, b) => calculateSpecific(b, 'quiz') - calculateSpecific(a, 'quiz'));
      case 'memory': return currentMembers.sort((a, b) => calculateSpecific(b, 'memoryGame') - calculateSpecific(a, 'memoryGame'));
      case 'specialty': return currentMembers.sort((a, b) => calculateSpecific(b, 'specialtyGame') - calculateSpecific(a, 'specialtyGame'));
      case 'threeclues': return currentMembers.sort((a, b) => calculateSpecific(b, 'threeCluesGame') - calculateSpecific(a, 'threeCluesGame'));
      default: return currentMembers.sort((a, b) => calculateWeeklyTotal(b) - calculateWeeklyTotal(a));
    }
  };

  const sortedData = getSortedData();
  const podiumSlots = [sortedData[0] || null, sortedData[1] || null, sortedData[2] || null];
  const remaining = sortedData.slice(3);

  const unitStats = [UnitName.AGUIA_DOURADA, UnitName.GUERREIROS, UnitName.LIDERANCA].map(unitName => {
    const unitMembers = (Array.isArray(members) ? members : []).filter(m => m.unit === unitName);
    const total = unitMembers.reduce((acc, m) => acc + calculateWeeklyTotal(m), 0);
    return { name: unitName, total, count: unitMembers.length };
  }).sort((a, b) => b.total - a.total);

  const renderMemberItem = (member: Member, position: number) => {
    let points = 0;
    if (tab === 'quiz') points = calculateSpecific(member, 'quiz');
    else if (tab === 'memory') points = calculateSpecific(member, 'memoryGame');
    else if (tab === 'specialty') points = calculateSpecific(member, 'specialtyGame');
    else if (tab === 'threeclues') points = calculateSpecific(member, 'threeCluesGame');
    else points = calculateWeeklyTotal(member);

    return (
      <div key={member.id} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-blue-900/5 transition-all mx-2">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-sm text-slate-400 shrink-0">{position}º</div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-50">
          {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" /> : <User size={28} className="m-auto text-slate-200 mt-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{member.name}</h4>
          <div className="flex items-center gap-2"><img src={UNIT_LOGOS[member.unit as UnitName] || UNIT_LOGOS[UnitName.LIDERANCA]} className="w-4 h-4 object-contain" /><p className="text-[10px] text-slate-400 font-bold uppercase truncate">{member.unit}</p></div>
        </div>
        <div className="text-right shrink-0 px-2"><p className="text-2xl font-black text-[#0061f2] leading-none">{points}</p><p className="text-[8px] uppercase font-black text-slate-300 tracking-widest mt-1">Pts</p></div>
      </div>
    );
  };

  const getPointsForPodium = (member: Member | null) => {
    if (!member) return 0;
    if (tab === 'quiz') return calculateSpecific(member, 'quiz');
    if (tab === 'memory') return calculateSpecific(member, 'memoryGame');
    if (tab === 'specialty') return calculateSpecific(member, 'specialtyGame');
    if (tab === 'threeclues') return calculateSpecific(member, 'threeCluesGame');
    return calculateWeeklyTotal(member);
  };

  const TabButton = ({ type, label, icon: Icon }: { type: TabType, label: string, icon: any }) => (
    <button onClick={() => setTab(type)} className={`px-2 py-2.5 text-[9px] font-black rounded-xl transition-all uppercase tracking-tighter flex items-center justify-center gap-1.5 ${tab === type ? 'bg-white shadow-md text-[#0061f2]' : 'text-[#94a3b8] hover:text-slate-600'}`}>
      <Icon size={14} strokeWidth={2.5} /><span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-[#f1f5f9] p-2 rounded-[2rem] shadow-inner space-y-2 mx-2 mt-4">
        <div className="grid grid-cols-3 gap-2"><TabButton type="members" label="Membros" icon={User} /><TabButton type="units" label="Unidades" icon={Shield} /><TabButton type="quiz" label="Quiz" icon={Brain} /></div>
        <div className="grid grid-cols-3 gap-2"><TabButton type="memory" label="Memória" icon={Gamepad2} /><TabButton type="specialty" label="Especialid." icon={Medal} /><TabButton type="threeclues" label="3 Dicas" icon={HelpCircle} /></div>
      </div>
      {tab !== 'units' ? (
        <div className="space-y-8">
          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-12">
            <div className="flex flex-col items-center"><div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-50 mb-3 flex items-center justify-center shadow-lg">{podiumSlots[1]?.photoUrl ? <img src={podiumSlots[1].photoUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-slate-200" />}</div><div className="text-center mb-2 px-1 max-w-[80px]"><p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate">{podiumSlots[1] ? podiumSlots[1].name.split(' ')[0] : '---'}</p></div><div className="w-20 sm:w-24 h-28 bg-white rounded-t-[2rem] shadow-2xl border-t border-x border-slate-100 flex flex-col items-center justify-center p-2"><Medal size={24} className="text-slate-300 mb-2" /><span className="text-xl font-black text-slate-400">{getPointsForPodium(podiumSlots[1])}</span></div></div>
            <div className="flex flex-col items-center z-10"><div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#FFD700] overflow-hidden bg-white mb-3 flex items-center justify-center shadow-2xl relative">{podiumSlots[0]?.photoUrl ? <img src={podiumSlots[0].photoUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200" />}</div><div className="text-center mb-2 px-1 max-w-[100px]"><p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter truncate">{podiumSlots[0] ? podiumSlots[0].name.split(' ')[0] : '---'}</p></div><div className="w-24 sm:w-28 h-40 bg-gradient-to-b from-white to-yellow-50 rounded-t-[2.5rem] shadow-2xl border-t-2 border-x border-yellow-100 flex flex-col items-center justify-center p-2"><Trophy size={32} className="text-yellow-400 mb-3" /><span className="text-3xl font-black text-[#0061f2]">{getPointsForPodium(podiumSlots[0])}</span></div></div>
            <div className="flex flex-col items-center"><div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-300 overflow-hidden bg-amber-50 mb-3 flex items-center justify-center shadow-lg">{podiumSlots[2]?.photoUrl ? <img src={podiumSlots[2].photoUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-slate-200" />}</div><div className="text-center mb-2 px-1 max-w-[80px]"><p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate">{podiumSlots[2] ? podiumSlots[2].name.split(' ')[0] : '---'}</p></div><div className="w-20 sm:w-24 h-24 bg-white rounded-t-[2rem] shadow-2xl border-t border-x border-slate-100 flex flex-col items-center justify-center p-2"><Star size={24} className="text-amber-400 mb-2" /><span className="text-xl font-black text-amber-500">{getPointsForPodium(podiumSlots[2])}</span></div></div>
          </div>
          <div className="space-y-3 pb-20">{remaining.length > 0 ? remaining.map((member, index) => renderMemberItem(member, index + 4)) : sortedData.length === 0 ? <div className="text-center py-20 bg-white/50 rounded-[3rem] mx-4 border-2 border-dashed border-slate-200"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma pontuação registrada.</p></div> : null}</div>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {unitStats.map((unit, idx) => (
            <div key={unit.name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4"><div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center p-2 ${idx === 0 ? 'bg-yellow-50' : 'bg-blue-50'}`}><img src={UNIT_LOGOS[unit.name as UnitName] || UNIT_LOGOS[UnitName.LIDERANCA]} className="w-full h-full object-contain" /></div><div><h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{unit.name}</h3><p className="text-xs text-slate-400 font-bold">{unit.count} membros ativos</p></div></div>
                <div className="text-right"><p className="text-3xl font-black text-[#0061f2] leading-none">{unit.total}</p><p className="text-[8px] uppercase font-black text-slate-300 tracking-widest mt-1">Pontos Semanais</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ranking;
