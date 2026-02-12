
import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, UnitName, Member, Announcement } from './types';
import { DatabaseService } from './db';
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
import Navbar from './components/Navbar';
import { LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sentinelas_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [counselors, setCounselors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'ranking' | 'leadership' | 'profile' | 'games' | 'unit_detail' | 'register' | 'admin_announcements' | 'admin_quiz' | 'admin_specialty' | 'admin_management'>('home');
  const [selectedUnit, setSelectedUnit] = useState<UnitName | null>(null);

  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";

  // Admin overrides for games
  const [quizOverride, setQuizOverride] = useState(false);
  const [memoryOverride, setMemoryOverride] = useState(false);
  const [specialtyOverride, setSpecialtyOverride] = useState(false);

  useEffect(() => {
    const membersSub = DatabaseService.subscribeMembers(setMembers);
    const announcementsSub = DatabaseService.subscribeAnnouncements(setAnnouncements);
    const counselorsSub = DatabaseService.subscribeCounselors((data) => {
      setCounselors(data.map(c => c.name));
    });

    return () => {
      membersSub.unsubscribe();
      announcementsSub.unsubscribe();
      counselorsSub.unsubscribe();
    };
  }, []);

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
    if (updatedMember) {
      await DatabaseService.updateMember(updatedMember);
    }
  };

  const handleResetRanking = async (type: 'members' | 'quiz' | 'memory' | 'specialty' | '1x1') => {
    const updatedMembers = members.map(m => {
      const newScores = (m.scores || []).map(s => {
        const news = { ...s };
        if (type === 'members') {
          news.punctuality = 0; news.uniform = 0; news.material = 0; news.bible = 0;
          news.voluntariness = 0; news.activities = 0; news.treasury = 0;
        } else if (type === 'quiz') {
          news.quiz = 0;
        } else if (type === 'memory') {
          news.memoryGame = 0;
        } else if (type === 'specialty') {
          news.specialtyGame = 0;
        } else if (type === '1x1') {
          news.challenge1x1 = 0;
        }
        return news;
      });
      return { ...m, scores: newScores };
    });

    for (const m of updatedMembers) {
      await DatabaseService.updateMember(m);
    }
  };

  if (!user) {
    if (currentPage === 'register') {
      return (
        <Register 
          onRegister={(u, m) => {
            if (m) handleLogin(u);
            else setCurrentPage('home');
          }} 
          onBack={() => setCurrentPage('home')}
          counselorList={counselors}
        />
      );
    }
    return <Login onLogin={handleLogin} onGoToRegister={() => setCurrentPage('register')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'ranking':
        return <Ranking members={members} />;
      case 'leadership':
        return <Leadership members={members} userRole={user.role} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            members={members} 
            onUpdateUser={handleUpdateUser} 
            onLogout={handleLogout}
            onGoToAdminManagement={() => setCurrentPage('admin_management')}
            counselorList={counselors}
          />
        );
      case 'games':
        return (
          <Games 
            user={user} 
            members={members} 
            onUpdateMember={DatabaseService.updateMember.bind(DatabaseService)}
            quizOverride={quizOverride}
            memoryOverride={memoryOverride}
            specialtyOverride={specialtyOverride}
          />
        );
      case 'unit_detail':
        return selectedUnit ? (
          <UnitDetail 
            unitName={selectedUnit} 
            members={members} 
            onBack={() => setCurrentPage('home')} 
            onLogout={handleLogout}
            onAddMember={DatabaseService.addMember.bind(DatabaseService)}
            onUpdateMember={DatabaseService.updateMember.bind(DatabaseService)}
            onDeleteMember={DatabaseService.deleteMember.bind(DatabaseService)}
            role={user.role}
            userName={user.name}
            counselorList={counselors}
          />
        ) : null;
      case 'admin_announcements':
        return (
          <AdminAnnouncements 
            announcements={announcements}
            onAdd={DatabaseService.addAnnouncement.bind(DatabaseService)}
            onDelete={DatabaseService.deleteAnnouncement.bind(DatabaseService)}
            onBack={() => setCurrentPage('profile')}
          />
        );
      case 'admin_quiz':
        return <AdminQuizEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      case 'admin_specialty':
        return <AdminSpecialtyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      case 'admin_management':
        return (
          <AdminManagement 
            members={members}
            userEmail={user.email}
            onBack={() => setCurrentPage('profile')}
            onGoToAdminAvisos={() => setCurrentPage('admin_announcements')}
            onGoToAdminQuiz={() => setCurrentPage('admin_quiz')}
            onGoToAdminSpecialty={() => setCurrentPage('admin_specialty')}
            onAddCounselor={DatabaseService.addCounselor.bind(DatabaseService)}
            onResetRanking={handleResetRanking}
            quizOverride={quizOverride}
            onToggleQuizOverride={() => setQuizOverride(!quizOverride)}
            memoryOverride={memoryOverride}
            onToggleMemoryOverride={() => setMemoryOverride(!memoryOverride)}
            specialtyOverride={specialtyOverride}
            onToggleSpecialtyOverride={() => setSpecialtyOverride(!specialtyOverride)}
          />
        );
      case 'home':
      default:
        return (
          <Dashboard 
            members={members} 
            announcements={announcements} 
            onSelectUnit={(unit) => {
              setSelectedUnit(unit);
              setCurrentPage('unit_detail');
            }} 
          />
        );
    }
  };

  const showGlobalLayout = ['home', 'ranking', 'leadership', 'profile', 'games'].includes(currentPage);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* CABEÇALHO PRINCIPAL DO APP */}
      {showGlobalLayout && (
        <header className="bg-[#0061f2] text-white px-6 h-16 flex items-center justify-between shadow-lg z-50 shrink-0">
          <div className="flex items-center gap-3">
            <img src={LOGO_APP} alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="font-black uppercase tracking-tight text-sm">Sentinelas</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <LogOut size={18} />
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>

      {showGlobalLayout && (
        <footer className="shrink-0 bg-white border-t border-slate-100">
          <Navbar currentPage={currentPage as any} setCurrentPage={setCurrentPage as any} />
        </footer>
      )}
    </div>
  );
};

export default App;
