
import React from 'react';
import { UnitName, Member } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Users, Shield } from 'lucide-react';

interface UnitsProps {
  members: Member[];
  onSelectUnit: (unit: UnitName) => void;
  isDarkMode?: boolean;
}

const Units: React.FC<UnitsProps> = ({ members, onSelectUnit, isDarkMode }) => {
  const safeMembers = Array.isArray(members) ? members : [];

  const getUnitStats = (unit: UnitName) => {
    const unitMembers = safeMembers.filter(m => m.unit === unit);
    const totalPoints = unitMembers.reduce((acc, member) => {
      return acc + (Array.isArray(member.scores) ? member.scores : []).reduce((mAcc, score) => {
        return mAcc + 
               (score.punctuality || 0) + 
               (score.uniform || 0) + 
               (score.material || 0) + 
               (score.bible || 0) + 
               (score.voluntariness || 0) + 
               (score.activities || 0) + 
               (score.treasury || 0);
      }, 0);
    }, 0);
    return { count: unitMembers.length, points: totalPoints };
  };

  const aguiaStats = getUnitStats(UnitName.AGUIA_DOURADA);
  const guerreirosStats = getUnitStats(UnitName.GUERREIROS);
  const liderancaStats = getUnitStats(UnitName.LIDERANCA);

  const UnitButton = ({ unit, stats, color }: { unit: UnitName, stats: any, color: string }) => (
    <button 
      onClick={() => onSelectUnit(unit)}
      className="bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-xl shadow-blue-900/5 border-2 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-2xl group relative overflow-hidden w-full dark:border-slate-700"
      style={{ borderColor: color }}
    >
      {/* Logo Container */}
      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-700">
        <img 
          src={UNIT_LOGOS[unit]} 
          alt={`Logo ${unit}`} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Info Container */}
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-black text-slate-800 dark:text-slate-100 text-base uppercase tracking-tight leading-tight truncate">{unit}</h4>
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mt-0.5">
          <Users size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">{stats.count} membros</span>
        </div>
      </div>

      {/* Points Container */}
      <div className="text-right pr-2">
        <p className="text-[#0061f2] font-black text-2xl leading-none">{stats.points}</p>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">pontos</p>
      </div>
      
      {/* Decorative accent */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 opacity-40" style={{ backgroundColor: color }}></div>
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white dark:bg-[#0f172a] overflow-y-auto pb-24 pt-6">
      {/* UNITS LIST SECTION */}
      <div className="px-4 flex flex-col gap-4">
        <UnitButton unit={UnitName.AGUIA_DOURADA} stats={aguiaStats} color="#FFD700" />
        <UnitButton unit={UnitName.GUERREIROS} stats={guerreirosStats} color="#0061f2" />
        <UnitButton unit={UnitName.LIDERANCA} stats={liderancaStats} color="#1e293b" />
      </div>
    </div>
  );
};

export default Units;
