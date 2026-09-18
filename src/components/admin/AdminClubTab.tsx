import React, { useState, useMemo } from 'react';
import {
  BellRing,
  Trophy,
  UserPlus,
  BookOpen,
  Search,
  Filter,
  User,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Medal,
  Activity
} from 'lucide-react';
import { Member, CounselorDB, Devotional } from '@/types';

interface AdminClubTabProps {
  members: Member[];
  counselors: CounselorDB[];
  devotionalsCount: number;
  onGoToAdminAvisos: () => void;
  onProcessMonthlyAwards?: () => void;
  onOpenCounselorModal: () => void;
  onOpenDevotionalModal: () => void;
  onInspectMember: (member: Member) => void;
  isDarkMode?: boolean;
}

export const AdminClubTab: React.FC<AdminClubTabProps> = ({
  members,
  counselors,
  devotionalsCount,
  onGoToAdminAvisos,
  onProcessMonthlyAwards,
  onOpenCounselorModal,
  onOpenDevotionalModal,
  onInspectMember,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');

  const unitsList = useMemo(() => {
    const set = new Set<string>();
    members.forEach(m => {
      if (m.unit && m.unit.trim()) {
        set.add(m.unit.trim());
      }
    });
    return Array.from(set).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members
      .filter(m => {
        const matchSearch = !q ||
          m.name.toLowerCase().includes(q) ||
          (m.unit && m.unit.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q));
        const matchUnit = selectedUnit === 'all' || m.unit === selectedUnit;
        return matchSearch && matchUnit;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, searchTerm, selectedUnit]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 CARDS DE GESTÃO DO CLUBE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avisos */}
        <div
          onClick={onGoToAdminAvisos}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
            isDarkMode
              ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                <BellRing size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Mural
              </span>
            </div>
            <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Avisos do Clube
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Criar, fixar e gerenciar comunicados para o clube.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-blue-500 text-[10px] font-black uppercase">
            <span>Gerenciar Avisos</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Conselheiros */}
        <div
          onClick={onOpenCounselorModal}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
            isDarkMode
              ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                <UserPlus size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {counselors.length} Ativos
              </span>
            </div>
            <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Conselheiros
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Cadastrar instrutores e líderes de unidades.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-emerald-500 text-[10px] font-black uppercase">
            <span>Gerenciar Equipe</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Devocionais */}
        <div
          onClick={onOpenDevotionalModal}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
            isDarkMode
              ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-500 border border-purple-500/20">
                <BookOpen size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {devotionalsCount} Agendados
              </span>
            </div>
            <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Devocionais
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Programar meditações diárias e vídeos espirituais.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-purple-500 text-[10px] font-black uppercase">
            <span>Agendar Meditações</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Medalhas Mensais */}
        <div
          onClick={() => {
            if (onProcessMonthlyAwards) {
              onProcessMonthlyAwards();
              alert('Processamento de medalhas solicitado! Verifique o ranking após alguns instantes.');
            }
          }}
          className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
            isDarkMode
              ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20">
                <Trophy size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Ranking
              </span>
            </div>
            <h3 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Medalhas Mensais
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Atribuir medalhas de Ouro, Prata e Bronze aos 3 primeiros colocados.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-amber-500 text-[10px] font-black uppercase">
            <span>Processar Campeões</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* INSPEÇÃO DE MEMBROS COM BUSCA E FILTROS */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-black uppercase tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <ShieldCheck className="text-blue-500" size={20} />
              Inspeção de Membros ({members.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Consulte logs detalhados, pontuações brutas de jogos e estudos de cada desbravador.
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou unidade..."
                className={`pl-10 pr-8 py-2 rounded-xl text-xs font-bold outline-none border transition-all w-full sm:w-64 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500'
                }`}
              >
                <option value="all">Todas as Unidades ({members.length})</option>
                {unitsList.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de membros */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <User size={32} className="mx-auto opacity-40 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Nenhum membro encontrado</p>
              <p className="text-[10px]">Tente alterar os termos da busca ou o filtro de unidade.</p>
            </div>
          ) : (
            filteredMembers.map((member, idx) => {
              const gameScore = (member as any).totalGamesPoints || 0;
              const studyScore = (member as any).specialtyStudyScore || 0;
              return (
                <div
                  key={`member-card-${member.id || idx}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDarkMode
                      ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 font-black text-sm uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {member.name}
                        </h4>
                        {member.role && (
                          <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {member.role}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        Unidade: <span className="text-blue-500">{member.unit || 'Geral'}</span>
                        {member.className ? ` • Classe: ${member.className}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold" title="Pontos de Jogos">
                        🎮 {gameScore} pts
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold" title="Pontos de Estudos">
                        📖 {studyScore} pts
                      </span>
                    </div>

                    <button
                      onClick={() => onInspectMember(member)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                    >
                      <Activity size={14} />
                      Inspecionar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
