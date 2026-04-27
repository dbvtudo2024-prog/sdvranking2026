
import React, { useState, useEffect } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, HelpCircle, MessageSquare, BookOpen, Calendar, Plus, Shuffle, Trophy, Anchor, User, Map, Type, Leaf, HeartPulse, Music, Database } from 'lucide-react';
import { Member, ChatMessage, Devotional, CounselorDB, Score } from '@/types';
import { DatabaseService, supabase } from '@/db';
import { GAME_KEYS } from '@/helpers/scoreHelpers';
import { motion, AnimatePresence } from 'motion/react';
import { getCycleStart } from '@/utils/gameUtils';

import { NEW_QUIZ_QUESTIONS, NEW_THREE_CLUES_QUESTIONS, NEW_SCRAMBLED_VERSES, NEW_KNOTS_ASSETS, DEFAULT_ANNOUNCEMENTS, DEFAULT_SPECIALTY_STUDIES, DEFAULT_MEMBERS } from '@/seedData';

interface AdminManagementProps {
  members: Member[];
  userEmail?: string;
  onBack: () => void;
  onGoToAdminAvisos: () => void;
  onGoToAdminQuiz: () => void;
  onGoToAdminSpecialty: () => void;
  onGoToAdminThreeClues: () => void;
  onGoToAdminSpecialtyStudy: () => void;
  onGoToAdminPuzzle: () => void;
  onGoToAdminScrambledVerse: () => void;
  onGoToAdminNatureId: () => void;
  onGoToAdminFirstAid: () => void;
  onGoToAdminSpecialtyTrail: () => void;
  counselors: CounselorDB[];
  onAddCounselor: (name: string) => Promise<void>;
  onUpdateCounselor: (id: string | number, name: string) => Promise<void>;
  onDeleteCounselor: (id: string | number) => Promise<void>;
  onResetRanking: (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid') => Promise<void>;
  quizOverride: boolean;
  onToggleQuizOverride: () => void;
  memoryOverride: boolean;
  onToggleMemoryOverride: () => void;
  specialtyOverride: boolean;
  onToggleSpecialtyOverride: () => void;
  threeCluesOverride: boolean;
  onToggleThreeCluesOverride: () => void;
  puzzleOverride: boolean;
  onTogglePuzzleOverride: () => void;
  knotsOverride: boolean;
  onToggleKnotsOverride: () => void;
  specialtyTrailOverride: boolean;
  onToggleSpecialtyTrailOverride: () => void;
  scrambledVerseOverride: boolean;
  onToggleScrambledVerseOverride: () => void;
  natureIdOverride: boolean;
  onToggleNatureIdOverride: () => void;
  firstAidOverride: boolean;
  onToggleFirstAidOverride: () => void;
  brickBreakerOverride: boolean;
  onToggleBrickBreakerOverride: () => void;
  mahjongOverride: boolean;
  onToggleMahjongOverride: () => void;
  onProcessMonthlyAwards?: () => Promise<void>;
  isDarkMode?: boolean;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  members,
  userEmail,
  onBack,
  onGoToAdminAvisos,
  onGoToAdminQuiz,
  onGoToAdminSpecialty,
  onGoToAdminThreeClues,
  onGoToAdminSpecialtyStudy,
  onGoToAdminPuzzle,
  onGoToAdminScrambledVerse,
  onGoToAdminNatureId,
  onGoToAdminFirstAid,
  onGoToAdminSpecialtyTrail,
  counselors = [],
  onAddCounselor,
  onUpdateCounselor,
  onDeleteCounselor,
  onResetRanking,
  quizOverride,
  onToggleQuizOverride,
  memoryOverride,
  onToggleMemoryOverride,
  specialtyOverride,
  onToggleSpecialtyOverride,
  threeCluesOverride,
  onToggleThreeCluesOverride,
  puzzleOverride,
  onTogglePuzzleOverride,
  knotsOverride,
  onToggleKnotsOverride,
  specialtyTrailOverride,
  onToggleSpecialtyTrailOverride,
  scrambledVerseOverride,
  onToggleScrambledVerseOverride,
  natureIdOverride,
  onToggleNatureIdOverride,
  firstAidOverride,
  onToggleFirstAidOverride,
  brickBreakerOverride,
  onToggleBrickBreakerOverride,
  mahjongOverride,
  onToggleMahjongOverride,
  onProcessMonthlyAwards,
  isDarkMode
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState(false);
  const [editCounselor, setEditCounselor] = useState<CounselorDB | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{table: string, count: number, status: string, columns: string[]}[]>([]);

  const runDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    const results = [];
    const tables = [
      'members', 
      'announcements', 
      'conselheiros', 
      'specialty_studies', 
      'devotionals', 
      'game_configs', 
      'three_clues_questions', 
      'quiz_questions',
      'puzzle_images',
      'game_assets',
      'scrambled_verses',
      'EspecialidadesDBV'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          // Se a tabela não existe ou deu erro de permissão
          results.push({ 
            table, 
            count: 0, 
            status: `Faltando/Erro: ${error.code === '42P01' ? 'Tabela Não Existe' : error.message}`, 
            columns: [] 
          });
          continue;
        }
        
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        
        let alertMsg = 'OK';
        // Verificação específica de coluna
        if (table === 'specialty_studies' || table === 'devotionals') {
          const { error: colError } = await supabase.from(table).select('scheduled_for').limit(0);
          if (colError) {
            if (colError.message.includes('scheduled_for') || colError.code === 'PGRST102' || colError.code === 'PGRST100') {
              alertMsg = 'Faltando coluna scheduled_for';
            }
          }
        }

        results.push({ 
          table, 
          count: count || 0, 
          status: alertMsg, 
          columns 
        });
      } catch (e: any) {
        results.push({ table, count: 0, status: `EXCEÇÃO: ${e.message}`, columns: [] });
      }
    }
    setDiagnosticResults(results);
    setIsDiagnosticRunning(false);
  };
  const [newCounselorName, setNewCounselorName] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [devotionalLink, setDevotionalLink] = useState('');
  const [devotionalTitle, setDevotionalTitle] = useState('Devocional Diário');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScheduledFor, setDevotionalScheduledFor] = useState(new Date().toISOString().slice(0, 16));
  const [isSavingDevotional, setIsSavingDevotional] = useState(false);
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [showDevotionalList, setShowDevotionalList] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [gameAssets, setGameAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

  useEffect(() => {
    loadDevotionals();
  }, []);

  const loadAssets = async () => {
    try {
      const assets = await DatabaseService.getGameAssets('knots');
      setGameAssets(assets);
    } catch (err) {
      console.error("Erro ao carregar ativos:", err);
    }
  };

  const handleUpdateAsset = async (id: number) => {
    if (!newAssetUrl.trim()) return;
    setIsSavingAsset(true);
    try {
      await DatabaseService.updateGameAsset(id, newAssetUrl);
      alert("✅ Imagem atualizada!");
      setEditingAsset(null);
      setNewAssetUrl('');
      loadAssets();
    } catch (err) {
      alert("❌ Erro ao atualizar.");
    } finally {
      setIsSavingAsset(false);
    }
  };

  const loadDevotionals = async () => {
    try {
      const data = await DatabaseService.getAllDevotionals();
      setAllDevotionals(data);
    } catch (err) {
      console.error("Erro ao carregar devocionais:", err);
    }
  };

  const handleSaveDevotional = async () => {
    if (!devotionalTitle.trim()) {
      alert("Preencha ao menos o título.");
      return;
    }
    setIsSavingDevotional(true);
    try {
      const scheduledDate = new Date(devotionalScheduledFor);
      const isNow = scheduledDate <= new Date();

      await DatabaseService.createDevotional({
        link: devotionalLink,
        title: devotionalTitle,
        content: devotionalContent,
        scheduled_for: scheduledDate.toISOString()
      });

      alert("✅ Devocional agendado com sucesso!");
      setDevotionalLink('');
      setDevotionalTitle('Devocional Diário');
      setDevotionalContent('');
      loadDevotionals();
    } catch (err) {
      alert("❌ Erro ao salvar devocional.");
    } finally {
      setIsSavingDevotional(false);
    }
  };

  const handleDeleteDevotional = async (id: number) => {
    if (!confirm("Excluir este devocional?")) return;
    try {
      await DatabaseService.deleteDevotional(id);
      loadDevotionals();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const handleResetClick = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid', label: string) => {
    if (!confirm(`CONFIRMAÇÃO 1: Deseja zerar todos os pontos de ${label.toUpperCase()}?`)) return;
    if (!confirm(`⚠️ CONFIRMAÇÃO FINAL: Esta ação vai apagar permanentemente os pontos de ${label} de TODOS os membros. Podemos prosseguir?`)) return;

    setIsResetting(type);
    try {
      await onResetRanking(type);
      alert(`✅ SUCESSO: O ranking de ${label} foi totalmente zerado!`);
    } catch (error) {
      alert('❌ ERRO: Falha ao comunicar com o servidor.');
    } finally {
      setIsResetting(null);
    }
  };

  const handleAddOrUpdateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselorName.trim()) return;
    setIsProcessing(true);
    try {
      if (editCounselor) await onUpdateCounselor(editCounselor.id!, newCounselorName);
      else await onAddCounselor(newCounselorName);
      setNewCounselorName('');
      setEditCounselor(null);
      setShowCounselorModal(false);
    } catch (error) { alert("Erro ao salvar conselheiro."); } finally { setIsProcessing(false); }
  };

  const handleSeedAllData = async () => {
    if (!window.confirm("Deseja adicionar 20 novas questões inéditas para todos os jogos? (Duplicatas serão ignoradas)")) return;
    setIsSeeding(true);
    try {
      console.log("Iniciando semeadura de dados...");
      await DatabaseService.seedQuizQuestions(NEW_QUIZ_QUESTIONS);
      console.log("Quiz semeado.");
      await DatabaseService.seedThreeCluesQuestions(NEW_THREE_CLUES_QUESTIONS);
      console.log("3 Dicas semeado.");
      await DatabaseService.seedScrambledVerses(NEW_SCRAMBLED_VERSES);
      console.log("Versículos semeados.");
      await DatabaseService.seedGameAssets(NEW_KNOTS_ASSETS);
      
      // Novos seeds para Avisos, Estudos e Membros
      await DatabaseService.seedAnnouncements(DEFAULT_ANNOUNCEMENTS);
      await DatabaseService.seedSpecialtyStudies(DEFAULT_SPECIALTY_STUDIES);
      await DatabaseService.seedMembers(DEFAULT_MEMBERS);
      console.log("Assets semeados.");
      alert("✅ SUCESSO: Novas questões e ativos adicionados com sucesso!");
    } catch (error: any) {
      console.error("Erro detalhado ao semear dados:", error);
      const errorMsg = error?.message || error?.details || "Erro desconhecido";
      alert(`❌ ERRO: Falha ao adicionar novas questões. Detalhes: ${errorMsg}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrateData = async () => {
    if (!window.confirm("Isso irá copiar todos os dados do banco antigo para o novo. Certifique-se de que o banco novo está pronto para receber os dados. Deseja continuar?")) return;
    
    setIsMigrating(true);
    setMigrationStatus('Iniciando conexão com banco antigo...');

    const OLD_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
    const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM';
    
    // Create temporary old client
    const { createClient } = await import('@supabase/supabase-js');
    const oldSupabase = createClient(OLD_URL, OLD_KEY);

    const tables = [
      'users',
      'members', 
      'conselheiros', 
      'announcements', 
      'messages',
      'devotionals',
      'specialty_studies',
      'specialty_study_questions',
      'quiz_questions', 
      'three_clues_questions', 
      'who_am_i_questions',
      'puzzle_images', 
      'scrambled_verses', 
      'EspecialidadesDBV',
      'game_configs',
      'game_assets',
      'desbravadores',
      'especialidades',
      'quizzes'
    ];

    try {
      for (const table of tables) {
        setMigrationStatus(`Migrando tabela: ${table.toUpperCase()}...`);
        
        // 1. Fetch from old
        const { data: oldData, error: fetchError } = await oldSupabase.from(table).select('*');
        if (fetchError) throw new Error(`Erro ao buscar ${table}: ${fetchError.message}`);
        
        if (!oldData || oldData.length === 0) {
          setMigrationStatus(`Tabela ${table} está vazia. Pulando...`);
          continue;
        }

        // 2. Prepare data for insert: filter out sensitive/problematic columns
        const dataToInsert = oldData.map(item => {
          const newItem = { ...item };
          // Remove created_at to let new DB handle it
          if ('created_at' in newItem) delete newItem.created_at;
          
          // Remove password from users table if it exists (security and constraint fix)
          if (table === 'users' && 'password' in newItem) delete newItem.password;

          // If ID is UUID string, remove it for non-relational tables so new DB generates sequential bigint
          const isRelationalTable = ['members', 'users', 'messages', 'announcements', 'quizzes'].includes(table);
          if (!isRelationalTable && typeof newItem.id === 'string' && newItem.id.includes('-')) {
            delete newItem.id;
          }
          return newItem;
        });

        // 3. Insert into new (current) in small batches with delay to avoid timeouts
        const BATCH_SIZE = 5;
        for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
          const batch = dataToInsert.slice(i, i + BATCH_SIZE);
          const { error: insertError } = await supabase.from(table).upsert(batch);
          if (insertError) throw new Error(`Erro ao inserir lote em ${table}: ${insertError.message}`);
          
          setMigrationStatus(`⏳ Migrando ${table}... (${Math.min(i + BATCH_SIZE, dataToInsert.length)}/${dataToInsert.length})`);
          
          // Small delay between batches to breath
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setMigrationStatus(`✅ Tabela ${table} migrada com sucesso (${oldData.length} registros).`);
      }
      
      alert("🚀 MIGRAÇÃO CONCLUÍDA! Todos os dados foram transferidos.");
      setMigrationStatus('Migração finalizada com sucesso.');
    } catch (error: any) {
      console.error("Erro na migração:", error);
      alert(`❌ ERRO NA MIGRAÇÃO: ${error.message}`);
      setMigrationStatus(`ERRO: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const [inspectingMember, setInspectingMember] = useState<Member | null>(null);

  const [fixProgress, setFixProgress] = useState<{current: number, total: number} | null>(null);

  const handleFixGameStatus = async () => {
    if (!window.confirm("Isso irá remover pontuações duplicadas e padronizar o formato dos dados em lotes para evitar erros. Deseja continuar?")) return;
    
    setIsProcessing(true);
    setFixProgress(null);
    try {
      const allUpdatedMembers: Member[] = [];
      let totalToFix = 0;

      // 1. Identificar quem precisa de correção localmente primeiro
      const membersToCorrection = members.map(member => {
        if (!member.scores || !Array.isArray(member.scores)) return null;
        
        let hasChanges = false;
        const cycleStart = getCycleStart();
        const seenCurrentWeek = new Set<string>();
        const cleanedScores: Score[] = [];

        const sortedScores = [...member.scores].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateA - dateB;
        });

        for (const scoreObj of sortedScores) {
          const s = { ...scoreObj } as any;
          const scoreDate = new Date(s.date);
          
          if (!s.gameId) {
            const foundKey = GAME_KEYS.find(key => s[key] !== undefined);
            if (foundKey) {
              s.gameId = foundKey;
              s.points = Number(s[foundKey]);
              hasChanges = true;
            }
          }

          if (s.gameId) {
            if (s.points === undefined && s[s.gameId] !== undefined) {
              s.points = Number(s[s.gameId]);
              hasChanges = true;
            }
            GAME_KEYS.forEach(key => { if (s[key] !== undefined && key !== 'points') { delete s[key]; hasChanges = true; } });

            if (scoreDate >= cycleStart) {
              const uniqueKey = `${s.gameId}-${s.quizCategory || ''}`;
              if (seenCurrentWeek.has(uniqueKey)) {
                hasChanges = true;
                continue;
              }
              seenCurrentWeek.add(uniqueKey);
            }
          }
          cleanedScores.push(s);
        }
        
        if (hasChanges) {
          return { ...member, scores: cleanedScores };
        }
        return null;
      }).filter((m): m is Member => m !== null);

      totalToFix = membersToCorrection.length;

      if (totalToFix > 0) {
        setFixProgress({ current: 0, total: totalToFix });
        
        // 2. Processar em lotes de 10 para evitar timeout do banco
        const batchSize = 10;
        for (let i = 0; i < membersToCorrection.length; i += batchSize) {
          const batch = membersToCorrection.slice(i, i + batchSize);
          await DatabaseService.updateMembers(batch);
          setFixProgress({ current: Math.min(i + batchSize, totalToFix), total: totalToFix });
        }
        
        alert(`✅ SUCESSO: O status de jogos de ${totalToFix} desbravadores foi corrigido com sucesso!`);
      } else {
        alert("ℹ️ Nenhuma inconsistência encontrada para corrigir.");
      }
    } catch (error: any) {
      console.error("Erro ao corrigir status:", error);
      alert(`❌ ERRO: ${error.message || "Falha ao processar a correção."}`);
    } finally {
      setIsProcessing(false);
      setFixProgress(null);
    }
  };

  const GameLockButton = ({ label, active, onToggle, icon: Icon }: any) => (
    <button 
      onClick={onToggle}
      className={`w-full ${active 
        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-500') 
        : (isDarkMode ? 'bg-slate-900/50 text-slate-500 border-slate-800' : 'bg-white text-slate-400 border-slate-100')} 
        aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-sm border uppercase text-[9px] font-black tracking-widest active:scale-95 transition-all`}
    >
      <Icon size={22} />
      {label}
      <span className="text-[7px] opacity-70">{active ? 'LIBERADO' : 'BLOQUEADO'}</span>
    </button>
  );

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-y-auto`}>
      <div className="p-6 space-y-8 pb-32">
        
        {/* 1. LIBERAÇÃO MANUAL DE JOGOS */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-8 border backdrop-blur-sm`}>
          <div className="flex flex-col items-center gap-1">
            <h3 className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[11px] font-black uppercase tracking-[0.25em]`}>Controle de Acesso</h3>
            <p className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Liberação Manual de Jogos</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <GameLockButton label="Quiz" active={quizOverride} onToggle={onToggleQuizOverride} icon={Zap} />
            <GameLockButton label="Memória" active={memoryOverride} onToggle={onToggleMemoryOverride} icon={Gamepad2} />
            <GameLockButton label="Espec." active={specialtyOverride} onToggle={onToggleSpecialtyOverride} icon={Medal} />
            <GameLockButton label="3 Dicas" active={threeCluesOverride} onToggle={onToggleThreeCluesOverride} icon={HelpCircle} />
            <GameLockButton label="Quebra-C" active={puzzleOverride} onToggle={onTogglePuzzleOverride} icon={Shuffle} />
            <GameLockButton label="Nós" active={knotsOverride} onToggle={onToggleKnotsOverride} icon={Anchor} />
            <GameLockButton label="Trilha" active={specialtyTrailOverride} onToggle={onToggleSpecialtyTrailOverride} icon={Map} />
            <GameLockButton label="Versículo" active={scrambledVerseOverride} onToggle={onToggleScrambledVerseOverride} icon={Type} />
            <GameLockButton label="Natureza" active={natureIdOverride} onToggle={onToggleNatureIdOverride} icon={Leaf} />
            <GameLockButton label="Socorro" active={firstAidOverride} onToggle={onToggleFirstAidOverride} icon={HeartPulse} />
          </div>
        </div>

        {/* 2. MURAL E EQUIPE */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6 border backdrop-blur-sm`}>
           <div className="flex items-center gap-2 px-2">
             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
               <ShieldAlert size={16} />
             </div>
             <h3 className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Mural e Equipe</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={onGoToAdminAvisos} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}>
                <BellRing size={24} /> GERENCIAR AVISOS
              </button>
              <button 
                onClick={() => {
                  if (onProcessMonthlyAwards) {
                    onProcessMonthlyAwards();
                    alert('Solicitado processamento de medalhas! Verifique no perfil após alguns segundos.');
                  }
                }}
                className={`w-full ${isDarkMode ? 'bg-amber-900/10 text-amber-500 border-amber-900/30' : 'bg-amber-50 text-amber-700 border-amber-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-[10px] tracking-widest active:scale-95 transition-all outline-none`}
              >
                <Trophy size={20} /> Medalhas Mensais
              </button>
            </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setEditCounselor(null); setNewCounselorName(''); setShowCounselorModal(true); }} className={`${isDarkMode ? 'bg-slate-900/50 text-blue-400 border-blue-900/30' : 'bg-blue-50/50 text-[#0061f2] border-blue-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <UserPlus size={22} /> CONSELHEIROS
                </button>
                <button onClick={() => { setShowDevotionalList(false); setShowDevotionalModal(true); }} className={`${isDarkMode ? 'bg-slate-900/50 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50/50 text-emerald-600 border-emerald-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <BookOpen size={22} /> DEVOCIONAIS
                </button>
              </div>
           </div>
        </div>

        {/* 3. INSPEÇÃO DE MEMBROS */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6 border backdrop-blur-sm`}>
           <div className="flex items-center gap-2 px-2">
             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
               <User size={16} />
             </div>
             <h3 className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Inspeção de Membros</h3>
           </div>
           
           <div className="space-y-4">
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight px-2">Verificar pontuações brutas e logs de atividade</p>
             <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {members.sort((a, b) => a.name.localeCompare(b.name)).map(member => (
                 <div 
                   key={member.id}
                   className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                 >
                   <div className="overflow-hidden pr-4">
                     <p className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{member.name}</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase">Unidade: {member.unit}</p>
                   </div>
                   <button 
                     onClick={() => setInspectingMember(member)}
                     className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all flex-shrink-0"
                   >
                     Inspecionar
                   </button>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* 4. GESTÃO DE JOGOS */}
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-[3rem] p-8 shadow-2xl shadow-blue-900/5 space-y-6 border backdrop-blur-sm`}>
           <div className="flex items-center gap-2 px-2">
             <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
               <Trophy size={16} />
             </div>
             <h3 className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>Gestão de Jogos</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              <button onClick={onGoToAdminQuiz} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}>
                <ListFilter size={24} /> EDITAR QUIZ & QUESTÕES
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onGoToAdminSpecialty} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Medal size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> ESPECIALIDADES
                </button>
                <button onClick={onGoToAdminThreeClues} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <HelpCircle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> 3 DICAS
                </button>
                <button onClick={onGoToAdminSpecialtyStudy} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <BookOpen size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> ESTUDO (PDF)
                </button>
                <button onClick={onGoToAdminPuzzle} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Shuffle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> QUEBRA-CABEÇA
                </button>
                <button onClick={onGoToAdminScrambledVerse} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Shuffle size={22} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /> VERSÍCULO
                </button>
                <button onClick={onGoToAdminNatureId} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Leaf size={22} className={isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} /> NATUREZA
                </button>
                <button onClick={onGoToAdminFirstAid} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <HeartPulse size={22} className={isDarkMode ? 'text-red-500' : 'text-red-600'} /> 1º SOCORROS
                </button>
                <button onClick={onGoToAdminSpecialtyTrail} className={`w-full ${isDarkMode ? 'bg-slate-900/50 text-slate-300 border-slate-800' : 'bg-white text-slate-600 border-slate-100'} py-5 rounded-[2rem] font-black flex flex-col items-center justify-center gap-3 shadow-sm border uppercase text-[9px] tracking-widest active:scale-95 transition-all`}>
                  <Map size={22} className={isDarkMode ? 'text-blue-500' : 'text-blue-600'} /> TRILHA ESPECIAL.
                </button>
              </div>
              <button 
                onClick={() => { loadAssets(); setShowAssetsModal(true); }} 
                className={`w-full ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' : 'bg-blue-50 text-blue-600 border-blue-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}
              >
                <Zap size={24} /> GERENCIAR IMAGENS (ASSETS)
              </button>
              <button 
                onClick={handleSeedAllData} 
                disabled={isSeeding}
                className={`w-full ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}
              >
                {isSeeding ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                ADICIONAR 20 NOVAS QUESTÕES (TODOS OS JOGOS)
              </button>
              <button 
                onClick={handleFixGameStatus} 
                disabled={isProcessing}
                className={`w-full ${isDarkMode ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 'bg-amber-50 text-amber-600 border-amber-100'} py-6 rounded-[2rem] font-black flex flex-col items-center justify-center gap-2 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}
              >
                <div className="flex items-center gap-4">
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                  CORRIGIR STATUS DE JOGOS
                </div>
                {fixProgress && (
                  <div className="w-full max-w-[200px] mt-2">
                    <div className="h-1.5 w-full bg-slate-200/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300" 
                        style={{ width: `${(fixProgress.current / fixProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[8px] mt-1 opacity-70">
                      PROCESSANDO: {fixProgress.current} / {fixProgress.total}
                    </p>
                  </div>
                )}
              </button>

              <div className={`p-6 rounded-[2rem] border mt-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <h3 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Database size={16} className="text-blue-500" />
                  Migração de Banco de Dados
                </h3>
                <p className="text-[10px] mb-4 opacity-70 font-medium">
                  Use esta ferramenta para copiar os dados do banco antigo para o novo. 
                  Isso irá sobrescrever dados com o mesmo ID.
                </p>
                <button 
                  onClick={handleMigrateData}
                  disabled={isMigrating}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isMigrating ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95'}`}
                >
                  {isMigrating ? 'MIGRANDO...' : 'INICIAR MIGRAÇÃO'}
                </button>
                {migrationStatus && (
                  <div className="mt-4 p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-slate-200/10">
                    <p className="text-[9px] font-mono leading-none break-words">
                      {migrationStatus}
                    </p>
                  </div>
                )}
              </div>
              <button 
                onClick={async () => {
                  if (onProcessMonthlyAwards) {
                    setIsProcessing(true);
                    try {
                      await onProcessMonthlyAwards();
                      alert("✅ Insígnias históricas atualizadas com sucesso!");
                    } catch (err) {
                      alert("❌ Erro ao atualizar insígnias.");
                    } finally {
                      setIsProcessing(false);
                    }
                  }
                }}
                disabled={isProcessing}
                className={`w-full ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400 border-indigo-900/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} py-6 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-sm border uppercase text-xs tracking-widest active:scale-95 transition-all`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Trophy size={24} />}
                ATUALIZAR INSÍGNIAS HISTÓRICAS
              </button>
           </div>
        </div>
        {/* 5. ZERAR RANKING (PAINEL MASTER) */}
        <div className={`${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'} p-10 rounded-[3.5rem] border shadow-xl space-y-6 mt-6`}>
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert size={24} className="text-blue-600" />
            <h4 className={`text-[12px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Diagnóstico do Banco</h4>
          </div>
          <button 
            onClick={runDiagnostic}
            disabled={isDiagnosticRunning}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}
          >
            {isDiagnosticRunning ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            EXECUTAR DIAGNÓSTICO DE DADOS
          </button>

          {diagnosticResults.length > 0 && (
            <div className="space-y-4 mt-6">
              {/* Painel de Correção SQL */}
              <div className={`p-6 rounded-[2.5rem] border-2 ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-900 border-slate-800'} overflow-hidden shadow-2xl`}>
                <div className="flex items-center gap-2 mb-4">
                  <Database size={18} className="text-amber-400" />
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Comandos de Reparo (SQL Editor)</h4>
                </div>
                <p className="text-[9px] text-slate-400 mb-4 leading-relaxed uppercase font-black opacity-70">
                  Copie o código abaixo e cole no SQL EDITOR do seu Supabase Dashboard para criar as tabelas que estão faltando nas suas imagens:
                </p>
                <div className="bg-black/40 p-4 rounded-3xl border border-slate-700/50">
                  <pre className="text-[8px] font-mono text-green-400 overflow-x-auto custom-scrollbar select-all leading-tight">
{`-- 1. CRIAÇÃO DE TODAS AS TABELAS DO SISTEMA (ESTRUTURA COMPLETA)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(), 
  email TEXT, 
  full_name TEXT, 
  avatar_url TEXT, 
  role TEXT DEFAULT 'user', 
  password TEXT, -- Adicionado para compatibilidade
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, unit TEXT, birth_date DATE, phone TEXT, email TEXT, role TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS messages (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, sender_id UUID, content TEXT, role TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS announcements (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, title TEXT, content TEXT, schedule_date TIMESTAMP WITH TIME ZONE, priority TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS devotionals (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, title TEXT, content TEXT, link TEXT, scheduled_for TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS specialty_studies (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, title TEXT, content TEXT, video_url TEXT, scheduled_for TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS specialty_study_questions (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, study_id BIGINT, question TEXT, options JSONB, correct_answer INTEGER);
CREATE TABLE IF NOT EXISTS quiz_questions (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, question TEXT, options JSONB, correct_answer INTEGER, category TEXT, difficulty TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS who_am_i_questions (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, content TEXT, correct_answer TEXT, clues JSONB, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS three_clues_questions (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, content TEXT, answer TEXT, clues JSONB, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS scrambled_verses (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, verse TEXT, reference TEXT, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS puzzle_images (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, url TEXT, title TEXT, category TEXT, difficulty TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS "EspecialidadesDBV" (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "Nome" TEXT, "Imagem" TEXT, "Categoria" TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS game_configs (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, key TEXT UNIQUE, value JSONB, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS game_assets (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, game_type TEXT, name TEXT, url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS desbravadores (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name TEXT, unit TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS especialidades (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name TEXT, category TEXT, image_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS conselheiros (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name TEXT, unit TEXT, phone TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS quizzes (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, user_id UUID, score INTEGER, category TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());

-- 2. GARANTIR COLUNAS EM TABELAS QUE PODEM JÁ EXISTIR
ALTER TABLE IF EXISTS users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE specialty_studies ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE three_clues_questions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE three_clues_questions ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE who_am_i_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE who_am_i_questions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "EspecialidadesDBV" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. HABILITAR RLS E CRIAR POLÍTICAS DE ACESSO TOTAL
DO $$ 
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['devotionals', 'quizzes', 'who_am_i_questions', 'three_clues_questions', 'quiz_questions', 'EspecialidadesDBV', 'game_configs', 'game_assets', 'members', 'messages', 'announcements', 'specialty_studies', 'specialty_study_questions', 'scrambled_verses', 'puzzle_images', 'users', 'desbravadores', 'especialidades', 'conselheiros'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE 'ALTER TABLE IF EXISTS "' || t || '" ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Public Access" ON "' || t || '"';
        EXECUTE 'CREATE POLICY "Public Access" ON "' || t || '" FOR ALL USING (true) WITH CHECK (true)';
    END LOOP;
END $$;`}
                  </pre>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <p className="text-[8px] font-bold text-blue-400 uppercase leading-none text-center">
                    Dica: Após rodar no SQL Editor, clique em "EXECUTAR DIAGNÓSTICO" novamente.
                  </p>
                </div>
              </div>

              {/* Lista de Resultados */}
              <div className="grid grid-cols-1 gap-3">
                {diagnosticResults.map(res => (
                  <div key={res.table} className={`p-5 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex flex-col">
                         <span className="font-black text-[11px] uppercase tracking-tighter text-blue-500">{res.table}</span>
                         <span className={`text-[7px] font-black uppercase opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total: {res.count} registros</span>
                       </div>
                       <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${
                         res.status === 'OK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                       }`}>{res.status}</span>
                    </div>
                    {res.columns.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                        {res.columns.map(col => (
                          <span key={col} className={`text-[6px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>{col}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. ZERAR RANKING (PAINEL MASTER) */}
        {userEmail === ADMIN_MASTER_EMAIL && (
          <div className={`${isDarkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-[#fff1f1] border-red-100'} p-10 rounded-[3.5rem] border shadow-xl shadow-red-900/5 space-y-6 mt-6`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                <AlertTriangle size={20} strokeWidth={3} />
                <h4 className={`text-[12px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Zerar Rankings (Master)</h4>
              </div>
              <p className={`text-[9px] font-black ${isDarkMode ? 'text-red-800' : 'text-red-400'} uppercase tracking-widest mb-8 text-center leading-tight`}>Esta área é visível apenas para você. Ações irreversíveis.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button disabled={!!isResetting} onClick={() => handleResetClick('members', 'Membros')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'members' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Membros
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('quiz', 'Quiz')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'quiz' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Quiz
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('memory', 'Memória')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'memory' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Memória
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('specialty', 'Especialidade')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'specialty' ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />} 
                  </div>
                  Zerar Especialidade
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('1x1', 'Arena 1x1')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === '1x1' ? <Loader2 className="animate-spin" size={20} /> : <Sword size={20} />} 
                  </div>
                  Zerar Arena 1x1
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('threeclues', 'Três Dicas')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'threeclues' ? <Loader2 className="animate-spin" size={20} /> : <HelpCircle size={20} />} 
                  </div>
                  Zerar 3 Dicas
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('natureid', 'Natureza')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'natureid' ? <Loader2 className="animate-spin" size={20} /> : <Leaf size={20} />} 
                  </div>
                  Zerar Natureza
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('firstaid', 'Socorros')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'firstaid' ? <Loader2 className="animate-spin" size={20} /> : <HeartPulse size={20} />} 
                  </div>
                  Zerar Socorros
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('specialtytrail', 'Trilha')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'specialtytrail' ? <Loader2 className="animate-spin" size={20} /> : <Map size={20} />} 
                  </div>
                  Zerar Trilha
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('puzzle', 'Quebra-Cabeça')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'puzzle' ? <Loader2 className="animate-spin" size={20} /> : <Shuffle size={20} />} 
                  </div>
                  Zerar Quebra-Cabeça
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('knots', 'Nós')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'knots' ? <Loader2 className="animate-spin" size={20} /> : <Anchor size={20} />} 
                  </div>
                  Zerar Nós
                </button>
                <button disabled={!!isResetting} onClick={() => handleResetClick('scrambledverse', 'Versículo')} className={`${isDarkMode ? 'bg-slate-900/40 text-red-400 border-red-900/20' : 'bg-white text-red-600 border-red-100'} p-6 rounded-[2.5rem] font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-3 shadow-sm min-h-[110px] active:scale-95 transition-all border hover:border-red-500/30 group`}>
                  <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                    {isResetting === 'scrambledverse' ? <Loader2 className="animate-spin" size={20} /> : <Type size={20} />} 
                  </div>
                  Zerar Versículo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA ADICIONAR/EDITAR CONSELHEIROS */}
      {showCounselorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>{editCounselor ? 'Editar' : 'Novo'} Conselheiro</h3>
              <button onClick={() => setShowCounselorModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddOrUpdateCounselor} className="space-y-5 shrink-0">
              <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Nome do Conselheiro</label>
                <input 
                  required
                  autoFocus
                  className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-[#0061f2] outline-none font-bold text-sm shadow-inner`}
                  placeholder="Ex: JOÃO GABRIEL"
                  value={newCounselorName}
                  onChange={e => setNewCounselorName(e.target.value.toUpperCase())}
                />
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#0061f2] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  {editCounselor ? 'ATUALIZAR' : 'ADICIONAR'}
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              <h4 className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest ml-2`}>Conselheiros Cadastrados ({counselors.length})</h4>
              {counselors.length === 0 ? (
                <p className="text-center py-8 text-slate-300 text-[10px] font-black uppercase">Nenhum conselheiro cadastrado</p>
              ) : (
                counselors.map(c => (
                  <div key={`modal-counselor-${c.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4 flex items-center justify-between group`}>
                    <span className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-xs uppercase tracking-tight`}>{c.name}</span>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditCounselor(c); setNewCounselorName(c.name); }} className="text-blue-300 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if(confirm('Excluir?')) onDeleteCounselor(c.id!); }} className="text-red-200 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA GESTÃO DE DEVOCIONAIS */}
      {showDevotionalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-emerald-600" />
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>Gestão de Devocionais</h3>
              </div>
              <button onClick={() => setShowDevotionalModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>

            <div className={`flex p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xl shrink-0`}>
              <button 
                onClick={() => setShowDevotionalList(false)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!showDevotionalList ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'text-slate-400'}`}
              >
                Novo Devocional
              </button>
              <button 
                onClick={() => setShowDevotionalList(true)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${showDevotionalList ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'text-slate-400'}`}
              >
                Ver Agendados
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!showDevotionalList ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Título do Devocional</label>
                    <input 
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                      placeholder="Ex: Momento com Deus"
                      value={devotionalTitle}
                      onChange={e => setDevotionalTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Link do Vídeo ou Conteúdo</label>
                    <input 
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                      placeholder="Link do YouTube ou site"
                      value={devotionalLink}
                      onChange={e => setDevotionalLink(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Texto do Devocional</label>
                    <textarea 
                      rows={4}
                      className={`w-full p-4 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm resize-none`}
                      placeholder="Escreva a mensagem do dia..."
                      value={devotionalContent}
                      onChange={e => setDevotionalContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase ml-2 tracking-widest`}>Agendar Para</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="datetime-local"
                        className={`w-full p-4 pl-12 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-100 text-slate-700'} border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm`}
                        value={devotionalScheduledFor}
                        onChange={e => setDevotionalScheduledFor(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveDevotional}
                    disabled={isSavingDevotional}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSavingDevotional ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                    AGENDAR DEVOCIONAL
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {allDevotionals.length === 0 ? (
                    <div className="py-10 text-center opacity-30">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nenhum devocional agendado</p>
                    </div>
                  ) : (
                    allDevotionals.map(dev => (
                      <div key={`modal-devotional-${dev.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4 flex items-center justify-between`}>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase leading-tight`}>{dev.title}</p>
                          <p className={`text-[8px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mt-0.5`}>
                            {new Date(dev.scheduled_for).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteDevotional(dev.id!)}
                          className="p-2 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL PARA GESTÃO DE ASSETS (IMAGENS) */}
      {showAssetsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-6">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-blue-600" />
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-tight`}>Imagens dos Jogos</h3>
              </div>
              <button onClick={() => setShowAssetsModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
            </div>

            <p className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest leading-relaxed`}>
              Aqui você pode trocar os links das imagens que aparecem nos jogos. Use links diretos (que terminam em .jpg ou .png).
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {gameAssets.length === 0 ? (
                <div className="py-10 text-center opacity-30">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nenhuma imagem encontrada na tabela game_assets</p>
                </div>
              ) : (
                gameAssets.map(asset => (
                  <div key={`asset-${asset.id}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-3xl p-5 space-y-4`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-tight`}>{asset.name}</p>
                        <p className={`text-[8px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest truncate`}>{asset.game_type}</p>
                      </div>
                      <button 
                        onClick={() => { setEditingAsset(asset); setNewAssetUrl(asset.url); }}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>

                    {editingAsset?.id === asset.id && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                        <input 
                          className={`w-full p-3 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-700'} border rounded-xl text-xs font-bold`}
                          placeholder="Cole o novo link da imagem aqui..."
                          value={newAssetUrl}
                          onChange={e => setNewAssetUrl(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateAsset(asset.id)}
                            disabled={isSavingAsset}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            {isSavingAsset ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} SALVAR
                          </button>
                          <button 
                            onClick={() => setEditingAsset(null)}
                            className={`px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}
                          >
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE INSPEÇÃO DE MEMBRO */}
      <AnimatePresence>
        {inspectingMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'} rounded-[2.5rem] shadow-2xl border`}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{inspectingMember.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Logs de Pontuação e Atividade</p>
                </div>
                <button onClick={() => setInspectingMember(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pontos de Jogos</p>
                    <p className="text-2xl font-black text-blue-500">{(inspectingMember as any).totalGamesPoints || 0}</p>
                  </div>
                  <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Estudos</p>
                    <p className="text-2xl font-black text-amber-500">{(inspectingMember as any).specialtyStudyScore || 0}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Registros Brutos ({inspectingMember.scores?.length || 0})</h4>
                  <div className="space-y-2">
                    {inspectingMember.scores?.slice().reverse().map((score: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-2xl border text-[10px] ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter ${
                            score.type === 'game' ? 'bg-blue-100 text-blue-600' : 
                            score.type === 'weekly' ? 'bg-green-100 text-green-600' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {score.type || 'N/A'} - {score.gameId || 'N/A'}
                          </span>
                          <span className="text-slate-400 font-bold">{score.date}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(score).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                              <span className="text-slate-500 font-medium">{key}:</span>
                              <span className={`font-bold ${key === 'points' ? 'text-blue-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {(!inspectingMember.scores || inspectingMember.scores.length === 0) && (
                      <div className="py-10 text-center">
                        <p className="text-slate-400 font-bold text-xs uppercase">Nenhum registro encontrado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;
