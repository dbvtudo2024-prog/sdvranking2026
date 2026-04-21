
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthUser, UserRole, UnitName, Member, Announcement, ChatMessage, Challenge1x1, CounselorDB, GameConfig, BadgeLevel, UserBadge, UserStats } from '@/types';
import { DatabaseService } from '@/db';
import { calculateMonthlyGamesTotal } from '@/helpers/scoreHelpers';
import { APP_VERSION } from '@/constants';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Units from '@/pages/Units';
import Bible, { BibleHandle } from '@/pages/Bible';
import BibleReading from '@/pages/BibleReading';
import Devotional from '@/pages/Devotional';
import UnitDetail from '@/pages/UnitDetail';
import Ranking from '@/pages/Ranking';
import Profile from '@/pages/Profile';
import AdminAnnouncements from '@/pages/AdminAnnouncements';
import AdminQuizEditor from '@/pages/AdminQuizEditor';
import AdminSpecialtyEditor from '@/pages/AdminSpecialtyEditor';
import AdminThreeCluesEditor from '@/pages/AdminThreeCluesEditor';
import AdminSpecialtyStudyEditor from '@/pages/AdminSpecialtyStudyEditor';
import AdminPuzzleEditor from '@/pages/AdminPuzzleEditor';
import AdminScrambledVerseEditor from '@/pages/AdminScrambledVerseEditor';
import Birthdays, { BirthdaysRef } from '@/pages/Birthdays';
import SpecialtyStudyArea, { SpecialtyStudyHandle } from '@/pages/SpecialtyStudyArea';
import AdminManagement from '@/pages/AdminManagement';
import Games from '@/pages/Games';
import Chat from '@/pages/Chat';
import Badges from '@/pages/Badges';
import AppNavbar from '@/components/AppNavbar';
import TickerBanner from '@/components/TickerBanner';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { ArrowLeft, Bell, X, Sword, Moon, Sun, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sentinelas_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('sentinelas_dark_mode') === 'true';
  });
  
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [counselorsData, setCounselorsData] = useState<CounselorDB[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'units' | 'ranking' | 'profile' | 'games' | 'badges' | 'unit_detail' | 'register' | 'admin_announcements' | 'admin_quiz' | 'admin_specialty' | 'admin_three_clues' | 'admin_specialty_study' | 'admin_puzzle' | 'admin_scrambled_verse' | 'specialty_study' | 'admin_management' | 'chat' | 'bible_reading' | 'bible' | 'devotional' | 'birthdays'>('home');
  const [adminQuizCategory, setAdminQuizCategory] = useState<'Todas' | 'Desbravadores' | 'Bíblia' | 'Natureza' | 'Primeiros Socorros' | 'Especialidades'>('Todas');
  const [selectedUnit, setSelectedUnit] = useState<UnitName | null>(null);
  const bibleRef = useRef<BibleHandle>(null);
  const specialtyStudyRef = useRef<SpecialtyStudyHandle>(null);
  const birthdaysRef = useRef<BirthdaysRef>(null);
  
  const [isGameActive, setIsGameActive] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSpecialtyName, setActiveSpecialtyName] = useState<string | null>(null);
  const [activeSpecialtyImage, setActiveSpecialtyImage] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<ChatMessage | null>(null);
  const [challengeNotification, setChallengeNotification] = useState<Challenge1x1 | null>(null);
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  const LOGO_APP = "https://lhcobtexredrovjbxaew.supabase.co/storage/v1/object/public/Imagens/app/brasao3d.PNG";
  const BRASAO_3D = "https://lhcobtexredrovjbxaew.supabase.co/storage/v1/object/public/Imagens/app/brasao3d.PNG";

  const [quizOverride, setQuizOverride] = useState(false);
  const [memoryOverride, setMemoryOverride] = useState(false);
  const [specialtyOverride, setSpecialtyOverride] = useState(false);
  const [threeCluesOverride, setThreeCluesOverride] = useState(false);
  const [puzzleOverride, setPuzzleOverride] = useState(false);
  const [knotsOverride, setKnotsOverride] = useState(false);
  const [specialtyTrailOverride, setSpecialtyTrailOverride] = useState(false);
  const [scrambledVerseOverride, setScrambledVerseOverride] = useState(false);
  const [natureIdOverride, setNatureIdOverride] = useState(false);
  const [firstAidOverride, setFirstAidOverride] = useState(false);

  useEffect(() => {
    setIsGameActive(false);
  }, [currentPage]);

  useEffect(() => {
    // Remove o splash screen do HTML após o React carregar
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('splash-hidden');
      // Remove do DOM após a transição de fade
      setTimeout(() => {
        splash.remove();
      }, 500);
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sentinelas_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const savedVersion = localStorage.getItem('sentinelas_version');
    if (savedVersion && savedVersion !== APP_VERSION) {
      setShowUpdateNotice(true);
    }
    localStorage.setItem('sentinelas_version', APP_VERSION);
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      console.log("Current orientation:", window.screen?.orientation?.type || "unknown");
    };
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    return () => window.removeEventListener('orientationchange', checkOrientation);
  }, []);

  useEffect(() => {
    const unlockOrientation = async () => {
      try {
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          await window.screen.orientation.unlock();
          console.log("Orientation unlocked in App.tsx");
        }
      } catch (err) {
        console.log("Failed to unlock orientation in App.tsx:", err);
      }
    };
    unlockOrientation();
  }, []);

  useEffect(() => {
    console.log("[App] useEffect de assinaturas disparado. User:", user?.id);
    if (!user) {
      console.log("[App] Nenhum usuário logado. Limpando membros.");
      setMembers([]);
      return;
    }

    console.log("[App] Iniciando DatabaseService.subscribeGlobalData...");
    const globalSub = DatabaseService.subscribeGlobalData({
      onAnnouncements: (data) => {
        console.log("[App] Avisos recebidos:", data.length);
        setAnnouncements(data);
      },
      onCounselors: (data) => {
        console.log("[App] Conselheiros recebidos:", data.length);
        setCounselorsData(data);
      },
      onGameConfigs: (config: GameConfig) => {
        console.log("[App] Configs de jogo recebidas");
        setQuizOverride(config.quiz_override);
        setMemoryOverride(config.memory_override);
        setSpecialtyOverride(config.specialty_override);
        setThreeCluesOverride(config.three_clues_override);
        setPuzzleOverride(config.puzzle_override);
        setKnotsOverride(config.knots_override);
        setSpecialtyTrailOverride(config.specialty_trail_override);
        setScrambledVerseOverride(config.scrambled_verse_override);
        setNatureIdOverride(config.nature_id_override);
        setFirstAidOverride(config.first_aid_override);
      },
      onMembers: (data) => {
        console.log("[App] Membros recebidos:", data.length);
        setMembers(data);
      },
      onChallenges: (challenge) => {
        console.log("[App] Novo desafio recebido!");
        if (String(challenge.challengedId) === String(user.id) && challenge.status === 'pending') {
          setChallengeNotification(challenge);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }
    });

    return () => {
      globalSub.unsubscribe();
    };
  }, [user?.id]);

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // LÓGICA DE NOTIFICAÇÃO SUPER RESILIENTE
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (msg: ChatMessage) => {
      console.log("Chegou mensagem no Realtime:", msg);
      
      // Se eu sou o autor, ignora
      if (String(msg.sender_id) === String(user.id)) return;

      // Se estou na tela de chat, não mostra banner, apenas zera
      if (currentPageRef.current === 'chat') {
        setUnreadCount(0);
        return;
      }

      // Verifica se a mensagem é relevante para mim (já filtrado pelo Supabase, mas por segurança)
      const isRelevant = msg.unit === 'Geral' || msg.unit === user.unit || !user.unit;

      if (isRelevant) {
        setUnreadCount(prev => prev + 1);
        setLastNotification(msg);
        
        // vibração se suportado
        if (navigator.vibrate) navigator.vibrate(200);

        // Remove o banner após 10 segundos
        setTimeout(() => setLastNotification(null), 10000);
      }
    };

    // Subscreve apenas ao 'Geral' e à unidade do usuário (se houver)
    const subGeral = DatabaseService.subscribeMessages('Geral', handleNewMessage);
    let subUnit: any = null;
    
    if (user.unit && user.unit !== 'Geral') {
      subUnit = DatabaseService.subscribeMessages(user.unit, handleNewMessage);
    }

    return () => {
      subGeral.unsubscribe();
      if (subUnit) subUnit.unsubscribe();
    };
  }, [user?.id, user?.unit]); // Removido currentPage para evitar churn de conexões

  useEffect(() => {
    if (currentPage === 'chat') {
      setUnreadCount(0);
      setLastNotification(null);
    }
  }, [currentPage]);

  const handleAddMember = useCallback(async (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
    try { await DatabaseService.addMember(newMember); } catch (e) { console.error(e); }
  }, []);

  const handleUpdateMember = useCallback(async (updatedMember: Member) => {
    setMembers(prev => prev.map(m => String(m.id) === String(updatedMember.id) ? updatedMember : m));
    try { await DatabaseService.updateMember(updatedMember); } catch (e) { console.error(e); }
  }, []);

  const handleAwardBadge = useCallback(async (badgeId: string, level: BadgeLevel = BadgeLevel.BRONZE) => {
    if (!user) return;
    
    // Check if user already has this badge at this level or higher
    const currentBadges = user.badges || [];
    const existingBadge = currentBadges.find(b => b.badgeId === badgeId);
    
    // Level hierarchy for comparison
    const levels = [BadgeLevel.BRONZE, BadgeLevel.SILVER, BadgeLevel.GOLD, BadgeLevel.DIAMOND];
    const currentLevelIdx = existingBadge ? levels.indexOf(existingBadge.level) : -1;
    const newLevelIdx = levels.indexOf(level);

    if (existingBadge && currentLevelIdx >= newLevelIdx) return;

    const newBadge: UserBadge = {
      badgeId,
      level,
      awardedAt: new Date().toISOString()
    };

    const updatedBadges = existingBadge 
      ? currentBadges.map(b => b.badgeId === badgeId ? newBadge : b)
      : [...currentBadges, newBadge];

    const updatedUser = { ...user, badges: updatedBadges };
    setUser(updatedUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(updatedUser));

    const member = members.find(m => String(m.id) === String(user.id));
    if (member) {
      const updatedMember = { ...member, badges: updatedBadges };
      handleUpdateMember(updatedMember);
    }
  }, [user, members, handleUpdateMember]);

  const handleUpdateStats = useCallback(async (statsUpdate: Partial<UserStats>) => {
    if (!user) return;
    
    const currentStats = user.stats || {
      totalMessages: 0,
      totalLogins: 0,
      totalQuizzes: 0,
      totalVerses: 0,
      totalGames: 0,
      totalDevotionals: 0
    };

    const newStats: UserStats = {
      totalMessages: (currentStats.totalMessages || 0) + (statsUpdate.totalMessages || 0),
      totalLogins: (currentStats.totalLogins || 0) + (statsUpdate.totalLogins || 0),
      totalQuizzes: (currentStats.totalQuizzes || 0) + (statsUpdate.totalQuizzes || 0),
      totalVerses: (currentStats.totalVerses || 0) + (statsUpdate.totalVerses || 0),
      totalGames: (currentStats.totalGames || 0) + (statsUpdate.totalGames || 0),
      totalDevotionals: (currentStats.totalDevotionals || 0) + (statsUpdate.totalDevotionals || 0),
      lastCheckInDate: statsUpdate.lastCheckInDate !== undefined ? statsUpdate.lastCheckInDate : currentStats.lastCheckInDate,
      checkInStreak: statsUpdate.checkInStreak !== undefined ? statsUpdate.checkInStreak : currentStats.checkInStreak,
      lastMonthlyAwarded: statsUpdate.lastMonthlyAwarded !== undefined ? statsUpdate.lastMonthlyAwarded : currentStats.lastMonthlyAwarded
    };

    // AWARD STATS-BASED BADGES
    if (newStats.totalDevotionals) {
      if (newStats.totalDevotionals >= 30) handleAwardBadge('estudioso_medal', BadgeLevel.GOLD);
      else if (newStats.totalDevotionals >= 15) handleAwardBadge('estudioso_medal', BadgeLevel.SILVER);
      else if (newStats.totalDevotionals >= 5) handleAwardBadge('estudioso_medal', BadgeLevel.BRONZE);
    }

    if (newStats.totalVerses) {
      if (newStats.totalVerses >= 30) handleAwardBadge('conquistador_biblico', BadgeLevel.GOLD);
      else if (newStats.totalVerses >= 15) handleAwardBadge('conquistador_biblico', BadgeLevel.SILVER);
      else if (newStats.totalVerses >= 5) handleAwardBadge('conquistador_biblico', BadgeLevel.BRONZE);
    }

    const updatedUser = { ...user, stats: newStats };
    setUser(updatedUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(updatedUser));

    const member = members.find(m => String(m.id) === String(user.id));
    if (member) {
      const updatedMember = { ...member, stats: newStats };
      handleUpdateMember(updatedMember);
    }
  }, [user, members, handleUpdateMember]);

  const handleDeleteMember = useCallback(async (id: string | number) => {
    setMembers(prev => prev.filter(m => String(m.id) !== String(id)));
    try { await DatabaseService.deleteMember(String(id)); } catch (e) { console.error(e); }
  }, []);

  const handleAddAnnouncement = useCallback(async (ann: Announcement) => {
    setAnnouncements(prev => [ann, ...prev]);
    try { await DatabaseService.addAnnouncement(ann); } catch (e) { console.error(e); }
  }, []);

  const handleDeleteAnnouncement = useCallback(async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try { await DatabaseService.deleteAnnouncement(id); } catch (e) { console.error(e); }
  }, []);

  const handleLogin = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(authUser));
    setCurrentPage('home');
  }, []);

  const handleStudyStateChange = useCallback((name: string | null, img: string | null) => {
    setActiveSpecialtyName(name);
    setActiveSpecialtyImage(img);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sentinelas_user');
    setCurrentPage('home');
    setSelectedUnit(null);
  }, []);

  const handleUpdateUser = useCallback(async (updatedUser: AuthUser, updatedMember?: Member) => {
    setUser(updatedUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(updatedUser));
    await DatabaseService.addUser(updatedUser);
    if (updatedMember) handleUpdateMember(updatedMember);
  }, [handleUpdateMember]);

  const handleResetRanking = useCallback(async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid') => {
    const updatedMembers = members.map(m => {
      const newScores = (m.scores || []).map(s => {
        const news = { ...s };
        if (type === 'members') {
          news.punctuality = 0; news.uniform = 0; news.material = 0; news.bible = 0;
          news.voluntariness = 0; news.activities = 0; news.treasury = 0;
        } else if (type === 'quiz') news.quiz = 0;
        else if (type === 'memory') news.memoryGame = 0;
        else if (type === 'specialty') news.specialtyGame = 0;
        else if (type === '1x1') news.challenge1x1 = 0;
        else if (type === 'threeclues') news.threeCluesGame = 0;
        else if (type === 'puzzle') news.puzzleGame = 0;
        else if (type === 'knots') news.knotsGame = 0;
        else if (type === 'specialtytrail') news.specialtyTrailGame = 0;
        else if (type === 'scrambledverse') news.scrambledVerseGame = 0;
        else if (type === 'natureid') news.natureIdGame = 0;
        else if (type === 'firstaid') news.firstAidGame = 0;
        return news;
      });
      return { ...m, scores: newScores };
    });
    setMembers(updatedMembers);
    try {
      await DatabaseService.updateMembers(updatedMembers);
    } catch (e) {
      console.error("Erro ao resetar ranking:", e);
    }
  }, [members]);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Sentinelas da Verdade';
      case 'units': return 'Unidades do Clube';
      case 'bible': return 'Bíblia Sagrada';
      case 'bible_reading': return 'Plano de Leitura';
      case 'ranking': return 'Ranking Geral';
      case 'birthdays': return 'Aniversariantes';
      case 'profile': return 'Meu Perfil';
      case 'games': return 'Central de Jogos';
      case 'chat': return 'Chat do Clube';
      case 'badges': return 'Minhas Insígnias';
      case 'unit_detail': return selectedUnit ? `Unidade ${selectedUnit}` : 'Detalhes';
      case 'admin_announcements': return 'Mural de Avisos';
      case 'admin_quiz': return 'Editor de Quiz';
      case 'admin_specialty': return 'Editor de Especialidades';
      case 'admin_three_clues': return 'Editor de 3 Dicas';
      case 'admin_specialty_study': return 'Editor de Estudo';
      case 'admin_puzzle': return 'Editor de Quebra-Cabeça';
      case 'admin_scrambled_verse': return 'Editor de Versículo';
      case 'specialty_study': return 'Estudo de Especialidades';
      case 'admin_management': return 'Gestão Administrativa';
      case 'devotional': return 'Devocional Diário';
      default: return 'Sentinelas da Verdade';
    }
  };

  const handleBack = () => {
    if (currentPage === 'unit_detail') setCurrentPage('units');
    else if (currentPage === 'bible') {
      const handled = bibleRef.current?.goBack();
      if (!handled) setCurrentPage('home');
    }
    else if (currentPage === 'specialty_study') {
      const handled = specialtyStudyRef.current?.goBack();
      if (!handled) setCurrentPage('home');
    }
    else if (currentPage === 'bible_reading') setCurrentPage('bible');
    else if (currentPage === 'devotional') setCurrentPage('bible');
    else if (currentPage === 'birthdays') {
      const handled = birthdaysRef.current?.goBack();
      if (!handled) setCurrentPage('home');
    }
    else if (currentPage === 'admin_management') setCurrentPage('profile');
    else if (['admin_announcements', 'admin_quiz', 'admin_specialty', 'admin_three_clues', 'admin_specialty_study', 'admin_puzzle', 'admin_scrambled_verse'].includes(currentPage)) setCurrentPage('admin_management');
    else if (currentPage !== 'home') setCurrentPage('home');
  };

  // LÓGICA PARA EVITAR FECHAR O APP NO BOTÃO VOLTAR DO CELULAR
  useEffect(() => {
    // Sempre que a página mudar, adicionamos um estado no histórico
    window.history.pushState({ page: currentPage }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (currentPage === 'home') {
        // Se estiver na home e tentar voltar, não faz nada ou deixa o navegador agir
        // Mas para evitar fechar acidentalmente, podemos empurrar o estado de volta
        window.history.pushState({ page: 'home' }, '');
      } else {
        handleBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  const lastProcessedRef = useRef<string>('');

  const processSpecialtyAwards = useCallback(async (currentMembers: Member[], updates: { [id: string]: Member }) => {
    if (!user) return;
    
    currentMembers.forEach(m => {
      const completedCount = (m.scores || []).filter(s => s.specialtyStudyScore !== undefined && s.specialtyStudyScore >= 10).length;
      if (completedCount < 10) return;

      const levels = [
        { threshold: 10, level: BadgeLevel.BRONZE },
        { threshold: 25, level: BadgeLevel.SILVER },
        { threshold: 50, level: BadgeLevel.GOLD },
        { threshold: 75, level: BadgeLevel.DIAMOND },
        { threshold: 100, level: BadgeLevel.MASTER }
      ];

      const currentMemberData = updates[String(m.id)] || m;
      let currentBadges = [...(currentMemberData.badges || [])];
      let hasChanges = false;

      levels.forEach(l => {
        if (completedCount >= l.threshold) {
          const badgeId = `specialty_master_${l.threshold}`;
          if (!currentBadges.some(b => b.badgeId === badgeId)) {
            currentBadges.push({
              badgeId,
              level: l.level,
              awardedAt: new Date().toISOString(),
              points: completedCount,
              monthLabel: 'Especialidades'
            });
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        updates[String(m.id)] = { ...currentMemberData, badges: currentBadges };
        if (user && (String(m.id) === String(user.id) || m.name === user.name)) {
          setUser(prev => {
            if (!prev) return null;
            // Merge existing badges with new ones
            const newBadges = currentBadges.filter(cb => !(prev.badges || []).some(pb => pb.badgeId === cb.badgeId));
            if (newBadges.length === 0) return prev;
            const updated = { ...prev, badges: [...(prev.badges || []), ...newBadges] };
            localStorage.setItem('sentinelas_user', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });
  }, [user]);

  const isProcessingAwards = useRef(false);
  const processAutomatedAwards = useCallback(async () => {
    if (!user || isProcessingAwards.current) return;
    if (!members || members.length === 0) return;

    // Hash mais sensível: agora considera a soma total de pontos para detectar mudanças nos placares
    const totalBadges = members.reduce((acc, m) => acc + (m.badges?.length || 0), 0);
    const totalScores = members.reduce((acc, m) => acc + (m.scores?.length || 0), 0);
    const totalPoints = members.reduce((acc, m) => acc + (m.scores?.reduce((sacc, s) => sacc + (s.points || 0), 0) || 0), 0);
    const stateHash = `v7-${members.length}-${totalBadges}-${totalScores}-${totalPoints}`;
    
    if (lastProcessedRef.current === stateHash) return;
    lastProcessedRef.current = stateHash;

    console.log(`[Awards] Processando medalhas automaticamente (${stateHash})...`);
    isProcessingAwards.current = true;
    
    try {
      const { calculateMonthlyGamesTotal } = await import('@/helpers/scoreHelpers');
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const monthsSet = new Set<string>();
      members.forEach(m => {
        (m.scores || []).forEach(s => {
          if (!s.date) return;
          let mStr = '';
          
          if (s.date.includes('-')) {
            const parts = s.date.split('-');
            if (parts.length >= 2) {
              if (parts[0].length === 4) mStr = `${parts[0]}-${parts[1].padStart(2, '0')}`;
              else if (parts[2]?.length === 4) mStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
            }
          } else if (s.date.includes('/')) {
            const parts = s.date.split('/');
            if (parts.length === 3) mStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
            else if (parts.length === 2) {
              const year = parts[1].length === 4 ? parts[1] : parts[0].length === 4 ? parts[0] : '';
              const month = parts[1].length === 4 ? parts[0] : parts[1];
              if (year) mStr = `${year}-${month.padStart(2, '0')}`;
            }
          }
          
          if (mStr && mStr.length === 7 && mStr !== currentMonth) monthsSet.add(mStr);
        });
      });

      const pastMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
      const levels = [BadgeLevel.GOLD, BadgeLevel.SILVER, BadgeLevel.BRONZE];

      // Mapeamento dos ganhadores esperados para cada mês
      // month -> [memberIdAtPos1, memberIdAtPos2, memberIdAtPos3]
      const expectedChampionsByMonth: { [month: string]: string[] } = {};

      for (const mStr of pastMonths) {
        const sorted = [...members]
          .map(m => ({ m, score: calculateMonthlyGamesTotal(m, mStr) }))
          .filter(si => si.score > 0)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.m.name.localeCompare(b.m.name);
          })
          .slice(0, 3);
        
        expectedChampionsByMonth[mStr] = sorted.map(si => String(si.m.id));
      }

      const updatesToProcess: { [memberId: string]: Member } = {};

      // RECONCILIAÇÃO: Para cada membro, verificar se as medalhas atuais batem com as esperadas
      members.forEach(m => {
        let hasChanges = false;
        const currentBadges = m.badges || [];
        
        // 1. Remover medalhas mensais que não deveriam estar lá ou que estão na posição errada
        // E manter as outras insígnias intocadas
        let filteredBadges = currentBadges.filter(b => {
          if (!b.badgeId.startsWith('monthly_games_')) return true;
          
          // ID format: monthly_games_YYYY-MM_Pos
          const parts = b.badgeId.split('_');
          const month = parts[2];
          const pos = parseInt(parts[3]);
          
          const expectedChamps = expectedChampionsByMonth[month];
          if (!expectedChamps) return false; // Mês sem pontuação (ou atual), remove
          
          const expectedChampIdAtPos = expectedChamps[pos - 1];
          const shouldIHaveThis = expectedChampIdAtPos === String(m.id);
          
          if (!shouldIHaveThis) hasChanges = true;
          return shouldIHaveThis;
        });

        // 2. Adicionar medalhas mensais que estão faltando
        for (const month of pastMonths) {
          const expectedChamps = expectedChampionsByMonth[month];
          const myPos = expectedChamps.indexOf(String(m.id));
          
          if (myPos !== -1) {
            const pos = myPos + 1;
            const badgeId = `monthly_games_${month}_${pos}`;
            
            if (!filteredBadges.some(b => b.badgeId === badgeId)) {
              hasChanges = true;
              const [y, mm] = month.split('-');
              const monthDate = new Date(parseInt(y), parseInt(mm) - 1);
              const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' });
              const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
              const posLabel = pos === 1 ? '1º Lugar' : pos === 2 ? '2º Lugar' : '3º Lugar';
              const score = calculateMonthlyGamesTotal(m, month);

              filteredBadges.push({
                badgeId,
                level: levels[myPos],
                awardedAt: new Date().toISOString(),
                points: score,
                monthLabel: `${posLabel} - ${monthLabel} ${y}`
              });
            }
          }
        }

        // 3. Remover Duplicatas (Safety)
        const seen = new Set<string>();
        const uniqueFinalBadges = filteredBadges.filter(b => {
          if (seen.has(b.badgeId)) {
            hasChanges = true;
            return false;
          }
          seen.add(b.badgeId);
          return true;
        });

        if (hasChanges) {
          updatesToProcess[String(m.id)] = { ...m, badges: uniqueFinalBadges };
        }
      });

      // 2. Processar Mestres de Especialidades
      await processSpecialtyAwards(members, updatesToProcess);

      const entries = Object.values(updatesToProcess);
      if (entries.length > 0) {
        console.log(`[Awards] Aplicando ${entries.length} atualizações de membros...`);
        await DatabaseService.updateMembers(entries);
        
        // Sync local user state if changed
        if (user) {
          const myUpdate = entries.find(e => 
            String(e.id) === String(user.id) || 
            (e.name === user.name && e.role === user.role && e.unit === user.unit)
          );
          if (myUpdate) {
            console.log("[Awards] Sincronizando estado do usuário atual.");
            setUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, badges: myUpdate.badges };
              localStorage.setItem('sentinelas_user', JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.error("[Awards] Falha crítica no processamento:", err);
    } finally {
      isProcessingAwards.current = false;
    }
  }, [user, members, processSpecialtyAwards]);

  useEffect(() => {
    processAutomatedAwards();
  }, [members, user?.role, processAutomatedAwards]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home announcements={announcements} onNavigate={(p) => setCurrentPage(p)} isDarkMode={isDarkMode} user={user!} members={members} onAwardBadge={handleAwardBadge} onUpdateStats={handleUpdateStats} />;
      case 'units': return <Units members={members} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentPage('unit_detail'); }} onGoToBirthdays={() => setCurrentPage('birthdays')} isDarkMode={isDarkMode} />;
      case 'birthdays': return <Birthdays ref={birthdaysRef} members={members} onBack={() => setCurrentPage('home')} isDarkMode={isDarkMode} />;
      case 'bible': return <Bible ref={bibleRef} onGoToReadingPlan={() => setCurrentPage('bible_reading')} onGoToDevotional={() => setCurrentPage('devotional')} onBackToHome={() => setCurrentPage('home')} isDarkMode={isDarkMode} />;
      case 'bible_reading': return <BibleReading user={user!} onBack={() => setCurrentPage('bible')} isDarkMode={isDarkMode} />;
      case 'devotional': return <Devotional onBack={() => setCurrentPage('bible')} isDarkMode={isDarkMode} onAwardBadge={handleAwardBadge} onUpdateStats={handleUpdateStats} />;
      case 'ranking': return <Ranking members={members} isDarkMode={isDarkMode} />;
      case 'profile': return <Profile user={user!} members={members} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onGoToAdminManagement={() => setCurrentPage('admin_management')} counselorList={counselorsData.map(c => c.name)} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onGoToBadges={() => setCurrentPage('badges')} />;
      case 'games': return <Games user={user!} members={members} onUpdateMember={handleUpdateMember} onAwardBadge={handleAwardBadge} onUpdateStats={handleUpdateStats} quizOverride={quizOverride} memoryOverride={memoryOverride} specialtyOverride={specialtyOverride} threeCluesOverride={threeCluesOverride} puzzleOverride={puzzleOverride} knotsOverride={knotsOverride} specialtyTrailOverride={specialtyTrailOverride} scrambledVerseOverride={scrambledVerseOverride} natureIdOverride={natureIdOverride} firstAidOverride={firstAidOverride} isDarkMode={isDarkMode} onGameActiveChange={setIsGameActive} />;
      case 'badges': return <Badges user={user!} members={members} isDarkMode={isDarkMode} />;
      case 'chat': return <Chat user={user!} isDarkMode={isDarkMode} onAwardBadge={handleAwardBadge} onUpdateStats={handleUpdateStats} />;
      case 'unit_detail': return selectedUnit ? <UnitDetail unitName={selectedUnit} members={members} onBack={() => setCurrentPage('units')} onLogout={handleLogout} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} role={user!.role} userName={user!.name} counselorList={counselorsData.map(c => c.name)} isDarkMode={isDarkMode} /> : null;
      case 'admin_announcements': return <AdminAnnouncements announcements={announcements} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} onBack={() => setCurrentPage('admin_management')} isDarkMode={isDarkMode} />;
      case 'admin_quiz': return <AdminQuizEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} initialCategory={adminQuizCategory} />;
      case 'admin_specialty': return <AdminSpecialtyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_three_clues': return <AdminThreeCluesEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_specialty_study': return <AdminSpecialtyStudyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_puzzle': return <AdminPuzzleEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_scrambled_verse': return <AdminScrambledVerseEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'specialty_study': return <SpecialtyStudyArea ref={specialtyStudyRef} user={user!} members={members} onUpdateMember={handleUpdateMember} onAwardBadge={handleAwardBadge} onBack={() => setCurrentPage('home')} onStudyStateChange={handleStudyStateChange} isDarkMode={isDarkMode} />;
      case 'admin_management': return <AdminManagement members={members} userEmail={user!.email} onBack={() => setCurrentPage('profile')} 
      onProcessMonthlyAwards={processAutomatedAwards}
      onGoToAdminAvisos={() => setCurrentPage('admin_announcements')} 
      onGoToAdminQuiz={() => { setAdminQuizCategory('Todas'); setCurrentPage('admin_quiz'); }} 
      onGoToAdminSpecialty={() => setCurrentPage('admin_specialty')} 
      onGoToAdminThreeClues={() => setCurrentPage('admin_three_clues')} 
      onGoToAdminSpecialtyStudy={() => setCurrentPage('admin_specialty_study')} 
      onGoToAdminPuzzle={() => setCurrentPage('admin_puzzle')} 
      onGoToAdminScrambledVerse={() => setCurrentPage('admin_scrambled_verse')} 
      onGoToAdminNatureId={() => { setAdminQuizCategory('Natureza'); setCurrentPage('admin_quiz'); }}
      onGoToAdminFirstAid={() => { setAdminQuizCategory('Primeiros Socorros'); setCurrentPage('admin_quiz'); }}
      onGoToAdminSpecialtyTrail={() => { setAdminQuizCategory('Especialidades'); setCurrentPage('admin_quiz'); }}
      counselors={counselorsData} onAddCounselor={DatabaseService.addCounselor.bind(DatabaseService)} onUpdateCounselor={DatabaseService.updateCounselor.bind(DatabaseService)} onDeleteCounselor={DatabaseService.deleteCounselor.bind(DatabaseService)} onResetRanking={handleResetRanking} 
      quizOverride={quizOverride} onToggleQuizOverride={async () => { const nv = !quizOverride; setQuizOverride(nv); await DatabaseService.updateGameConfig({ quiz_override: nv }); }} 
      memoryOverride={memoryOverride} onToggleMemoryOverride={async () => { const nv = !memoryOverride; setMemoryOverride(nv); await DatabaseService.updateGameConfig({ memory_override: nv }); }} 
      specialtyOverride={specialtyOverride} onToggleSpecialtyOverride={async () => { const nv = !specialtyOverride; setSpecialtyOverride(nv); await DatabaseService.updateGameConfig({ specialty_override: nv }); }} 
      threeCluesOverride={threeCluesOverride} onToggleThreeCluesOverride={async () => { const nv = !threeCluesOverride; setThreeCluesOverride(nv); await DatabaseService.updateGameConfig({ three_clues_override: nv }); }} 
      puzzleOverride={puzzleOverride} onTogglePuzzleOverride={async () => { const nv = !puzzleOverride; setPuzzleOverride(nv); await DatabaseService.updateGameConfig({ puzzle_override: nv }); }} 
      knotsOverride={knotsOverride} onToggleKnotsOverride={async () => { const nv = !knotsOverride; setKnotsOverride(nv); await DatabaseService.updateGameConfig({ knots_override: nv }); }}
      specialtyTrailOverride={specialtyTrailOverride} onToggleSpecialtyTrailOverride={async () => { const nv = !specialtyTrailOverride; setSpecialtyTrailOverride(nv); await DatabaseService.updateGameConfig({ specialty_trail_override: nv }); }}
      scrambledVerseOverride={scrambledVerseOverride} onToggleScrambledVerseOverride={async () => { const nv = !scrambledVerseOverride; setScrambledVerseOverride(nv); await DatabaseService.updateGameConfig({ scrambled_verse_override: nv }); }}
      natureIdOverride={natureIdOverride} onToggleNatureIdOverride={async () => { const nv = !natureIdOverride; setNatureIdOverride(nv); await DatabaseService.updateGameConfig({ nature_id_override: nv }); }}
      firstAidOverride={firstAidOverride} onToggleFirstAidOverride={async () => { const nv = !firstAidOverride; setFirstAidOverride(nv); await DatabaseService.updateGameConfig({ first_aid_override: nv }); }}
      isDarkMode={isDarkMode} />;
      default: return <Home announcements={announcements} onNavigate={(p) => setCurrentPage(p)} isDarkMode={isDarkMode} user={user!} />;
    }
  };

  if (!user) {
    if (currentPage === 'register') return <Register onRegister={(u, m) => { 
      if (m) {
        setMembers(prev => [...prev, m]); 
        handleLogin(u);
      } else {
        setCurrentPage('home');
      }
    }} onBack={() => setCurrentPage('home')} counselorList={counselorsData.map(c => c.name)} />;
    return <Login onLogin={handleLogin} onGoToRegister={() => setCurrentPage('register')} />;
  }

  const isDetailPage = ['unit_detail', 'admin_announcements', 'admin_quiz', 'admin_specialty', 'admin_three_clues', 'admin_management', 'admin_specialty_study', 'admin_puzzle', 'admin_who_am_i', 'admin_scrambled_verse', 'specialty_study', 'bible_reading', 'bible', 'devotional', 'birthdays'].includes(currentPage);

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden relative ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-height: 500px) and (orientation: landscape) {
          header { height: 3.5rem !important; }
          header h1 { font-size: 0.875rem !important; }
          header p { display: none !important; }
          nav { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
          nav button { height: 2.5rem !important; }
          nav span { display: none !important; }
        }
      `}} />
      {/* BANNER DE NOTIFICAÇÃO MELHORADO */}
      {lastNotification && (
        <div 
          onClick={() => {
            if (lastNotification.sender_id === 'system_devotional') {
              setCurrentPage('devotional');
            } else {
              setCurrentPage('chat');
            }
            setLastNotification(null);
          }}
          className="fixed top-24 inset-x-4 z-[9999] bg-[#0061f2] text-white p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-4 animate-in slide-in-from-top-20 duration-500 cursor-pointer border-2 border-white/30 active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0 border-2 border-white/40 overflow-hidden shadow-inner">
             <img src={lastNotification.sender_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lastNotification.sender_id}`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">{lastNotification.sender_name}</p>
                <div className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   <span className="text-[8px] font-bold opacity-70 uppercase">Mensagem Direta</span>
                </div>
             </div>
             <p className="text-sm font-black truncate pr-4 text-white leading-tight">{lastNotification.text}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLastNotification(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
             <X size={20} />
          </button>
        </div>
      )}

      {/* NOTIFICAÇÃO DE DESAFIO 1X1 */}
      {challengeNotification && (
        <div 
          onClick={() => {
            setCurrentPage('games');
            setChallengeNotification(null);
          }}
          className="fixed top-24 inset-x-4 z-[9999] bg-amber-500 text-white p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-4 animate-in slide-in-from-top-20 duration-500 cursor-pointer border-2 border-white/30 active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0 border-2 border-white/40 flex items-center justify-center shadow-inner">
             <Sword size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-100">Arena 1x1</p>
                <div className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                   <span className="text-[8px] font-bold opacity-70 uppercase">Novo Desafio</span>
                </div>
             </div>
             <p className="text-sm font-black truncate pr-4 text-white leading-tight">
               {challengeNotification.challengerName} desafiou você!
             </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setChallengeNotification(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
             <X size={20} />
          </button>
        </div>
      )}

      {/* AVISO DE ATUALIZAÇÃO */}
      {showUpdateNotice && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-4 border-[#0061f2] flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0061f2]">
              <Bell size={40} className="animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Nova Atualização!</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Uma nova versão do app está disponível para você. Para garantir que tudo funcione perfeitamente, por favor:
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl w-full border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-xs font-black uppercase text-[#0061f2] dark:text-blue-400">Feche o app completamente e abra-o novamente.</p>
            </div>
            <button 
              onClick={() => setShowUpdateNotice(false)}
              className="w-full h-14 bg-[#0061f2] hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/25"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {currentPage !== 'home' && (
        <header className="bg-[#0061f2] text-white px-5 h-20 flex items-center justify-between shadow-xl z-50 shrink-0">
          <div className="flex items-center gap-3">
            {isDetailPage ? (
              <button onClick={handleBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90">
                <ArrowLeft size={22} strokeWidth={3} />
              </button>
            ) : (
              <img 
                src={LOGO_APP} 
                alt="Logo" 
                className="w-12 h-12 object-contain" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex flex-col">
              <h1 className="font-black uppercase tracking-tight text-base leading-tight">{getPageTitle()}</h1>
              <p className="text-[10px] font-bold uppercase opacity-80 leading-none mt-1">
                {activeSpecialtyName ? activeSpecialtyName : `${user.name} • ${user.funcao || user.role}`}
              </p>
            </div>
          </div>

          {activeSpecialtyImage && currentPage === 'specialty_study' && (
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center animate-in zoom-in duration-300">
              <img 
                src={formatImageUrl(activeSpecialtyImage)} 
                alt="Especialidade" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </header>
      )}
      
      {['chat', 'bible', 'devotional', 'specialty_study'].includes(currentPage) && <TickerBanner announcements={announcements} />}
      
      <main className="flex-1 overflow-hidden">{renderPage()}</main>

      {/* FLOATING CHAT BUTTON */}
      {user && currentPage !== 'chat' && !isGameActive && (
        <button 
          onClick={() => setCurrentPage('chat')}
          className={`fixed bottom-24 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-[90] transition-all active:scale-90 hover:scale-105 ${
            isDarkMode 
              ? 'bg-blue-500 text-white shadow-blue-500/20 active:bg-blue-600' 
              : 'bg-[#0061f2] text-white shadow-blue-600/30 active:bg-blue-700'
          }`}
        >
          <div className="relative">
            <MessageCircle size={28} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </button>
      )}

      {['home', 'units', 'ranking', 'leadership', 'pathfinders', 'profile', 'games', 'badges', 'chat', 'specialty_study'].includes(currentPage) && !activeSpecialtyName && !isGameActive && (
        <footer className="shrink-0 z-[100]">
          <AppNavbar 
            currentPage={currentPage as any} 
            setCurrentPage={setCurrentPage as any} 
            unreadCount={unreadCount}
            isDarkMode={isDarkMode}
          />
        </footer>
      )}
    </div>
  );
};

export default App;
