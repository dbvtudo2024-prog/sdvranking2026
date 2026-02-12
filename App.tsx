
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
import { LogOut, Loader2 } from 'lucide-react';

type Page = 'home' | 'ranking' | 'leadership' | 'profile' | 'games' | 'admin_management' | 'admin_announcements' | 'admin_quiz_editor' | 'admin_specialty_editor';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeUnit, setActiveUnit] = useState<UnitName | null>(null);

  const [quizOverride, setQuizOverride] = useState(() => localStorage.getItem('sentinelas_quiz_override') === 'true');
  const [memoryOverride, setMemoryOverride] = useState(() => localStorage.getItem('sentinelas_memory_override') === 'true');
  const [specialtyOverride, setSpecialtyOverride] = useState(() => localStorage.getItem('sentinelas_specialty_override') === 'true');

  // Logotipo Interno (Original)
  const LOGO_APP = "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx";
  // Logotipo de Carregamento/Instalação (Novo)
  const LOGO_LOADING = "https://lh3.googleusercontent.com/d/1RSopVlUN5znsyAR7bq1z2kvbOa0kh4ok";

  useEffect(() => {
    const savedUser = localStorage.getItem('sentinelas_session_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const membersChannel = DatabaseService.subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    });

    const annChannel = DatabaseService.subscribeAnnouncements((data) => {
      setAnnouncements(data);
    });

    return () => {
      if (membersChannel) membersChannel.unsubscribe();
      if (annChannel) annChannel.unsubscribe();
    };
  }, []);

  const handleToggleOverride = (key: 'quiz' | 'memory' | 'specialty') => {
    if (key === 'quiz') {
      const newVal = !quizOverride;
      setQuizOverride(newVal);
      localStorage.setItem('sentinelas_quiz_override', String(newVal));
    } else if (key === 'memory') {
      const newVal = !memoryOverride;
      setMemoryOverride(newVal);
      localStorage.setItem('sentinelas_memory_override', String(newVal));
    } else if (key === 'specialty') {
      const newVal = !specialtyOverride;
      setSpecialtyOverride(newVal);
      localStorage.setItem('sentinelas_specialty_override', String(newVal));
    }
  };

  const handleLogin = async (authUser: AuthUser, updatedMember?: Member) => {
    setUser(authUser);
    setIsRegistering(false);
    localStorage.setItem('sentinelas_session_user', JSON.stringify(authUser));
    
    await DatabaseService.addUser(authUser);
    if (updatedMember) {
      await DatabaseService.updateMember(updatedMember);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinelas_session_user');
    setUser(null);
    setCurrentPage('home');
    setActiveUnit(null);
  };

  const handleAddMember = async (m: Member) => {
    await DatabaseService.addMember(m);
  };

  const handleUpdateMember = async (m: Member) => {
    await DatabaseService.updateMember(m);
  };

  const handleDeleteMember = async (id: string) => {
    await DatabaseService.deleteMember(id);
  };

  const handleAddCounselor = (name: string) => {
    const saved = localStorage.getItem('sentinelas_counselors');
    const list: string[] = saved ? JSON.parse(saved) : [];
    if (!list.includes(name)) {
      list.push(name);
      localStorage.setItem('sentinelas_counselors', JSON.stringify(list));
      alert(`Conselheiro(a) ${name} adicionado com sucesso!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0061f2] flex flex-col items-center justify-center text-white gap-6">
        <img src={LOGO_LOADING} alt="Logo" className="w-32 h-32 object-contain animate-pulse" />
        <Loader2 size={48} className="animate-spin text-white/40" />
      </div>
    );
  }

  if (!user) {
    if (isRegistering) {
      return <Register onRegister={handleLogin} onBack={() => setIsRegistering(false)} />;
    }
    return <Login onLogin={handleLogin} onGoToRegister={() => setIsRegistering(true)} />;
  }

  const renderContent = () => {
    if (activeUnit) {
      const savedCounselors = localStorage.getItem('sentinelas_counselors');
      const counselorList = savedCounselors ? JSON.parse(savedCounselors) : [];

      return (
        <UnitDetail 
          unitName={activeUnit} 
          members={members.filter(m => m.unit === activeUnit)}
          onBack={() => setActiveUnit(null)}
          onLogout={handleLogout}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          role={user.role}
          userName={user.name}
          counselorList={counselorList}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <Dashboard members={members} announcements={announcements} onSelectUnit={(unit) => setActiveUnit(unit)} />;
      case 'ranking':
        return <Ranking members={members} />;
      case 'leadership':
        return <Leadership members={members} />;
      case 'games':
        return (
          <Games 
            user={user} 
            members={members} 
            onUpdateMember={handleUpdateMember} 
            quizOverride={quizOverride}
            memoryOverride={memoryOverride}
            specialtyOverride={specialtyOverride}
          />
        );
      case 'profile':
        const savedCounselorsProfile = localStorage.getItem('sentinelas_counselors');
        const counselorListProfile = savedCounselorsProfile ? JSON.parse(savedCounselorsProfile) : [];
        return (
          <Profile 
            user={user} 
            members={members}
            onUpdateUser={handleLogin} 
            onLogout={handleLogout} 
            onGoToAdminManagement={() => setCurrentPage('admin_management')}
            onUpdateMember={handleUpdateMember}
            counselorList={counselorListProfile}
          />
        );
      case 'admin_management':
        return (
          <AdminManagement 
            onBack={() => setCurrentPage('profile')}
            onGoToAdminAvisos={() => setCurrentPage('admin_announcements')}
            onGoToAdminQuiz={() => setCurrentPage('admin_quiz_editor')}
            onGoToAdminSpecialty={() => setCurrentPage('admin_specialty_editor')}
            onAddCounselor={handleAddCounselor} 
            quizOverride={quizOverride}
            onToggleQuizOverride={() => handleToggleOverride('quiz')}
            memoryOverride={memoryOverride}
            onToggleMemoryOverride={() => handleToggleOverride('memory')}
            specialtyOverride={specialtyOverride}
            onToggleSpecialtyOverride={() => handleToggleOverride('specialty')}
          />
        );
      case 'admin_announcements':
        return (
          <AdminAnnouncements 
            announcements={announcements} 
            onAdd={(a) => DatabaseService.addAnnouncement(a)} 
            onDelete={(id) => DatabaseService.deleteAnnouncement(id)} 
            onBack={() => setCurrentPage('admin_management')} 
          />
        );
      case 'admin_quiz_editor':
        return <AdminQuizEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      case 'admin_specialty_editor':
        return <AdminSpecialtyEditor onBack={() => setCurrentPage('admin_management')} onLogout={handleLogout} />;
      default:
        return <Dashboard members={members} announcements={announcements} onSelectUnit={(unit) => setActiveUnit(unit)} />;
    }
  };

  // Alteração: 'leadership' não deve mais ser considerada uma internal page para manter a Navbar
  const isInternalPage = currentPage.startsWith('admin_');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center sm:py-4">
      <div className="w-full sm:max-w-2xl lg:max-w-4xl h-screen sm:h-[92vh] sm:rounded-[3rem] bg-white shadow-2xl flex flex-col relative overflow-hidden border border-slate-200">
        {!activeUnit && !isInternalPage && (
          <header className="bg-[#0061f2] text-white px-6 h-20 flex items-center justify-between shadow-lg flex-shrink-0 z-50">
             <div className="flex items-center gap-3">
               <img src={LOGO_APP} alt="Logo" className="w-10 h-10 object-contain" />
               <h1 className="font-black uppercase tracking-tight text-sm">Sentinelas</h1>
             </div>
             <button onClick={handleLogout} className="p-2 bg-white/10 rounded-xl"><LogOut size={18} /></button>
          </header>
        )}
        <main className={`flex-1 overflow-y-auto bg-slate-50 ${(activeUnit || isInternalPage) ? 'p-0' : 'p-4'}`}>
          {renderContent()}
        </main>
        {!activeUnit && !isInternalPage && (
          <div className="flex-shrink-0 bg-white border-t border-slate-100">
            <Navbar currentPage={currentPage as any} setCurrentPage={(p) => { setActiveUnit(null); setCurrentPage(p as any); }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
