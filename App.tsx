
import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, UnitName, Member, Announcement, ChatMessage, Challenge1x1 } from './types';
import { DatabaseService, CounselorDB, GameConfig } from './db';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UnitDetail from './pages/UnitDetail';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminQuizEditor from './pages/AdminQuizEditor';
import AdminSpecialtyEditor from './pages/AdminSpecialtyEditor';
import AdminManagement from './pages/AdminManagement';
import Games from './pages/Games';
import Leadership from './pages/Leadership';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';
import { LogOut, ArrowLeft, Bell, X, Sword } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sentinelas_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [counselorsData, setCounselorsData] = useState<CounselorDB[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'ranking' | 'leadership' | 'profile' | 'games' | 'unit_detail' | 'register' | 'admin_announcements' | 'admin_quiz' | 'admin_specialty' | 'admin_management' | 'chat'>('home');
  const [selectedUnit, setSelectedUnit] = useState<UnitName | null>(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<ChatMessage | null>(null);
  const [challengeNotification, setChallengeNotification] = useState<Challenge1x1 | null>(null);

  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  const [quizOverride, setQuizOverride] = useState(false);
  const [memoryOverride, setMemoryOverride] = useState(false);
  const [specialtyOverride, setSpecialtyOverride] = useState(false);
  const [threeCluesOverride, setThreeCluesOverride] = useState(false);

  useEffect(() => {
    const membersSub = DatabaseService.subscribeMembers(setMembers);
    const announcementsSub = DatabaseService.subscribeAnnouncements(setAnnouncements);
    const counselorsSub = DatabaseService.subscribeCounselors(setCounselorsData);
    const gameConfigsSub = DatabaseService.subscribeGameConfigs((config: GameConfig) => {
      setQuizOverride(config.quiz_override);
      setMemoryOverride(config.memory_override);
      setSpecialtyOverride(config.specialty_override);
      setThreeCluesOverride(config.three_clues_override);
    });

    return () => {
      membersSub.unsubscribe();
      announcementsSub.unsubscribe();
      counselorsSub.unsubscribe();
      gameConfigsSub.unsubscribe();
    };
  }, []);

  // LÓGICA DE NOTIFICAÇÃO DE DESAFIOS
  useEffect(() => {
    if (!user) return;

    const subChallenges = DatabaseService.subscribeChallenges((challenge) => {
      if (challenge.challengedId === user.id && challenge.status === 'pending') {
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

  const handleAddMember = async (newMember: Member) => {
    setMembers(prev => [...prev, newMember]);
    try { await DatabaseService.addMember(newMember); } catch (e) { console.error(e); }
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers(prev => prev.map(m => String(m.id) === String(updatedMember.id) ? updatedMember : m));
    try { await DatabaseService.updateMember(updatedMember); } catch (e) { console.error(e); }
  };

  const handleDeleteMember = async (id: string | number) => {
    setMembers(prev => prev.filter(m => String(m.id) !== String(id)));
    try { await DatabaseService.deleteMember(String(id)); } catch (e) { console.error(e); }
  };

  const handleAddAnnouncement = async (ann: Announcement) => {
    setAnnouncements(prev => [ann, ...prev]);
    try { await DatabaseService.addAnnouncement(ann); } catch (e) { console.error(e); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try { await DatabaseService.deleteAnnouncement(id); } catch (e) { console.error(e); }
  };

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(authUser));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sentinelas_user');
    setCurrentPage('home');
    setSelectedUnit(null);
  };

  const handleUpdateUser = async (updatedUser: AuthUser, updatedMember?: Member) => {
    setUser(updatedUser);
    localStorage.setItem('sentinelas_user', JSON.stringify(updatedUser));
    await DatabaseService.addUser(updatedUser);
    if (updatedMember) handleUpdateMember(updatedMember);
  };

  const handleResetRanking = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1' | 'threeclues') => {
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
        return news;
      });
      return { ...m, scores: newScores };
    });
    setMembers(updatedMembers);
    for (const m of updatedMembers) await DatabaseService.updateMember(m);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Sentinelas da Verdade';
      case 'ranking': return 'Ranking Geral';
      case 'leadership': return 'Corpo Diretivo';
      case 'profile': return 'Meu Perfil';
      case 'games': return 'Central de Jogos';
      case 'chat': return 'Chat do Clube';
      case 'unit_detail': return selectedUnit ? `Unidade ${selectedUnit}` : 'Detalhes';
      case 'admin_announcements': return 'Mural de Avisos';
      case 'admin_quiz': return 'Editor de Quiz';
      case 'admin_specialty': return 'Editor de Especialidades';
      case 'admin_management': return 'Gestão Administrativa';
      default: return 'Sentinelas da Verdade';
    }
  };

  const handleBack = () => {
    if (currentPage === 'unit_detail') setCurrentPage('home');
    else if (currentPage === 'admin_management') setCurrentPage('profile');
    else if (['admin_announcements', 'admin_quiz', 'admin_specialty'].includes(currentPage)) setCurrentPage('admin_management');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'ranking': return <Ranking members={members} />;
      case 'leadership': return <Leadership members={members} />;
      case 'profile': return <Profile user={user!} members={members} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onGoToAdminManagement={() => setCurrentPage('admin_management')} counselorList={counselorsData.map(c => c.name)} />;
      case 'games': return <Games user={user!} members={members} onUpdateMember={handleUpdateMember} quizOverride={quizOverride} memoryOverride={memoryOverride} specialtyOverride={specialtyOverride} threeCluesOverride={threeCluesOverride} />;
      case 'chat': return <Chat user={user!} />;
      case 'unit_detail': return selectedUnit ? <UnitDetail unitName={selectedUnit} members={members} onBack={() => setCurrentPage('home')} onLogout={handleLogout} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} role={user!.role} userName={user!.name} counselorList={counselorsData.map(c => c.name)} /> : null;
      case 'admin_announcements': return <AdminAnnouncements announcements={announcements} onAdd={handleAddAnnouncement} onDelete={handleDeleteAnnouncement} onBack={() => setCurrentPage('admin_management')} />;
      case 'admin_quiz': return <AdminQuizEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      case 'admin_specialty': return <AdminSpecialtyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      case 'admin_management': return <AdminManagement members={members} userEmail={user!.email} onBack={() => setCurrentPage('profile')} onGoToAdminAvisos={() => setCurrentPage('admin_announcements')} onGoToAdminQuiz={() => setCurrentPage('admin_quiz')} onGoToAdminSpecialty={() => setCurrentPage('admin_specialty')} counselors={counselorsData} onAddCounselor={DatabaseService.addCounselor.bind(DatabaseService)} onUpdateCounselor={DatabaseService.updateCounselor.bind(DatabaseService)} onDeleteCounselor={DatabaseService.deleteCounselor.bind(DatabaseService)} onResetRanking={handleResetRanking} quizOverride={quizOverride} onToggleQuizOverride={async () => { const nv = !quizOverride; setQuizOverride(nv); await DatabaseService.updateGameConfig({ quiz_override: nv }); }} memoryOverride={memoryOverride} onToggleMemoryOverride={async () => { const nv = !memoryOverride; setMemoryOverride(nv); await DatabaseService.updateGameConfig({ memory_override: nv }); }} specialtyOverride={specialtyOverride} onToggleSpecialtyOverride={async () => { const nv = !specialtyOverride; setSpecialtyOverride(nv); await DatabaseService.updateGameConfig({ specialty_override: nv }); }} threeCluesOverride={threeCluesOverride} onToggleThreeCluesOverride={async () => { const nv = !threeCluesOverride; setThreeCluesOverride(nv); await DatabaseService.updateGameConfig({ three_clues_override: nv }); }} />;
      default: return <Dashboard members={members} announcements={announcements} onSelectUnit={(u) => { setSelectedUnit(u); setCurrentPage('unit_detail'); }} />;
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

  const isDetailPage = ['unit_detail', 'admin_announcements', 'admin_quiz', 'admin_specialty', 'admin_management'].includes(currentPage);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {/* BANNER DE NOTIFICAÇÃO MELHORADO */}
      {lastNotification && (
        <div 
          onClick={() => setCurrentPage('chat')}
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

      <header className="bg-[#0061f2] text-white px-5 h-20 flex items-center justify-between shadow-xl z-50 shrink-0">
        <div className="flex items-center gap-3">
          {isDetailPage ? (
            <button onClick={handleBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90">
              <ArrowLeft size={22} strokeWidth={3} />
            </button>
          ) : (
            <img src={LOGO_APP} alt="Logo" className="w-12 h-12 object-contain" />
          )}
          <div className="flex flex-col">
            <h1 className="font-black uppercase tracking-tight text-base leading-tight">{getPageTitle()}</h1>
            <p className="text-[10px] font-bold uppercase opacity-80 leading-none mt-1">
              {user.name} • {user.funcao || user.role}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90">
          <LogOut size={20} strokeWidth={3} />
        </button>
      </header>
      
      <main className="flex-1 overflow-hidden">{renderPage()}</main>

      {['home', 'ranking', 'leadership', 'profile', 'games', 'chat'].includes(currentPage) && (
        <footer className="shrink-0 bg-white border-t border-slate-100">
          <Navbar 
            currentPage={currentPage as any} 
            setCurrentPage={setCurrentPage as any} 
            unreadCount={unreadCount}
          />
        </footer>
      )}
    </div>
  );
};

export default App;
