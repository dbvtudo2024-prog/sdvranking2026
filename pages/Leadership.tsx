
import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, UnitName } from '../types';
import { UNIT_LOGOS } from '../constants';
import { User, Shield, X, Award, Mail } from 'lucide-react';

const Leadership: React.FC = () => {
  const [leaders, setLeaders] = useState<AuthUser[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchLeaders = () => {
      const usersStr = localStorage.getItem('sentinelas_registered_users');
      const users: AuthUser[] = usersStr ? JSON.parse(usersStr) : [];
      const leadershipList = users.filter(u => u.role === UserRole.LEADERSHIP);
      setLeaders(leadershipList);
    };

    fetchLeaders();
    window.addEventListener('storage', fetchLeaders);
    return () => window.removeEventListener('storage', fetchLeaders);
  }, []);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center py-6">
        <h2 className="text-[#0061f2] text-sm sm:text-lg font-black uppercase tracking-[0.3em] drop-shadow-sm">
          EQUIPE DE LIDERANÇA
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {leaders.length > 0 ? (
          leaders.map((leader) => (
            <div 
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-4 cursor-pointer active:scale-95 hover:border-blue-200 transition-all group overflow-hidden relative"
            >
              {leader.unit ? (
                <div className="absolute top-4 right-4 w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
                   <img src={UNIT_LOGOS[leader.unit]} className="w-full h-full object-contain" alt="Unidade" />
                </div>
              ) : (
                <div className="absolute top-4 right-4 text-[7px] font-black text-[#FFD700] uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full border border-slate-100 shadow-sm">
                   LIDERANÇA
                </div>
              )}

              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                {leader.photoUrl ? (
                  <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-blue-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-800 truncate uppercase tracking-tight">
                  {leader.name.split(' ')[0]} {leader.name.split(' ').length > 1 ? leader.name.split(' ').slice(-1) : ''}
                </h3>
                <p className="text-[10px] font-black text-[#0061f2] uppercase tracking-widest">{leader.funcao}</p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  <Shield size={10} />
                  <span className="text-[9px] font-bold uppercase truncate">{leader.className || 'Liderança'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-20">
             <Shield size={80} className="mx-auto mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">Nenhum líder encontrado</p>
          </div>
        )}
      </div>

      {selectedLeader && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`h-32 relative ${selectedLeader.unit === UnitName.AGUIA_DOURADA ? 'bg-yellow-400' : 'bg-[#0061f2]'}`}>
               <button 
                onClick={() => setSelectedLeader(null)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
               >
                 <X size={24} />
               </button>
               
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                 <div className="w-28 h-28 rounded-[2.5rem] bg-white p-1.5 shadow-xl">
                   <div className="w-full h-full rounded-[2rem] bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-slate-50">
                      {selectedLeader.photoUrl ? (
                        <img src={selectedLeader.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-slate-300" />
                      )}
                   </div>
                 </div>
               </div>
            </div>

            <div className="pt-16 p-8 pb-10 space-y-6 text-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{selectedLeader.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-[#0061f2] rounded-full mt-2 border border-blue-100">
                  <Award size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{selectedLeader.funcao}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center min-h-[80px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Classe</p>
                  <p className="text-[11px] font-black text-slate-700 uppercase leading-tight text-center">{selectedLeader.className || '---'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center justify-center min-h-[80px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Unidade</p>
                  <p className="text-[11px] font-black text-slate-700 uppercase leading-tight text-center">{selectedLeader.unit || 'LIDERANÇA'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <Mail size={18} className="text-[#0061f2]" />
                   <div className="text-left">
                     <p className="text-[8px] font-black text-slate-400 uppercase">E-mail de Contato</p>
                     <p className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{selectedLeader.email}</p>
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
