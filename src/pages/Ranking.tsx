
import React, { useState, useMemo } from 'react';
import { Member, UnitName, ClubUnit, DEFAULT_UNITS } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Trophy, User, Shield, Gamepad2, Crown, Medal, Star, Sparkles, Flame, ChevronRight, Award, TrendingUp, Users, Zap } from 'lucide-react';
import { calculateSpecific, calculateGamesTotal, calculateWeeklyTotal, calculateMonthlyGamesTotal, calculateMonthlySpecific, GAME_KEYS, GAMES_METADATA, EXTRA_GAME_KEYS } from '@/helpers/scoreHelpers';
import MemberProfileModal from '@/components/MemberProfileModal';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { motion, AnimatePresence } from 'motion/react';

interface RankingProps {
  members: Member[];
  isDarkMode?: boolean;
  unitsList?: ClubUnit[];
}

type TabType = 'members' | 'units' | 'games' | 'hall';
type GameTabType = 'total' | 'quiz' | 'memory' | 'specialty' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid';

const Ranking: React.FC<RankingProps> = ({ members, isDarkMode, unitsList = DEFAULT_UNITS }) => {
  const [tab, setTab] = useState<TabType>('members');
  const [gameTab, setGameTab] = useState<GameTabType>('total');
  const [selectedProfile, setSelectedProfile] = useState<Member | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Helper para obter o logo da unidade
  const getUnitLogo = (unitName?: string) => {
    if (!unitName) return null;
    const found = unitsList.find(u => u.name.trim().toLowerCase() === unitName.trim().toLowerCase());
    return found?.logoUrl || (UNIT_LOGOS as any)[unitName] || null;
  };

  // Sync profile when members list updates (ensures badges show up in real-time)
  const currentProfile = useMemo(() => {
    if (!selectedProfile) return null;
    return members.find(m => m.id === selectedProfile.id) || selectedProfile;
  }, [members, selectedProfile]);

  const allMonthsWithScores = useMemo(() => {
    const months = new Set<string>();
    members.forEach(m => {
      m.scores.forEach(s => {
        if (s.date) {
          let mStr = '';
          if (s.date.includes('-')) {
            const parts = s.date.split('-');
            if (parts.length >= 2) mStr = `${parts[0]}-${parts[1].padStart(2, '0')}`;
          } else if (s.date.includes('/')) {
            const parts = s.date.split('/');
            if (parts.length === 3) mStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
          }

          if (mStr && mStr.length === 7 && mStr !== currentMonth) {
            months.add(mStr);
          }
        }
      });
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [members, currentMonth]);

  const sortedData = useMemo(() => {
    const data = Array.isArray(members) ? [...members] : [];
    
    if (tab === 'games') {
      if (gameTab === 'total') {
        return data.sort((a, b) => calculateMonthlyGamesTotal(b, currentMonth) - calculateMonthlyGamesTotal(a, currentMonth));
      }
      
      if (gameTab === 'quiz') return data.sort((a, b) => calculateMonthlySpecific(b, 'quiz', currentMonth) - calculateMonthlySpecific(a, 'quiz', currentMonth));
      if (gameTab === 'memory') return data.sort((a, b) => calculateMonthlySpecific(b, 'memoryGame', currentMonth) - calculateMonthlySpecific(a, 'memoryGame', currentMonth));
      if (gameTab === 'specialty') return data.sort((a, b) => calculateMonthlySpecific(b, 'specialtyGame', currentMonth) - calculateMonthlySpecific(a, 'specialtyGame', currentMonth));
      if (gameTab === 'threeclues') return data.sort((a, b) => calculateMonthlySpecific(b, 'threeCluesGame', currentMonth) - calculateMonthlySpecific(a, 'threeCluesGame', currentMonth));
      if (gameTab === 'puzzle') return data.sort((a, b) => calculateMonthlySpecific(b, 'puzzleGame', currentMonth) - calculateMonthlySpecific(a, 'puzzleGame', currentMonth));
      if (gameTab === 'knots') return data.sort((a, b) => calculateMonthlySpecific(b, 'knotsGame', currentMonth) - calculateMonthlySpecific(a, 'knotsGame', currentMonth));
      if (gameTab === 'specialtytrail') return data.sort((a, b) => calculateMonthlySpecific(b, 'specialtyTrailGame', currentMonth) - calculateMonthlySpecific(a, 'specialtyTrailGame', currentMonth));
      if (gameTab === 'scrambledverse') return data.sort((a, b) => calculateMonthlySpecific(b, 'scrambledVerseGame', currentMonth) - calculateMonthlySpecific(a, 'scrambledVerseGame', currentMonth));
      if (gameTab === 'natureid') return data.sort((a, b) => calculateMonthlySpecific(b, 'natureIdGame', currentMonth) - calculateMonthlySpecific(a, 'natureIdGame', currentMonth));
      if (gameTab === 'firstaid') return data.sort((a, b) => calculateMonthlySpecific(b, 'firstAidGame', currentMonth) - calculateMonthlySpecific(a, 'firstAidGame', currentMonth));
    }
    
    return data.sort((a, b) => calculateWeeklyTotal(b) - calculateWeeklyTotal(a));
  }, [members, tab, gameTab, currentMonth]);

  const podiumSlots = [sortedData[0] || null, sortedData[1] || null, sortedData[2] || null];
  const remaining = sortedData.slice(3);

  const getPoints = (m: Member | null) => {
    if (!m) return 0;
    if (tab === 'games') {
      if (gameTab === 'quiz') return calculateMonthlySpecific(m, 'quiz', currentMonth);
      if (gameTab === 'memory') return calculateMonthlySpecific(m, 'memoryGame', currentMonth);
      if (gameTab === 'specialty') return calculateMonthlySpecific(m, 'specialtyGame', currentMonth);
      if (gameTab === 'threeclues') return calculateMonthlySpecific(m, 'threeCluesGame', currentMonth);
      if (gameTab === 'puzzle') return calculateMonthlySpecific(m, 'puzzleGame', currentMonth);
      if (gameTab === 'knots') return calculateMonthlySpecific(m, 'knotsGame', currentMonth);
      if (gameTab === 'specialtytrail') return calculateMonthlySpecific(m, 'specialtyTrailGame', currentMonth);
      if (gameTab === 'scrambledverse') return calculateMonthlySpecific(m, 'scrambledVerseGame', currentMonth);
      if (gameTab === 'natureid') return calculateMonthlySpecific(m, 'natureIdGame', currentMonth);
      if (gameTab === 'firstaid') return calculateMonthlySpecific(m, 'firstAidGame', currentMonth);
      return calculateMonthlyGamesTotal(m, currentMonth);
    }
    return calculateWeeklyTotal(m);
  };

  const totalPointsSum = useMemo(() => {
    return sortedData.reduce((sum, m) => sum + getPoints(m), 0);
  }, [sortedData, tab, gameTab, currentMonth]);

  const gameCategoriesList: { type: GameTabType; label: string; icon?: string }[] = [
    { type: 'total', label: 'Geral de Jogos' },
    { type: 'quiz', label: 'Quiz' },
    { type: 'memory', label: 'Memória' },
    { type: 'specialty', label: 'Brasões' },
    { type: 'threeclues', label: '3 Dicas' },
    { type: 'puzzle', label: 'Puzzle' },
    { type: 'knots', label: 'Nós' },
    { type: 'specialtytrail', label: 'Trilha' },
    { type: 'scrambledverse', label: 'Versículo' },
    { type: 'natureid', label: 'Natureza' },
    { type: 'firstaid', label: 'Socorros' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 overflow-y-auto h-full bg-slate-50 dark:bg-[#0f172a]">
      
      {/* ========================================================= */}
      {/* BARRA DE NAVEGAÇÃO & HEADER PARA DESKTOP E MOBILE */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-3.5 md:px-8 pt-2 md:pt-6">
        
        {/* CABEÇALHO MOBILE (COMPACTO E ELEGANTE) */}
        <div className="md:hidden pb-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/20">
                <Trophy size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                  Quadro de Honra
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 leading-tight">
                  {tab === 'members' && 'Desempenho Semanal'}
                  {tab === 'units' && 'Disputa das Unidades'}
                  {tab === 'games' && `Jogos • ${currentMonth}`}
                  {tab === 'hall' && 'Campeões Históricos'}
                </p>
              </div>
            </div>

            {/* Total de Membros Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Users size={12} className="text-[#0061f2] dark:text-blue-400" />
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{members.length} membros</span>
            </div>
          </div>

          {/* Mini-cards rápidos no mobile */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Crown size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase text-slate-400 block leading-none">Líder</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 truncate block leading-tight">
                  {podiumSlots[0]?.name?.split(' ')[0] || 'Ninguém'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Zap size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase text-slate-400 block leading-none">Pontos</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate block leading-tight">
                  {totalPointsSum} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CABEÇALHO DO RANKING NO PC */}
        <div className="hidden md:flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                <Trophy size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Quadro de Honra & Classificação
                </h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {tab === 'members' && 'Ranking individual de desempenho semanal por classe e atividades'}
                  {tab === 'units' && 'Disputa geral entre as unidades do Clube Sentinelas da Verdade'}
                  {tab === 'games' && `Temporada de Jogos do Mês (${currentMonth})`}
                  {tab === 'hall' && 'Hall dos Campeões Históricos das temporadas anteriores'}
                </p>
              </div>
            </div>
          </div>

          {/* ESTATÍSTICAS RÁPIDAS NO PC */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0061f2] dark:text-blue-400">
                <Users size={16} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-tight">Membros</span>
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{members.length}</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                <Crown size={16} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-tight">Líder Atual</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 leading-none truncate max-w-[130px] block">
                  {podiumSlots[0]?.name?.split(' ')[0] || 'Ninguém'}
                </span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                <Zap size={16} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-tight">Total de Pontos</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">{totalPointsSum} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTOR DE ABAS PRINCIPAIS */}
        {/* VERSÃO PC: Abas Modernas com Indicadores */}
        <div className="hidden md:flex items-center gap-2 mt-5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50">
          {[
            { type: 'members' as TabType, label: 'Ranking de Membros', icon: User, count: members.length },
            { type: 'units' as TabType, label: 'Batalha das Unidades', icon: Shield, count: unitsList.length },
            { type: 'games' as TabType, label: 'Central de Jogos', icon: Gamepad2, count: GAME_KEYS.length },
            { type: 'hall' as TabType, label: 'Hall da Fama', icon: Trophy, count: allMonthsWithScores.length },
          ].map(({ type, label, icon: Icon, count }) => (
            <button
              key={`pc-tab-${type}`}
              onClick={() => setTab(type)}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 ${
                tab === type
                  ? 'bg-white dark:bg-slate-700 text-[#0061f2] dark:text-blue-400 shadow-sm shadow-slate-300/50 dark:shadow-slate-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40'
              }`}
            >
              <Icon size={16} className="shrink-0" strokeWidth={2.5} />
              <span>{label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                tab === type 
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-[#0061f2] dark:text-blue-300' 
                  : 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* VERSÃO MOBILE: Seletor Otimizado com Toque Suave */}
        <div className="md:hidden bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-2xl grid grid-cols-4 gap-1 border border-slate-300/40 dark:border-slate-700/40 shadow-inner">
          <button 
            onClick={() => setTab('members')} 
            className={`py-2.5 px-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1 ${
              tab === 'members' 
                ? 'bg-white dark:bg-slate-700 shadow-xs text-[#0061f2] dark:text-blue-400 border border-white dark:border-slate-600' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <User size={13} strokeWidth={2.5} />
            <span>Membros</span>
          </button>
          <button 
            onClick={() => setTab('units')} 
            className={`py-2.5 px-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1 ${
              tab === 'units' 
                ? 'bg-white dark:bg-slate-700 shadow-xs text-[#0061f2] dark:text-blue-400 border border-white dark:border-slate-600' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Shield size={13} strokeWidth={2.5} />
            <span>Unidades</span>
          </button>
          <button 
            onClick={() => setTab('games')} 
            className={`py-2.5 px-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1 ${
              tab === 'games' 
                ? 'bg-white dark:bg-slate-700 shadow-xs text-[#0061f2] dark:text-blue-400 border border-white dark:border-slate-600' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Gamepad2 size={13} strokeWidth={2.5} />
            <span>Jogos</span>
          </button>
          <button 
            onClick={() => setTab('hall')} 
            className={`py-2.5 px-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1 ${
              tab === 'hall' 
                ? 'bg-white dark:bg-slate-700 shadow-xs text-[#0061f2] dark:text-blue-400 border border-white dark:border-slate-600' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Trophy size={13} strokeWidth={2.5} />
            <span>Hall</span>
          </button>
        </div>

        {/* SUB-ABAS DE JOGOS */}
        {tab === 'games' && (
          <div className="mt-3">
            {/* PC: Grade fluida de categorias */}
            <div className="hidden md:flex flex-wrap gap-2 items-center">
              {gameCategoriesList.map(cat => (
                <button
                  key={`pc-game-tab-${cat.type}`}
                  onClick={() => setGameTab(cat.type)}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 border ${
                    gameTab === cat.type
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <Gamepad2 size={13} className={gameTab === cat.type ? 'text-white' : 'text-slate-400'} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile: Carrossel touch horizontal com badges visualmente marcantes */}
            <div className="md:hidden flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar no-scrollbar -mx-1 px-1">
              {gameCategoriesList.map(cat => (
                <button
                  key={`mobile-game-tab-${cat.type}`}
                  onClick={() => setGameTab(cat.type)}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all uppercase tracking-tight shrink-0 border flex items-center gap-1.5 ${
                    gameTab === cat.type
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Gamepad2 size={11} className={gameTab === cat.type ? 'text-white' : 'text-slate-400'} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* ----------------- ABA: HALL DA FAMA ----------------- */}
        {tab === 'hall' ? (
          <div className="space-y-8 pb-24">
            {allMonthsWithScores.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-base font-black uppercase text-slate-600 dark:text-slate-300">Nenhum mês arquivado ainda</h3>
                <p className="text-xs text-slate-400 mt-1">O Hall da Fama exibirá o pódio dos 3 campeões de cada mês encerrado.</p>
              </div>
            ) : (
              allMonthsWithScores.map(mStr => {
                const [y, m] = mStr.split('-');
                const monthDate = new Date(parseInt(y), parseInt(m) - 1);
                const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' });
                const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                
                const monthChampions = [...members]
                  .filter(m => calculateMonthlyGamesTotal(m, mStr) > 0)
                  .sort((a, b) => {
                    const scoreB = calculateMonthlyGamesTotal(b, mStr);
                    const scoreA = calculateMonthlyGamesTotal(a, mStr);
                    if (scoreB !== scoreA) return scoreB - scoreA;
                    return a.name.localeCompare(b.name);
                  })
                  .slice(0, 3);

                if (monthChampions.length === 0) return null;

                return (
                  <div key={mStr} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <Trophy size={13} className="text-amber-500" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{monthLabel} / {y}</h3>
                      </div>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                    
                    {/* Grid responsivo: 1 col no mobile, 3 cols no PC */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {monthChampions.map((champ, idx) => {
                        const unitLogo = getUnitLogo(champ.unit);
                        return (
                          <div 
                            key={`${mStr}-${champ.id || champ.name || idx}-${idx}`} 
                            onClick={() => setSelectedProfile(champ)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer hover:scale-[1.01] transition-all ${
                              idx === 0 
                                ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-800 border-amber-300 dark:border-amber-600/40 shadow-sm' 
                                : idx === 1
                                  ? 'bg-gradient-to-r from-slate-200/50 to-white dark:from-slate-700/30 dark:to-slate-800 border-slate-200 dark:border-slate-700'
                                  : 'bg-gradient-to-r from-orange-500/10 to-white dark:from-orange-950/20 dark:to-slate-800 border-orange-200 dark:border-orange-800/40'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                              idx === 0 ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950' :
                              idx === 1 ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' :
                              'bg-amber-700 text-white'
                            }`}>
                              {idx + 1}º
                            </div>

                            {champ.photoUrl ? (
                              <img 
                                src={formatImageUrl(champ.photoUrl)} 
                                alt={champ.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700 shadow-sm" 
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700">
                                <User size={20} className="text-slate-400 dark:text-slate-500" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm uppercase truncate text-slate-900 dark:text-white">
                                {champ.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {unitLogo && <img src={unitLogo} alt={champ.unit} className="w-3.5 h-3.5 object-contain" />}
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate">{champ.unit}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[8px] font-black uppercase text-amber-500 dark:text-amber-400 block">Campeão</span>
                              <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                {calculateMonthlyGamesTotal(champ, mStr)} <span className="text-xs font-bold text-slate-400">pts</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        ) : tab !== 'units' ? (
          
          /* ----------------- ABA: MEMBROS OU JOGOS ----------------- */
          <div className="space-y-8">
            
            {/* ========================================================= */}
            {/* PÓDIO DESKTOP (PC) - VISUAL ESPORTIVO / OLYMPIC PODIUM   */}
            {/* ========================================================= */}
            <div className="hidden md:grid grid-cols-3 gap-6 items-end pt-8 pb-4">
              
              {/* 2º LUGAR (PRATA) */}
              <div 
                onClick={() => podiumSlots[1] && setSelectedProfile(podiumSlots[1])}
                className="group relative cursor-pointer rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-b from-slate-100/80 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-slate-300 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-slate-950/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Medal size={12} />
                    <span>2º Lugar • Prata</span>
                  </span>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-600">#02</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-300 dark:border-slate-600 shadow-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      {podiumSlots[1]?.photoUrl ? (
                        <img src={formatImageUrl(podiumSlots[1].photoUrl)} alt={podiumSlots[1]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={36} className="text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 shadow-sm">
                      2º
                    </div>
                  </div>

                  <h3 className="text-base font-black uppercase text-slate-900 dark:text-white truncate max-w-[200px]">
                    {podiumSlots[1]?.name || 'Disponível'}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1">
                    {getUnitLogo(podiumSlots[1]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[1]?.unit)!} alt="" className="w-4 h-4 object-contain" />
                    )}
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {podiumSlots[1]?.unit || 'Sem Unidade'}
                    </span>
                  </div>

                  {/* Badge de Pontuação */}
                  <div className="mt-4 w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {tab === 'games' ? 'Pontos Jogos' : 'Pontos Semanal'}
                    </span>
                    <span className="text-2xl font-black text-slate-700 dark:text-slate-200 tabular-nums">
                      {podiumSlots[1] ? getPoints(podiumSlots[1]) : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1º LUGAR (OURO - CAMPEÃO MASTER) */}
              <div 
                onClick={() => podiumSlots[0] && setSelectedProfile(podiumSlots[0])}
                className="group relative cursor-pointer rounded-3xl p-7 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-b from-amber-500/15 via-white to-amber-500/5 dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-900 border-amber-400 dark:border-amber-500/60 shadow-xl shadow-amber-500/10 dark:shadow-amber-500/5 -translate-y-4"
              >
                {/* Glow de destaque no topo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <Crown size={14} className="fill-slate-950" />
                  <span>1º LUGAR • CAMPEÃO</span>
                </div>

                <div className="flex items-center justify-between mb-4 pt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Sparkles size={13} />
                    <span>Líder da Classificação</span>
                  </span>
                  <span className="text-3xl font-black text-amber-500/40">#01</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-amber-400 dark:border-amber-500 shadow-xl bg-amber-50 dark:bg-slate-700 flex items-center justify-center ring-4 ring-amber-400/20">
                      {podiumSlots[0]?.photoUrl ? (
                        <img src={formatImageUrl(podiumSlots[0].photoUrl)} alt={podiumSlots[0]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={44} className="text-amber-500" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-white dark:border-slate-800 flex items-center justify-center font-black text-sm text-slate-950 shadow-md">
                      1º
                    </div>
                  </div>

                  <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white truncate max-w-[220px]">
                    {podiumSlots[0]?.name || 'Disponível'}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1">
                    {getUnitLogo(podiumSlots[0]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[0]?.unit)!} alt="" className="w-4 h-4 object-contain" />
                    )}
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                      {podiumSlots[0]?.unit || 'Sem Unidade'}
                    </span>
                  </div>

                  {/* Insígnias do 1º Lugar */}
                  {(podiumSlots[0]?.badges || []).length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {podiumSlots[0]?.badges.slice(0, 4).map((b, bIdx) => (
                        <span key={`pc-podium-b-${bIdx}`} className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-black text-amber-700 dark:text-amber-300">
                          {b.monthLabel || 'Campeão'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Placar Dourado Central */}
                  <div className="mt-4 w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-400/40 dark:border-amber-500/30 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block leading-tight">
                        {tab === 'games' ? 'Pontos Jogos' : 'Pontos Semanal'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {tab === 'games' ? 'Mês Atual' : 'Temporada'}
                      </span>
                    </div>
                    <span className="text-3xl lg:text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      {podiumSlots[0] ? getPoints(podiumSlots[0]) : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3º LUGAR (BRONZE) */}
              <div 
                onClick={() => podiumSlots[2] && setSelectedProfile(podiumSlots[2])}
                className="group relative cursor-pointer rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-b from-orange-100/60 via-white to-orange-50/40 dark:from-orange-950/20 dark:via-slate-800 dark:to-slate-900 border-amber-700/30 dark:border-amber-800/50 shadow-md shadow-orange-900/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300">
                    <Medal size={12} />
                    <span>3º Lugar • Bronze</span>
                  </span>
                  <span className="text-2xl font-black text-amber-800/30 dark:text-amber-700/30">#03</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-amber-700/40 dark:border-amber-800/60 shadow-lg bg-orange-50 dark:bg-slate-700 flex items-center justify-center">
                      {podiumSlots[2]?.photoUrl ? (
                        <img src={formatImageUrl(podiumSlots[2].photoUrl)} alt={podiumSlots[2]?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={36} className="text-amber-700" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-700 border-2 border-white dark:border-slate-800 flex items-center justify-center font-black text-xs text-white shadow-sm">
                      3º
                    </div>
                  </div>

                  <h3 className="text-base font-black uppercase text-slate-900 dark:text-white truncate max-w-[200px]">
                    {podiumSlots[2]?.name || 'Disponível'}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1">
                    {getUnitLogo(podiumSlots[2]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[2]?.unit)!} alt="" className="w-4 h-4 object-contain" />
                    )}
                    <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {podiumSlots[2]?.unit || 'Sem Unidade'}
                    </span>
                  </div>

                  {/* Badge de Pontuação */}
                  <div className="mt-4 w-full py-3 px-4 rounded-2xl bg-amber-50/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {tab === 'games' ? 'Pontos Jogos' : 'Pontos Semanal'}
                    </span>
                    <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
                      {podiumSlots[2] ? getPoints(podiumSlots[2]) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* PÓDIO MOBILE (CELULAR) - DESIGN ESPORTIVO DINÂMICO       */}
            {/* ========================================================= */}
            <div className="md:hidden flex items-end justify-center gap-2 pt-5 pb-3">
              
              {/* 2º LUGAR (PRATA) */}
              <div 
                onClick={() => podiumSlots[1] && setSelectedProfile(podiumSlots[1])}
                className="flex flex-col items-center flex-1 max-w-[105px] cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative mb-1">
                  <div className="w-16 h-16 rounded-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-800 shadow-md flex items-center justify-center">
                    {podiumSlots[1]?.photoUrl ? (
                      <img src={formatImageUrl(podiumSlots[1].photoUrl)} alt={podiumSlots[1]?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={26} className="text-slate-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-slate-300 dark:bg-slate-600 border border-white dark:border-slate-800 flex items-center justify-center font-black text-[10px] text-slate-800 dark:text-slate-100 shadow-xs">
                    2º
                  </div>
                </div>

                <div className="text-center my-1 px-0.5 w-full">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">
                    {podiumSlots[1]?.name?.split(' ')[0] || 'Livre'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {getUnitLogo(podiumSlots[1]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[1]?.unit)!} alt="" className="w-3 h-3 object-contain shrink-0" />
                    )}
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate">
                      {podiumSlots[1]?.unit || 'Sem Unidade'}
                    </p>
                  </div>
                </div>

                {/* Pedestal Prata */}
                <div className="w-full h-24 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900 rounded-t-2xl border-t-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                    {tab === 'games' ? 'Jogos' : 'Semanal'}
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
                    {podiumSlots[1] ? getPoints(podiumSlots[1]) : 0}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400">pts</span>
                </div>
              </div>

              {/* 1º LUGAR (OURO / CAMPEÃO) */}
              <div 
                onClick={() => podiumSlots[0] && setSelectedProfile(podiumSlots[0])}
                className="flex flex-col items-center flex-1 max-w-[125px] cursor-pointer active:scale-95 transition-transform z-10 -translate-y-3"
              >
                <div className="relative mb-1">
                  <div className="w-20 h-20 rounded-3xl border-3 border-amber-400 dark:border-amber-500 overflow-hidden bg-amber-50 dark:bg-slate-800 shadow-xl flex items-center justify-center ring-2 ring-amber-400/30">
                    {podiumSlots[0]?.photoUrl ? (
                      <img src={formatImageUrl(podiumSlots[0].photoUrl)} alt={podiumSlots[0]?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={34} className="text-amber-500" />
                    )}
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
                    <Crown size={14} className="fill-slate-950" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-white dark:border-slate-800 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm">
                    1º
                  </div>
                </div>

                <div className="text-center my-1 px-0.5 w-full">
                  <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase truncate leading-tight">
                    {podiumSlots[0]?.name?.split(' ')[0] || 'Livre'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {getUnitLogo(podiumSlots[0]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[0]?.unit)!} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
                    )}
                    <p className="text-[8px] font-black text-amber-700/80 dark:text-amber-400/85 uppercase truncate">
                      {podiumSlots[0]?.unit || 'Sem Unidade'}
                    </p>
                  </div>
                </div>

                {/* Pedestal Ouro */}
                <div className="w-full h-32 bg-gradient-to-b from-amber-500/15 via-white to-amber-50 dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-900 rounded-t-2xl border-t-3 border-amber-400 dark:border-amber-500 shadow-md flex flex-col items-center justify-center p-2 text-center">
                  <Trophy size={18} className="text-amber-500 mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                    {tab === 'games' ? 'Jogos' : 'Semanal'}
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {podiumSlots[0] ? getPoints(podiumSlots[0]) : 0}
                  </span>
                  <span className="text-[8px] font-bold text-amber-500">pontos</span>
                </div>
              </div>

              {/* 3º LUGAR (BRONZE) */}
              <div 
                onClick={() => podiumSlots[2] && setSelectedProfile(podiumSlots[2])}
                className="flex flex-col items-center flex-1 max-w-[105px] cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative mb-1">
                  <div className="w-16 h-16 rounded-2xl border-2 border-amber-700/40 dark:border-amber-800/60 overflow-hidden bg-orange-50 dark:bg-slate-800 shadow-md flex items-center justify-center">
                    {podiumSlots[2]?.photoUrl ? (
                      <img src={formatImageUrl(podiumSlots[2].photoUrl)} alt={podiumSlots[2]?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={26} className="text-amber-700" />
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-amber-700 border border-white dark:border-slate-800 flex items-center justify-center font-black text-[10px] text-white shadow-xs">
                    3º
                  </div>
                </div>

                <div className="text-center my-1 px-0.5 w-full">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">
                    {podiumSlots[2]?.name?.split(' ')[0] || 'Livre'}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {getUnitLogo(podiumSlots[2]?.unit) && (
                      <img src={getUnitLogo(podiumSlots[2]?.unit)!} alt="" className="w-3 h-3 object-contain shrink-0" />
                    )}
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate">
                      {podiumSlots[2]?.unit || 'Sem Unidade'}
                    </p>
                  </div>
                </div>

                {/* Pedestal Bronze */}
                <div className="w-full h-20 bg-gradient-to-b from-orange-100/60 to-orange-200/50 dark:from-orange-950/20 dark:to-slate-900 rounded-t-2xl border-t-2 border-amber-700/40 dark:border-amber-800/60 shadow-sm flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[8px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-0.5">
                    {tab === 'games' ? 'Jogos' : 'Semanal'}
                  </span>
                  <span className="text-xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
                    {podiumSlots[2] ? getPoints(podiumSlots[2]) : 0}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400">pts</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LISTAGEM DOS DEMAIS MEMBROS (4º LUGAR EM DIANTE)          */}
            {/* ========================================================= */}
            
            {/* VERSÃO PC: TABELA ELEGANTE DE DESEMPENHO */}
            <div className="hidden md:block pb-24">
              <div className="flex items-center justify-between mb-3 px-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Classificação Geral ({remaining.length} membros seguintes)
                </h4>
                <span className="text-xs font-semibold text-slate-400">Clique em qualquer desbravador para abrir a ficha completa</span>
              </div>

              <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
                {/* Header da Tabela */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/60 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <div className="col-span-1 text-center">Posição</div>
                  <div className="col-span-4">Desbravador</div>
                  <div className="col-span-3">Unidade & Cargo</div>
                  <div className="col-span-2">Conquistas</div>
                  <div className="col-span-2 text-right">Pontos Totais</div>
                </div>

                {/* Linhas da Tabela */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {remaining.map((m, idx) => {
                    const pos = idx + 4;
                    const unitLogo = getUnitLogo(m.unit);
                    const pts = getPoints(m);

                    return (
                      <div
                        key={`pc-rank-member-${m.id || 'mem'}-${idx}`}
                        onClick={() => setSelectedProfile(m)}
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-blue-50/50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
                      >
                        {/* Posição */}
                        <div className="col-span-1 flex justify-center">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                            {pos}º
                          </span>
                        </div>

                        {/* Desbravador */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          {m.photoUrl ? (
                            <img
                              src={formatImageUrl(m.photoUrl)}
                              alt={m.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              <User size={18} className="text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-sm uppercase text-slate-900 dark:text-white truncate group-hover:text-[#0061f2] dark:group-hover:text-blue-400 transition-colors">
                              {m.name}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-400 block truncate">
                              {m.className || 'Classe Desbravador'}
                            </span>
                          </div>
                        </div>

                        {/* Unidade & Cargo */}
                        <div className="col-span-3 flex items-center gap-2 min-w-0">
                          {unitLogo && (
                            <img src={unitLogo} alt={m.unit} className="w-5 h-5 object-contain shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 truncate block">
                              {m.unit || 'Sem Unidade'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium truncate block">
                              {m.funcao || 'Membro'}
                            </span>
                          </div>
                        </div>

                        {/* Conquistas */}
                        <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                          {(m.badges || []).length > 0 ? (
                            (m.badges || []).slice(0, 3).map((b, bIdx) => (
                              <span
                                key={`pc-badge-${m.id}-${bIdx}`}
                                title={b.monthLabel || 'Medalha'}
                                className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500"
                              >
                                <Trophy size={11} />
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">--</span>
                          )}
                        </div>

                        {/* Pontos Totais */}
                        <div className="col-span-2 flex items-center justify-end gap-3">
                          <div className="text-right">
                            <span className="text-base lg:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                              {pts}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 block leading-none">
                              pontos
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* VERSÃO MOBILE: LISTA VERTICAL OTIMIZADA E ESPORTIVA */}
            <div className="md:hidden space-y-2.5 pb-24">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Classificação Geral ({remaining.length})
                </span>
                <span className="text-[9px] font-medium text-slate-400">Toque para ver perfil</span>
              </div>

              {remaining.map((m, idx) => {
                const pos = idx + 4;
                const unitLogo = getUnitLogo(m.unit);
                const pts = getPoints(m);

                return (
                  <div 
                    key={`rank-member-${m.id || m.name || idx}-${idx}`} 
                    onClick={() => setSelectedProfile(m)}
                    className="group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    {/* Badge de Posição */}
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200/80 dark:border-slate-700/80">
                      {pos}º
                    </div>

                    {/* Foto / Avatar */}
                    {m.photoUrl ? (
                      <img 
                        src={formatImageUrl(m.photoUrl)} 
                        alt={m.name}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <User size={20} className="text-slate-400 dark:text-slate-500" />
                      </div>
                    )}

                    {/* Nome & Unidade */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-xs uppercase truncate text-slate-900 dark:text-white">
                          {m.name}
                        </h4>
                        
                        {(m.badges || []).length > 0 && (
                          <div className="flex -space-x-1 shrink-0">
                            {(m.badges || []).slice(0, 2).map((ub, bidx) => (
                              <div 
                                key={`mini-badge-${m.id || 'mem'}-${ub.badgeId || bidx}-${bidx}`}
                                className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white dark:border-slate-800 flex items-center justify-center"
                              >
                                <Trophy size={7} className="text-slate-950" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {unitLogo && (
                          <img src={unitLogo} alt={m.unit} className="w-3 h-3 object-contain shrink-0" />
                        )}
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">
                          {m.unit || 'Sem Unidade'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                        <span className="text-[9px] font-medium text-slate-400 truncate">
                          {m.className || 'Desbravador'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Pontuação */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <div className={`px-2.5 py-1 rounded-xl border flex flex-col items-end justify-center ${
                        tab === 'games' 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/10 border-blue-500/30 text-[#0061f2] dark:text-blue-400'
                      }`}>
                        <span className="text-[7px] font-black uppercase tracking-wider block opacity-80 leading-none">
                          {tab === 'games' ? 'Jogos' : 'Semanal'}
                        </span>
                        <span className="text-sm font-black tabular-nums leading-tight mt-0.5">
                          {pts}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          
          /* ----------------- ABA: UNIDADES ----------------- */
          <div className="space-y-6 pb-24">
            
            {/* VERSÃO PC: BANNERS ESPORTIVOS DAS UNIDADES */}
            <div className="hidden md:block space-y-6">
              {(() => {
                const rankedUnits = unitsList
                  .map(unitObj => {
                    const unitName = unitObj.name;
                    const unitMembers = members.filter(m => (m.unit || '').trim().toLowerCase() === unitName.trim().toLowerCase());
                    const weekly = unitMembers.reduce((acc, m) => acc + calculateWeeklyTotal(m), 0);
                    const games = unitMembers.reduce((acc, m) => acc + calculateGamesTotal(m), 0);
                    const logo = unitObj.logoUrl || (UNIT_LOGOS as any)[unitName];
                    const color = unitObj.color || '#0061f2';
                    const avgWeekly = unitMembers.length > 0 ? Math.round(weekly / unitMembers.length) : 0;
                    return { unit: unitName, unitObj, logo, color, weekly, games, memberCount: unitMembers.length, avgWeekly };
                  })
                  .sort((a, b) => b.weekly - a.weekly);

                const leaderUnit = rankedUnits[0];
                const otherUnits = rankedUnits.slice(1);
                const maxPoints = Math.max(...rankedUnits.map(u => u.weekly), 1);

                return (
                  <div className="space-y-6">
                    {/* Unidade Líder em Super Destaque */}
                    {leaderUnit && (
                      <div className="p-8 rounded-3xl border-2 border-amber-400 dark:border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-white to-amber-500/5 dark:from-amber-500/20 dark:via-slate-800 dark:to-slate-900 shadow-xl shadow-amber-500/10 flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-400 p-3 shadow-lg flex items-center justify-center">
                              {leaderUnit.logo ? (
                                <img src={leaderUnit.logo} alt={leaderUnit.unit} className="w-full h-full object-contain filter drop-shadow-md" />
                              ) : (
                                <Shield size={48} style={{ color: leaderUnit.color }} />
                              )}
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
                              <Crown size={16} />
                            </div>
                          </div>

                          <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
                              <Trophy size={12} />
                              <span>1º Lugar • Unidade Líder</span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              {leaderUnit.unit}
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {leaderUnit.memberCount} integrantes • Média de {leaderUnit.avgWeekly} pts por desbravador
                            </p>
                          </div>
                        </div>

                        {/* Placar da Líder */}
                        <div className="flex items-center gap-6">
                          <div className="text-right pr-6 border-r border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Jogos Totais</span>
                            <span className="text-xl font-black text-slate-700 dark:text-slate-300 tabular-nums">{leaderUnit.games} pts</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Pontuação Semanal</span>
                            <span className="text-4xl lg:text-5xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{leaderUnit.weekly}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Grid das Demais Unidades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {otherUnits.map((u, uIdx) => {
                        const rankPos = uIdx + 2;
                        const percentage = Math.round((u.weekly / maxPoints) * 100);

                        return (
                          <div
                            key={`pc-other-unit-${u.unit}-${uIdx}`}
                            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shrink-0">
                                  {u.logo ? (
                                    <img src={u.logo} alt={u.unit} className="w-full h-full object-contain" />
                                  ) : (
                                    <Shield size={32} style={{ color: u.color }} />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300">
                                      {rankPos}º
                                    </span>
                                    <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">
                                      {u.unit}
                                    </h3>
                                  </div>
                                  <span className="text-xs text-slate-400 font-medium block mt-1">
                                    {u.memberCount} integrantes • {u.avgWeekly} pts/membro
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Semanal</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                                  {u.weekly}
                                </span>
                              </div>
                            </div>

                            {/* Barra de Progresso Comparativa */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span>Desempenho relativo</span>
                                <span>{percentage}% do líder</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-[#0061f2]" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* VERSÃO MOBILE: LISTA ORIGINAL COMPACTA */}
            <div className="md:hidden space-y-3 max-w-3xl mx-auto">
              {unitsList
                .map(unitObj => {
                  const unitName = unitObj.name;
                  const unitMembers = members.filter(m => (m.unit || '').trim().toLowerCase() === unitName.trim().toLowerCase());
                  const weekly = unitMembers.reduce((acc, m) => acc + calculateWeeklyTotal(m), 0);
                  const games = unitMembers.reduce((acc, m) => acc + calculateGamesTotal(m), 0);
                  const logo = unitObj.logoUrl || (UNIT_LOGOS as any)[unitName];
                  const color = unitObj.color || '#0061f2';
                  return { unit: unitName, unitObj, logo, color, weekly, games, memberCount: unitMembers.length };
                })
                .sort((a, b) => b.weekly - a.weekly)
                .map(({ unit, logo, color, weekly, games, memberCount }, uIdx) => {
                  const rankPos = uIdx + 1;
                  return (
                    <div 
                      key={`rank-unit-${unit}-${uIdx}`} 
                      id={`rank-unit-card-${uIdx}`}
                      className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                        rankPos === 1
                          ? isDarkMode 
                            ? 'bg-gradient-to-r from-yellow-900/15 via-slate-800 to-slate-800 border-yellow-500/30 shadow-md shadow-yellow-500/5'
                            : 'bg-gradient-to-r from-yellow-50/80 via-white to-white border-yellow-200/80 shadow-sm shadow-yellow-500/5'
                          : isDarkMode 
                            ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm shadow-slate-200/50'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border ${
                        rankPos === 1 
                          ? 'bg-yellow-400 text-yellow-950 border-yellow-300 shadow-xs' 
                          : rankPos === 2
                            ? isDarkMode ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-200 text-slate-700 border-slate-300'
                            : rankPos === 3
                              ? isDarkMode ? 'bg-amber-900/40 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-200'
                              : isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {rankPos}º
                      </div>

                      <div className="w-11 h-11 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center">
                        {logo ? (
                          <img 
                            src={logo} 
                            alt={unit} 
                            className="w-10 h-10 sm:w-12 sm:h-12 max-w-[48px] max-h-[48px] object-contain filter drop-shadow-sm pointer-events-none" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <Shield size={26} style={{ color }} className="shrink-0 drop-shadow-xs" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className={`text-xs sm:text-sm md:text-base font-black uppercase leading-tight truncate ${
                          rankPos === 1 
                            ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-900') 
                            : (isDarkMode ? 'text-white' : 'text-slate-900')
                        }`}>
                          {unit}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
                            isDarkMode ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <User size={10} className="shrink-0" />
                            <span>{memberCount} {memberCount === 1 ? 'membro' : 'membros'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border flex flex-col items-end justify-center ${
                          rankPos === 1
                            ? isDarkMode ? 'bg-yellow-950/40 border-yellow-700/40 text-yellow-400' : 'bg-yellow-50/80 border-yellow-200 text-yellow-800'
                            : isDarkMode ? 'bg-blue-950/30 border-blue-800/30 text-blue-400' : 'bg-blue-50/60 border-blue-100 text-[#0061f2]'
                        }`}>
                          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider block opacity-75">
                            Semanal
                          </span>
                          <span className="text-sm sm:text-lg font-black tracking-tight tabular-nums leading-tight">
                            {weekly}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {currentProfile && (
        <MemberProfileModal 
          member={currentProfile} 
          onClose={() => setSelectedProfile(null)} 
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default Ranking;

