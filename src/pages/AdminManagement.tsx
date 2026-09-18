
import React, { useState, useEffect } from 'react';
import { BellRing, UserPlus, ListFilter, Zap, Gamepad2, X, ShieldAlert, Medal, Trash2, AlertTriangle, Loader2, Sword, Edit2, Check, Copy, HelpCircle, MessageSquare, BookOpen, Calendar, Plus, Shuffle, Trophy, Anchor, User, Map, Type, Leaf, HeartPulse, Music, Grid3X3, Square, Upload, Cloud, Database, FileText, Table, Download, Eye, RefreshCw, CheckCircle2, FileSpreadsheet, Layers, ArrowLeft, Search, SlidersHorizontal, Filter, ChevronRight, Users, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Member, ChatMessage, Devotional, CounselorDB, Score } from '@/types';
import { DatabaseService, migrateAllDataToCloudflareD1, seedInitialDataToCloudflareD1, runD1Query, getCloudflareApiUrl, setCloudflareApiUrl, testCloudflareConnection, DEFAULT_CLOUDFLARE_API_URL, createAllD1Tables, ALL_D1_TABLES } from '@/db';
import { GAME_KEYS } from '@/helpers/scoreHelpers';
import { motion, AnimatePresence } from 'motion/react';
import { getCycleStart } from '@/utils/gameUtils';

