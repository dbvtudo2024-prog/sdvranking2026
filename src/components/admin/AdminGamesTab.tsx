import React, { useState } from 'react';
import { useHorizontalScroll } from '@/utils/useHorizontalScroll';
import {
  ListFilter,
  Zap,
  Gamepad2,
  Medal,
  HelpCircle,
  BookOpen,
  Shuffle,
  Anchor,
  Map,
  Type,
  Leaf,
  HeartPulse,
  Grid3X3,
  Square,
  Sword,
  Loader2,
  Plus,
  Trophy,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface AdminGamesTabProps {
  onGoToAdminQuiz: () => void;
  onGoToAdminSpecialty: () => void;
  onGoToAdminThreeClues: () => void;
  onGoToAdminSpecialtyStudy: () => void;
  onGoToAdminPuzzle: () => void;
  onGoToAdminScrambledVerse: () => void;
  onGoToAdminNatureId: () => void;
  onGoToAdminFirstAid: () => void;
  onGoToAdminSpecialtyTrail: () => void;

  quizOverride?: boolean;
  onToggleQuizOverride?: () => void;
  quizAllowedDay?: number | null;
  onSetQuizAllowedDay?: (day: number | null) => void;

  memoryOverride?: boolean;
  onToggleMemoryOverride?: () => void;
  memoryAllowedDay?: number | null;
  onSetMemoryAllowedDay?: (day: number | null) => void;

  specialtyOverride?: boolean;
  onToggleSpecialtyOverride?: () => void;
  specialtyAllowedDay?: number | null;
  onSetSpecialtyAllowedDay?: (day: number | null) => void;

  threeCluesOverride?: boolean;
  onToggleThreeCluesOverride?: () => void;
  threeCluesAllowedDay?: number | null;
  onSetThreeCluesAllowedDay?: (day: number | null) => void;

  puzzleOverride?: boolean;
  onTogglePuzzleOverride?: () => void;
  puzzleAllowedDay?: number | null;
  onSetPuzzleAllowedDay?: (day: number | null) => void;

  knotsOverride?: boolean;
  onToggleKnotsOverride?: () => void;
  knotsAllowedDay?: number | null;
  onSetKnotsAllowedDay?: (day: number | null) => void;

  specialtyTrailOverride?: boolean;
  onToggleSpecialtyTrailOverride?: () => void;
  specialtyTrailAllowedDay?: number | null;
  onSetSpecialtyTrailAllowedDay?: (day: number | null) => void;

  scrambledVerseOverride?: boolean;
  onToggleScrambledVerseOverride?: () => void;
  scrambledVerseAllowedDay?: number | null;
  onSetScrambledVerseAllowedDay?: (day: number | null) => void;

  natureIdOverride?: boolean;
  onToggleNatureIdOverride?: () => void;
  natureIdAllowedDay?: number | null;
  onSetNatureIdAllowedDay?: (day: number | null) => void;

  firstAidOverride?: boolean;
  onToggleFirstAidOverride?: () => void;
  firstAidAllowedDay?: number | null;
  onSetFirstAidAllowedDay?: (day: number | null) => void;

  mahjongOverride?: boolean;
  onToggleMahjongOverride?: () => void;
  mahjongAllowedDay?: number | null;
  onSetMahjongAllowedDay?: (day: number | null) => void;

  brickBreakerOverride?: boolean;
  onToggleBrickBreakerOverride?: () => void;
  brickBreakerAllowedDay?: number | null;
  onSetBrickBreakerAllowedDay?: (day: number | null) => void;

  specialtyStudyOverride?: boolean;
  onToggleSpecialtyStudyOverride?: () => void;
  specialtyStudyAllowedDay?: number | null;
  onSetSpecialtyStudyAllowedDay?: (day: number | null) => void;

  onOpenAssetsModal: () => void;
  onSeedAllData: () => void;
  isSeeding: boolean;
  onFixGameStatus: () => void;
  isProcessing: boolean;
  fixProgress: { current: number; total: number } | null;
  onProcessMonthlyAwards?: () => void;
  isDarkMode?: boolean;
}

export const AdminGamesTab: React.FC<AdminGamesTabProps> = ({
  onGoToAdminQuiz,
  onGoToAdminSpecialty,
  onGoToAdminThreeClues,
  onGoToAdminSpecialtyStudy,
  onGoToAdminPuzzle,
  onGoToAdminScrambledVerse,
  onGoToAdminNatureId,
  onGoToAdminFirstAid,
  onGoToAdminSpecialtyTrail,
  quizOverride,
  onToggleQuizOverride,
  quizAllowedDay,
  onSetQuizAllowedDay,
  memoryOverride,
  onToggleMemoryOverride,
  memoryAllowedDay,
  onSetMemoryAllowedDay,
  specialtyOverride,
  onToggleSpecialtyOverride,
  specialtyAllowedDay,
  onSetSpecialtyAllowedDay,
  threeCluesOverride,
  onToggleThreeCluesOverride,
  threeCluesAllowedDay,
  onSetThreeCluesAllowedDay,
  puzzleOverride,
  onTogglePuzzleOverride,
  puzzleAllowedDay,
  onSetPuzzleAllowedDay,
  knotsOverride,
  onToggleKnotsOverride,
  knotsAllowedDay,
  onSetKnotsAllowedDay,
  specialtyTrailOverride,
  onToggleSpecialtyTrailOverride,
  specialtyTrailAllowedDay,
  onSetSpecialtyTrailAllowedDay,
  scrambledVerseOverride,
  onToggleScrambledVerseOverride,
  scrambledVerseAllowedDay,
  onSetScrambledVerseAllowedDay,
  natureIdOverride,
  onToggleNatureIdOverride,
  natureIdAllowedDay,
  onSetNatureIdAllowedDay,
  firstAidOverride,
  onToggleFirstAidOverride,
  firstAidAllowedDay,
  onSetFirstAidAllowedDay,
  mahjongOverride,
  onToggleMahjongOverride,
  mahjongAllowedDay,
  onSetMahjongAllowedDay,
  brickBreakerOverride,
  onToggleBrickBreakerOverride,
  brickBreakerAllowedDay,
  onSetBrickBreakerAllowedDay,
  specialtyStudyOverride,
  onToggleSpecialtyStudyOverride,
  specialtyStudyAllowedDay,
  onSetSpecialtyStudyAllowedDay,
  onOpenAssetsModal,
  onSeedAllData,
  isSeeding,
  onFixGameStatus,
  isProcessing,
  fixProgress,
  onProcessMonthlyAwards,
  isDarkMode
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'editors' | 'access' | 'tools'>('editors');
  const subNavRef = useHorizontalScroll<HTMLDivElement>();

  const daysList = [
    { v: -1, l: 'Todos os Dias' },
    { v: 0, l: 'Domingo' },
    { v: 1, l: 'Segunda' },
    { v: 2, l: 'Terça' },
    { v: 3, l: 'Quarta' },
    { v: 4, l: 'Quinta' },
    { v: 5, l: 'Sexta' },
    { v: 6, l: 'Sábado' },
  ];

  const editors = [
    {
      title: 'Quiz Bíblico & Geral',
      desc: 'Banco de perguntas e respostas com 4 alternativas.',
      icon: ListFilter,
      badge: 'Principal',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      action: onGoToAdminQuiz,
      iconBg: 'bg-blue-600 text-white'
    },
    {
      title: 'Especialidades DBV',
      desc: 'Manual de especialidades, insígnias e requisitos.',
      icon: Medal,
      badge: 'Oficial',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      action: onGoToAdminSpecialty,
      iconBg: 'bg-amber-600 text-white'
    },
    {
      title: 'Estudos de Especialidades',
      desc: 'PDFs, vídeos e questionários com importação CSV.',
      icon: BookOpen,
      badge: 'PDF + Quiz',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      action: onGoToAdminSpecialtyStudy,
      iconBg: 'bg-emerald-600 text-white'
    },
    {
      title: 'Jogo das 3 Pistas',
      desc: 'Charadas bíblicas com pontuação decrescente.',
      icon: HelpCircle,
      badge: 'Enigma',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      action: onGoToAdminThreeClues,
      iconBg: 'bg-purple-600 text-white'
    },
    {
      title: 'Quebra-Cabeça Bíblico',
      desc: 'Imagens bíblicas para montar em blocos.',
      icon: Shuffle,
      badge: 'Visual',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      action: onGoToAdminPuzzle,
      iconBg: 'bg-indigo-600 text-white'
    },
    {
      title: 'Versículo Embaralhado',
      desc: 'Versículos bíblicos para ordenar as palavras.',
      icon: Type,
      badge: 'Bíblia',
      badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      action: onGoToAdminScrambledVerse,
      iconBg: 'bg-cyan-600 text-white'
    },
    {
      title: 'Identificação da Natureza',
      desc: 'Perguntas com fotos de animais, plantas e aves.',
      icon: Leaf,
      badge: 'Natureza',
      badgeColor: 'bg-green-500/10 text-green-500 border-green-500/20',
      action: onGoToAdminNatureId,
      iconBg: 'bg-green-600 text-white'
    },
    {
      title: 'Primeiros Socorros',
      desc: 'Simulações de urgência e técnicas de socorro.',
      icon: HeartPulse,
      badge: 'Saúde',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
      action: onGoToAdminFirstAid,
      iconBg: 'bg-red-600 text-white'
    },
    {
      title: 'Trilha de Especialidades',
      desc: 'Progresso em trilhas temáticas com perguntas.',
      icon: Map,
      badge: 'Trilha',
      badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      action: onGoToAdminSpecialtyTrail,
      iconBg: 'bg-rose-600 text-white'
    },
  ];

  const accessControls = [
    { label: 'Quiz', icon: Zap, active: quizOverride, toggle: onToggleQuizOverride, day: quizAllowedDay, setDay: onSetQuizAllowedDay },
    { label: 'Memória', icon: Gamepad2, active: memoryOverride, toggle: onToggleMemoryOverride, day: memoryAllowedDay, setDay: onSetMemoryAllowedDay },
    { label: 'Especialidades', icon: Medal, active: specialtyOverride, toggle: onToggleSpecialtyOverride, day: specialtyAllowedDay, setDay: onSetSpecialtyAllowedDay },
    { label: '3 Dicas', icon: HelpCircle, active: threeCluesOverride, toggle: onToggleThreeCluesOverride, day: threeCluesAllowedDay, setDay: onSetThreeCluesAllowedDay },
    { label: 'Quebra-Cabeça', icon: Shuffle, active: puzzleOverride, toggle: onTogglePuzzleOverride, day: puzzleAllowedDay, setDay: onSetPuzzleAllowedDay },
    { label: 'Nós & Amarras', icon: Anchor, active: knotsOverride, toggle: onToggleKnotsOverride, day: knotsAllowedDay, setDay: onSetKnotsAllowedDay },
    { label: 'Trilha de Espec.', icon: Map, active: specialtyTrailOverride, toggle: onToggleSpecialtyTrailOverride, day: specialtyTrailAllowedDay, setDay: onSetSpecialtyTrailAllowedDay },
    { label: 'Versículo', icon: Type, active: scrambledVerseOverride, toggle: onToggleScrambledVerseOverride, day: scrambledVerseAllowedDay, setDay: onSetScrambledVerseAllowedDay },
    { label: 'Natureza', icon: Leaf, active: natureIdOverride, toggle: onToggleNatureIdOverride, day: natureIdAllowedDay, setDay: onSetNatureIdAllowedDay },
    { label: '1º Socorros', icon: HeartPulse, active: firstAidOverride, toggle: onToggleFirstAidOverride, day: firstAidAllowedDay, setDay: onSetFirstAidAllowedDay },
    { label: 'Mahjong Bíblico', icon: Grid3X3, active: mahjongOverride, toggle: onToggleMahjongOverride, day: mahjongAllowedDay, setDay: onSetMahjongAllowedDay },
    { label: 'Blocos Bíblicos', icon: Square, active: brickBreakerOverride, toggle: onToggleBrickBreakerOverride, day: brickBreakerAllowedDay, setDay: onSetBrickBreakerAllowedDay },
    { label: 'Estudo Espec. (PDF)', icon: BookOpen, active: specialtyStudyOverride, toggle: onToggleSpecialtyStudyOverride, day: specialtyStudyAllowedDay, setDay: onSetSpecialtyStudyAllowedDay },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-menu de navegação rápida interna */}
      <div className={`flex items-center justify-between flex-wrap gap-3 p-2 rounded-2xl border ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div
          ref={subNavRef}
          style={{ overscrollBehavior: 'contain' }}
          className="flex items-center gap-1.5 overflow-x-auto p-1 no-scrollbar select-none"
          title="Dica: Use a roda do mouse para rolar horizontalmente"
        >
          <button
            onClick={() => setActiveSubSection('editors')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubSection === 'editors'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} />
            <span>Editores de Conteúdo ({editors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubSection('access')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubSection === 'access'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Controle de Acesso ({accessControls.length})</span>
          </button>

          <button
            onClick={() => setActiveSubSection('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeSubSection === 'tools'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap size={14} />
            <span>Manutenção & Ativos</span>
          </button>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
          Central de Jogos & Dinâmicas
        </span>
      </div>

      {/* SEÇÃO 1: EDITORES DOS JOGOS */}
      {activeSubSection === 'editors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editors.map((editor) => {
            const Icon = editor.icon;
            return (
              <div
                key={editor.title}
                onClick={editor.action}
                className={`group cursor-pointer p-5 rounded-3xl border transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg shadow-black/20'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-3 rounded-2xl ${editor.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${editor.badgeColor}`}>
                      {editor.badge}
                    </span>
                  </div>

                  <h3 className={`text-sm font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {editor.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {editor.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-blue-500">
                  <span className="text-[10px] font-black uppercase tracking-wider group-hover:underline">
                    Abrir Editor
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SEÇÃO 2: CONTROLE DE ACESSO E DIAS PERMITIDOS */}
      {activeSubSection === 'access' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-slate-700'
          }`}>
            <p className="text-xs font-bold leading-relaxed">
              💡 <strong>Como funciona a liberação:</strong> Quando marcado como <strong>Liberado Direto</strong>, os desbravadores podem jogar a qualquer hora independentemente do dia. Caso contrário, o jogo só abre no <strong>Dia Permitido</strong> configurado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accessControls.map((item) => {
              const Icon = item.icon;
              const isOverridden = !!item.active;
              return (
                <div
                  key={item.label}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isOverridden
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {item.label}
                        </p>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${
                          isOverridden ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {isOverridden ? '● Liberado sempre' : 'Agendado'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 active:scale-95 ${
                        isOverridden
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isOverridden ? 'Liberado' : 'Bloquear'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                      Dia Permitido:
                    </span>
                    <select
                      value={item.day ?? -1}
                      onChange={(e) => item.setDay && item.setDay(Number(e.target.value))}
                      className={`text-[9px] font-bold uppercase tracking-tight py-1 px-2 rounded-lg border outline-none cursor-pointer transition-all ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500'
                      }`}
                    >
                      {daysList.map((d) => (
                        <option key={d.v} value={d.v}>{d.l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEÇÃO 3: FERRAMENTAS DE MANUTENÇÃO & ATIVOS */}
      {activeSubSection === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Gerenciar Imagens (Assets)
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Fotos de nós, quebra-cabeça e ilustrações
                  </p>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                Altere os links das imagens oficiais dos nós e jogos. Suporta URLs diretas de imagens hospedadas.
              </p>
            </div>
            <button
              onClick={onOpenAssetsModal}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <ImageIcon size={16} />
              Abrir Galeria de Assets
            </button>
          </div>

          <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                  <Plus size={22} />
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Adicionar 20 Novas Questões
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Injeção de banco para todos os jogos
                  </p>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                Carrega 20 novas perguntas padrão para Quiz, 3 Dicas e Versículos diretamente no banco de dados.
              </p>
            </div>
            <button
              onClick={onSeedAllData}
              disabled={isSeeding}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSeeding ? 'Adicionando Questões...' : 'Injetar Questões Padrão'}
            </button>
          </div>

          <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20">
                  <Zap size={22} />
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Corrigir Status de Jogos
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Recalcular pontuações e pendências
                  </p>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                Percorre os registros de todos os membros ajustando pontuações brutas e corrigindo flags corrompidas.
              </p>
              {fixProgress && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-200/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${(fixProgress.current / fixProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[8px] font-mono text-slate-400">
                    Progresso: {fixProgress.current} / {fixProgress.total}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onFixGameStatus}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {isProcessing ? 'Processando Correção...' : 'Executar Correção'}
            </button>
          </div>

          <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20">
                  <Trophy size={22} />
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Insígnias & Medalhas Históricas
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Recalcular campeões anteriores
                  </p>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                Varre os rankings dos meses anteriores e atribui as medalhas de Ouro, Prata e Bronze para os 3 primeiros colocados.
              </p>
            </div>
            <button
              onClick={async () => {
                if (onProcessMonthlyAwards) {
                  await onProcessMonthlyAwards();
                  alert('Insígnias históricas recalculadas com sucesso!');
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Trophy size={16} />
              Atualizar Insígnias
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
