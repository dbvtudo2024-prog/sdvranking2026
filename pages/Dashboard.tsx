
import React from 'react';
import { UnitName, Member, Announcement } from '../types';
import { UNIT_LOGOS } from '../constants';
import { Users, Shield, TrendingUp } from 'lucide-react';

interface DashboardProps {
  members: Member[];
  announcements: Announcement[];
  onSelectUnit: (unit: UnitName) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, announcements, onSelectUnit }) => {
  const safeMembers = Array.isArray(members) ? members : [];

  const getUnitStats = (unit: UnitName) => {
    const unitMembers = safeMembers.filter(m => m.unit === unit);
    // TOTALIZADOR BASEADO APENAS NAS PONTUAÇÕES SEMANAIS (CONFORME SOLICITADO)
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-slate-50">
      <div className="pt-8 pb-4 px-6">
         <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Painel de Unidades</h2>
         <p className="text-[#0061f2] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
          <TrendingUp size={12} /> Pontuação Semanal (Secretaria)
        </p>
      </div>

      <div className="px-2 sm:px-4 space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onSelectUnit(UnitName.AGUIA_DOURADA)}
            className="bg-white rounded-[2.5rem] py-6 sm:py-10 px-4 shadow-xl shadow-blue-900/5 border-2 border-[#FFD700] flex flex-col items-center justify-center text-center transition-all active:scale-95 hover:shadow-2xl hover:bg-yellow-50 group"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 flex items-center justify-center">
              <img 
                src={UNIT_LOGOS[UnitName.AGUIA_DOURADA]} 
                alt="Logo Águia" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-1 whitespace-nowrap uppercase">Águia Dourada</h4>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <Users size={12} />
              <span className="text-[10px] font-bold">{aguiaStats.count}</span>
            </div>
            <p className="text-[#0061f2] font-black text-sm sm:text-xl">{aguiaStats.points} pts</p>
          </button>

          <button 
            onClick={() => onSelectUnit(UnitName.GUERREIROS)}
            className="bg-white rounded-[2.5rem] py-6 sm:py-10 px-4 shadow-xl shadow-blue-900/5 border-2 border-[#0061f2] flex flex-col items-center justify-center text-center transition-all active:scale-95 hover:shadow-2xl hover:bg-blue-50 group"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 flex items-center justify-center">
              <img 
                src={UNIT_LOGOS[UnitName.GUERREIROS]} 
                alt="Logo Guerreiros" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-1 whitespace-nowrap uppercase">Guerreiros</h4>
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <Users size={12} />
              <span className="text-[10px] font-bold">{guerreirosStats.count}</span>
            </div>
            <p className="text-[#0061f2] font-black text-sm sm:text-xl">{guerreirosStats.points} pts</p>
          </button>
        </div>

        <button 
          onClick={() => onSelectUnit(UnitName.LIDERANCA)}
          className="w-full bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center justify-between transition-all active:scale-95 hover:shadow-2xl hover:border-blue-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center p-2 bg-slate-50 rounded-2xl">
              <img 
                src={UNIT_LOGOS[UnitName.LIDERANCA]} 
                alt="Logo Liderança" 
                className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-500" 
              />
            </div>
            <div className="text-left">
              <h4 className="font-black text-slate-800 text-sm sm:text-lg uppercase">Equipe de Liderança</h4>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Shield size={14} className="text-[#0061f2]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{liderancaStats.count} Ativos</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[#0061f2] font-black text-lg sm:text-2xl">{liderancaStats.points}</p>
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total</p>
          </div>
        </button>
      </div>

      <div className="mt-auto p-4 sm:p-8">
        <h3 className="text-[10px] font-black text-[#0061f2] uppercase tracking-[0.2em] mb-3 ml-2">Mural de Avisos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements && announcements.length > 0 ? (
            announcements.slice(0, 2).map((aviso) => (
              <div key={aviso.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] font-black text-[#0061f2] uppercase tracking-wide leading-tight truncate">
                    {aviso.title}
                  </p>
                  <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    {aviso.date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                  {aviso.content}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-slate-100/50 rounded-3xl p-5 border border-slate-200/50 text-center">
              <p className="text-xs text-slate-400 italic">Nenhum aviso no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
