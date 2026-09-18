import React from 'react';
import {
  Cloud,
  Database,
  Zap,
  Loader2,
  Check,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Table,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { DEFAULT_CLOUDFLARE_API_URL } from '@/db';

interface AdminDatabaseTabProps {
  cfWorkerUrl: string;
  onSaveCfUrl: (url: string) => void;
  onTestCf: () => void;
  isTestingCf: boolean;
  cfTestStatus: { success: boolean; message: string } | null;
  onRunDiagnostic: () => void;
  isDiagnosticRunning: boolean;
  diagnosticResults: { table: string; count: number; status: string; columns: string[] }[];
  onCreateAllTables: () => void;
  isCreatingAllTables: boolean;
  onSeedInitialDataToD1: () => void;
  isSeedingD1: boolean;
  d1SeedResult: {
    success: boolean;
    counts: { members: number; users: number; announcements: number; specialties: number; studies: number; devotionals: number; questions: number };
    message: string;
  } | null;
  isDarkMode?: boolean;
}

export const AdminDatabaseTab: React.FC<AdminDatabaseTabProps> = ({
  cfWorkerUrl,
  onSaveCfUrl,
  onTestCf,
  isTestingCf,
  cfTestStatus,
  onRunDiagnostic,
  isDiagnosticRunning,
  diagnosticResults,
  onCreateAllTables,
  isCreatingAllTables,
  onSeedInitialDataToD1,
  isSeedingD1,
  d1SeedResult,
  isDarkMode
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. GATEWAY CLOUDFLARE WORKER & STATUS */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Cloud size={24} />
            </div>
            <div>
              <h3 className={`text-base font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Gateway Cloudflare Worker & D1
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Conexão para banco relacional global de alta performance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSaveCfUrl(DEFAULT_CLOUDFLARE_API_URL)}
            className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:underline"
          >
            Restaurar URL Padrão
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={cfWorkerUrl}
            onChange={(e) => onSaveCfUrl(e.target.value)}
            placeholder="https://seu-worker.workers.dev"
            className={`flex-1 px-4 py-3 rounded-2xl border text-xs font-mono outline-none transition-all ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={onTestCf}
            disabled={isTestingCf}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isTestingCf ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isTestingCf ? 'Testando...' : 'Testar Conexão'}
          </button>
        </div>

        {cfTestStatus && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            cfTestStatus.success
              ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {cfTestStatus.success ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{cfTestStatus.message}</span>
          </div>
        )}
      </div>

      {/* 2. DIAGNÓSTICO DAS 16 TABELAS & GARANTIA DE SCHEMA */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
              <Database size={24} />
            </div>
            <div>
              <h3 className={`text-base font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Diagnóstico e Integridade das 16 Tabelas
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Verifique a existência, integridade de colunas e volume de dados no Cloudflare D1.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunDiagnostic}
              disabled={isDiagnosticRunning || isCreatingAllTables}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isDiagnosticRunning ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {isDiagnosticRunning ? 'Diagnosticando...' : 'Executar Diagnóstico'}
            </button>

            <button
              onClick={onCreateAllTables}
              disabled={isCreatingAllTables || isDiagnosticRunning}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isCreatingAllTables ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
              {isCreatingAllTables ? 'Criando Tabelas...' : 'Garantir 16 Tabelas no D1'}
            </button>
          </div>
        </div>

        {diagnosticResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Tabelas Verificadas: {diagnosticResults.length}</span>
              <span className="text-emerald-500">
                Ativas (OK): {diagnosticResults.filter(r => r.status === 'OK').length} / {diagnosticResults.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {diagnosticResults.map((res, rIdx) => (
                <div
                  key={`diag-${res.table}-${rIdx}`}
                  className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono font-bold text-xs text-blue-500 truncate">
                      {res.table}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      res.status === 'OK'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {res.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Linhas no D1:</span>
                    <span className={`font-mono font-black ${res.count >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {res.count >= 0 ? res.count : 'Inexistente'}
                    </span>
                  </div>

                  {res.columns.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-1">
                      {res.columns.slice(0, 6).map((col, cIdx) => (
                        <span
                          key={`col-${col}-${cIdx}`}
                          className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {col}
                        </span>
                      ))}
                      {res.columns.length > 6 && (
                        <span className="text-[8px] px-1.5 py-0.5 font-bold text-slate-400">
                          +{res.columns.length - 6} colunas
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. RESTAURAÇÃO / SEED DOS DADOS INICIAIS */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20">
            <HardDrive size={24} />
          </div>
          <div>
            <h3 className={`text-base font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Dados Base & Padrão do Clube
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Restaure o banco de dados Cloudflare D1 com os registros padrões do clube.
            </p>
          </div>
        </div>

        <button
          onClick={onSeedInitialDataToD1}
          disabled={isSeedingD1}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isSeedingD1 ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
          {isSeedingD1 ? 'Populando Cloudflare D1...' : 'Popular Cloudflare D1 com Dados Base do Clube'}
        </button>

        {d1SeedResult && (
          <div className={`p-4 rounded-2xl border ${
            d1SeedResult.success
              ? isDarkMode ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDarkMode ? 'bg-red-950/30 border-red-900/50 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
          } space-y-2`}>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
              {d1SeedResult.success ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{d1SeedResult.message}</span>
            </div>
            {d1SeedResult.success && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-black/10">Membros: <strong className="text-emerald-500">{d1SeedResult.counts.members}</strong></div>
                <div className="p-2 rounded-lg bg-black/10">Usuários: <strong className="text-emerald-500">{d1SeedResult.counts.users}</strong></div>
                <div className="p-2 rounded-lg bg-black/10">Especialidades: <strong className="text-emerald-500">{d1SeedResult.counts.specialties}</strong></div>
                <div className="p-2 rounded-lg bg-black/10">Estudos: <strong className="text-emerald-500">{d1SeedResult.counts.studies}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
