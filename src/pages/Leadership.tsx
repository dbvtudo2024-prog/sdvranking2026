
import React, { useState } from 'react';
import { Member, UserRole, UnitName } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { X, Award, ShieldCheck, Shield, Calendar, Users, Star, Trophy, BookOpen } from 'lucide-react';

interface LeadershipProps {
  members: Member[];
  isDarkMode?: boolean;
}

const Leadership: React.FC<LeadershipProps> = ({ members, isDarkMode }) => {
  const [selectedLeader, setSelectedLeader] = useState<Member | null>(null);

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
    
    // Use a Map to keep only the best score for each specialty
    const specialtyMap = new Map<string, number>();
    
    member.scores.forEach(s => {
      if (s.specialtyStudyName) {
        const currentScore = s.specialtyStudyScore || 0;
        const existingScore = specialtyMap.get(s.specialtyStudyName) || 0;
        if (currentScore > existingScore) {
          specialtyMap.set(s.specialtyStudyName, currentScore);
        } else if (!specialtyMap.has(s.specialtyStudyName)) {
          specialtyMap.set(s.specialtyStudyName, currentScore);
        }
      }
    });

    return Array.from(specialtyMap.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const getPriority = (counselor: string) => {
    const c = normalize(counselor || '');
    if (c.includes('diretor') && !c.includes('associado')) return 10;
    if (c.includes('diretor') && c.includes('associado')) return 9;
    if (c.includes('secretar')) return 8;
    if (c.includes('tesour')) return 7;
    if (c.includes('capela')) return 6;
    if (c.includes('instrutor')) return 5;
    if (c.includes('conselheiro')) return 4;
    return 0;
  };

  const leaders = (members || [])
    .filter(m => {
      const role = normalize(String(m.role || ''));
      const unit = normalize(String(m.unit || ''));
      const counselor = normalize(String(m.counselor || ''));
      const isUnitLider = m.unit === UnitName.LIDERANCA || unit.includes('lideranca');
      const isRoleLider = m.role === UserRole.LEADERSHIP || role.includes('lider');
      const hasKeywords = role.includes('diret') || counselor.includes('diret') || counselor.includes('secret') || counselor.includes('tesour') || counselor.includes('capel');
      return isUnitLider || isRoleLider || hasKeywords;
    })
    .sort((a, b) => getPriority(b.counselor) - getPriority(a.counselor));

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-y-auto">
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24 pt-8">
        {leaders.length > 0 ? (
          leaders.map((leader) => (
            <div 
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 flex items-center gap-4 cursor-pointer active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 w-6 h-6 opacity-40">
                 <img src={UNIT_LOGOS[leader.unit] || UNIT_LOGOS[UnitName.LIDERANCA] || undefined} className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-900 flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-md overflow-hidden">
                {leader.photoUrl ? <img src={leader.photoUrl} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}`} className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 truncate uppercase tracking-tight">{leader.name}</h3>
                <p className="text-[10px] font-black text-[#0061f2] uppercase tracking-widest">{leader.counselor || 'Membro Liderança'}</p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400 dark:text-slate-500">
                  <Star size={10} className="text-amber-400" />
                  <span className="text-[9px] font-bold uppercase truncate">{calculateWeeklyTotal(leader) + calculateGamesTotal(leader)} Pontos Totais</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-30">
             <ShieldCheck size={80} className="mx-auto mb-4 text-[#0061f2]" />
             <p className="font-black uppercase tracking-widest text-xs">Nenhum líder encontrado</p>
          </div>
        )}
      </div>

      {selectedLeader && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col relative">
            <button onClick={() => setSelectedLeader(null)} className="absolute top-6 right-6 p-2 bg-black/10 dark:bg-white/10 rounded-full text-white z-20 hover:bg-black/20 transition-colors">
              <X size={24} />
            </button>
            
            <div className="flex-1 overflow-y-auto">
              <div className={`h-32 relative ${selectedLeader.unit === UnitName.AGUIA_DOURADA ? 'bg-yellow-400' : 'bg-[#0061f2]'}`}>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-[2rem] bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                       {selectedLeader.photoUrl ? <img src={selectedLeader.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLeader.id}`} className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-14 p-8 pb-10 text-center space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase leading-tight">{selectedLeader.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#0061f2] rounded-full">
                  <Award size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {selectedLeader.counselor || 'Liderança'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                    <Calendar size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Idade</p>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300">{selectedLeader.age} anos</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1">
                    <Users size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Classe</p>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 text-center leading-tight whitespace-normal break-words">
                    {selectedLeader.className || 'Não Informada'}
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
                    <p className="text-lg font-black text-[#0061f2]">{calculateWeeklyTotal(selectedLeader)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Jogos</p>
                    <p className="text-lg font-black text-pink-500">{calculateGamesTotal(selectedLeader)}</p>
                  </div>
                </div>
              </div>

              {/* ESPECIALIDADES CONCLUÍDAS */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <BookOpen size={12} /> Especialidades (Estudo)
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {getCompletedSpecialties(selectedLeader).length > 0 ? (
                    getCompletedSpecialties(selectedLeader).map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                        <span className="text-[9px] font-black uppercase whitespace-nowrap">
                          {spec.name}
                        </span>
                        <div className="w-[1px] h-3 bg-emerald-200 dark:bg-emerald-800 mx-0.5"></div>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          {spec.score}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">Nenhuma especialidade concluída ainda.</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                   <Shield size={12} />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em]">{selectedLeader.unit}</p>
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

export default Leadership;