import { NEW_QUIZ_QUESTIONS, NEW_THREE_CLUES_QUESTIONS, NEW_SCRAMBLED_VERSES, NEW_KNOTS_ASSETS, DEFAULT_ANNOUNCEMENTS, DEFAULT_SPECIALTY_STUDIES, DEFAULT_MEMBERS, DEFAULT_DEVOTIONALS } from '@/seedData';
import { isValidCounselorPersonName } from '@/utils/counselors';
import { parseSpecialtyStudiesFromRows } from '@/utils/specialtyStudyCsv';
import { useHorizontalScroll } from '@/utils/useHorizontalScroll';
import { AdminGamesTab } from '@/components/admin/AdminGamesTab';
import { AdminClubTab } from '@/components/admin/AdminClubTab';
import { AdminDatabaseTab } from '@/components/admin/AdminDatabaseTab';
import { AdminImportTab } from '@/components/admin/AdminImportTab';
import { AdminMasterTab } from '@/components/admin/AdminMasterTab';

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
  quizAllowedDay?: number | null;
  onSetQuizAllowedDay: (day: number | null) => void;
  memoryAllowedDay?: number | null;
  onSetMemoryAllowedDay: (day: number | null) => void;
  specialtyAllowedDay?: number | null;
  onSetSpecialtyAllowedDay: (day: number | null) => void;
  threeCluesAllowedDay?: number | null;
  onSetThreeCluesAllowedDay: (day: number | null) => void;
  puzzleAllowedDay?: number | null;
  onSetPuzzleAllowedDay: (day: number | null) => void;
  knotsAllowedDay?: number | null;
  onSetKnotsAllowedDay: (day: number | null) => void;
  specialtyTrailAllowedDay?: number | null;
  onSetSpecialtyTrailAllowedDay: (day: number | null) => void;
  scrambledVerseAllowedDay?: number | null;
  onSetScrambledVerseAllowedDay: (day: number | null) => void;
  natureIdAllowedDay?: number | null;
  onSetNatureIdAllowedDay: (day: number | null) => void;
  firstAidAllowedDay?: number | null;
  onSetFirstAidAllowedDay: (day: number | null) => void;
  brickBreakerAllowedDay?: number | null;
  onSetBrickBreakerAllowedDay: (day: number | null) => void;
  mahjongAllowedDay?: number | null;
  onSetMahjongAllowedDay: (day: number | null) => void;
  specialtyStudyOverride: boolean;
  onToggleSpecialtyStudyOverride: () => void;
  specialtyStudyAllowedDay?: number | null;
  onSetSpecialtyStudyAllowedDay: (day: number | null) => void;
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
  quizAllowedDay,
  onSetQuizAllowedDay,
  memoryAllowedDay,
  onSetMemoryAllowedDay,
  specialtyAllowedDay,
  onSetSpecialtyAllowedDay,
  threeCluesAllowedDay,
  onSetThreeCluesAllowedDay,
  puzzleAllowedDay,
  onSetPuzzleAllowedDay,
  knotsAllowedDay,
  onSetKnotsAllowedDay,
  specialtyTrailAllowedDay,
  onSetSpecialtyTrailAllowedDay,
  scrambledVerseAllowedDay,
  onSetScrambledVerseAllowedDay,
  natureIdAllowedDay,
  onSetNatureIdAllowedDay,
  firstAidAllowedDay,
  onSetFirstAidAllowedDay,
  brickBreakerAllowedDay,
  onSetBrickBreakerAllowedDay,
  mahjongAllowedDay,
  onSetMahjongAllowedDay,
  specialtyStudyOverride,
  onToggleSpecialtyStudyOverride,
  specialtyStudyAllowedDay,
  onSetSpecialtyStudyAllowedDay,
  onProcessMonthlyAwards,
  isDarkMode
}) => {
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState(false);
  const [editCounselor, setEditCounselor] = useState<CounselorDB | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<{table: string, count: number, status: string, columns: string[]}[]>([]);
  const [copiado, setCopiado] = useState(false);

  // Estados de navegação e organização da área de Admin
  type AdminTab = 'games' | 'club' | 'database' | 'import' | 'master';
  const [activeTab, setActiveTab] = useState<AdminTab>('games');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberUnitFilter, setMemberUnitFilter] = useState('all');
  const [gameControlSection, setGameControlSection] = useState<'editors' | 'access'>('editors');

  // Estados para migração para o Cloudflare D1
  const [cfWorkerUrl, setCfWorkerUrl] = useState(() => getCloudflareApiUrl());
  const [isTestingCf, setIsTestingCf] = useState(false);
  const [cfTestStatus, setCfTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isMigratingD1, setIsMigratingD1] = useState(false);
  const [d1MigrationResult, setD1MigrationResult] = useState<{
    success: boolean;
    counts: { members: number; users: number; announcements: number; specialties: number; gameConfigs: number };
    message: string;
  } | null>(null);
  const [isSeedingD1, setIsSeedingD1] = useState(false);
  const [d1SeedResult, setD1SeedResult] = useState<{
    success: boolean;
    counts: { members: number; users: number; announcements: number; specialties: number; studies: number; devotionals: number; questions: number };
    message: string;
  } | null>(null);

  const handleTestCf = async () => {
    setIsTestingCf(true);
    setCfTestStatus(null);
    try {
      const res = await testCloudflareConnection(cfWorkerUrl);
      setCfTestStatus(res);
    } catch (e: any) {
      setCfTestStatus({ success: false, message: e?.message || 'Erro ao conectar' });
    } finally {
      setIsTestingCf(false);
    }
  };

  const handleSaveCfUrl = (newUrl: string) => {
    setCfWorkerUrl(newUrl);
    setCloudflareApiUrl(newUrl);
    setCfTestStatus(null);
  };

  const handleSeedInitialDataToD1 = async () => {
    if (!window.confirm("Deseja popular o Cloudflare D1 com os dados padrão do clube (Membros com Davi campeão, Especialidades, Estudos, Devocionais e Quiz)?\n\nEsta opção restaura a estrutura inicial e registros base no Cloudflare D1.")) return;
    setCloudflareApiUrl(cfWorkerUrl);
    setIsSeedingD1(true);
    setD1SeedResult(null);
    try {
      const res = await seedInitialDataToCloudflareD1();
      setD1SeedResult(res);
      if (res.success) {
        alert(`✅ SUCESSO!\n\nCloudflare D1 populado com os dados base:\n• Membros: ${res.counts.members}\n• Usuários: ${res.counts.users}\n• Avisos: ${res.counts.announcements}\n• Especialidades: ${res.counts.specialties}\n• Estudos: ${res.counts.studies}\n• Devocionais: ${res.counts.devotionals}\n• Quiz: ${res.counts.questions}`);
      } else {
        alert(`❌ Falha ao popular D1: ${res.message}`);
      }
    } catch (e: any) {
      alert(`❌ Erro inesperado: ${e?.message || "Falha ao popular D1"}`);
    } finally {
      setIsSeedingD1(false);
    }
  };

  const handleMigrateToCloudflareD1 = async () => {
    if (!window.confirm("Deseja iniciar a migração de dados (Usuários, Membros, Avisos, Especialidades e Configs) para o Cloudflare D1?")) return;
    setCloudflareApiUrl(cfWorkerUrl);
    setIsMigratingD1(true);
    setD1MigrationResult(null);
    try {
      const res = await migrateAllDataToCloudflareD1();
      setD1MigrationResult(res);
      if (res.success) {
        alert(`✅ SUCESSO!\n\nDados migrados para o Cloudflare D1:\n• Membros: ${res.counts.members}\n• Usuários: ${res.counts.users}\n• Avisos: ${res.counts.announcements}\n• Especialidades: ${res.counts.specialties}\n• Configurações: ${res.counts.gameConfigs}`);
      } else {
        alert(`❌ Falha na migração: ${res.message}`);
      }
    } catch (e: any) {
      alert(`❌ Erro inesperado: ${e?.message || 'Falha ao migrar'}`);
    } finally {
      setIsMigratingD1(false);
    }
  };

  // Templates pré-definidos de CSV para cada uma das 16 tabelas originadas do Supabase
  const CSV_TEMPLATES: Record<string, { label: string; template: string; headers: string[] }> = {
    members: {
      label: 'Membros (members)',
      headers: ['id', 'name', 'unit', 'role', 'className', 'birthday', 'phone', 'counselor'],
      template: `id,name,unit,role,className,birthday,phone,counselor\nmem_davi,Davi de Pin,Águia Dourada,Desbravador,Amigo,2012-05-15,11999999999,Carlos\nmem_ronaldo,Ronaldo Sonic,Liderança,Diretoria,Guia,2000-01-10,11988888888,Ronaldo`
    },
    users: {
      label: 'Usuários (users)',
      headers: ['id', 'username', 'name', 'password', 'role', 'unit', 'funcao', 'avatar'],
      template: `id,username,name,password,role,unit,funcao\nuser_davi,davi,Davi de Pin,123,Desbravador,Águia Dourada,Desbravador Campeão\nuser_ronaldo,ronaldo,Ronaldo Sonic,123,Liderança,Liderança,Diretoria`
    },
    announcements: {
      label: 'Avisos (announcements)',
      headers: ['id', 'title', 'content', 'date', 'author', 'target', 'pinned'],
      template: `id,title,content,date,author,target,pinned\nav_1,Reunião de Pais,Reunião especial de pais neste sábado às 16h no clube.,2026-04-10,Diretoria,Todos,0\nav_2,Acampamento de Outono,Inscrições abertas para o próximo acampamento.,2026-04-15,Diretoria,Todos,1`
    },
    EspecialidadesDBV: {
      label: 'Especialidades (EspecialidadesDBV)',
      headers: ['id', 'Nome', 'Area', 'badgeUrl'],
      template: `id,Nome,Area,badgeUrl\nesp_arte_acampar,Arte de Acampar,Atividades Recreativas,https://i.ibb.co/example/acampar.png\nesp_primeiros_socorros,Primeiros Socorros,Saúde e Ciência,https://i.ibb.co/example/socorros.png`
    },
    specialty_studies: {
      label: 'Estudos de Especialidades (specialty_studies)',
      headers: ['nome', 'categoria', 'pdf_url', 'video_url', 'imagem', 'data_agendamento', 'pergunta', 'opcao_a', 'opcao_b', 'opcao_c', 'opcao_d', 'resposta_correta'],
      template: `nome,categoria,pdf_url,video_url,imagem,data_agendamento,pergunta,opcao_a,opcao_b,opcao_c,opcao_d,resposta_correta
"Especialidade de Gatos","Natureza","https://exemplo.com/gatos.pdf","https://youtube.com/watch?v=123","https://exemplo.com/gatos.png","2026-05-01","Qual o nome científico do gato doméstico?","Felis catus","Panthera leo","Felis silvestris","Lynx lynx",0
"Especialidade de Gatos","Natureza","https://exemplo.com/gatos.pdf","https://youtube.com/watch?v=123","https://exemplo.com/gatos.png","2026-05-01","Quantos dentes tem um gato adulto?","20","30","40","50",1
"Estudo de Nós e Amarras","Habilidades Manuais","https://exemplo.com/nos.pdf","","https://i.ibb.co/ex.png","2026-04-12","Qual nó é usado para unir cabos de bitolas diferentes?","Nó de Escota","Nó Direito","Lais de Guia","Catau",0`
    },
    devotionals: {
      label: 'Devocionais (devotionals)',
      headers: ['id', 'title', 'content', 'link', 'scheduled_for'],
      template: `id,title,content,link,scheduled_for\ndev_1,O Guia da Fé,Lâmpada para os meus pés é a Tua palavra e luz para o meu caminho.,https://biblia.com,2026-04-11`
    },
    quiz_questions: {
      label: 'Perguntas do Quiz (quiz_questions)',
      headers: ['id', 'category', 'question', 'options', 'correct_answer', 'tip', 'image_url'],
      template: `id,category,question,options,correct_answer,tip,image_url\nq_1,Bíblia,Quem construiu a arca?,Moisés;Noé;Abraão;Davi,1,Ele tinha 3 filhos e colocou animais na arca,`
    },
    Biblia_Completa: {
      label: 'Bíblia Completa (Biblia_Completa)',
      headers: ['id', 'Livro', 'Capitulo', 'Versiculo', 'Texto', 'testamento'],
      template: `id,Livro,Capitulo,Versiculo,Texto,testamento\n1,Gênesis,1,1,No princípio criou Deus os céus e a terra.,Antigo\n2,Gênesis,1,2,E a terra era sem forma e vazia.,Antigo`
    },
    conselheiros: {
      label: 'Conselheiros (conselheiros)',
      headers: ['id', 'nome', 'unidade'],
      template: `id,nome,unidade\ncons_1,Carlos Souza,Águia Dourada\ncons_2,Ana Paula,Guerreiros de Betel`
    },
    game_assets: {
      label: 'Ativos dos Jogos (game_assets)',
      headers: ['id', 'game_type', 'name', 'url'],
      template: `id,game_type,name,url\nasset_1,knots,Nó Direito,https://exemplo.com/no_direito.png\nasset_2,nature,Ipê Amarelo,https://exemplo.com/ipe.png`
    },
    game_configs: {
      label: 'Configurações de Jogos (game_configs)',
      headers: ['id', 'type', 'config'],
      template: `id,type,config\n1,game_configs,{"active":true,"quizOverride":false}`
    },
    messages: {
      label: 'Mensagens / Chat (messages)',
      headers: ['id', 'sender_id', 'sender_name', 'sender_photo', 'text', 'unit', 'target'],
      template: `id,sender_id,sender_name,sender_photo,text,unit,target\nmsg_1,user_ronaldo,Ronaldo Sonic,,Bem-vindos ao mural do clube!,all,all`
    },
    puzzle_images: {
      label: 'Quebra-Cabeça (puzzle_images)',
      headers: ['id', 'title', 'url'],
      template: `id,title,url\npuz_1,Acampamento de Verão,https://images.unsplash.com/photo-1510312305653-8ed496efae75`
    },
    scrambled_verses: {
      label: 'Versículos Embaralhados (scrambled_verses)',
      headers: ['id', 'title', 'reference', 'text', 'scheduled_for'],
      template: `id,title,reference,text,scheduled_for\nsv_1,Salmos 23:1,Salmos 23:1,O Senhor é o meu pastor nada me faltará.,2026-04-12`
    },
    three_clues_questions: {
      label: 'Três Pistas (three_clues_questions)',
      headers: ['id', 'category', 'answer', 'clue1', 'clue2', 'clue3'],
      template: `id,category,answer,clue1,clue2,clue3\ntc_1,Bíblia,Moisés,Fui colocado em um cesto de junco,Abri o Mar Vermelho,Recebi as tábuas dos Dez Mandamentos`
    },
    who_am_i_questions: {
      label: 'Quem Sou Eu (who_am_i_questions)',
      headers: ['id', 'character', 'clues', 'tip', 'category'],
      template: `id,character,clues,tip,category\nwai_1,Davi,Derrubei um gigante com uma funda;Fui o segundo rei de Israel;Escrevi muitos Salmos,Fui pastor de ovelhas na juventude,Bíblia`
    }
  };

  // Estados para envio de tabelas CSV/XLSX para o novo banco (Cloudflare D1)
  type ImportTargetTable =
    | 'members'
    | 'users'
    | 'announcements'
    | 'EspecialidadesDBV'
    | 'specialty_studies'
    | 'devotionals'
    | 'quiz_questions'
    | 'Biblia_Completa'
    | 'conselheiros'
    | 'game_assets'
    | 'game_configs'
    | 'messages'
    | 'puzzle_images'
    | 'scrambled_verses'
    | 'three_clues_questions'
    | 'who_am_i_questions'
    | 'custom';

  const [importTarget, setImportTarget] = useState<ImportTargetTable>('members');
  const [customTableName, setCustomTableName] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [rawImportText, setRawImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingAllTables, setIsCreatingAllTables] = useState(false);
  const [detectedTableName, setDetectedTableName] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, error: 0 });
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);

  // Auto-identifica a tabela a partir do nome do arquivo (ex: announcements_rows.csv -> announcements)
  const detectTableFromFileName = (fileName: string): ImportTargetTable | null => {
    const clean = fileName
      .toLowerCase()
      .replace(/\.(csv|json|xlsx|xls)$/, '')
      .replace(/_rows$/, '')
      .replace(/_row$/, '')
      .trim();

    const map: Record<string, ImportTargetTable> = {
      'announcements': 'announcements',
      'avisos': 'announcements',
      'biblia_completa': 'Biblia_Completa',
      'bibliacompleta': 'Biblia_Completa',
      'biblia': 'Biblia_Completa',
      'conselheiros': 'conselheiros',
      'counselors': 'conselheiros',
      'devotionals': 'devotionals',
      'devocionais': 'devotionals',
      'especialidadesdbv': 'EspecialidadesDBV',
      'especialidades': 'EspecialidadesDBV',
      'game_assets': 'game_assets',
      'gameassets': 'game_assets',
      'game_configs': 'game_configs',
      'gameconfigs': 'game_configs',
      'members': 'members',
      'membros': 'members',
      'messages': 'messages',
      'mensagens': 'messages',
      'puzzle_images': 'puzzle_images',
      'puzzleimages': 'puzzle_images',
      'quiz_questions': 'quiz_questions',
      'quiz': 'quiz_questions',
      'scrambled_verses': 'scrambled_verses',
      'scrambledverses': 'scrambled_verses',
      'specialty_studies': 'specialty_studies',
      'specialtystudies': 'specialty_studies',
      'three_clues_questions': 'three_clues_questions',
      'threeclues': 'three_clues_questions',
      'users': 'users',
      'usuarios': 'users',
      'who_am_i_questions': 'who_am_i_questions',
      'whoami': 'who_am_i_questions',
      'who_am_i': 'who_am_i_questions'
    };
    return map[clean] || null;
  };

  const handleCopyTemplate = () => {
    const tpl = CSV_TEMPLATES[importTarget]?.template;
    if (tpl) {
      navigator.clipboard.writeText(tpl);
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 2000);
    }
  };

  const handleLoadTemplateIntoEditor = () => {
    const tpl = CSV_TEMPLATES[importTarget]?.template;
    if (tpl) {
      setRawImportText(tpl);
      setImportFormat('csv');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readImportFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      readImportFile(file);
    }
  };

  const readImportFile = (file: File) => {
    const detected = detectTableFromFileName(file.name);
    if (detected) {
      setImportTarget(detected);
      setDetectedTableName(detected);
      setTimeout(() => setDetectedTableName(null), 6000);
    }

    // Suporte nativo a planilhas Excel (.xlsx, .xls)
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          setRawImportText(JSON.stringify(json, null, 2));
          setImportFormat('json');
        } catch (err: any) {
          alert('Erro ao processar planilha Excel: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    if (file.name.endsWith('.json')) {
      setImportFormat('json');
    } else if (file.name.endsWith('.csv')) {
      setImportFormat('csv');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setRawImportText(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  // Criação explícita de todas as 16 tabelas no Cloudflare D1
  const handleCreateAllTables = async () => {
    if (!window.confirm("Deseja criar e verificar todas as 16 tabelas originadas do Supabase no Cloudflare D1 agora?")) return;
    setIsCreatingAllTables(true);
    try {
      const res = await createAllD1Tables();
      if (res.success) {
        alert(`✅ SUCESSO!\n\nTodas as 16 tabelas foram criadas/garantidas no Cloudflare D1:\n` + ALL_D1_TABLES.map(t => `• ${t}`).join('\n'));
      } else {
        alert(`⚠️ Tabelas criadas: ${res.createdCount} de 16.\nErros:\n${res.errors.join('\n')}`);
      }
      await runDiagnostic();
    } catch (err: any) {
      alert(`❌ Erro ao criar tabelas: ${err?.message || 'Falha inesperada'}`);
    } finally {
      setIsCreatingAllTables(false);
    }
  };

  const runDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    const results = [];
    
    for (const table of ALL_D1_TABLES) {
      try {
        const rows = await runD1Query(`SELECT * FROM ${table} LIMIT 1`);
        const countRes = await runD1Query<{ total?: number }>(`SELECT COUNT(*) as total FROM ${table}`);
        const count = countRes && countRes[0] ? (countRes[0].total ?? (countRes[0] as any)['COUNT(*)'] ?? 0) : 0;
        const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
        
        results.push({ 
          table, 
          count: Number(count) || 0, 
          status: 'OK', 
          columns 
        });
      } catch (e: any) {
        results.push({ table, count: -1, status: `Não criada ou com erro: ${e?.message || 'Inacessível'}`, columns: [] });
      }
    }
    setDiagnosticResults(results);
    setIsDiagnosticRunning(false);
  };
  const [newCounselorName, setNewCounselorName] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [devotionalLink, setDevotionalLink] = useState('');
  const [devotionalTitle, setDevotionalTitle] = useState('');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScheduledFor, setDevotionalScheduledFor] = useState(new Date().toISOString().slice(0, 16));
  const [isSavingDevotional, setIsSavingDevotional] = useState(false);
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null);
  const [showDevotionalList, setShowDevotionalList] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [gameAssets, setGameAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  
  const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';
  const isMasterAdmin = (userEmail || '').toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase();

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
    const finalTitle = devotionalTitle.trim() || 'Devocional Diário';
    
    if (!devotionalContent.trim() && !devotionalLink.trim()) {
      alert("Preencha ao menos o texto ou o link do devocional.");
      return;
    }
    
    setIsSavingDevotional(true);
    try {
      const scheduledDate = new Date(devotionalScheduledFor);

      if (editingDevotional && editingDevotional.id) {
        await DatabaseService.updateDevotional(editingDevotional.id, {
          link: devotionalLink,
          title: finalTitle,
          content: devotionalContent,
          scheduled_for: scheduledDate.toISOString()
        });
        alert("✅ Devocional editado com sucesso!");
        setEditingDevotional(null);
      } else {
        await DatabaseService.createDevotional({
          link: devotionalLink,
          title: finalTitle,
          content: devotionalContent,
          scheduled_for: scheduledDate.toISOString()
        });
        alert("✅ Devocional agendado com sucesso!");
      }

      // Calcula o próximo dia com base na data que foi salva
      const nextDay = new Date(scheduledDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const yyyy = nextDay.getFullYear();
      const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDay.getDate()).padStart(2, '0');
      const hh = String(nextDay.getHours()).padStart(2, '0');
      const min = String(nextDay.getMinutes()).padStart(2, '0');
      const nextDayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

      setDevotionalLink('');
      setDevotionalTitle('');
      setDevotionalContent('');
      setDevotionalScheduledFor(nextDayStr);
      loadDevotionals();
    } catch (err) {
      alert("❌ Erro ao salvar devocional.");
    } finally {
      setIsSavingDevotional(false);
    }
  };

  const handleEditDevotional = (dev: Devotional) => {
    setEditingDevotional(dev);
    setDevotionalTitle(dev.title);
    setDevotionalLink(dev.link);
    setDevotionalContent(dev.content);
    const d = new Date(dev.scheduled_for);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    setDevotionalScheduledFor(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    setShowDevotionalList(false);
  };

  const handleCancelEditDevotional = () => {
    setEditingDevotional(null);
    setDevotionalTitle('');
    setDevotionalLink('');
    setDevotionalContent('');
    setDevotionalScheduledFor(new Date().toISOString().slice(0, 16));
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
    const cleanName = newCounselorName.trim();
    if (!cleanName) return;
    if (!isValidCounselorPersonName(cleanName)) {
      alert("Por favor, insira o nome de uma pessoa. Nomes de cargos, funções ou unidades não são permitidos.");
      return;
    }
    setIsProcessing(true);
    try {
      if (editCounselor) await onUpdateCounselor(editCounselor.id!, cleanName);
      else await onAddCounselor(cleanName);
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
      await DatabaseService.seedDevotionals(DEFAULT_DEVOTIONALS);
      console.log("Assets e devocionais semeados.");
      alert("✅ SUCESSO: Novas questões e ativos adicionados com sucesso!");
    } catch (error: any) {
      console.error("Erro detalhado ao semear dados:", error);
      const errorMsg = error?.message || error?.details || "Erro desconhecido";
      alert(`❌ ERRO: Falha ao adicionar novas questões. Detalhes: ${errorMsg}`);
    } finally {
      setIsSeeding(false);
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

  const handleImportData = async () => {
    if (!rawImportText.trim()) {
      alert("Por favor, cole os dados CSV ou JSON primeiro ou selecione um arquivo!");
      return;
    }

    if (importTarget === 'custom' && !customTableName.trim()) {
      alert("Por favor, digite o nome da tabela personalizada de destino!");
      return;
    }

    setImportLogs([]);
    setIsImporting(true);
    setImportProgress({ current: 0, total: 0, success: 0, error: 0 });

    const getValueWithAliases = (obj: any, aliases: string[], defaultValue: any = '') => {
      for (const alias of aliases) {
        if (obj[alias] !== undefined && obj[alias] !== null) return obj[alias];
      }
      const objKeys = Object.keys(obj);
      for (const alias of aliases) {
        const matchedKey = objKeys.find(k => k.toLowerCase() === alias.toLowerCase());
        if (matchedKey && obj[matchedKey] !== undefined && obj[matchedKey] !== null) return obj[matchedKey];
      }
      return defaultValue;
    };

    try {
      let items: any[] = [];

      if (importFormat === 'json') {
        try {
          const parsed = JSON.parse(rawImportText);
          items = Array.isArray(parsed) ? parsed : [parsed];
        } catch (jsonErr: any) {
          throw new Error(`JSON Inválido: ${jsonErr.message}`);
        }
      } else {
        // Parser robusto de CSV que respeita aspas duplas, ponto-e-vírgula, vírgula e TAB
        const lines = rawImportText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          throw new Error("O CSV precisa ter pelo menos 2 linhas (cabeçalho + conteúdo)");
        }

        const headerLine = lines[0];
        let separator = ',';
        const commas = (headerLine.match(/,/g) || []).length;
        const semicolons = (headerLine.match(/;/g) || []).length;
        const tabs = (headerLine.match(/\t/g) || []).length;
        if (tabs > commas && tabs > semicolons) separator = '\t';
        else if (semicolons >= commas) separator = ';';
        
        const parseCSVLine = (line: string, sep: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === sep && !inQuotes) {
              result.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current);
          return result.map(v => v.trim());
        };

        const headers = parseCSVLine(headerLine, separator).map(h => h.replace(/^["']|["']$/g, '').trim());

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i];
          const values = parseCSVLine(currentLine, separator);
          
          if (values.length > 0 && values.some(v => v !== '')) {
            const rowObject: any = {};
            headers.forEach((header, index) => {
              if (header) {
                rowObject[header] = values[index] !== undefined ? values[index] : '';
              }
            });
            items.push(rowObject);
          }
        }
      }

      const total = items.length;
      setImportProgress(p => ({ ...p, total }));
      setImportLogs(prev => [...prev, `🔍 Identificados ${total} registros para importar na tabela "${importTarget === 'custom' ? customTableName : importTarget}".`]);

      let successCount = 0;
      let errorCount = 0;

      if (importTarget === 'specialty_studies') {
        const parsedStudies = parseSpecialtyStudiesFromRows(items);
        setImportLogs(prev => [...prev, `📚 Identificado(s) ${parsedStudies.length} estudo(s) de especialidade(s) para importar.`]);
        setImportProgress(p => ({ ...p, total: parsedStudies.length }));

        for (let sIdx = 0; sIdx < parsedStudies.length; sIdx++) {
          const study = parsedStudies[sIdx];
          const curr = sIdx + 1;
          setImportProgress(p => ({ ...p, current: curr }));

          try {
            await DatabaseService.saveSpecialtyStudy(study);
            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${curr}/${parsedStudies.length}] Salvo no Banco de Dados: Estudo "${study.name}" (${study.questions?.length || 0} questões)`]);
          } catch (err: any) {
            errorCount++;
            setImportProgress(p => ({ ...p, error: errorCount }));
            setImportLogs(prev => [...prev, `❌ [${curr}/${parsedStudies.length}] Erro ao salvar "${study.name}": ${err?.message || err}`]);
          }
        }

        setIsProcessing(false);
        setImportLogs(prev => [...prev, `🎉 Importação de estudos concluída: ${successCount} salvos com sucesso, ${errorCount} erros.`]);
        return;
      }

      for (let index = 0; index < total; index++) {
        const item = items[index];
        const currentNum = index + 1;
        setImportProgress(p => ({ ...p, current: currentNum }));

        try {
          const recordId = String(getValueWithAliases(item, ['id', 'ID'], '') || `rec_${Date.now()}_${index}`);

          if (importTarget === 'members') {
            const rawAge = getValueWithAliases(item, ['age', 'Age', 'idade', 'Idade'], '0');
            const ageVal = parseInt(rawAge, 10) || 0;
            
            const rawScores = getValueWithAliases(item, ['scores', 'Scores', 'pontos', 'Pontos', 'score', 'Score'], null);
            let parsedScores: any[] = [];
            if (rawScores) {
              if (typeof rawScores === 'string') {
                try { parsedScores = JSON.parse(rawScores); } catch { parsedScores = []; }
              } else if (Array.isArray(rawScores)) {
                parsedScores = rawScores;
              }
            }

            const rawBadges = getValueWithAliases(item, ['badges', 'Badges', 'medalhas', 'Medalhas', 'conquistas'], null);
            let parsedBadges: any[] = [];
            if (rawBadges) {
              try { parsedBadges = typeof rawBadges === 'string' ? JSON.parse(rawBadges) : rawBadges; } catch {}
            }

            const rawStats = getValueWithAliases(item, ['stats', 'Stats', 'estatisticas', 'Estatísticas'], null);
            let parsedStats: any = { gamesPlayed: 0, correctAnswers: 0, wrongAnswers: 0, timeSpent: 0, perfectGames: 0 };
            if (rawStats) {
              try { parsedStats = typeof rawStats === 'string' ? JSON.parse(rawStats) : rawStats; } catch {}
            }

            const nameVal = getValueWithAliases(item, ['name', 'Name', 'nome', 'Nome'], 'Membro');
            const roleVal = getValueWithAliases(item, ['role', 'Role', 'cargo', 'Cargo', 'funcao', 'Função'], 'Desbravador');
            const classNameVal = getValueWithAliases(item, ['className', 'ClassName', 'class_name', 'classe', 'Classe', 'rank'], 'Amigo');
            const joinedAtVal = getValueWithAliases(item, ['joinedAt', 'JoinedAt', 'joined_at', 'entrada'], new Date().toISOString());
            const birthdayVal = getValueWithAliases(item, ['birthday', 'Birthday', 'nascimento', 'Nascimento', 'aniversario', 'birthDate'], '');
            const counselorVal = getValueWithAliases(item, ['counselor', 'Counselor', 'conselheiro', 'Conselheiro'], '');
            const unitVal = getValueWithAliases(item, ['unit', 'Unit', 'unidade', 'Unidade'], 'Sucessores');
            const phoneVal = getValueWithAliases(item, ['phone', 'Phone', 'telefone', 'Telefone', 'whatsapp', 'celular'], '');
            const photoUrlVal = getValueWithAliases(item, ['photoUrl', 'PhotoUrl', 'photo_url', 'foto', 'Foto', 'avatar'], '');

            const payload: any = {
              id: recordId,
              name: nameVal,
              role: roleVal,
              age: ageVal,
              className: classNameVal,
              joinedAt: joinedAtVal,
              birthday: birthdayVal || null,
              counselor: counselorVal,
              unit: unitVal,
              scores: parsedScores,
              photoUrl: photoUrlVal,
              badges: parsedBadges,
              stats: parsedStats
            };

            // Insere diretamente no Cloudflare D1
            await runD1Query(
              "INSERT OR REPLACE INTO members (id, name, unit, role, rank, active, birthDate, phone, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                payload.id,
                payload.name,
                payload.unit,
                payload.role,
                payload.className || "",
                1,
                payload.birthday || "",
                phoneVal || "",
                JSON.stringify({ scores: payload.scores || [], badges: payload.badges || [], stats: payload.stats || {}, counselor: payload.counselor || "" })
              ]
            );

            // Atualiza backup local
            try {
              const cached = localStorage.getItem("sentinelas_members_backup");
              let list: Member[] = cached ? JSON.parse(cached) : [];
              list = list.filter(m => m.id !== payload.id);
              list.push(payload);
              localStorage.setItem("sentinelas_members_backup", JSON.stringify(list));
            } catch {}

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Membro "${payload.name}"`]);

          } else if (importTarget === 'users') {
            const rawAge = getValueWithAliases(item, ['age', 'Age', 'idade', 'Idade'], null);
            const ageVal = rawAge ? parseInt(rawAge, 10) : null;
            const nameVal = getValueWithAliases(item, ['name', 'Name', 'nome', 'Nome'], 'Usuário');
            const roleVal = getValueWithAliases(item, ['role', 'Role', 'cargo', 'Cargo'], 'Desbravador');
            const funcaoVal = getValueWithAliases(item, ['funcao', 'Função', 'função', 'role_detail'], '');
            const unitVal = getValueWithAliases(item, ['unit', 'Unit', 'unidade', 'Unidade'], '');
            const birthdayVal = getValueWithAliases(item, ['birthday', 'Birthday', 'nascimento', 'Nascimento'], '');
            const classNameVal = getValueWithAliases(item, ['className', 'ClassName', 'classe', 'Classe'], '');
            const emailVal = getValueWithAliases(item, ['email', 'Email', 'username', 'login', 'usuario'], recordId);
            const passwordVal = getValueWithAliases(item, ['password', 'Password', 'senha', 'Senha'], '123456');
            const photoUrlVal = getValueWithAliases(item, ['photoUrl', 'PhotoUrl', 'avatar', 'foto', 'Foto'], '');

            const rawBadges = getValueWithAliases(item, ['badges', 'Badges', 'monthlyMedals', 'medalhas'], null);
            let parsedBadges: any[] = [];
            if (rawBadges) {
              try { parsedBadges = typeof rawBadges === 'string' ? JSON.parse(rawBadges) : rawBadges; } catch {}
            }

            const payload: any = {
              id: recordId,
              name: nameVal,
              role: roleVal,
              funcao: funcaoVal || roleVal,
              unit: unitVal,
              age: ageVal,
              birthday: birthdayVal || null,
              className: classNameVal,
              email: emailVal,
              password: passwordVal,
              photoUrl: photoUrlVal,
              badges: parsedBadges,
              stats: { gamesPlayed: 0, correctAnswers: 0, wrongAnswers: 0, timeSpent: 0, perfectGames: 0 }
            };

            // Insere diretamente no Cloudflare D1
            await runD1Query(
              "INSERT OR REPLACE INTO users (id, username, name, role, unit, password, active, funcao, monthlyMedals, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [
                payload.id,
                payload.email || payload.id,
                payload.name,
                payload.role,
                payload.unit || "",
                payload.password || "123456",
                1,
                payload.funcao || payload.role,
                JSON.stringify(payload.badges || []),
                payload.photoUrl || ""
              ]
            );

            // Atualiza backup local de usuários
            try {
              const cached = localStorage.getItem("sentinelas_users_backup");
              let list: any[] = cached ? JSON.parse(cached) : [];
              list = list.filter(u => u.id !== payload.id);
              list.push(payload);
              localStorage.setItem("sentinelas_users_backup", JSON.stringify(list));
            } catch {}

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Usuário "${payload.name}" (${payload.email})`]);

          } else if (importTarget === 'announcements') {
            const title = getValueWithAliases(item, ['title', 'Title', 'titulo', 'Titulo', 'nome'], 'Novo Aviso');
            const content = getValueWithAliases(item, ['content', 'Content', 'conteudo', 'Conteúdo', 'texto', 'mensagem'], '');
            const date = getValueWithAliases(item, ['date', 'Date', 'data', 'Data'], new Date().toISOString().split('T')[0]);
            const author = getValueWithAliases(item, ['author', 'Author', 'autor', 'Autor'], 'Diretoria');
            const target = getValueWithAliases(item, ['target', 'Target', 'alvo', 'Alvo', 'destinatario'], 'Todos');
            const pinnedRaw = getValueWithAliases(item, ['pinned', 'Pinned', 'fixado', 'Fixado'], '0');
            const pinned = pinnedRaw === '1' || pinnedRaw === 1 || pinnedRaw === 'true' ? 1 : 0;

            await runD1Query(
              "INSERT OR REPLACE INTO announcements (id, title, content, date, author, target, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [recordId, title, content, date, author, target, pinned]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Aviso "${title}"`]);

          } else if (importTarget === 'EspecialidadesDBV') {
            const nome = getValueWithAliases(item, ['Nome', 'nome', 'name', 'Name', 'titulo'], 'Especialidade');
            const area = getValueWithAliases(item, ['Area', 'area', 'Categoria', 'categoria', 'Category'], 'Geral');
            const badgeUrl = getValueWithAliases(item, ['badgeUrl', 'badge_url', 'Imagem', 'imagem', 'url', 'foto'], '');

            await runD1Query(
              "INSERT OR REPLACE INTO EspecialidadesDBV (id, Nome, Area, badgeUrl) VALUES (?, ?, ?, ?)",
              [recordId, nome, area, badgeUrl]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Especialidade "${nome}"`]);

          } else if (importTarget === 'specialty_studies') {
            const name = getValueWithAliases(item, ['name', 'Name', 'nome', 'Nome', 'titulo'], 'Novo Estudo');
            const pdfurl = getValueWithAliases(item, ['pdfurl', 'pdf_url', 'pdf', 'link_pdf'], '');
            const video_url = getValueWithAliases(item, ['video_url', 'videoUrl', 'video', 'youtube'], '');
            const specialty_image_url = getValueWithAliases(item, ['specialty_image_url', 'imagem', 'badge', 'foto'], '');
            const category = getValueWithAliases(item, ['category', 'Category', 'categoria', 'area'], 'Geral');
            const questionsRaw = getValueWithAliases(item, ['questions', 'Questions', 'questoes', 'perguntas'], '[]');
            const scheduled_for = getValueWithAliases(item, ['scheduled_for', 'scheduledFor', 'agendamento', 'data'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt', 'criado_em'], new Date().toISOString());

            const parsedStudies = parseSpecialtyStudiesFromRows([item]);
            const studyToSave = parsedStudies[0] || {
              id: recordId,
              name,
              pdfurl,
              video_url,
              specialty_image_url,
              category,
              questions: typeof questionsRaw === 'string' ? JSON.parse(questionsRaw || '[]') : questionsRaw,
              scheduled_for,
              created_at
            };

            await DatabaseService.saveSpecialtyStudy(studyToSave);

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Banco de Dados: Estudo "${name}"`]);

          } else if (importTarget === 'devotionals') {
            const title = getValueWithAliases(item, ['title', 'Title', 'titulo', 'Titulo'], 'Devocional');
            const content = getValueWithAliases(item, ['content', 'Content', 'conteudo', 'Conteúdo', 'texto'], '');
            const link = getValueWithAliases(item, ['link', 'Link', 'url', 'Url'], '');
            const scheduled_for = getValueWithAliases(item, ['scheduled_for', 'scheduledFor', 'agendamento', 'data'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt', 'criado_em'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO devotionals (id, title, content, link, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              [recordId, title, content, link, scheduled_for, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Devocional "${title}"`]);

          } else if (importTarget === 'quiz_questions') {
            const category = getValueWithAliases(item, ['category', 'Category', 'categoria', 'Categoria'], 'Geral');
            const question = getValueWithAliases(item, ['question', 'Question', 'pergunta', 'Pergunta'], '');
            const optionsRaw = getValueWithAliases(item, ['options', 'Options', 'opcoes', 'alternativas'], '[]');
            const correctAnswerRaw = getValueWithAliases(item, ['correct_answer', 'correctAnswer', 'correta', 'resposta_correta'], '0');
            const tip = getValueWithAliases(item, ['tip', 'Tip', 'dica', 'Dica'], '');
            const image_url = getValueWithAliases(item, ['image_url', 'imageUrl', 'imagem', 'foto'], '');

            let optionsStr = '[]';
            if (typeof optionsRaw === 'string') {
              if (optionsRaw.startsWith('[') && optionsRaw.endsWith(']')) {
                optionsStr = optionsRaw;
              } else if (optionsRaw.includes(';') || optionsRaw.includes('|')) {
                const splitOpts = optionsRaw.split(/[;|]/).map(o => o.trim()).filter(Boolean);
                optionsStr = JSON.stringify(splitOpts);
              } else {
                optionsStr = JSON.stringify([optionsRaw]);
              }
            } else if (Array.isArray(optionsRaw)) {
              optionsStr = JSON.stringify(optionsRaw);
            }

            const correct_answer = parseInt(correctAnswerRaw, 10) || 0;

            await runD1Query(
              "INSERT OR REPLACE INTO quiz_questions (id, category, question, options, correct_answer, tip, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [recordId, category, question, optionsStr, correct_answer, tip, image_url]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Questão "${question.slice(0, 30)}..."`]);

          } else if (importTarget === 'Biblia_Completa') {
            const livro = getValueWithAliases(item, ['Livro', 'livro', 'book', 'book_name', 'Nome'], 'Gênesis');
            const capitulo = parseInt(getValueWithAliases(item, ['Capitulo', 'capitulo', 'chapter'], '1'), 10) || 1;
            const versiculo = parseInt(getValueWithAliases(item, ['Versiculo', 'versiculo', 'verse', 'verse_number'], '1'), 10) || 1;
            const texto = getValueWithAliases(item, ['Texto', 'texto', 'text', 'conteudo'], '');
            const testamento = getValueWithAliases(item, ['testamento', 'Testamento'], 'Antigo');

            await runD1Query(
              "INSERT OR REPLACE INTO Biblia_Completa (id, Livro, Capitulo, Versiculo, Texto, testamento, book_name, chapter, verse_number, text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [recordId, livro, capitulo, versiculo, texto, testamento, livro, capitulo, versiculo, texto]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Bíblia "${livro} ${capitulo}:${versiculo}"`]);

          } else if (importTarget === 'conselheiros') {
            const nome = getValueWithAliases(item, ['nome', 'Nome', 'name', 'Name'], 'Conselheiro');
            const unidade = getValueWithAliases(item, ['unidade', 'Unidade', 'unit', 'Unit'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt', 'criado_em'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO conselheiros (id, nome, name, unidade, unit, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              [recordId, nome, nome, unidade, unidade, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Conselheiro "${nome}" (${unidade})`]);

          } else if (importTarget === 'game_assets') {
            const game_type = getValueWithAliases(item, ['game_type', 'gameType', 'tipo_jogo'], 'geral');
            const name = getValueWithAliases(item, ['name', 'Name', 'nome', 'titulo'], 'Ativo');
            const url = getValueWithAliases(item, ['url', 'URL', 'imagem', 'image_url'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO game_assets (id, game_type, name, url, created_at) VALUES (?, ?, ?, ?, ?)",
              [recordId, game_type, name, url, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Game Asset "${name}"`]);

          } else if (importTarget === 'game_configs') {
            const type = getValueWithAliases(item, ['type', 'tipo'], 'game_configs');
            const configRaw = getValueWithAliases(item, ['config', 'Config', 'dados'], '{}');
            const config = typeof configRaw === 'string' ? configRaw : JSON.stringify(configRaw);
            const updated_at = getValueWithAliases(item, ['updated_at', 'updatedAt'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO game_configs (id, type, config, updated_at) VALUES (?, ?, ?, ?)",
              [recordId, type, config, updated_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Configuração de Jogos "${type}"`]);

          } else if (importTarget === 'messages') {
            const sender_id = getValueWithAliases(item, ['sender_id', 'senderId', 'usuario_id', 'id_usuario'], 'anon');
            const sender_name = getValueWithAliases(item, ['sender_name', 'senderName', 'nome', 'autor'], 'Desbravador');
            const sender_photo = getValueWithAliases(item, ['sender_photo', 'senderPhoto', 'foto', 'avatar'], '');
            const text = getValueWithAliases(item, ['text', 'Text', 'mensagem', 'conteudo'], '');
            const unit = getValueWithAliases(item, ['unit', 'Unit', 'unidade'], '');
            const target = getValueWithAliases(item, ['target', 'Target', 'destino', 'alvo'], 'all');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt', 'timestamp'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO messages (id, sender_id, sender_name, sender_photo, text, unit, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [recordId, sender_id, sender_name, sender_photo, text, unit, target, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Mensagem de "${sender_name}"`]);

          } else if (importTarget === 'puzzle_images') {
            const title = getValueWithAliases(item, ['title', 'Title', 'titulo', 'Titulo', 'nome'], 'Quebra-Cabeça');
            const url = getValueWithAliases(item, ['url', 'URL', 'imagem', 'image_url'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO puzzle_images (id, title, url, created_at) VALUES (?, ?, ?, ?)",
              [recordId, title, url, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Imagem Quebra-Cabeça "${title}"`]);

          } else if (importTarget === 'scrambled_verses') {
            const title = getValueWithAliases(item, ['title', 'Title', 'titulo', 'Titulo'], 'Versículo');
            const reference = getValueWithAliases(item, ['reference', 'Reference', 'referencia', 'passagem'], '');
            const text = getValueWithAliases(item, ['text', 'Text', 'texto', 'versiculo'], '');
            const scheduled_for = getValueWithAliases(item, ['scheduled_for', 'scheduledFor', 'data'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO scrambled_verses (id, title, reference, text, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              [recordId, title, reference, text, scheduled_for, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Versículo "${title}" (${reference})`]);

          } else if (importTarget === 'three_clues_questions') {
            const category = getValueWithAliases(item, ['category', 'Category', 'categoria'], 'Bíblia');
            const answer = getValueWithAliases(item, ['answer', 'Answer', 'resposta', 'personagem'], '');
            const clue1 = getValueWithAliases(item, ['clue1', 'Clue1', 'pista1', 'dica1'], '');
            const clue2 = getValueWithAliases(item, ['clue2', 'Clue2', 'pista2', 'dica2'], '');
            const clue3 = getValueWithAliases(item, ['clue3', 'Clue3', 'pista3', 'dica3'], '');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt'], new Date().toISOString());

            await runD1Query(
              "INSERT OR REPLACE INTO three_clues_questions (id, category, answer, clue1, clue2, clue3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [recordId, category, answer, clue1, clue2, clue3, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: 3 Pistas "${answer}"`]);

          } else if (importTarget === 'who_am_i_questions') {
            const character = getValueWithAliases(item, ['character', 'Character', 'personagem', 'nome', 'answer'], '');
            const cluesRaw = getValueWithAliases(item, ['clues', 'Clues', 'pistas', 'dicas'], '[]');
            const tip = getValueWithAliases(item, ['tip', 'Tip', 'dica'], '');
            const category = getValueWithAliases(item, ['category', 'Category', 'categoria'], 'Bíblia');
            const created_at = getValueWithAliases(item, ['created_at', 'createdAt'], new Date().toISOString());
            const clues = typeof cluesRaw === 'string' ? cluesRaw : JSON.stringify(cluesRaw);

            await runD1Query(
              "INSERT OR REPLACE INTO who_am_i_questions (id, character, clues, tip, category, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              [recordId, character, clues, tip, category, created_at]
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo no Cloudflare D1: Quem Sou Eu "${character}"`]);

          } else {
            // Tabela personalizada no Cloudflare D1
            const targetTable = (customTableName || importTarget).trim();
            const colKeys = Object.keys(item).filter(k => k && k.trim());
            if (colKeys.length === 0) throw new Error("Linha sem colunas válidas.");

            const placeholders = colKeys.map(() => '?').join(', ');
            const values = colKeys.map(k => {
              const val = item[k];
              if (typeof val === 'object' && val !== null) return JSON.stringify(val);
              return val !== undefined ? val : null;
            });

            await runD1Query(
              `INSERT OR REPLACE INTO ${targetTable} (${colKeys.join(', ')}) VALUES (${placeholders})`,
              values
            );

            successCount++;
            setImportProgress(p => ({ ...p, success: successCount }));
            setImportLogs(prev => [...prev, `✅ [${currentNum}/${total}] Salvo na tabela "${targetTable}" com sucesso!`]);
          }

        } catch (itemErr: any) {
          errorCount++;
          setImportProgress(p => ({ ...p, error: errorCount }));
          setImportLogs(prev => [...prev, `❌ [${currentNum}/${total}] Falha no registro: "${item.name || item.title || item.Nome || 'Sem Nome'}". Motivo: ${itemErr.message || JSON.stringify(itemErr)}`]);
        }
      }

      setImportLogs(prev => [...prev, `\n🏁 Processamento concluído! SUCESSOS: ${successCount} | FALHAS: ${errorCount}`]);
      alert(`Importação para o Cloudflare D1 Concluída!\nSucessos: ${successCount}\nFalhas: ${errorCount}`);

    } catch (err: any) {
      alert(`Erro na Importação: ${err.message}`);
      setImportLogs(prev => [...prev, `🚨 ERRO GERAL: ${err.message}`]);
    } finally {
      setIsImporting(false);
    }
  };

  const navRef = useHorizontalScroll<HTMLElement>();

  const navTabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'games', label: 'Jogos & Dinâmicas', icon: Gamepad2 },
    { id: 'club', label: 'Clube & Membros', icon: Users },
    { id: 'database', label: 'Banco & D1', icon: Database },
    { id: 'import', label: 'Importar Planilhas', icon: FileSpreadsheet },
    ...(isMasterAdmin ? [{ id: 'master' as AdminTab, label: 'Zona Master', icon: ShieldAlert }] : [])
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} overflow-y-auto`}>
      {/* HEADER FIXO SUPERIOR DA ADMINISTRAÇÃO */}
      <header className={`sticky top-0 z-30 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md border-b px-4 sm:px-8 py-3.5 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Voltar ao Perfil"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Painel de Administração
                </h1>
                {isMasterAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    Master
                  </span>
                )}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sentinelas da Verdade • Gestão Unificada
              </p>
            </div>
          </div>

          {/* NAVEGAÇÃO POR ABAS COM SUPORTE A ROLAGEM PELA RODA DO MOUSE (PC) */}
          <nav
            ref={navRef}
            style={{ overscrollBehavior: 'contain' }}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar select-none"
            title="Dica: Use a roda do mouse para rolar horizontalmente"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30'
                      : isDarkMode
                      ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DA ABA SELECIONADA */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 pb-32">
        {activeTab === 'games' && (
          <AdminGamesTab
            onGoToAdminQuiz={onGoToAdminQuiz}
            onGoToAdminSpecialty={onGoToAdminSpecialty}
            onGoToAdminThreeClues={onGoToAdminThreeClues}
            onGoToAdminSpecialtyStudy={onGoToAdminSpecialtyStudy}
            onGoToAdminPuzzle={onGoToAdminPuzzle}
            onGoToAdminScrambledVerse={onGoToAdminScrambledVerse}
            onGoToAdminNatureId={onGoToAdminNatureId}
            onGoToAdminFirstAid={onGoToAdminFirstAid}
            onGoToAdminSpecialtyTrail={onGoToAdminSpecialtyTrail}
            quizOverride={quizOverride}
            onToggleQuizOverride={onToggleQuizOverride}
            quizAllowedDay={quizAllowedDay}
            onSetQuizAllowedDay={onSetQuizAllowedDay}
            memoryOverride={memoryOverride}
            onToggleMemoryOverride={onToggleMemoryOverride}
            memoryAllowedDay={memoryAllowedDay}
            onSetMemoryAllowedDay={onSetMemoryAllowedDay}
            specialtyOverride={specialtyOverride}
            onToggleSpecialtyOverride={onToggleSpecialtyOverride}
            specialtyAllowedDay={specialtyAllowedDay}
            onSetSpecialtyAllowedDay={onSetSpecialtyAllowedDay}
            threeCluesOverride={threeCluesOverride}
            onToggleThreeCluesOverride={onToggleThreeCluesOverride}
            threeCluesAllowedDay={threeCluesAllowedDay}
            onSetThreeCluesAllowedDay={onSetThreeCluesAllowedDay}
            puzzleOverride={puzzleOverride}
            onTogglePuzzleOverride={onTogglePuzzleOverride}
            puzzleAllowedDay={puzzleAllowedDay}
            onSetPuzzleAllowedDay={onSetPuzzleAllowedDay}
            knotsOverride={knotsOverride}
            onToggleKnotsOverride={onToggleKnotsOverride}
            knotsAllowedDay={knotsAllowedDay}
            onSetKnotsAllowedDay={onSetKnotsAllowedDay}
            specialtyTrailOverride={specialtyTrailOverride}
            onToggleSpecialtyTrailOverride={onToggleSpecialtyTrailOverride}
            specialtyTrailAllowedDay={specialtyTrailAllowedDay}
            onSetSpecialtyTrailAllowedDay={onSetSpecialtyTrailAllowedDay}
            scrambledVerseOverride={scrambledVerseOverride}
            onToggleScrambledVerseOverride={onToggleScrambledVerseOverride}
            scrambledVerseAllowedDay={scrambledVerseAllowedDay}
            onSetScrambledVerseAllowedDay={onSetScrambledVerseAllowedDay}
            natureIdOverride={natureIdOverride}
            onToggleNatureIdOverride={onToggleNatureIdOverride}
            natureIdAllowedDay={natureIdAllowedDay}
            onSetNatureIdAllowedDay={onSetNatureIdAllowedDay}
            firstAidOverride={firstAidOverride}
            onToggleFirstAidOverride={onToggleFirstAidOverride}
            firstAidAllowedDay={firstAidAllowedDay}
            onSetFirstAidAllowedDay={onSetFirstAidAllowedDay}
            mahjongOverride={mahjongOverride}
            onToggleMahjongOverride={onToggleMahjongOverride}
            mahjongAllowedDay={mahjongAllowedDay}
            onSetMahjongAllowedDay={onSetMahjongAllowedDay}
            brickBreakerOverride={brickBreakerOverride}
            onToggleBrickBreakerOverride={onToggleBrickBreakerOverride}
            brickBreakerAllowedDay={brickBreakerAllowedDay}
            onSetBrickBreakerAllowedDay={onSetBrickBreakerAllowedDay}
            specialtyStudyOverride={specialtyStudyOverride}
            onToggleSpecialtyStudyOverride={onToggleSpecialtyStudyOverride}
            specialtyStudyAllowedDay={specialtyStudyAllowedDay}
            onSetSpecialtyStudyAllowedDay={onSetSpecialtyStudyAllowedDay}
            onOpenAssetsModal={() => { loadAssets(); setShowAssetsModal(true); }}
            onSeedAllData={handleSeedAllData}
            isSeeding={isSeeding}
            onFixGameStatus={handleFixGameStatus}
            isProcessing={isProcessing}
            fixProgress={fixProgress}
            onProcessMonthlyAwards={onProcessMonthlyAwards}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'club' && (
          <AdminClubTab
            members={members}
            counselors={counselors}
            devotionalsCount={allDevotionals.length}
            onGoToAdminAvisos={onGoToAdminAvisos}
            onProcessMonthlyAwards={onProcessMonthlyAwards}
            onOpenCounselorModal={() => { setEditCounselor(null); setNewCounselorName(''); setShowCounselorModal(true); }}
            onOpenDevotionalModal={() => { setShowDevotionalList(false); setShowDevotionalModal(true); }}
            onInspectMember={(member) => setInspectingMember(member)}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'database' && (
          <AdminDatabaseTab
            cfWorkerUrl={cfWorkerUrl}
            onSaveCfUrl={handleSaveCfUrl}
            onTestCf={handleTestCf}
            isTestingCf={isTestingCf}
            cfTestStatus={cfTestStatus}
            onRunDiagnostic={runDiagnostic}
            isDiagnosticRunning={isDiagnosticRunning}
            diagnosticResults={diagnosticResults}
            onCreateAllTables={handleCreateAllTables}
            isCreatingAllTables={isCreatingAllTables}
            onSeedInitialDataToD1={handleSeedInitialDataToD1}
            isSeedingD1={isSeedingD1}
            d1SeedResult={d1SeedResult}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'import' && (
          <AdminImportTab
            importTarget={importTarget}
            setImportTarget={setImportTarget}
            importFormat={importFormat}
            setImportFormat={setImportFormat}
            rawImportText={rawImportText}
            setRawImportText={setRawImportText}
            isImporting={isImporting}
            importProgress={importProgress}
            importLogs={importLogs}
            isDragActive={isDragActive}
            setIsDragActive={setIsDragActive}
            onFileDrop={handleFileDrop}
            onFileChange={handleFileChange}
            onCopyTemplate={handleCopyTemplate}
            onLoadTemplateIntoEditor={handleLoadTemplateIntoEditor}
            onImportData={handleImportData}
            templateCopied={templateCopied}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'master' && isMasterAdmin && (
          <AdminMasterTab
            isResetting={isResetting}
            onResetClick={handleResetClick}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

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
                counselors.map((c, cIdx) => (
                  <div key={`modal-counselor-${c.id || c.name || cIdx}-${cIdx}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-2xl p-4 flex items-center justify-between group`}>
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
              <button onClick={() => { setShowDevotionalModal(false); handleCancelEditDevotional(); }} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className={`flex p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xl shrink-0`}>
              <button 
                onClick={() => setShowDevotionalList(false)}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!showDevotionalList ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white text-emerald-600 shadow-sm') : 'text-slate-400'}`}
              >
                {editingDevotional ? 'Editar Devocional' : 'Novo Devocional'}
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

                  {editingDevotional ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSaveDevotional}
                        disabled={isSavingDevotional}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSavingDevotional ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                        SALVAR ALTERAÇÕES
                      </button>
                      <button 
                        onClick={handleCancelEditDevotional}
                        className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all"
                      >
                        <X size={24} />
                        CANCELAR
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSaveDevotional}
                      disabled={isSavingDevotional}
                      className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-md uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSavingDevotional ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                      AGENDAR DEVOCIONAL
                    </button>
                  )}
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
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditDevotional(dev)}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Editar devocional"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDevotional(dev.id!)}
                            className="p-2 text-red-300 hover:text-red-500 transition-colors"
                            title="Excluir devocional"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                gameAssets.map((asset, aIdx) => (
                  <div key={`asset-${asset.id || aIdx}-${aIdx}`} className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} border rounded-3xl p-5 space-y-4`}>
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
                      <div key={`raw-score-${score.id || idx}-${idx}`} className={`p-3 rounded-2xl border text-[10px] ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
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
                          {Object.entries(score).map(([key, val], eIdx) => (
                            <div key={`score-val-${key}-${eIdx}`} className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
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
