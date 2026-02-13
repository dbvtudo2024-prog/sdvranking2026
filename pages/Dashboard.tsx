
import React from 'react';
import { UnitName, Member, Announcement } from '../types';
import { UNIT_LOGOS } from '../constants';
import { Users, Shield, TrendingUp, Megaphone, ChevronRight } from 'lucide-react';

interface DashboardProps {
  members: Member[];
  announcements: Announcement[];
  onSelectUnit: (unit: UnitName) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, announcements, onSelectUnit }) => {
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
      className={`bg-white rounded-[2.5rem] py-10 px-4 shadow-xl shadow-blue-900/5 border-2 flex flex-col items-center justify-center text-center transition-all active:scale-95 hover:shadow-2xl group relative overflow-hidden h-full w-full`}
      style={{ borderColor: color }}
    >
      <div className="w-24 h-24 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
        <img 
          src={UNIT_LOGOS[unit]} 
          alt={`Logo ${unit}`} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <h4 className="font-black text-slate-800 text-base sm:text-lg mb-1 whitespace-nowrap uppercase tracking-tight">{unit}</h4>
      <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
        <Users size={14} />
        <span className="text-[11px] font-bold">{stats.count} membros</span>
      </div>
      <p className="text-[#0061f2] font-black text-2xl sm:text-4xl">{stats.points} <span className="text-xs sm:text-sm">pts</span></p>
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white overflow-y-auto pb-10">
      {/* HERO BANNER - ESTILO IMAGEM 3 */}
      <div className="px-6 pt-8 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={24} className="text-[#0061f2]" strokeWidth={3} />
          <h2 className="text-[#0061f2] text-2xl font-black uppercase tracking-tight leading-none">Gestão de Unidades</h2>
        </div>
        <p className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-[0.2em] ml-8">Secretaria Virtual • Painel de Controle</p>
      </div>

      {/* ANNOUNCEMENTS SECTION */}
      <div className="px-4 mb-8 pt-4">
        <div className="bg-[#0061f2] rounded-[2.5rem] p-6 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10 rotate-12">
            <Megaphone size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Megaphone size={18} className="text-white" />
              </div>
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Mural de Avisos</h3>
            </div>

            <div className="space-y-3">
              {announcements && announcements.length > 0 ? (
                announcements.slice(0, 1).map((aviso) => (
                  <div key={aviso.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[12px] font-black text-slate-800 uppercase tracking-wide leading-tight">
                        {aviso.title}
                      </p>
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                        {aviso.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {aviso.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 rounded-3xl p-6 text-center border border-white/20">
                  <p className="text-xs text-white/60 italic font-bold">Nenhum aviso importante hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UNITS GRID SECTION */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Unidades do Clube</h3>
          <span className="text-[10px] font-bold text-slate-300 tracking-tighter uppercase">Atualizado em tempo real</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <UnitButton unit={UnitName.AGUIA_DOURADA} stats={aguiaStats} color="#FFD700" />
          <UnitButton unit={UnitName.GUERREIROS} stats={guerreirosStats} color="#0061f2" />
          <div className="col-span-2 flex justify-center">
            <div className="w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.5rem)]">
              <UnitButton unit={UnitName.LIDERANCA} stats={liderancaStats} color="#1e293b" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
