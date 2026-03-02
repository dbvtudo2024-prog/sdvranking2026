
import React, { useState } from 'react';
import { Member, UnitName } from '../types';
import { UNIT_LOGOS } from '../constants';
import { Trophy, User, Shield, Gamepad2 } from 'lucide-react';

interface RankingProps {
  members: Member[];
}

type TabType = 'members' | 'units' | 'games';
type GameTabType = 'total' | 'quiz' | 'memory' | 'specialty' | 'threeclues';

const Ranking: React.FC<RankingProps> = ({ members }) => {
  const [tab, setTab] = useState<TabType>('members');
  const [gameTab, setGameTab] = useState<GameTabType>('total');

  const calculateWeeklyTotal = (member: Member) => {
    if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
    return member.scores.reduce((acc, curr) => acc + (Number(curr.punctuality) || 0) + (Number(curr.uniform) || 0) + (Number(curr.material) || 0) + (Number(curr.bible) || 0) + (Number(curr.voluntariness) || 0) + (Number(curr.activities) || 0) + (Number(curr.treasury) || 0), 0);
  };

  const calculateSpecific = (member: Member, key: string) => {
    if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
    return member.scores.reduce((acc, curr) => acc + (Number((curr as any)[key]) || 0), 0);
  };

  const calculateGamesTotal = (member: Member) => {
    return calculateSpecific(member, 'quiz') + 
           calculateSpecific(member, 'memoryGame') + 
           calculateSpecific(member, 'specialtyGame') + 
           calculateSpecific(member, 'threeCluesGame');
  };

  const getSortedData = () => {
    const data = Array.isArray(members) ? [...members] : [];
    if (tab === 'games') {
      if (gameTab === 'quiz') return data.sort((a, b) => calculateSpecific(b, 'quiz') - calculateSpecific(a, 'quiz'));
      if (gameTab === 'memory') return data.sort((a, b) => calculateSpecific(b, 'memoryGame') - calculateSpecific(a, 'memoryGame'));
      if (gameTab === 'specialty') return data.sort((a, b) => calculateSpecific(b, 'specialtyGame') - calculateSpecific(a, 'specialtyGame'));
      if (gameTab === 'threeclues') return data.sort((a, b) => calculateSpecific(b, 'threeCluesGame') - calculateSpecific(a, 'threeCluesGame'));
      return data.sort((a, b) => calculateGamesTotal(b) - calculateGamesTotal(a));
    }
    return data.sort((a, b) => calculateWeeklyTotal(b) - calculateWeeklyTotal(a));
  };

  const sortedData = getSortedData();
  const podiumSlots = [sortedData[0] || null, sortedData[1] || null, sortedData[2] || null];
  const remaining = sortedData.slice(3);

  const getPoints = (m: Member | null) => {
    if (!m) return 0;
    if (tab === 'games') {
      if (gameTab === 'quiz') return calculateSpecific(m, 'quiz');
      if (gameTab === 'memory') return calculateSpecific(m, 'memoryGame');
      if (gameTab === 'specialty') return calculateSpecific(m, 'specialtyGame');
      if (gameTab === 'threeclues') return calculateSpecific(m, 'threeCluesGame');
      return calculateGamesTotal(m);
    }
    return calculateWeeklyTotal(m);
  };

  const TabButton = ({ type, label, icon: Icon }: { type: TabType, label: string, icon: any }) => (
    <button 
      onClick={() => setTab(type)} 
      className={`py-3 text-[9px] font-black rounded-2xl transition-all uppercase tracking-tight flex items-center justify-center gap-1.5 ${
        tab === type 
          ? 'bg-white shadow-sm text-[#0061f2] border border-white' 
          : 'text-slate-400 hover:text-slate-500'
      }`}
    >
      <Icon size={14} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );

  const GameTabButton = ({ type, label }: { type: GameTabType, label: string }) => (
    <button 
      onClick={() => setGameTab(type)} 
      className={`px-2 py-2 text-[8px] font-black rounded-xl transition-all uppercase tracking-tighter flex-1 border ${
        gameTab === type 
          ? 'bg-[#0061f2] text-white border-[#0061f2] shadow-md' 
          : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 overflow-y-auto h-full">
      <div className="bg-[#f1f5f9] p-1.5 rounded-[2rem] shadow-inner mx-4 mt-6 grid grid-cols-3 gap-1.5">
        <TabButton type="members" label="Membro" icon={User} />
        <TabButton type="units" label="Unidade" icon={Shield} />
        <TabButton type="games" label="Jogos" icon={Gamepad2} />
      </div>

      {tab === 'games' && (
        <div className="flex flex-wrap gap-2 px-4">
          <GameTabButton type="total" label="Total" />
          <GameTabButton type="quiz" label="Quiz" />
          <GameTabButton type="memory" label="Memória" />
          <GameTabButton type="specialty" label="Especialid." />
          <GameTabButton type="threeclues" label="3 Dicas" />
        </div>
      )}
      
      {tab !== 'units' ? (
        <div className="space-y-8 px-4">
          {/* PÓDIO REESTRUTURADO */}
          <div className="flex items-end justify-center gap-2 pt-6 pb-4">
            
            {/* 2º LUGAR */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-50 shadow-lg flex items-center justify-center relative z-20">
                {podiumSlots[1]?.photoUrl ? <img src={podiumSlots[1].photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-200" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-20">
                <p className="text-[9px] font-black text-slate-500 uppercase truncate leading-tight">
                  {podiumSlots[1]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-300 uppercase truncate">
                  {podiumSlots[1]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[1] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-slate-400 uppercase">Q:{calculateSpecific(podiumSlots[1], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">M:{calculateSpecific(podiumSlots[1], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">E:{calculateSpecific(podiumSlots[1], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">3D:{calculateSpecific(podiumSlots[1], 'threeCluesGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-20 h-24 bg-white rounded-t-[2rem] shadow-2xl border-t border-slate-100 flex flex-col items-center justify-center p-2">
                <span className="text-xl font-black text-slate-400">{getPoints(podiumSlots[1])}</span>
              </div>
            </div>

            {/* 1º LUGAR */}
            <div className="flex flex-col items-center z-10 -translate-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-[#FFD700] overflow-hidden bg-white shadow-2xl flex items-center justify-center relative z-20">
                {podiumSlots[0]?.photoUrl ? <img src={podiumSlots[0].photoUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-slate-200" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-24">
                <p className="text-[10px] font-black text-[#0061f2] uppercase truncate leading-tight">
                  {podiumSlots[0]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-400 uppercase truncate">
                  {podiumSlots[0]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[0] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-blue-400 uppercase">Q:{calculateSpecific(podiumSlots[0], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">M:{calculateSpecific(podiumSlots[0], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">E:{calculateSpecific(podiumSlots[0], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">3D:{calculateSpecific(podiumSlots[0], 'threeCluesGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-24 h-40 bg-gradient-to-b from-white to-yellow-50 rounded-t-[2.5rem] shadow-2xl border-t-2 border-yellow-100 flex flex-col items-center justify-center p-2 text-center">
                <Trophy size={32} className="text-yellow-400 mb-2" />
                <span className="text-3xl font-black text-[#0061f2]">{getPoints(podiumSlots[0])}</span>
              </div>
            </div>

            {/* 3º LUGAR */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-300 overflow-hidden bg-amber-50 shadow-lg flex items-center justify-center relative z-20">
                {podiumSlots[2]?.photoUrl ? <img src={podiumSlots[2].photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-200" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-20">
                <p className="text-[9px] font-black text-amber-600 uppercase truncate leading-tight">
                  {podiumSlots[2]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-300 uppercase truncate">
                  {podiumSlots[2]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[2] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-amber-400 uppercase">Q:{calculateSpecific(podiumSlots[2], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">M:{calculateSpecific(podiumSlots[2], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">E:{calculateSpecific(podiumSlots[2], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">3D:{calculateSpecific(podiumSlots[2], 'threeCluesGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-20 h-20 bg-white rounded-t-[2rem] shadow-2xl border-t border-slate-100 flex flex-col items-center justify-center p-2">
                <span className="text-xl font-black text-amber-500">{getPoints(podiumSlots[2])}</span>
              </div>
            </div>
          </div>

          {/* LISTAGEM GERAL */}
          <div className="space-y-3 pb-24">
            {remaining.map((m, idx) => (
              <div key={`rank-member-${m.id}`} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-blue-900/5">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-sm text-slate-400 shrink-0">{idx + 4}º</div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-50 shrink-0">
                  {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-auto text-slate-200 mt-2" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{m.name.split(' ')[0]}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{m.unit}</p>
                  {tab === 'games' && (
                    <div className="flex gap-2 mt-1">
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Q: {calculateSpecific(m, 'quiz')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">M: {calculateSpecific(m, 'memoryGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">E: {calculateSpecific(m, 'specialtyGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">3D: {calculateSpecific(m, 'threeCluesGame')}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 px-2">
                  <p className="text-2xl font-black text-[#0061f2] leading-none">{getPoints(m)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-24">
          {[UnitName.AGUIA_DOURADA, UnitName.GUERREIROS, UnitName.LIDERANCA]
            .map(unit => {
              const unitMembers = members.filter(m => m.unit === unit);
              const total = unitMembers.reduce((acc, m) => acc + calculateWeeklyTotal(m), 0);
              return { unit, total, memberCount: unitMembers.length };
            })
            .sort((a, b) => b.total - a.total)
            .map(({ unit, total, memberCount }) => (
              <div key={`rank-unit-${unit}`} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={UNIT_LOGOS[unit] || undefined} className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase">{unit}</h3>
                    <p className="text-xs text-slate-400 font-bold">{memberCount} membros</p>
                  </div>
                </div>
                <div className="text-right font-black text-3xl text-[#0061f2]">{total}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Ranking;
