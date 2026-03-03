
import React, { useState } from 'react';
import { Member, UserRole, UnitName } from '@/types';
import { UNIT_LOGOS } from '@/constants';
import { X, Award, ShieldCheck, Shield, Calendar, Users } from 'lucide-react';

interface LeadershipProps {
  members: Member[];
}

const Leadership: React.FC<LeadershipProps> = ({ members }) => {
  const [selectedLeader, setSelectedLeader] = useState<Member | null>(null);

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
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-y-auto">
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24 pt-8">
        {leaders.length > 0 ? (
          leaders.map((leader) => (
            <div 
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-4 cursor-pointer active:scale-95 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 w-6 h-6 opacity-40">
                 <img src={UNIT_LOGOS[leader.unit] || UNIT_LOGOS[UnitName.LIDERANCA] || undefined} className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                {leader.photoUrl ? <img src={leader.photoUrl} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}`} className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-800 truncate uppercase tracking-tight">{leader.name}</h3>
                <p className="text-[10px] font-black text-[#0061f2] uppercase tracking-widest">{leader.counselor || 'Membro Liderança'}</p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  <Shield size={10} /><span className="text-[9px] font-bold uppercase truncate">{leader.className || 'Corpo Diretivo'}</span>
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
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className={`h-32 relative ${selectedLeader.unit === UnitName.AGUIA_DOURADA ? 'bg-yellow-400' : 'bg-[#0061f2]'}`}>
               <button onClick={() => setSelectedLeader(null)} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white"><X size={24} /></button>
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                 <div className="w-28 h-28 rounded-[2.5rem] bg-white p-1.5 shadow-xl">
                   <div className="w-full h-full rounded-[2rem] bg-slate-100 overflow-hidden flex items-center justify-center">
                      {selectedLeader.photoUrl ? <img src={selectedLeader.photoUrl} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLeader.id}`} className="w-full h-full object-cover" />}
                   </div>
                 </div>
               </div>
            </div>
            <div className="pt-16 p-8 pb-10 text-center space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 uppercase leading-tight">{selectedLeader.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-[#0061f2] rounded-full">
                  <Award size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {selectedLeader.counselor || 'Liderança'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Idade</p>
                  </div>
                  <p className="text-sm font-black text-slate-700">{selectedLeader.age} anos</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Users size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Classe</p>
                  </div>
                  <p className="text-sm font-black text-slate-700 truncate w-full text-center">
                    {selectedLeader.className || 'Não Informada'}
                  </p>
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
      )}
    </div>
  );
};

export default Leadership;
