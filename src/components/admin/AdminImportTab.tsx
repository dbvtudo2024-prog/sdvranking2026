import React, { useRef } from 'react';
import {
  Upload,
  Database,
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Trash2,
  Loader2,
  Table,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ALL_D1_TABLES } from '@/db';

interface AdminImportTabProps {
  importTarget: string;
  setImportTarget: (target: any) => void;
  importFormat: 'csv' | 'json';
  setImportFormat: (format: 'csv' | 'json') => void;
  rawImportText: string;
  setRawImportText: (text: string) => void;
  isImporting: boolean;
  importProgress: { current: number; total: number; success: number; error: number };
  importLogs: string[];
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
  onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyTemplate: () => void;
  onLoadTemplateIntoEditor: () => void;
  onImportData: () => void;
  templateCopied: boolean;
  isDarkMode?: boolean;
}

export const AdminImportTab: React.FC<AdminImportTabProps> = ({
  importTarget,
  setImportTarget,
  importFormat,
  setImportFormat,
  rawImportText,
  setRawImportText,
  isImporting,
  importProgress,
  importLogs,
  isDragActive,
  setIsDragActive,
  onFileDrop,
  onFileChange,
  onCopyTemplate,
  onLoadTemplateIntoEditor,
  onImportData,
  templateCopied,
  isDarkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className={`text-base font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Importador em Massa de Planilhas (CSV / XLSX / JSON)
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Inserção e atualização unificada diretamente no Cloudflare D1 e Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCopyTemplate}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                templateCopied
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {templateCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{templateCopied ? 'Modelo Copiado!' : 'Copiar Modelo'}</span>
            </button>

            <button
              onClick={onLoadTemplateIntoEditor}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Download size={14} />
              <span>Carregar Exemplo</span>
            </button>
          </div>
        </div>

        {/* 1. SELEÇÃO DA TABELA ALVO */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Table size={14} /> Tabela de Destino ({ALL_D1_TABLES.length} disponíveis)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {ALL_D1_TABLES.map((t) => {
              const isSelected = importTarget === t;
              return (
                <button
                  key={`tbl-btn-${t}`}
                  type="button"
                  onClick={() => setImportTarget(t)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-tight transition-all truncate border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : isDarkMode
                      ? 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ÁREA DE DRAG & DROP E UPLOAD */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={onFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : isDarkMode
              ? 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .tsv, .xlsx, .xls, .json, text/csv, application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={onFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Upload size={28} />
            </div>
            <div>
              <p className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Arraste sua planilha ou clique para selecionar
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatos suportados: CSV (.csv), Excel (.xlsx / .xls) ou JSON (.json)
              </p>
            </div>
          </div>
        </div>

        {/* 3. EDITOR DE TEXTO / PRÉ-VISUALIZAÇÃO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Conteúdo bruto ({rawImportText.trim() ? rawImportText.split('\n').length : 0} linhas)
            </label>
            {rawImportText && (
              <button
                type="button"
                onClick={() => setRawImportText('')}
                className="text-[10px] font-black uppercase text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Limpar Editor
              </button>
            )}
          </div>

          <textarea
            value={rawImportText}
            onChange={(e) => setRawImportText(e.target.value)}
            rows={8}
            placeholder="Cole os dados em formato CSV (separado por vírgula ou ponto-e-vírgula) ou JSON aqui..."
            className={`w-full p-4 rounded-2xl border font-mono text-xs outline-none transition-all resize-y ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
            }`}
          />
        </div>

        {/* 4. BOTÃO DE AÇÃO */}
        <button
          onClick={onImportData}
          disabled={isImporting || !rawImportText.trim()}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {isImporting ? 'Importando e Gravando no Banco...' : `Importar Dados para a Tabela "${importTarget}"`}
        </button>

        {/* 5. PROGRESSO & LOGS */}
        {importProgress && importProgress.total > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span>Progresso da Importação</span>
              <span>{importProgress.current} / {importProgress.total}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(importProgress.current / Math.max(1, importProgress.total)) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 text-[10px] font-mono font-bold">
              <span className="text-emerald-500">Sucessos: {importProgress.success}</span>
              <span className="text-red-500">Falhas: {importProgress.error}</span>
            </div>
          </div>
        )}

        {importLogs.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Console de Importação
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
              {importLogs.map((log, idx) => (
                <div key={`log-${idx}`} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
