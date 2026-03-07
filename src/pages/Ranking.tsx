
import React, { useState } from 'react';
import { Member, UnitName } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Trophy, User, Shield, Gamepad2 } from 'lucide-react';

interface RankingProps {
  members: Member[];
  isDarkMode?: boolean;
}

type TabType = 'members' | 'units' | 'games';
type GameTabType = 'total' | 'quiz' | 'memory' | 'specialty' | 'threeclues' | 'puzzle' | 'knots' | 'whoami' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid';

const Ranking: React.FC<RankingProps> = ({ members, isDarkMode }) => {
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
           calculateSpecific(member, 'threeCluesGame') +
           calculateSpecific(member, 'puzzleGame') +
           calculateSpecific(member, 'knotsGame') +
           calculateSpecific(member, 'whoAmIGame') +
           calculateSpecific(member, 'specialtyTrailGame') +
           calculateSpecific(member, 'scrambledVerseGame') +
           calculateSpecific(member, 'natureIdGame') +
           calculateSpecific(member, 'firstAidGame');
  };

  const getSortedData = () => {
    const data = Array.isArray(members) ? [...members] : [];
    if (tab === 'games') {
      if (gameTab === 'quiz') return data.sort((a, b) => calculateSpecific(b, 'quiz') - calculateSpecific(a, 'quiz'));
      if (gameTab === 'memory') return data.sort((a, b) => calculateSpecific(b, 'memoryGame') - calculateSpecific(a, 'memoryGame'));
      if (gameTab === 'specialty') return data.sort((a, b) => calculateSpecific(b, 'specialtyGame') - calculateSpecific(a, 'specialtyGame'));
      if (gameTab === 'threeclues') return data.sort((a, b) => calculateSpecific(b, 'threeCluesGame') - calculateSpecific(a, 'threeCluesGame'));
      if (gameTab === 'puzzle') return data.sort((a, b) => calculateSpecific(b, 'puzzleGame') - calculateSpecific(a, 'puzzleGame'));
      if (gameTab === 'knots') return data.sort((a, b) => calculateSpecific(b, 'knotsGame') - calculateSpecific(a, 'knotsGame'));
      if (gameTab === 'whoami') return data.sort((a, b) => calculateSpecific(b, 'whoAmIGame') - calculateSpecific(a, 'whoAmIGame'));
      if (gameTab === 'specialtytrail') return data.sort((a, b) => calculateSpecific(b, 'specialtyTrailGame') - calculateSpecific(a, 'specialtyTrailGame'));
      if (gameTab === 'scrambledverse') return data.sort((a, b) => calculateSpecific(b, 'scrambledVerseGame') - calculateSpecific(a, 'scrambledVerseGame'));
      if (gameTab === 'natureid') return data.sort((a, b) => calculateSpecific(b, 'natureIdGame') - calculateSpecific(a, 'natureIdGame'));
      if (gameTab === 'firstaid') return data.sort((a, b) => calculateSpecific(b, 'firstAidGame') - calculateSpecific(a, 'firstAidGame'));
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
      if (gameTab === 'puzzle') return calculateSpecific(m, 'puzzleGame');
      if (gameTab === 'knots') return calculateSpecific(m, 'knotsGame');
      if (gameTab === 'whoami') return calculateSpecific(m, 'whoAmIGame');
      if (gameTab === 'specialtytrail') return calculateSpecific(m, 'specialtyTrailGame');
      if (gameTab === 'scrambledverse') return calculateSpecific(m, 'scrambledVerseGame');
      if (gameTab === 'natureid') return calculateSpecific(m, 'natureIdGame');
      if (gameTab === 'firstaid') return calculateSpecific(m, 'firstAidGame');
      return calculateGamesTotal(m);
    }
    return calculateWeeklyTotal(m);
  };

  const TabButton = ({ type, label, icon: Icon }: { type: TabType, label: string, icon: any }) => (
    <button 
      onClick={() => setTab(type)} 
      className={`py-3 text-[9px] font-black rounded-2xl transition-all uppercase tracking-tight flex items-center justify-center gap-1.5 ${
        tab === type 
          ? 'bg-white dark:bg-slate-700 shadow-sm text-[#0061f2] dark:text-blue-400 border border-white dark:border-slate-600' 
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-500'
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
          : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 overflow-y-auto h-full bg-slate-50 dark:bg-[#0f172a]">
      <div className="bg-[#f1f5f9] dark:bg-slate-800/50 p-1.5 rounded-[2rem] shadow-inner mx-4 mt-6 grid grid-cols-3 gap-1.5">
        <TabButton type="members" label="Membro" icon={User} />
        <TabButton type="units" label="Unidade" icon={Shield} />
        <TabButton type="games" label="Jogos" icon={Gamepad2} />
      </div>

      {tab === 'games' && (
        <div className="flex flex-wrap gap-2 px-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <GameTabButton type="total" label="Total" />
          <GameTabButton type="quiz" label="Quiz" />
          <GameTabButton type="memory" label="Memória" />
          <GameTabButton type="specialty" label="Especialid." />
          <GameTabButton type="threeclues" label="3 Dicas" />
          <GameTabButton type="puzzle" label="Puzzle" />
          <GameTabButton type="knots" label="Nós" />
          <GameTabButton type="whoami" label="Quem Sou" />
          <GameTabButton type="specialtytrail" label="Trilha" />
          <GameTabButton type="scrambledverse" label="Versículo" />
          <GameTabButton type="natureid" label="Natureza" />
          <GameTabButton type="firstaid" label="Socorros" />
        </div>
      )}
      
      {tab !== 'units' ? (
        <div className="space-y-8 px-4">
          {/* PÓDIO REESTRUTURADO */}
          <div className="flex items-end justify-center gap-2 pt-6 pb-4">
            
            {/* 2º LUGAR */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-lg flex items-center justify-center relative z-20">
                {podiumSlots[1]?.photoUrl ? <img src={podiumSlots[1].photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-200 dark:text-slate-700" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-20">
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase truncate leading-tight">
                  {podiumSlots[1]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-300 dark:text-slate-600 uppercase truncate">
                  {podiumSlots[1]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[1] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-slate-400 uppercase">Q:{calculateSpecific(podiumSlots[1], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">M:{calculateSpecific(podiumSlots[1], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">E:{calculateSpecific(podiumSlots[1], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">3D:{calculateSpecific(podiumSlots[1], 'threeCluesGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">P:{calculateSpecific(podiumSlots[1], 'puzzleGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">N:{calculateSpecific(podiumSlots[1], 'knotsGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">QS:{calculateSpecific(podiumSlots[1], 'whoAmIGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">T:{calculateSpecific(podiumSlots[1], 'specialtyTrailGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">V:{calculateSpecific(podiumSlots[1], 'scrambledVerseGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">Nat:{calculateSpecific(podiumSlots[1], 'natureIdGame')}</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">Soc:{calculateSpecific(podiumSlots[1], 'firstAidGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-20 h-24 bg-white dark:bg-slate-800 rounded-t-[2rem] shadow-2xl border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-2">
                <span className="text-xl font-black text-slate-400 dark:text-slate-500">{getPoints(podiumSlots[1])}</span>
              </div>
            </div>

            {/* 1º LUGAR */}
            <div className="flex flex-col items-center z-10 -translate-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-[#FFD700] overflow-hidden bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center relative z-20">
                {podiumSlots[0]?.photoUrl ? <img src={podiumSlots[0].photoUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-slate-200 dark:text-slate-700" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-24">
                <p className="text-[10px] font-black text-[#0061f2] dark:text-blue-400 uppercase truncate leading-tight">
                  {podiumSlots[0]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate">
                  {podiumSlots[0]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[0] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-blue-400 uppercase">Q:{calculateSpecific(podiumSlots[0], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">M:{calculateSpecific(podiumSlots[0], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">E:{calculateSpecific(podiumSlots[0], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">3D:{calculateSpecific(podiumSlots[0], 'threeCluesGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">P:{calculateSpecific(podiumSlots[0], 'puzzleGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">N:{calculateSpecific(podiumSlots[0], 'knotsGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">QS:{calculateSpecific(podiumSlots[0], 'whoAmIGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">T:{calculateSpecific(podiumSlots[0], 'specialtyTrailGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">V:{calculateSpecific(podiumSlots[0], 'scrambledVerseGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">Nat:{calculateSpecific(podiumSlots[0], 'natureIdGame')}</span>
                    <span className="text-[6px] font-bold text-blue-400 uppercase">Soc:{calculateSpecific(podiumSlots[0], 'firstAidGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-24 h-40 bg-gradient-to-b from-white to-yellow-50 dark:from-slate-800 dark:to-slate-900 rounded-t-[2.5rem] shadow-2xl border-t-2 border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center p-2 text-center">
                <Trophy size={32} className="text-yellow-400 mb-2" />
                <span className="text-3xl font-black text-[#0061f2] dark:text-blue-400">{getPoints(podiumSlots[0])}</span>
              </div>
            </div>

            {/* 3º LUGAR */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-300 overflow-hidden bg-amber-50 dark:bg-slate-800 shadow-lg flex items-center justify-center relative z-20">
                {podiumSlots[2]?.photoUrl ? <img src={podiumSlots[2].photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-200 dark:text-slate-700" />}
              </div>
              <div className="text-center mt-2 mb-2 px-1 w-20">
                <p className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase truncate leading-tight">
                  {podiumSlots[2]?.name?.split(' ')[0] || ''}
                </p>
                <p className="text-[7px] font-bold text-slate-300 dark:text-slate-600 uppercase truncate">
                  {podiumSlots[2]?.unit || ''}
                </p>
                {tab === 'games' && podiumSlots[2] && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    <span className="text-[6px] font-bold text-amber-400 uppercase">Q:{calculateSpecific(podiumSlots[2], 'quiz')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">M:{calculateSpecific(podiumSlots[2], 'memoryGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">E:{calculateSpecific(podiumSlots[2], 'specialtyGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">3D:{calculateSpecific(podiumSlots[2], 'threeCluesGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">P:{calculateSpecific(podiumSlots[2], 'puzzleGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">N:{calculateSpecific(podiumSlots[2], 'knotsGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">QS:{calculateSpecific(podiumSlots[2], 'whoAmIGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">T:{calculateSpecific(podiumSlots[2], 'specialtyTrailGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">V:{calculateSpecific(podiumSlots[2], 'scrambledVerseGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">Nat:{calculateSpecific(podiumSlots[2], 'natureIdGame')}</span>
                    <span className="text-[6px] font-bold text-amber-400 uppercase">Soc:{calculateSpecific(podiumSlots[2], 'firstAidGame')}</span>
                  </div>
                )}
              </div>
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-t-[2rem] shadow-2xl border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-2">
                <span className="text-xl font-black text-amber-500">{getPoints(podiumSlots[2])}</span>
              </div>
            </div>
          </div>

          {/* LISTAGEM GERAL */}
          <div className="space-y-3 pb-24">
            {remaining.map((m, idx) => (
              <div key={`rank-member-${m.id}`} className="flex items-center gap-4 p-4 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 dark:shadow-none">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-sm text-slate-400 dark:text-slate-600 shrink-0">{idx + 4}º</div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md bg-slate-50 dark:bg-slate-900 shrink-0">
                  {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="m-auto text-slate-200 dark:text-slate-700 mt-2" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm truncate uppercase tracking-tight">{m.name.split(' ')[0]}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">{m.unit}</p>
                  {tab === 'games' && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Q: {calculateSpecific(m, 'quiz')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">M: {calculateSpecific(m, 'memoryGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">E: {calculateSpecific(m, 'specialtyGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">3D: {calculateSpecific(m, 'threeCluesGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">P: {calculateSpecific(m, 'puzzleGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">N: {calculateSpecific(m, 'knotsGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">QS: {calculateSpecific(m, 'whoAmIGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">T: {calculateSpecific(m, 'specialtyTrailGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">V: {calculateSpecific(m, 'scrambledVerseGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Nat: {calculateSpecific(m, 'natureIdGame')}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Soc: {calculateSpecific(m, 'firstAidGame')}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 px-2">
                  <p className="text-2xl font-black text-[#0061f2] dark:text-blue-400 leading-none">{getPoints(m)}</p>
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
              <div key={`rank-unit-${unit}`} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 dark:shadow-none flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={UNIT_LOGOS[unit] || undefined} className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase">{unit}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">{memberCount} membros</p>
                  </div>
                </div>
                <div className="text-right font-black text-3xl text-[#0061f2] dark:text-blue-400">{total}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Ranking;
