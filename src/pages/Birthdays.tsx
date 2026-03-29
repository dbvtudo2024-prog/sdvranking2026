
import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Member } from '@/types';
import { Cake, Calendar, ChevronLeft, ChevronRight, Star, User, Search, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BirthdaysProps {
  members: Member[];
  onBack: () => void;
  isDarkMode?: boolean;
}

export interface BirthdaysRef {
  goBack: () => boolean;
}

const Birthdays = forwardRef<BirthdaysRef, BirthdaysProps>(({ members, onBack, isDarkMode }, ref) => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchTerm, setSearchTerm] = useState('');

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (view === 'list') {
        setView('calendar');
        return true;
      }
      return false;
    }
  }));

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const safeMembers = Array.isArray(members) ? members : [];

  // Aniversariantes do dia
  const todayBirthdays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    return safeMembers.filter(m => {
      if (!m.birthday) return false;
      const [y, mStr, dStr] = m.birthday.split('-');
      return parseInt(mStr) - 1 === currentMonth && parseInt(dStr) === currentDay;
    });
  }, [safeMembers]);

  const filteredMembers = useMemo(() => {
    return safeMembers.filter(m => {
      if (!m.birthday) return false;
      
      const month = m.birthday.includes('-') 
        ? parseInt(m.birthday.split('-')[1]) - 1 
        : new Date(m.birthday).getMonth();
        
      const matchesMonth = month === selectedMonth;
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.unit.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesSearch;
    }).sort((a, b) => {
      const dayA = a.birthday?.includes('-') ? parseInt(a.birthday.split('-')[2]) : new Date(a.birthday!).getDate();
      const dayB = b.birthday?.includes('-') ? parseInt(b.birthday.split('-')[2]) : new Date(b.birthday!).getDate();
      return dayA - dayB;
    });
  }, [safeMembers, selectedMonth, searchTerm]);

  const handleMonthClick = (index: number) => {
    setSelectedMonth(index);
    setView('list');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] animate-in fade-in duration-500 overflow-hidden">
      {/* DESTAQUE DO DIA */}
      {todayBirthdays.length > 0 && (
        <div className="px-6 pt-6 shrink-0">
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-pink-500/30 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/10 rotate-12 pointer-events-none">
              <Cake size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-300 animate-pulse" size={18} fill="currentColor" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">Aniversariante(s) de Hoje!</h3>
              </div>
              <div className="flex flex-col gap-3">
                {todayBirthdays.map(m => (
                  <div key={m.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden bg-white/20">
                      <img src={m.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase truncate">{m.name}</p>
                      <p className="text-[9px] font-bold uppercase opacity-80">{m.unit} • {m.className || 'Liderança'}</p>
                    </div>
                    <div className="bg-white text-pink-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Parabéns!
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SELECTOR & SEARCH */}
      <div className="p-6 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            {view === 'calendar' ? 'Calendário de Aniversários' : `Aniversariantes de ${monthNames[selectedMonth]}`}
          </h2>
          {view === 'list' && (
            <button 
              onClick={() => setView('calendar')}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md text-[#0061f2] active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
            >
              <Grid size={20} />
            </button>
          )}
        </div>

        {view === 'list' && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou unidade..."
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0061f2] transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {view === 'calendar' ? (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-3 gap-3"
            >
              {monthNames.map((month, index) => {
                const count = safeMembers.filter(m => {
                  if (!m.birthday) return false;
                  const mMonth = m.birthday.includes('-') ? parseInt(m.birthday.split('-')[1]) - 1 : new Date(m.birthday).getMonth();
                  return mMonth === index;
                }).length;
                const isCurrentMonth = index === new Date().getMonth();

                return (
                  <button
                    key={month}
                    onClick={() => handleMonthClick(index)}
                    className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all active:scale-95 ${
                      isCurrentMonth 
                        ? 'bg-[#0061f2] border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">{month.substring(0, 3)}</span>
                    <span className={`text-xl font-black ${isCurrentMonth ? 'text-white' : 'text-[#0061f2]'}`}>{count}</span>
                    <span className={`text-[8px] font-bold uppercase opacity-60 ${isCurrentMonth ? 'text-blue-100' : 'text-slate-400'}`}>Membros</span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const day = member.birthday?.includes('-') ? member.birthday.split('-')[2] : new Date(member.birthday!).getDate();
                  const isToday = parseInt(day.toString()) === new Date().getDate() && selectedMonth === new Date().getMonth();
                  
                  return (
                    <div 
                      key={member.id}
                      className={`relative overflow-hidden p-4 rounded-[2rem] border-2 transition-all shadow-lg ${
                        isToday 
                          ? 'bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-slate-800 border-pink-200 dark:border-pink-800 shadow-pink-500/10' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-blue-900/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex-shrink-0 border-2 overflow-hidden shadow-md ${isToday ? 'border-pink-400' : 'border-slate-100 dark:border-slate-700'}`}>
                          {member.photoUrl ? (
                            <img src={member.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight leading-tight truncate">
                            {member.name}
                          </h4>
                          <p className="text-[9px] font-black text-[#0061f2] dark:text-blue-400 uppercase tracking-widest mt-0.5">
                            {member.unit} • {member.age} anos
                          </p>
                        </div>
                        <div className={`flex flex-col items-center justify-center min-w-[50px] h-14 rounded-2xl border-2 ${
                          isToday 
                            ? 'bg-pink-500 text-white border-pink-400' 
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-700'
                        }`}>
                          <span className="text-lg font-black leading-none">{day}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Dia</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <Cake size={48} className="mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum aniversariante</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default Birthdays;
