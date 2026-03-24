
import React, { useMemo } from 'react';
import { UnitName, Member } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { Users, Cake, Calendar, Star } from 'lucide-react';

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

  // Lógica de Aniversariantes
  const currentMonth = new Date().getMonth(); // 0-11
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const birthdayMembers = useMemo(() => {
    return safeMembers.filter(m => {
      if (!m.birthday) return false;
      const bDate = new Date(m.birthday);
      // O input date salva como AAAA-MM-DD. O new Date(m.birthday) pode ter problemas de timezone.
      // Vamos extrair o mês manualmente se for string AAAA-MM-DD
      if (m.birthday.includes('-')) {
        const parts = m.birthday.split('-');
        return parseInt(parts[1]) - 1 === currentMonth;
      }
      return bDate.getMonth() === currentMonth;
    }).sort((a, b) => {
      const dayA = a.birthday?.includes('-') ? parseInt(a.birthday.split('-')[2]) : new Date(a.birthday!).getDate();
      const dayB = b.birthday?.includes('-') ? parseInt(b.birthday.split('-')[2]) : new Date(b.birthday!).getDate();
      return dayA - dayB;
    });
  }, [safeMembers, currentMonth]);

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
      <div className="px-4 flex flex-col gap-4 mb-10">
        <UnitButton unit={UnitName.AGUIA_DOURADA} stats={aguiaStats} color="#FFD700" />
        <UnitButton unit={UnitName.GUERREIROS} stats={guerreirosStats} color="#0061f2" />
        <UnitButton unit={UnitName.LIDERANCA} stats={liderancaStats} color="#1e293b" />
      </div>

      {/* ANIVERSARIANTES SECTION */}
      <div className="px-4 pb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Cake className="text-pink-500" size={24} />
              Aniversariantes
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
              Mês de {monthNames[currentMonth]}
            </p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 px-3 py-1.5 rounded-full border border-pink-100 dark:border-pink-800/50">
            <span className="text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">
              {birthdayMembers.length} {birthdayMembers.length === 1 ? 'Membro' : 'Membros'}
            </span>
          </div>
        </div>

        {birthdayMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {birthdayMembers.map(member => {
              const day = member.birthday?.includes('-') ? member.birthday.split('-')[2] : new Date(member.birthday!).getDate();
              const isToday = parseInt(day.toString()) === new Date().getDate();
              
              return (
                <div 
                  key={member.id}
                  className={`relative overflow-hidden p-4 rounded-[2rem] border-2 transition-all shadow-lg ${
                    isToday 
                      ? 'bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-slate-800 border-pink-200 dark:border-pink-800 shadow-pink-500/10' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-blue-900/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Photo */}
                    <div className={`w-14 h-14 rounded-full flex-shrink-0 border-2 overflow-hidden ${isToday ? 'border-pink-400' : 'border-slate-100 dark:border-slate-700'}`}>
                      {member.photoUrl ? (
                        <img src={member.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight leading-tight truncate">
                        {member.name}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                        {member.unit} • {member.className || 'Liderança'}
                      </p>
                    </div>

                    {/* Date Badge */}
                    <div className={`flex flex-col items-center justify-center min-w-[50px] h-14 rounded-2xl border ${
                      isToday 
                        ? 'bg-pink-500 text-white border-pink-400' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-700'
                    }`}>
                      <span className="text-lg font-black leading-none">{day}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Dia</span>
                    </div>
                  </div>

                  {isToday && (
                    <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                      <Star size={12} fill="white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-12 flex flex-col items-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
              <Calendar size={32} />
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Nenhum aniversariante em {monthNames[currentMonth]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Units;
