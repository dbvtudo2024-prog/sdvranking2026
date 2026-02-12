
import React, { useState } from 'react';
import { Member, UserRole, UnitName } from '../types';
import { UNIT_LOGOS } from '../constants';
import { User, Shield, X, Award, ShieldCheck } from 'lucide-react';

interface LeadershipProps {
  members: Member[];
}

const Leadership: React.FC<LeadershipProps> = ({ members }) => {
  const [selectedLeader, setSelectedLeader] = useState<Member | null>(null);

  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  // Função para remover acentos e facilitar a busca
  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const leaders = (members || []).filter(m => {
    const role = normalize(String(m.role || ''));
    const unit = normalize(String(m.unit || ''));
    const counselor = normalize(String(m.counselor || ''));
    
    // Critério 1: Pertencer à unidade de Liderança (comparação direta de enum e normalizada)
    const isUnitLider = m.unit === UnitName.LIDERANCA || unit.includes('lideranca');
    
    // Critério 2: Ter cargo de Liderança
    const isRoleLider = m.role === UserRole.LEADERSHIP || role.includes('lider');

    // Critério 3: Palavras-chave de diretoria/liderança nos campos
    const hasKeywords = role.includes('diret') || 
                       counselor.includes('diret') || 
                       counselor.includes('secret') ||
                       counselor.includes('tesour') ||
                       counselor.includes('capel');

    return isUnitLider || isRoleLider || hasKeywords;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500">
      <header className="bg-[#0061f2] text-white px-6 h-28 flex flex-col justify-center shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={LOGO_APP} alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight leading-none">Equipe de Liderança</h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Sentinelas da Verdade • Desde 1997</p>
          </div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24 overflow-y-auto">
        {leaders.length > 0 ? (
          leaders.map((leader) => (
            <div 
              key={leader.id}
              onClick={() => setSelectedLeader(leader)}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-4 cursor-pointer active:scale-95 hover:border-blue-200 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-4 right-4 w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
                 <img src={UNIT_LOGOS[leader.unit] || UNIT_LOGOS[UnitName.LIDERANCA]} className="w-full h-full object-contain" alt="Unidade" />
              </div>

              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                {leader.photoUrl ? (
                  <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}`} alt="Avatar" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-800 truncate uppercase tracking-tight">
                  {leader.name}
                </h3>
                <p className="text-[10px] font-black text-[#0061f2] uppercase tracking-widest">
                  {leader.counselor || 'Membro Liderança'}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                  <Shield size={10} />
                  <span className="text-[9px] font-bold uppercase truncate">{leader.className || 'Classe de Líder'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-30">
             <ShieldCheck size={80} className="mx-auto mb-4 text-[#0061f2]" />
             <p className="font-black uppercase tracking-widest text-xs text-slate-400">Nenhum líder encontrado</p>
             <p className="text-[10px] text-slate-400 mt-2">Verifique se o seu perfil está na unidade de "Liderança"</p>
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
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedLeader.id}`} alt="Avatar" className="w-full h-full object-cover" />
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
                  <span className="text-[10px] font-black uppercase tracking-widest">{selectedLeader.counselor || 'Liderança'}</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leadership;
