
import React, { useState, useMemo } from 'react';
import { Member, UnitName } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Trophy, User, Shield, Gamepad2 } from 'lucide-react';
import { calculateSpecific, calculateGamesTotal, calculateWeeklyTotal, GAME_KEYS, GAMES_METADATA } from '@/helpers/scoreHelpers';
import MemberProfileModal from '@/components/MemberProfileModal';

interface RankingProps {
  members: Member[];
  isDarkMode?: boolean;
}

type TabType = 'members' | 'units' | 'games';
type GameTabType = 'total' | 'quiz' | 'memory' | 'specialty' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid' | 'study';

const Ranking: React.FC<RankingProps> = ({ members, isDarkMode }) => {
  const [tab, setTab] = useState<TabType>('members');
  const [gameTab, setGameTab] = useState<GameTabType>('total');
  const [selectedProfile, setSelectedProfile] = useState<Member | null>(null);

  const calculateGrandTotal = (member: Member) => {
    return calculateWeeklyTotal(member) + calculateGamesTotal(member);
  };


  const sortedData = useMemo(() => {
    const data = Array.isArray(members) ? [...members] : [];
    if (tab === 'games') {
      if (gameTab === 'quiz') return data.sort((a, b) => calculateSpecific(b, 'quiz') - calculateSpecific(a, 'quiz'));
      if (gameTab === 'memory') return data.sort((a, b) => calculateSpecific(b, 'memoryGame') - calculateSpecific(a, 'memoryGame'));
      if (gameTab === 'specialty') return data.sort((a, b) => calculateSpecific(b, 'specialtyGame') - calculateSpecific(a, 'specialtyGame'));
      if (gameTab === 'threeclues') return data.sort((a, b) => calculateSpecific(b, 'threeCluesGame') - calculateSpecific(a, 'threeCluesGame'));
      if (gameTab === 'puzzle') return data.sort((a, b) => calculateSpecific(b, 'puzzleGame') - calculateSpecific(a, 'puzzleGame'));
      if (gameTab === 'knots') return data.sort((a, b) => calculateSpecific(b, 'knotsGame') - calculateSpecific(a, 'knotsGame'));
      if (gameTab === 'specialtytrail') return data.sort((a, b) => calculateSpecific(b, 'specialtyTrailGame') - calculateSpecific(a, 'specialtyTrailGame'));
      if (gameTab === 'scrambledverse') return data.sort((a, b) => calculateSpecific(b, 'scrambledVerseGame') - calculateSpecific(a, 'scrambledVerseGame'));
      if (gameTab === 'natureid') return data.sort((a, b) => calculateSpecific(b, 'natureIdGame') - calculateSpecific(a, 'natureIdGame'));
      if (gameTab === 'firstaid') return data.sort((a, b) => calculateSpecific(b, 'firstAidGame') - calculateSpecific(a, 'firstAidGame'));
      if (gameTab === 'study') return data.sort((a, b) => calculateSpecific(b, 'specialtyStudyScore') - calculateSpecific(a, 'specialtyStudyScore'));
      return data.sort((a, b) => calculateGamesTotal(b) - calculateGamesTotal(a));
    }
    return data.sort((a, b) => calculateWeeklyTotal(b) - calculateWeeklyTotal(a));
  }, [members, tab, gameTab]);

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
      if (gameTab === 'specialtytrail') return calculateSpecific(m, 'specialtyTrailGame');
      if (gameTab === 'scrambledverse') return calculateSpecific(m, 'scrambledVerseGame');
      if (gameTab === 'natureid') return calculateSpecific(m, 'natureIdGame');
      if (gameTab === 'firstaid') return calculateSpecific(m, 'firstAidGame');
      if (gameTab === 'study') return calculateSpecific(m, 'specialtyStudyScore');
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 overflow-y-auto h-full bg-slate-50 dark:bg-[#0f172a]">
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
          <GameTabButton type="specialty" label="Brasões" />
          <GameTabButton type="threeclues" label="3 Dicas" />
          <GameTabButton type="puzzle" label="Puzzle" />
          <GameTabButton type="knots" label="Nós" />
          <GameTabButton type="specialtytrail" label="Trilha" />
          <GameTabButton type="scrambledverse" label="Versículo" />
          <GameTabButton type="natureid" label="Natureza" />
          <GameTabButton type="firstaid" label="Socorros" />
          <GameTabButton type="study" label="Estudo" />
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
                    {GAME_KEYS.map(key => {
                      const pts = calculateSpecific(podiumSlots[1]!, key);
                      if (pts === 0) return null;
                      return (
                        <span key={`podium-2-${key}`} className="text-[6px] font-bold text-slate-400 uppercase">
                          {GAMES_METADATA[key]?.shortLabel || key}:{pts}
                        </span>
                      );
                    })}
                    {(() => {
                      const total = calculateGamesTotal(podiumSlots[1]!);
                      const knownSum = GAME_KEYS.reduce((acc, k) => acc + calculateSpecific(podiumSlots[1]!, k), 0);
                      const diff = total - knownSum;
                      if (diff <= 0) return null;
                      return (
                        <span key={`podium-2-others`} className="text-[6px] font-bold text-slate-400 uppercase">
                          O:{diff}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="w-20 h-24 bg-white dark:bg-slate-800 rounded-t-[2rem] shadow-2xl border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center">
                <span className={`text-[7px] font-black uppercase tracking-widest leading-none mb-1 ${tab === 'games' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {tab === 'games' ? 'Jogos' : 'Semanal'}
                </span>
                <span className={`text-xl font-black ${tab === 'games' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {podiumSlots[1] ? getPoints(podiumSlots[1]) : 0}
                </span>
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
                    {GAME_KEYS.map(key => {
                      const pts = calculateSpecific(podiumSlots[0]!, key);
                      if (pts === 0) return null;
                      return (
                        <span key={`podium-1-${key}`} className="text-[6px] font-bold text-blue-400 uppercase">
                          {GAMES_METADATA[key]?.shortLabel || key}:{pts}
                        </span>
                      );
                    })}
                    {(() => {
                      const total = calculateGamesTotal(podiumSlots[0]!);
                      const knownSum = GAME_KEYS.reduce((acc, k) => acc + calculateSpecific(podiumSlots[0]!, k), 0);
                      const diff = total - knownSum;
                      if (diff <= 0) return null;
                      return (
                        <span key={`podium-1-others`} className="text-[6px] font-bold text-blue-400 uppercase">
                          O:{diff}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="w-24 h-40 bg-gradient-to-b from-white to-yellow-50 dark:from-slate-800 dark:to-slate-900 rounded-t-[2.5rem] shadow-2xl border-t-2 border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center p-2 text-center">
                <Trophy size={24} className="text-yellow-400 mb-2" />
                <span className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${tab === 'games' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {tab === 'games' ? 'Jogos' : 'Semanal'}
                </span>
                <span className={`text-3xl font-black ${tab === 'games' ? 'text-amber-500' : 'text-[#0061f2] dark:text-blue-400'}`}>
                  {podiumSlots[0] ? getPoints(podiumSlots[0]) : 0}
                </span>
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
                    {GAME_KEYS.map(key => {
                      const pts = calculateSpecific(podiumSlots[2]!, key);
                      if (pts === 0) return null;
                      return (
                        <span key={`podium-3-${key}`} className="text-[6px] font-bold text-amber-400 uppercase">
                          {GAMES_METADATA[key]?.shortLabel || key}:{pts}
                        </span>
                      );
                    })}
                    {(() => {
                      const total = calculateGamesTotal(podiumSlots[2]!);
                      const knownSum = GAME_KEYS.reduce((acc, k) => acc + calculateSpecific(podiumSlots[2]!, k), 0);
                      const diff = total - knownSum;
                      if (diff <= 0) return null;
                      return (
                        <span key={`podium-3-others`} className="text-[6px] font-bold text-amber-400 uppercase">
                          O:{diff}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-t-[2rem] shadow-2xl border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-2 text-center">
                <span className={`text-[7px] font-black uppercase tracking-widest leading-none mb-1 ${tab === 'games' ? 'text-amber-500' : 'text-blue-500'}`}>
                  {tab === 'games' ? 'Jogos' : 'Semanal'}
                </span>
                <span className={`text-xl font-black text-amber-500`}>
                  {podiumSlots[2] ? getPoints(podiumSlots[2]) : 0}
                </span>
              </div>
            </div>
          </div>

          {/* LISTAGEM GERAL */}
          <div className="space-y-4 pb-24">
            {remaining.map((m, idx) => (
              <div 
                key={`rank-member-${m.id}`} 
                onClick={() => setSelectedProfile(m)}
                className={`group relative flex items-center gap-4 p-4 rounded-[2.2rem] border transition-all cursor-pointer active:scale-[0.98] ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 hover:border-blue-800 shadow-blue-900/10' 
                    : 'bg-white border-slate-100 hover:border-blue-100 shadow-blue-900/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-sm text-slate-400 dark:text-slate-600 shrink-0 border border-slate-100 dark:border-slate-700">{idx + 4}º</div>
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-900 shrink-0">
                  {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="m-auto text-slate-200 dark:text-slate-700 mt-2.5" />}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className={`font-black text-sm truncate uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{m.name.split(' ')[0]}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">{m.unit}</p>
                </div>
                
                <div className="flex flex-col gap-1 items-end min-w-[70px]">
                  <div className={`shrink-0 flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border-2 ${
                    tab === 'games' 
                      ? (isDarkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50/50 border-amber-100')
                      : (isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-100')
                  }`}>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${
                      tab === 'games' 
                        ? (isDarkMode ? 'text-amber-500' : 'text-amber-600')
                        : (isDarkMode ? 'text-blue-400' : 'text-blue-500')
                    }`}>
                      {tab === 'games' ? 'Jogos' : 'Semanal'}
                    </span>
                    <span className={`text-base font-black leading-none ${
                      tab === 'games' 
                        ? (isDarkMode ? 'text-amber-600' : 'text-amber-700')
                        : (isDarkMode ? 'text-blue-400' : 'text-blue-700')
                    }`}>
                      {getPoints(m)}
                    </span>
                  </div>
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
              const weekly = unitMembers.reduce((acc, m) => acc + calculateWeeklyTotal(m), 0);
              const games = unitMembers.reduce((acc, m) => acc + calculateGamesTotal(m), 0);
              return { unit, weekly, games, memberCount: unitMembers.length };
            })
            .sort((a, b) => b.weekly - a.weekly)
            .map(({ unit, weekly, games, memberCount }) => (
              <div 
                key={`rank-unit-${unit}`} 
                className={`flex items-center gap-5 p-5 rounded-[2.5rem] border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 shadow-blue-900/10' 
                    : 'bg-white border-slate-100 shadow-blue-900/5'
                }`}
              >
                <div className={`w-16 h-16 shrink-0 flex items-center justify-center p-2 rounded-2xl border transition-transform duration-500 overflow-hidden shadow-inner ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
                }`} style={{ width: '64px', height: '64px' }}>
                  <img src={UNIT_LOGOS[unit] || undefined} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-black uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{unit}</h3>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md mt-1 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                    <User size={10} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{memberCount} membros</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-4 py-2 rounded-xl border-2 ${
                    isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-100'
                  }`}>
                    <span className={`text-[8px] font-black uppercase tracking-widest block mb-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                      Total Semanal
                    </span>
                    <span className={`text-xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      {weekly}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedProfile && (
        <MemberProfileModal 
          member={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default Ranking;
