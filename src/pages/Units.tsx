
import React from 'react';
import { UnitName, Member } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Users, Shield, Trophy } from 'lucide-react';
import { calculateWeeklyTotal, calculateGamesTotal } from '@/helpers/scoreHelpers';

interface UnitsProps {
  members: Member[];
  onSelectUnit: (unit: UnitName) => void;
  onGoToBirthdays: () => void;
  isDarkMode?: boolean;
}

const Units: React.FC<UnitsProps> = ({ members, onSelectUnit, onGoToBirthdays, isDarkMode }) => {
  const safeMembers = Array.isArray(members) ? members : [];

  const getUnitStats = (unit: UnitName) => {
    const unitMembers = safeMembers.filter(m => m.unit === unit);
    const weeklyPoints = unitMembers.reduce((acc, member) => acc + calculateWeeklyTotal(member), 0);
    const gamePoints = unitMembers.reduce((acc, member) => acc + calculateGamesTotal(member), 0);
    return { count: unitMembers.length, weeklyPoints, gamePoints };
  };

  const aguiaStats = getUnitStats(UnitName.AGUIA_DOURADA);
  const guerreirosStats = getUnitStats(UnitName.GUERREIROS);
  const liderancaStats = getUnitStats(UnitName.LIDERANCA);

  const UnitButton = ({ unit, stats, color }: { unit: UnitName, stats: any, color: string }) => (
    <button 
      onClick={() => onSelectUnit(unit)}
      className={`group relative flex items-center gap-5 p-5 rounded-[2.5rem] border-2 transition-all active:scale-[0.98] w-full shadow-xl ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:border-blue-900 shadow-blue-900/10' 
          : 'bg-white border-slate-50 hover:border-blue-100 shadow-blue-900/5'
      }`}
    >
      <div className={`w-16 h-16 shrink-0 flex items-center justify-center p-2 rounded-2xl border-2 transition-transform duration-500 group-hover:scale-110 overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'
      }`} style={{ width: '64px', height: '64px' }}>
        <img 
          src={UNIT_LOGOS[unit]} 
          alt={`Logo ${unit}`} 
          className="w-full h-full object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <h4 className={`font-black text-lg uppercase tracking-tight leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{unit}</h4>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
            <Users size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">{stats.count} Integrantes</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={`shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-xl border-2 ${
          isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-100'
        }`}>
          <span className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>Pontos Semanais</span>
          <span className={`text-xl font-black leading-none ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{stats.weeklyPoints}</span>
        </div>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-l-full" style={{ backgroundColor: color }}></div>
    </button>
  );

  return (
    <div className={`flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto pb-8 pt-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <div className="px-6 flex flex-col gap-5 mb-8">
        <UnitButton unit={UnitName.AGUIA_DOURADA} stats={aguiaStats} color="#FFD700" />
        <UnitButton unit={UnitName.GUERREIROS} stats={guerreirosStats} color="#0061f2" />
        <UnitButton unit={UnitName.LIDERANCA} stats={liderancaStats} color="#1e293b" />
      </div>
    </div>
  );
};

export default Units;
