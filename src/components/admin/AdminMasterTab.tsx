import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Trash2,
  Zap,
  Gamepad2,
  Medal,
  HelpCircle,
  Shuffle,
  Anchor,
  Type,
  Leaf,
  HeartPulse,
  Grid3X3,
  Square
} from 'lucide-react';

interface AdminMasterTabProps {
  isResetting: string | null;
  onResetClick: (gameKey: string, gameName: string) => void;
  isDarkMode?: boolean;
}

export const AdminMasterTab: React.FC<AdminMasterTabProps> = ({
  isResetting,
  onResetClick,
  isDarkMode
}) => {
  const allGamesReset = {
    key: 'all',
    name: 'TODOS OS JOGOS',
    icon: Trash2,
    desc: 'Redefine o ranking geral e remove todas as pontuações e logs do ciclo atual de todos os jogos.',
    danger: true
  };

  const individualGames = [
    { key: 'quiz', name: 'Quiz Bíblico', icon: Zap },
    { key: 'memoryGame', name: 'Jogo da Memória', icon: Gamepad2 },
    { key: 'specialtyGame', name: 'Especialidades', icon: Medal },
    { key: 'threeCluesGame', name: '3 Pistas', icon: HelpCircle },
    { key: 'puzzleGame', name: 'Quebra-Cabeça', icon: Shuffle },
    { key: 'knotsGame', name: 'Nós & Amarras', icon: Anchor },
    { key: 'scrambledVerseGame', name: 'Versículo', icon: Type },
    { key: 'natureIdGame', name: 'Natureza', icon: Leaf },
    { key: 'firstAidGame', name: '1º Socorros', icon: HeartPulse },
    { key: 'mahjongGame', name: 'Mahjong', icon: Grid3X3 },
    { key: 'brickBreakerGame', name: 'Blocos Bíblicos', icon: Square },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50/50 border-red-200 shadow-sm'
      }`}>
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 border border-red-500/20 shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div className="min-w-0">
            <h3 className={`text-base font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Zona de Administração Master (Apenas ronaldoSonic@gmail.com)
            </h3>
            <p className="text-xs text-red-500 font-bold uppercase mt-0.5">
              Atenção: Ações irreversíveis que redefinem o banco de dados e rankings.
            </p>
          </div>
        </div>

        {/* Alerta de Perigo */}
        <div className={`p-4 rounded-2xl border text-xs font-bold ${
          isDarkMode ? 'bg-red-950/40 border-red-900/60 text-red-300' : 'bg-red-100/70 border-red-300 text-red-900'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="uppercase font-black">Aviso de Perigo</span>
          </div>
          Ao zerar um ranking, todas as pontuações e logs daquele jogo correspondente ao ciclo atual serão removidos permanentemente.
        </div>

        {/* 1. Botão Principal: ZERAR TODOS OS JOGOS */}
        <div className="pt-1">
          <button
            type="button"
            disabled={!!isResetting}
            onClick={() => onResetClick(allGamesReset.key, allGamesReset.name)}
            className={`w-full p-4 sm:p-5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between gap-4 border transition-all active:scale-[0.99] disabled:opacity-50 overflow-hidden relative group bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-lg shadow-red-900/20`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                {isResetting === allGamesReset.key ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </div>
              <div className="min-w-0 text-left">
                <span className="block text-sm sm:text-base font-black tracking-tight truncate leading-tight">
                  ZERAR TODOS OS JOGOS
                </span>
                <span className="block text-[10px] sm:text-[11px] font-medium text-red-100 opacity-90 truncate mt-0.5">
                  {allGamesReset.desc}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider bg-white text-red-600 shadow-sm group-hover:bg-red-50 transition-colors whitespace-nowrap">
                {isResetting === allGamesReset.key ? 'Zerando...' : 'EXECUTAR RESET'}
              </span>
            </div>
          </button>
        </div>

        {/* Divisor */}
        <div className="pt-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
            Zerar Jogos Individualmente
          </p>

          {/* 2. Botões Individuais em grade com proteção contra overflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {individualGames.map((item) => {
              const Icon = item.icon;
              const isThisResetting = isResetting === item.key;
              return (
                <button
                  key={`reset-btn-${item.key}`}
                  type="button"
                  disabled={!!isResetting}
                  onClick={() => onResetClick(item.key, item.name)}
                  className={`p-3.5 sm:p-4 rounded-2xl font-black text-xs uppercase tracking-tight flex items-center justify-between gap-2.5 border transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden relative group text-left ${
                    isDarkMode
                      ? 'bg-slate-900/80 text-red-400 border-red-900/30 hover:bg-red-950/40 hover:border-red-800'
                      : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                      {isThisResetting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] sm:text-xs font-black uppercase tracking-tight truncate leading-tight">
                        {item.name}
                      </span>
                      <span className="block text-[8px] font-bold text-red-400/70 uppercase tracking-wider mt-0.5">
                        Zerar Ranking
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider border transition-colors whitespace-nowrap ${
                      isDarkMode
                        ? 'bg-red-950/60 text-red-300 border-red-900/50 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600'
                        : 'bg-red-50 text-red-600 border-red-200 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600'
                    }`}>
                      {isThisResetting ? 'Zerando...' : 'Executar'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
