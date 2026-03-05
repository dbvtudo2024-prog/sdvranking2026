
import React, { useState } from 'react';
import { Member, UserRole, UnitName } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { X, Award, Shield, Calendar, Users, Star, Trophy, Gamepad2, BookOpen } from 'lucide-react';

interface PathfindersProps {
  members: Member[];
  isDarkMode?: boolean;
}

const Pathfinders: React.FC<PathfindersProps> = ({ members, isDarkMode }) => {
  const [selectedPathfinder, setSelectedPathfinder] = useState<Member | null>(null);

  const pathfinders = (members || [])
    .filter(m => m.role === UserRole.PATHFINDER)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const getCompletedSpecialties = (member: Member) => {
    if (!member || !member.scores) return [];
    const specialties = member.scores
      .filter(s => s.specialtyStudyId && s.specialtyStudyName)
      .map(s => s.specialtyStudyName as string);
    return Array.from(new Set(specialties));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-y-auto">
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24 pt-8">
        {pathfinders.length > 0 ? (
          pathfinders.map((pathfinder) => (
            <div 
              key={pathfinder.id}
              onClick={() => setSelectedPathfinder(pathfinder)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 flex items-center gap-4 cursor-pointer active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 w-6 h-6 opacity-40">
                 <img src={UNIT_LOGOS[pathfinder.unit] || undefined} className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-900 flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-md overflow-hidden">
                {pathfinder.photoUrl ? (
                  <img src={pathfinder.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pathfinder.id}`} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">{pathfinder.name}</h3>
                <p className="text-[10px] font-black text-[#0061f2] uppercase tracking-widest">{pathfinder.unit}</p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400 dark:text-slate-500">
                  <Star size={10} className="text-amber-400" />
                  <span className="text-[9px] font-bold uppercase truncate">{calculateWeeklyTotal(pathfinder) + calculateGamesTotal(pathfinder)} Pontos Totais</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-30">
             <Users size={80} className="mx-auto mb-4 text-[#0061f2]" />
             <p className="font-black uppercase tracking-widest text-xs">Nenhum desbravador encontrado</p>
          </div>
        )}
      </div>

      {selectedPathfinder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col relative">
            <button onClick={() => setSelectedPathfinder(null)} className="absolute top-6 right-6 p-2 bg-black/10 dark:bg-white/10 rounded-full text-white z-20 hover:bg-black/20 transition-colors">
              <X size={24} />
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <div className={`h-32 relative ${selectedPathfinder.unit === UnitName.AGUIA_DOURADA ? 'bg-yellow-400' : 'bg-[#0061f2]'}`}>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-[2rem] bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                       {selectedPathfinder.photoUrl ? (
                         <img src={selectedPathfinder.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       ) : (
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPathfinder.id}`} className="w-full h-full object-cover" />
                       )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-14 p-8 pb-10 text-center space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase leading-tight">{selectedPathfinder.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0061f2] rounded-full">
                  <Award size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {selectedPathfinder.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                    <Calendar size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Idade</p>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300">{selectedPathfinder.age} anos</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                    <Users size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Classe</p>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 text-center leading-tight whitespace-normal break-words">
                    {selectedPathfinder.className || 'Não Informada'}
                  </p>
                </div>
              </div>

              {/* PONTUAÇÕES SIMPLIFICADAS */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Trophy size={12} /> Pontuações
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Semanal</p>
                    <p className="text-lg font-black text-[#0061f2]">{calculateWeeklyTotal(selectedPathfinder)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Jogos</p>
                    <p className="text-lg font-black text-pink-500">{calculateGamesTotal(selectedPathfinder)}</p>
                  </div>
                </div>
              </div>

              {/* ESPECIALIDADES CONCLUÍDAS */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <BookOpen size={12} /> Especialidades (Estudo)
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {getCompletedSpecialties(selectedPathfinder).length > 0 ? (
                    getCompletedSpecialties(selectedPathfinder).map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-800">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Nenhuma especialidade concluída ainda.</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                   <Shield size={12} />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em]">{selectedPathfinder.unit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Pathfinders;
