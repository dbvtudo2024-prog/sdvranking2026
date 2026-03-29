
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthUser, UserRole, UnitName, Member, Announcement, ChatMessage, Challenge1x1, CounselorDB, GameConfig } from '@/types';
import { DatabaseService } from '@/db';
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
import AdminWhoAmIEditor from '@/pages/AdminWhoAmIEditor';
import AdminScrambledVerseEditor from '@/pages/AdminScrambledVerseEditor';
import AdminPianoEditor from '@/pages/AdminPianoEditor';
import Birthdays, { BirthdaysRef } from '@/pages/Birthdays';
import SpecialtyStudyArea, { SpecialtyStudyHandle } from '@/pages/SpecialtyStudyArea';
import AdminManagement from '@/pages/AdminManagement';
import Games from '@/pages/Games';
import Leadership from '@/pages/Leadership';
import Pathfinders from '@/pages/Pathfinders';
import Chat from '@/pages/Chat';
import AppNavbar from '@/components/AppNavbar';
import TickerBanner from '@/components/TickerBanner';
import { formatImageUrl } from '@/helpers/imageHelpers';
import { ArrowLeft, Bell, X, Sword, Moon, Sun } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState<'home' | 'units' | 'ranking' | 'leadership' | 'pathfinders' | 'profile' | 'games' | 'unit_detail' | 'register' | 'admin_announcements' | 'admin_quiz' | 'admin_specialty' | 'admin_three_clues' | 'admin_specialty_study' | 'admin_puzzle' | 'admin_who_am_i' | 'admin_scrambled_verse' | 'specialty_study' | 'admin_management' | 'chat' | 'bible_reading' | 'bible' | 'devotional' | 'admin_piano' | 'birthdays'>('home');
  const [adminQuizCategory, setAdminQuizCategory] = useState<'Todas' | 'Desbravadores' | 'Bíblia' | 'Natureza' | 'Primeiros Socorros' | 'Especialidades'>('Todas');
  const [selectedUnit, setSelectedUnit] = useState<UnitName | null>(null);
  const bibleRef = useRef<BibleHandle>(null);
  const specialtyStudyRef = useRef<SpecialtyStudyHandle>(null);
  const birthdaysRef = useRef<BirthdaysRef>(null);
  
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
  const [whoAmIOverride, setWhoAmIOverride] = useState(false);
  const [specialtyTrailOverride, setSpecialtyTrailOverride] = useState(false);
  const [scrambledVerseOverride, setScrambledVerseOverride] = useState(false);
  const [natureIdOverride, setNatureIdOverride] = useState(false);
  const [firstAidOverride, setFirstAidOverride] = useState(false);

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
    const announcementsSub = DatabaseService.subscribeAnnouncements(setAnnouncements);
    const counselorsSub = DatabaseService.subscribeCounselors(setCounselorsData);
    const gameConfigsSub = DatabaseService.subscribeGameConfigs((config: GameConfig) => {
      setQuizOverride(config.quiz_override);
      setMemoryOverride(config.memory_override);
      setSpecialtyOverride(config.specialty_override);
      setThreeCluesOverride(config.three_clues_override);
      setPuzzleOverride(config.puzzle_override);
      setKnotsOverride(config.knots_override);
      setWhoAmIOverride(config.who_am_i_override);
      setSpecialtyTrailOverride(config.specialty_trail_override);
      setScrambledVerseOverride(config.scrambled_verse_override);
      setNatureIdOverride(config.nature_id_override);
      setFirstAidOverride(config.first_aid_override);
    });

    return () => {
      announcementsSub.unsubscribe();
      counselorsSub.unsubscribe();
      gameConfigsSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setMembers([]);
      return;
    }
    const membersSub = DatabaseService.subscribeMembers(setMembers);
    return () => {
      membersSub.unsubscribe();
    };
  }, [user?.id]);

  // LÓGICA DE NOTIFICAÇÃO DE DESAFIOS
  useEffect(() => {
    if (!user) return;

    const subChallenges = DatabaseService.subscribeChallenges((challenge) => {
      console.log("Desafio recebido no Realtime:", challenge);
      if (String(challenge.challengedId) === String(user.id) && challenge.status === 'pending') {
        console.log("Desafio é para mim!");
        setChallengeNotification(challenge);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    });

    return () => {
      subChallenges.unsubscribe();
    };
  }, [user?.id]);

  // LÓGICA DE NOTIFICAÇÃO SUPER RESILIENTE
  useEffect(() => {
    if (!user) return;

    const subMessages = DatabaseService.subscribeAllMessages((msg) => {
      console.log("Chegou mensagem no Realtime:", msg);
      
      // Se eu sou o autor, ignora
      if (String(msg.sender_id) === String(user.id)) return;

      // Se estou na tela de chat, não mostra banner, apenas zera
      if (currentPage === 'chat') {
        setUnreadCount(0);
        return;
      }

      // Verifica se a mensagem é relevante para mim
      const isRelevant = msg.unit === 'Geral' || msg.unit === user.unit || !user.unit;

      if (isRelevant) {
        setUnreadCount(prev => prev + 1);
        setLastNotification(msg);
        
        // vibração se suportado
        if (navigator.vibrate) navigator.vibrate(200);

        // Remove o banner após 10 segundos
        setTimeout(() => setLastNotification(null), 10000);
      }
    });

    return () => {
      subMessages.unsubscribe();
    };
  }, [user?.id, user?.unit, currentPage]);

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

  const handleResetRanking = useCallback(async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues' | 'puzzle' | 'knots' | 'whoami' | 'specialtytrail' | 'scrambledverse' | 'natureid' | 'firstaid' | 'mahjong') => {
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
        else if (type === 'whoami') news.whoAmIGame = 0;
        else if (type === 'specialtytrail') news.specialtyTrailGame = 0;
        else if (type === 'scrambledverse') news.scrambledVerseGame = 0;
        else if (type === 'natureid') news.natureIdGame = 0;
        else if (type === 'firstaid') news.firstAidGame = 0;
        else if (type === 'mahjong') news.mahjongGame = 0;
        return news;
      });
      return { ...m, scores: newScores };
    });
    setMembers(updatedMembers);
    for (const m of updatedMembers) await DatabaseService.updateMember(m);
  }, [members]);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Sentinelas da Verdade';
      case 'units': return 'Unidades do Clube';
      case 'bible': return 'Bíblia Sagrada';
      case 'bible_reading': return 'Plano de Leitura';
      case 'ranking': return 'Ranking Geral';
      case 'leadership': return 'Corpo Diretivo';
      case 'pathfinders': return 'Desbravadores';
      case 'birthdays': return 'Aniversariantes';
      case 'profile': return 'Meu Perfil';
      case 'games': return 'Central de Jogos';
      case 'chat': return 'Chat do Clube';
      case 'unit_detail': return selectedUnit ? `Unidade ${selectedUnit}` : 'Detalhes';
      case 'admin_announcements': return 'Mural de Avisos';
      case 'admin_quiz': return 'Editor de Quiz';
      case 'admin_specialty': return 'Editor de Especialidades';
      case 'admin_three_clues': return 'Editor de 3 Dicas';
      case 'admin_specialty_study': return 'Editor de Estudo';
      case 'admin_puzzle': return 'Editor de Quebra-Cabeça';
      case 'admin_who_am_i': return 'Editor de Quem Sou Eu?';
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
    else if (['admin_announcements', 'admin_quiz', 'admin_specialty', 'admin_three_clues', 'admin_specialty_study', 'admin_puzzle', 'admin_who_am_i', 'admin_scrambled_verse'].includes(currentPage)) setCurrentPage('admin_management');
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home announcements={announcements} onNavigate={(p) => setCurrentPage(p)} isDarkMode={isDarkMode} user={user!} members={members} />;
      case 'units': return <Units members={members} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentPage('unit_detail'); }} onGoToBirthdays={() => setCurrentPage('birthdays')} isDarkMode={isDarkMode} />;
      case 'birthdays': return <Birthdays ref={birthdaysRef} members={members} onBack={() => setCurrentPage('home')} isDarkMode={isDarkMode} />;
      case 'bible': return <Bible ref={bibleRef} onGoToReadingPlan={() => setCurrentPage('bible_reading')} onGoToDevotional={() => setCurrentPage('devotional')} onBackToHome={() => setCurrentPage('home')} isDarkMode={isDarkMode} />;
      case 'bible_reading': return <BibleReading user={user!} onBack={() => setCurrentPage('bible')} isDarkMode={isDarkMode} />;
      case 'devotional': return <Devotional onBack={() => setCurrentPage('bible')} isDarkMode={isDarkMode} />;
      case 'ranking': return <Ranking members={members} isDarkMode={isDarkMode} />;
      case 'leadership': return <Leadership members={members} isDarkMode={isDarkMode} />;
      case 'pathfinders': return <Pathfinders members={members} isDarkMode={isDarkMode} />;
      case 'profile': return <Profile user={user!} members={members} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onGoToAdminManagement={() => setCurrentPage('admin_management')} counselorList={counselorsData.map(c => c.name)} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
      case 'games': return <Games user={user!} members={members} onUpdateMember={handleUpdateMember} quizOverride={quizOverride} memoryOverride={memoryOverride} specialtyOverride={specialtyOverride} threeCluesOverride={threeCluesOverride} puzzleOverride={puzzleOverride} knotsOverride={knotsOverride} whoAmIOverride={whoAmIOverride} specialtyTrailOverride={specialtyTrailOverride} scrambledVerseOverride={scrambledVerseOverride} natureIdOverride={natureIdOverride} firstAidOverride={firstAidOverride} isDarkMode={isDarkMode} />;
      case 'chat': return <Chat user={user!} isDarkMode={isDarkMode} />;
      case 'unit_detail': return selectedUnit ? <UnitDetail unitName={selectedUnit} members={members} onBack={() => setCurrentPage('units')} onLogout={handleLogout} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} role={user!.role} userName={user!.name} counselorList={counselorsData.map(c => c.name)} isDarkMode={isDarkMode} /> : null;
      case 'admin_announcements': return <AdminAnnouncements announcements={announcements} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} onBack={() => setCurrentPage('admin_management')} isDarkMode={isDarkMode} />;
      case 'admin_quiz': return <AdminQuizEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} initialCategory={adminQuizCategory} />;
      case 'admin_specialty': return <AdminSpecialtyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_three_clues': return <AdminThreeCluesEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_specialty_study': return <AdminSpecialtyStudyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_puzzle': return <AdminPuzzleEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_who_am_i': return <AdminWhoAmIEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_scrambled_verse': return <AdminScrambledVerseEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} isDarkMode={isDarkMode} />;
      case 'admin_piano': return <AdminPianoEditor onBack={() => setCurrentPage('admin_management')} isDarkMode={isDarkMode} />;
      case 'specialty_study': return <SpecialtyStudyArea ref={specialtyStudyRef} user={user!} members={members} onUpdateMember={handleUpdateMember} onBack={() => setCurrentPage('home')} onStudyStateChange={handleStudyStateChange} isDarkMode={isDarkMode} />;
      case 'admin_management': return <AdminManagement members={members} userEmail={user!.email} onBack={() => setCurrentPage('profile')} 
      onGoToAdminAvisos={() => setCurrentPage('admin_announcements')} 
      onGoToAdminQuiz={() => { setAdminQuizCategory('Todas'); setCurrentPage('admin_quiz'); }} 
      onGoToAdminSpecialty={() => setCurrentPage('admin_specialty')} 
      onGoToAdminThreeClues={() => setCurrentPage('admin_three_clues')} 
      onGoToAdminSpecialtyStudy={() => setCurrentPage('admin_specialty_study')} 
      onGoToAdminPuzzle={() => setCurrentPage('admin_puzzle')} 
      onGoToAdminWhoAmI={() => setCurrentPage('admin_who_am_i')} 
      onGoToAdminScrambledVerse={() => setCurrentPage('admin_scrambled_verse')} 
      onGoToAdminNatureId={() => { setAdminQuizCategory('Natureza'); setCurrentPage('admin_quiz'); }}
      onGoToAdminFirstAid={() => { setAdminQuizCategory('Primeiros Socorros'); setCurrentPage('admin_quiz'); }}
      onGoToAdminSpecialtyTrail={() => { setAdminQuizCategory('Especialidades'); setCurrentPage('admin_quiz'); }}
      onGoToAdminPiano={() => setCurrentPage('admin_piano')}
      counselors={counselorsData} onAddCounselor={DatabaseService.addCounselor.bind(DatabaseService)} onUpdateCounselor={DatabaseService.updateCounselor.bind(DatabaseService)} onDeleteCounselor={DatabaseService.deleteCounselor.bind(DatabaseService)} onResetRanking={handleResetRanking} 
      quizOverride={quizOverride} onToggleQuizOverride={async () => { const nv = !quizOverride; setQuizOverride(nv); await DatabaseService.updateGameConfig({ quiz_override: nv }); }} 
      memoryOverride={memoryOverride} onToggleMemoryOverride={async () => { const nv = !memoryOverride; setMemoryOverride(nv); await DatabaseService.updateGameConfig({ memory_override: nv }); }} 
      specialtyOverride={specialtyOverride} onToggleSpecialtyOverride={async () => { const nv = !specialtyOverride; setSpecialtyOverride(nv); await DatabaseService.updateGameConfig({ specialty_override: nv }); }} 
      threeCluesOverride={threeCluesOverride} onToggleThreeCluesOverride={async () => { const nv = !threeCluesOverride; setThreeCluesOverride(nv); await DatabaseService.updateGameConfig({ three_clues_override: nv }); }} 
      puzzleOverride={puzzleOverride} onTogglePuzzleOverride={async () => { const nv = !puzzleOverride; setPuzzleOverride(nv); await DatabaseService.updateGameConfig({ puzzle_override: nv }); }} 
      knotsOverride={knotsOverride} onToggleKnotsOverride={async () => { const nv = !knotsOverride; setKnotsOverride(nv); await DatabaseService.updateGameConfig({ knots_override: nv }); }}
      whoAmIOverride={whoAmIOverride} onToggleWhoAmIOverride={async () => { const nv = !whoAmIOverride; setWhoAmIOverride(nv); await DatabaseService.updateGameConfig({ who_am_i_override: nv }); }}
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
      
      {currentPage !== 'specialty_study' && currentPage !== 'home' && <TickerBanner announcements={announcements} />}
      
      <main className="flex-1 overflow-hidden">{renderPage()}</main>

      {['home', 'units', 'ranking', 'leadership', 'pathfinders', 'profile', 'games', 'chat', 'specialty_study'].includes(currentPage) && !activeSpecialtyName && (
        <footer className="shrink-0 fixed bottom-0 left-0 right-0 z-[100]">
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
