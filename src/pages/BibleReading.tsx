import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AuthUser } from '@/types';
import { DatabaseService } from '@/db';
import { CHRONOLOGICAL_WEEKS, ChronologicalWeek, ChronologicalDay } from '@/data/chronologicalPlanData';
import { 
  BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, History, 
  Loader2, Search, ArrowLeft, Calendar, Info, Compass, HelpCircle, 
  Sparkles, Check, Clock, Shield, Flag, Award, Heart, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BibleReadingProps {
  user: AuthUser;
  onBack: () => void;
  onJumpToBible?: (book: string, chapter: number) => void;
  isDarkMode?: boolean;
  onViewChange?: (title: string, subtitle: string) => void;
}

export interface BibleReadingHandle {
  goBack: () => boolean;
}

const BIBLE_BOOKS_CH_COUNT = [
  { name: "Gênesis", chapters: 50 },
  { name: "Êxodo", chapters: 40 },
  { name: "Levítico", chapters: 27 },
  { name: "Números", chapters: 36 },
  { name: "Deuteronômio", chapters: 34 },
  { name: "Josué", chapters: 24 },
  { name: "Juízes", chapters: 21 },
  { name: "Rute", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Reis", chapters: 22 },
  { name: "2 Reis", chapters: 25 },
  { name: "1 Crônicas", chapters: 29 },
  { name: "2 Crônicas", chapters: 36 },
  { name: "Esdras", chapters: 10 },
  { name: "Neemias", chapters: 13 },
  { name: "Ester", chapters: 10 },
  { name: "Jó", chapters: 42 },
  { name: "Salmos", chapters: 150 },
  { name: "Provérbios", chapters: 31 },
  { name: "Eclesiastes", chapters: 12 },
  { name: "Cantares", chapters: 8 },
  { name: "Isaías", chapters: 66 },
  { name: "Jeremias", chapters: 52 },
  { name: "Lamentações", chapters: 5 },
  { name: "Ezequiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Oseias", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amós", chapters: 9 },
  { name: "Obadias", chapters: 1 },
  { name: "Jonas", chapters: 4 },
  { name: "Miqueias", chapters: 7 },
  { name: "Naum", chapters: 3 },
  { name: "Habacuque", chapters: 3 },
  { name: "Sofonias", chapters: 3 },
  { name: "Ageu", chapters: 2 },
  { name: "Zacarias", chapters: 14 },
  { name: "Malaquias", chapters: 4 },
  { name: "Mateus", chapters: 28 },
  { name: "Marcos", chapters: 16 },
  { name: "Lucas", chapters: 24 },
  { name: "João", chapters: 21 },
  { name: "Atos", chapters: 28 },
  { name: "Romanos", chapters: 16 },
  { name: "1 Coríntios", chapters: 16 },
  { name: "2 Coríntios", chapters: 13 },
  { name: "Gálatas", chapters: 6 },
  { name: "Efésios", chapters: 6 },
  { name: "Filipenses", chapters: 4 },
  { name: "Colossenses", chapters: 4 },
  { name: "1 Tessalonicenses", chapters: 5 },
  { name: "2 Tessalonicenses", chapters: 3 },
  { name: "1 Timóteo", chapters: 6 },
  { name: "2 Timóteo", chapters: 4 },
  { name: "Tito", chapters: 3 },
  { name: "Filemom", chapters: 1 },
  { name: "Hebreus", chapters: 13 },
  { name: "Tiago", chapters: 5 },
  { name: "1 Pedro", chapters: 5 },
  { name: "2 Pedro", chapters: 3 },
  { name: "1 João", chapters: 5 },
  { name: "2 João", chapters: 1 },
  { name: "3 João", chapters: 1 },
  { name: "Judas", chapters: 1 },
  { name: "Apocalipse", chapters: 22 }
];

interface ReadingDay {
  dayNumber: number;
  reading: string;
  suggestedBook: string;
}

const generate365DayPlan = (): ReadingDay[] => {
  const plan: ReadingDay[] = [];
  let currentBookIndex = 0;
  let currentChapter = 1;

  for (let day = 1; day <= 365; day++) {
    const prevAccumulated = Math.round((day - 1) * 1189 / 365);
    const currAccumulated = Math.round(day * 1189 / 365);
    const chaptersToRead = currAccumulated - prevAccumulated;

    let firstBookInDay = BIBLE_BOOKS_CH_COUNT[currentBookIndex]?.name || "Gênesis";
    let chaptersProcessed = 0;
    let segments: string[] = [];

    while (chaptersProcessed < chaptersToRead && currentBookIndex < BIBLE_BOOKS_CH_COUNT.length) {
      const book = BIBLE_BOOKS_CH_COUNT[currentBookIndex];
      const remainingInBook = book.chapters - currentChapter + 1;
      const readFromThisBook = Math.min(chaptersToRead - chaptersProcessed, remainingInBook);

      if (readFromThisBook > 0) {
        if (readFromThisBook === 1) {
          segments.push(`${book.name} ${currentChapter}`);
        } else {
          segments.push(`${book.name} ${currentChapter} a ${currentChapter + readFromThisBook - 1}`);
        }
        currentChapter += readFromThisBook;
        chaptersProcessed += readFromThisBook;
      }

      if (currentChapter > book.chapters) {
        currentBookIndex++;
        currentChapter = 1;
      }
    }

    plan.push({
      dayNumber: day,
      reading: segments.join("; "),
      suggestedBook: firstBookInDay
    });
  }
  return plan;
};

const MONTHS_DATA = [
  { name: "Janeiro", startDay: 1, endDay: 31 },
  { name: "Fevereiro", startDay: 32, endDay: 59 },
  { name: "Março", startDay: 60, endDay: 90 },
  { name: "Abril", startDay: 91, endDay: 120 },
  { name: "Maio", startDay: 121, endDay: 151 },
  { name: "Junho", startDay: 152, endDay: 181 },
  { name: "Julho", startDay: 182, endDay: 212 },
  { name: "Agosto", startDay: 213, endDay: 243 },
  { name: "Setembro", startDay: 244, endDay: 273 },
  { name: "Outubro", startDay: 274, endDay: 304 },
  { name: "Novembro", startDay: 305, endDay: 334 },
  { name: "Dezembro", startDay: 335, endDay: 365 }
];

// Utility to get current week index (1-52)
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return Math.max(1, Math.min(52, weekNo));
}

// Utility to get day index of year (1-365)
function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.min(365, Math.floor(diff / oneDay)));
}

const BibleReading = forwardRef<BibleReadingHandle, BibleReadingProps>(({ user, onBack, onJumpToBible, isDarkMode, onViewChange }, ref) => {
  // Plan type toggle
  const [planType, setPlanType] = useState<'weekly' | 'annual'>('weekly');
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'annual' | 'about' | null>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (selectedPlan !== null) {
        setSelectedPlan(null);
        return true;
      }
      return false;
    }
  }), [selectedPlan]);

  useEffect(() => {
    if (onViewChange) {
      if (selectedPlan === 'weekly') {
        onViewChange('Plano Cronológico', '52 Semanas');
      } else if (selectedPlan === 'annual') {
        onViewChange('Ano Bíblico', '365 Dias');
      } else if (selectedPlan === 'about') {
        onViewChange('Diretrizes e Ciclos', 'A. S. M.');
      } else {
        onViewChange('Plano de Leitura', 'Bíblia Sagrada');
      }
    }
  }, [selectedPlan, onViewChange]);
  
  // Completed items lists isolated per plan
  const [completedWeekly, setCompletedWeekly] = useState<string[]>([]);
  const [completedAnnual, setCompletedAnnual] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'plan' | 'about'>('plan');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  
  const currentWeekNum = getWeekNumber(new Date());
  const currentDayNum = getDayOfYear(new Date());
  const currentMonthNum = new Date().getMonth(); // 0-11
  
  const currentMonthName = MONTHS_DATA[currentMonthNum]?.name || "Janeiro";

  // Accordion lists
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    [currentWeekNum]: true
  });
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    [currentMonthName]: true
  });

  const fullAnnualPlan = generate365DayPlan();

  useEffect(() => {
    loadProgress();
  }, [user.id]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getBibleProgress(user.id);
      
      // Loaded Weekly plan progress
      const weeklyProgress = data.find((p: any) => p.plan_id === 'chronological_weeks');
      setCompletedWeekly(weeklyProgress ? weeklyProgress.completed_items || [] : []);

      // Loaded Annual plan progress
      const annualProgress = data.find((p: any) => p.plan_id === 'chronological');
      setCompletedAnnual(annualProgress ? annualProgress.completed_items || [] : []);
    } catch (err) {
      console.error("Erro ao carregar progresso bíblico:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeeklyDay = async (weekNum: number, dayNum: number) => {
    const itemId = `w${weekNum}_d${dayNum}`;
    const newCompleted = completedWeekly.includes(itemId)
      ? completedWeekly.filter(id => id !== itemId)
      : [...completedWeekly, itemId];
    
    setCompletedWeekly(newCompleted);
    
    try {
      await DatabaseService.updateBibleProgress(user.id, 'chronological_weeks', newCompleted);
    } catch (err) {
      console.error("Erro ao salvar progresso bíblico semanal:", err);
    }
  };

  const toggleWeeklyAll = async (week: ChronologicalWeek) => {
    const weekItemIds = week.days.map(d => `w${week.weekNumber}_d${d.dayNumber}`);
    const allCompletedInWeek = weekItemIds.every(id => completedWeekly.includes(id));
    
    let newCompleted: string[];
    if (allCompletedInWeek) {
      newCompleted = completedWeekly.filter(id => !weekItemIds.includes(id));
    } else {
      newCompleted = [...new Set([...completedWeekly, ...weekItemIds])];
    }
    
    setCompletedWeekly(newCompleted);
    try {
      await DatabaseService.updateBibleProgress(user.id, 'chronological_weeks', newCompleted);
    } catch (err) {
      console.error("Erro ao salvar progresso da semana inteira:", err);
    }
  };

  const toggleWeekExpand = (weekNum: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const toggleAnnualDay = async (dayNum: number) => {
    const itemId = `day_${dayNum}`;
    const newCompleted = completedAnnual.includes(itemId)
      ? completedAnnual.filter(id => id !== itemId)
      : [...completedAnnual, itemId];
    
    setCompletedAnnual(newCompleted);
    
    try {
      await DatabaseService.updateBibleProgress(user.id, 'chronological', newCompleted);
    } catch (err) {
      console.error("Erro ao salvar progresso bíblico diário:", err);
    }
  };

  const toggleAnnualMonthAll = async (month: typeof MONTHS_DATA[0]) => {
    const monthDaysIds: string[] = [];
    for (let d = month.startDay; d <= month.endDay; d++) {
      monthDaysIds.push(`day_${d}`);
    }
    
    const allCompletedInMonth = monthDaysIds.every(id => completedAnnual.includes(id));
    let newCompleted: string[];
    
    if (allCompletedInMonth) {
      newCompleted = completedAnnual.filter(id => !monthDaysIds.includes(id));
    } else {
      newCompleted = [...new Set([...completedAnnual, ...monthDaysIds])];
    }
    
    setCompletedAnnual(newCompleted);
    try {
      await DatabaseService.updateBibleProgress(user.id, 'chronological', newCompleted);
    } catch (err) {
      console.error("Erro ao salvar progresso mensal:", err);
    }
  };

  const jumpToCurrentWeek = () => {
    setExpandedWeeks(prev => ({
      ...prev,
      [currentWeekNum]: true
    }));
    
    setTimeout(() => {
      const el = document.getElementById(`week-card-${currentWeekNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const jumpToCurrentMonth = () => {
    setExpandedMonths(prev => ({
      ...prev,
      [currentMonthName]: true
    }));
    
    setTimeout(() => {
      const el = document.getElementById(`month-card-${currentMonthName}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Switcher and helper metrics
  const activeCompletedCount = planType === 'weekly' ? completedWeekly.length : completedAnnual.length;
  const activeTotalDays = planType === 'weekly' ? 52 * 7 : 365;
  const progressPercentage = Math.round((activeCompletedCount / activeTotalDays) * 100) || 0;

  const weeklyProgressPercentage = Math.round((completedWeekly.length / (52 * 7)) * 100) || 0;
  const annualProgressPercentage = Math.round((completedAnnual.length / 365) * 100) || 0;

  // Render weekly items
  const filteredWeeks = CHRONOLOGICAL_WEEKS.filter(week => {
    const weekItemIds = week.days.map(d => `w${week.weekNumber}_d${d.dayNumber}`);
    const completedInWeek = weekItemIds.filter(id => completedWeekly.includes(id)).length;
    const isWeekFullyCompleted = completedInWeek === 7;
    
    const matchesSearch = searchTerm === '' || 
      `Semana ${week.weekNumber}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      week.days.some(d => d.reading.toLowerCase().includes(searchTerm.toLowerCase()) || d.suggestedBook.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (!matchesSearch) return false;

    if (filterMode === 'completed') return isWeekFullyCompleted;
    if (filterMode === 'pending') return !isWeekFullyCompleted;
    return true;
  });

  // Render annual items flat if we search, else group by month
  const filteredAnnualDays = fullAnnualPlan.filter(day => {
    const isCompleted = completedAnnual.includes(`day_${day.dayNumber}`);
    
    const matchesSearch = searchTerm === '' || 
      `Dia ${day.dayNumber}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.suggestedBook.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;

    if (filterMode === 'completed') return isCompleted;
    if (filterMode === 'pending') return !isCompleted;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      {selectedPlan === null ? (
        /* MENU DE SELEÇÃO DE PLANO */
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none custom-scrollbar">
          {/* Subheader / Welcome message */}
          <div className="text-center py-4 shrink-0">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">
              Planos de Leitura
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
              Selecione o cronograma desejado para sincronizar seu progresso de leitura da Bíblia Sagrada.
            </p>
          </div>

          {/* Os 2 Planos como cartões de destaque */}
          <div className="grid grid-cols-1 gap-5 max-w-md mx-auto w-full">
            {/* CARD A: PLANO CRONOLÓGICO */}
            <motion.div
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedPlan('weekly');
                setPlanType('weekly');
                setActiveTab('plan');
              }}
              className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[170px] relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                    <Calendar size={20} strokeWidth={2.5} />
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-purple-200/50 dark:border-purple-800/50 leading-none">
                    52 Semanas
                  </span>
                </div>
                <h3 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                  Cronológico Semanal
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                  Estudo dinâmico estruturado em 52 semanas para compreender a história bíblica na ordem exata dos acontecimentos.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                  <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Seu progresso:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">{weeklyProgressPercentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${weeklyProgressPercentage}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* CARD B: ANO BÍBLICO */}
            <motion.div
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedPlan('annual');
                setPlanType('annual');
                setActiveTab('plan');
              }}
              className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[170px] relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                    <BookOpen size={20} strokeWidth={2.5} />
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 leading-none">
                    365 Dias
                  </span>
                </div>
                <h3 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                  Ano Bíblico Tradicional
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                  Guia diário consistente cobrindo toda a extensão da Bíblia de Gênesis a Apocalipse, programado para leitura diária.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                  <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Seu progresso:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{annualProgressPercentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${annualProgressPercentage}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* CARD C: DIRETRIZES E CICLOS */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedPlan('about');
              }}
              className="bg-white dark:bg-[#1e293b] rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-100 leading-none uppercase tracking-tight">
                    Diretrizes Estratégicas e Ciclos
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium font-sans">
                    Conheça as prioridades da Associação e o Ciclo de Colheita Geral.
                  </p>
                </div>
              </div>
              <ChevronDown size={16} className="-rotate-90 text-slate-450 dark:text-slate-500" />
            </motion.div>
          </div>
        </div>
      ) : selectedPlan === 'about' ? (
        /* VISUALIZAÇÃO DE DIRETRIZES E CICLOS */
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-10 px-6 pt-5 space-y-6 custom-scrollbar">
            {/* COMPREHENSIVE DIGITAL BROCHURE VIEW */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3.5xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Igreja Adventista do Sétimo Dia
                </span>
                <div className="flex flex-col items-center mt-5 mb-5 select-none">
                  <div className="grid grid-cols-2 gap-4 border-r border-slate-200/50 pr-4 pl-4">
                    <div className="w-6 h-6 rounded-full bg-red-500 shadow-md"></div>
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[21px] border-b-blue-500 shadow-md"></div>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-4 leading-none uppercase">
                    Leitura Bíblica
                  </h2>
                  <p className="text-sm font-light italic text-slate-400 dark:text-slate-500 my-1 font-serif">em</p>
                  <h3 className="text-xs font-black tracking-[0.2em] text-purple-600 dark:text-purple-400 uppercase leading-none">
                    Ordem Cronológica
                  </h3>
                  <div className="grid grid-cols-2 gap-4 border-r border-slate-200/50 pr-4 pl-4 mt-4">
                    <div className="w-6 h-6 bg-amber-500 rounded-t-full rotate-90 shadow-md"></div>
                    <div className="w-6 h-6 bg-emerald-500 rounded-md shadow-md"></div>
                  </div>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">
                  Associação Sul-Mato-Grossense
                </p>
              </div>

              {/* PRIORITY STATEMENTS DESCRIPTION BLOCK */}
              <div className="pt-6 space-y-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                  Prioridades Estratégicas
                </h3>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50/20 dark:bg-red-950/10 border border-red-100/50 dark:border-red-950/30">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-md font-bold">●</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-red-700 dark:text-red-400 uppercase tracking-wider">Identidade</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium font-sans">
                      Fortalecer aquilo que somos, firmando-nos na convicção e verdade bíblica.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/30">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md font-bold text-center">▲</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wider">Liderança</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium font-sans">
                      Ensinar enquanto formamos, capacitando os sentinelas para um serviço de excelência.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/30">
                  <div className="w-8 h-8 rounded-t-full rotate-90 bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md font-bold"></div>
                  <div>
                    <h4 className="font-extrabold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider">Novas Gerações</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium font-sans">
                      Guiar enquanto integramos, conectando os juvenis aos pilares eternos da fé.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/30">
                  <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center text-white shrink-0 shadow-md font-bold">■</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Discipulado</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium font-sans">
                      Cuidar enquanto fazemos, promovendo relações profundas com Cristo e comunidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HARVEST SEASONS BLOCK */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3.5xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
                <Sparkles size={14} className="text-purple-500" /> Ciclo de Colheita Geral
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-white dark:border-[#1e293b] shadow-sm"></span>
                  <div className="ml-1">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500"><Heart size={14} fill="currentColor" /></span>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Paixão (Jan-Abr)</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Devoção profunda pessoal, estudo contínuo e revigoramento espiritual individual.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-[#1e293b] shadow-sm"></span>
                  <div className="ml-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500"><Flag size={14} /></span>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Calebe (Mai-Jul)</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Missão active na prática, voluntariado social e evangelismo direto das férias.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-[#1e293b] shadow-sm"></span>
                  <div className="ml-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500"><Leaf size={14} /></span>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Primavera (Ago-Set)</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Batismo de primavera, colheitas públicas de fé e renovo do compromisso perante a comunidade.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-[#1e293b] shadow-sm"></span>
                  <div className="ml-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500"><Award size={14} /></span>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Reencontro (Out-Dez)</h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Acolhimento especial, resgate de membros e consagração final do ano.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DETALHE DO PLANO SELECIONADO */
        <>
          {/* PROGRESS SCORECARD PANEL */}
          <div className="bg-white dark:bg-slate-900 px-6 pb-4 pt-1.5 border-b border-slate-50 dark:border-slate-800/50 shrink-0">
            <div className="bg-slate-50 dark:bg-[#1e293b] rounded-2.5xl p-4 border border-slate-100 dark:border-[#1e293b]/70">
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Seu Progresso ({planType === 'weekly' ? 'Semanal' : 'Diário'})
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-450 mt-0.5">
                    {activeCompletedCount} de {activeTotalDays} {planType === 'weekly' ? 'dias' : 'dias'} concluídos
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{progressPercentage}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* CONTENT PORT VIEWPORT */}
          <div className="flex-1 overflow-y-auto pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${planType}-plan-tab`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-6 space-y-4 pt-4"
              >
              {/* SEARCH FILTERS BLOCK */}
              <div className="bg-white dark:bg-slate-900 rounded-2.5xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm mt-1 space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder={planType === 'weekly' ? "Buscar lição ou livro..." : "Buscar por dia, livro..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-purple-400 dark:focus:border-purple-400 transition-colors"
                  />
                </div>

                <div className="flex gap-1.5 pt-1 overflow-x-auto select-none custom-scrollbar">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                      filterMode === 'all' 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-extrabold' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    Todos ({planType === 'weekly' ? CHRONOLOGICAL_WEEKS.length : 365})
                  </button>
                  <button
                    onClick={() => setFilterMode('pending')}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                      filterMode === 'pending' 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-extrabold' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    Em Aberto
                  </button>
                  <button
                    onClick={() => setFilterMode('completed')}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                      filterMode === 'completed' 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-extrabold' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    Concluídos
                  </button>
                </div>
              </div>

              {/* RECOMMENDED FOR TODAY CARD banner */}
              <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 hover:to-indigo-900 text-white rounded-3xl p-5 border border-purple-500/10 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {planType === 'weekly' ? (
                    <>
                      <div>
                        <span className="bg-purple-500/30 text-purple-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border border-purple-500/20">
                          Recomendado Hoje
                        </span>
                        <h3 className="text-base font-black tracking-tight mt-2.5">Semana {currentWeekNum.toString().padStart(2, '0')}</h3>
                        <p className="text-slate-300 text-xs mt-1 max-w-[280px]">
                          Acompanhe o cronograma sincronizado da semana atual do ano.
                        </p>
                      </div>
                      <button 
                        onClick={jumpToCurrentWeek}
                        className="bg-white text-purple-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                      >
                        <Compass size={14} /> Ir para Semana
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="bg-purple-500/30 text-purple-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border border-purple-500/20">
                          Recomendado Hoje
                        </span>
                        <h3 className="text-base font-black tracking-tight mt-2.5">Dia {currentDayNum} do Ano</h3>
                        <p className="text-slate-300 text-xs mt-1 max-w-[280px]">
                          Leitura diária do Ano Bíblico. Suas leituras diárias estão em dia?
                        </p>
                      </div>
                      <button 
                        onClick={jumpToCurrentMonth}
                        className="bg-white text-purple-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                      >
                        <Compass size={14} /> Ir Para Mês Atual
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* RENDER VIEW ACCORDIONS */}
              <div className="space-y-3.5 pt-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 opacity-40">
                    <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Carregando leituras...</p>
                  </div>
                ) : planType === 'weekly' ? (
                  // WEEKLY PLAN LAYOUT
                  filteredWeeks.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      <History size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-2.5" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma semana encontrada</p>
                    </div>
                  ) : (
                    filteredWeeks.map((week) => {
                      const isExpanded = !!expandedWeeks[week.weekNumber];
                      const weekItemIds = week.days.map(d => `w${week.weekNumber}_d${d.dayNumber}`);
                      const completedInWeek = weekItemIds.filter(id => completedWeekly.includes(id)).length;
                      const isWeekFullyCompleted = completedInWeek === 7;
                      
                      return (
                        <div 
                          id={`week-card-${week.weekNumber}`}
                          key={week.weekNumber}
                          className={`bg-white dark:bg-[#1e293b] rounded-3xl border transition-all ${
                            isWeekFullyCompleted 
                              ? 'border-emerald-100 dark:border-emerald-950/40 shadow-sm' 
                              : week.weekNumber === currentWeekNum 
                                ? 'border-purple-300 dark:border-purple-900 shadow-md ring-1 ring-purple-100 dark:ring-purple-950/20'
                                : 'border-slate-100 dark:border-slate-800 shadow-sm'
                          }`}
                        >
                          {/* HEAD CARD */}
                          <div 
                            onClick={() => toggleWeekExpand(week.weekNumber)}
                            className="p-4 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner transition-colors ${
                                isWeekFullyCompleted 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                  : week.weekNumber === currentWeekNum
                                    ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}>
                                W{week.weekNumber.toString().padStart(2, '0')}
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                                    Semana {week.weekNumber.toString().padStart(2, '0')}
                                  </h4>
                                  {week.weekNumber === currentWeekNum && (
                                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest leading-none">
                                      Hoje
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                                  {completedInWeek} de 7 dias completos
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                <div 
                                  className={`h-full rounded-full transition-all ${isWeekFullyCompleted ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                  style={{ width: `${(completedInWeek / 7) * 100}%` }}
                                />
                              </div>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWeeklyAll(week);
                                }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                  isWeekFullyCompleted 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                    : 'border-2 border-slate-200 dark:border-slate-700 text-slate-300 hover:text-purple-500 hover:border-purple-300'
                                }`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              
                              <div className="text-slate-400 dark:text-slate-500 pl-1">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* DETAILS */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-1 duration-200">
                              <div className="space-y-2 pt-3">
                                {week.days.map((day) => {
                                  const isDayCompleted = completedWeekly.includes(`w${week.weekNumber}_d${day.dayNumber}`);
                                  return (
                                    <div 
                                      key={day.dayNumber}
                                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                        isDayCompleted 
                                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-950/30' 
                                          : 'bg-slate-50/40 dark:bg-slate-800/30 border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button
                                          onClick={() => toggleWeeklyDay(week.weekNumber, day.dayNumber)}
                                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                            isDayCompleted 
                                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                                          }`}
                                        >
                                          {isDayCompleted ? (
                                            <Check size={16} strokeWidth={3} />
                                          ) : (
                                            <span className="text-[10px] font-black">{day.dayNumber}</span>
                                          )}
                                        </button>
                                        
                                        <div className="flex-1 min-w-0 pr-2">
                                          <p className={`text-xs font-bold leading-tight uppercase transition-colors ${
                                            isDayCompleted 
                                              ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-70' 
                                              : 'text-slate-700 dark:text-slate-200'
                                          }`}>
                                            Dia {day.dayNumber}
                                          </p>
                                          <p className={`text-[11px] mt-0.5 tracking-tight font-extrabold truncate ${
                                            isDayCompleted 
                                              ? 'text-emerald-500 dark:text-emerald-500' 
                                              : 'text-slate-500 dark:text-slate-400'
                                          }`}>
                                            {day.reading}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => onJumpToBible && onJumpToBible(day.suggestedBook, 1)}
                                        className={`p-2.5 rounded-xl flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider transition-all hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95 ${
                                          isDayCompleted
                                            ? 'text-emerald-500 hover:text-emerald-600'
                                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                                        }`}
                                      >
                                        <span className="hidden sm:inline">Ler agora</span>
                                        <BookOpen size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  // ANNUAL PLAN LAYOUT
                  searchTerm !== '' ? (
                    // Flat search list for annual days
                    filteredAnnualDays.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <History size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-2.5" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Nenhum dia de leitura correspondente</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredAnnualDays.map((day) => {
                          const isDayCompleted = completedAnnual.includes(`day_${day.dayNumber}`);
                          return (
                            <div 
                              key={day.dayNumber}
                              className={`flex items-center justify-between p-3 bg-white dark:bg-[#1e293b] rounded-2.5xl border transition-all ${
                                isDayCompleted 
                                  ? 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/5' 
                                  : 'border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => toggleAnnualDay(day.dayNumber)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                    isDayCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                                  }`}
                                >
                                  {isDayCompleted ? (
                                    <Check size={16} strokeWidth={3} />
                                  ) : (
                                    <span className="text-[10px] font-black">{day.dayNumber}</span>
                                  )}
                                </button>
                                
                                <div className="flex-1 min-w-0 pr-2">
                                  <p className={`text-xs font-bold leading-tight uppercase transition-colors ${
                                    isDayCompleted 
                                      ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-70' 
                                      : 'text-slate-700 dark:text-slate-200'
                                  }`}>
                                    Dia {day.dayNumber}
                                  </p>
                                  <p className={`text-[11px] mt-0.5 tracking-tight font-extrabold truncate ${
                                    isDayCompleted 
                                      ? 'text-emerald-500' 
                                      : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {day.reading}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => onJumpToBible && onJumpToBible(day.suggestedBook, 1)}
                                className={`p-2.5 rounded-xl flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider transition-all hover:bg-white dark:hover:bg-slate-850 active:scale-95 ${
                                  isDayCompleted
                                    ? 'text-emerald-500'
                                    : 'text-purple-600 dark:text-purple-400'
                                }`}
                              >
                                <span className="hidden sm:inline">Ler agora</span>
                                <BookOpen size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    // Grouped month-by-month accordion list for annual plan
                    MONTHS_DATA.map((month) => {
                      const isExpanded = !!expandedMonths[month.name];
                      
                      // Calculate days inside this month
                      const monthDaysRange: number[] = [];
                      for (let d = month.startDay; d <= month.endDay; d++) {
                        monthDaysRange.push(d);
                      }
                      
                      const completedInMonth = monthDaysRange.filter(d => completedAnnual.includes(`day_${d}`)).length;
                      const monthTotalDays = month.endDay - month.startDay + 1;
                      const isMonthFullyCompleted = completedInMonth === monthTotalDays;
                      const isCurrentMonth = month.name === currentMonthName;
                      
                      return (
                        <div 
                          id={`month-card-${month.name}`}
                          key={month.name}
                          className={`bg-white dark:bg-[#1e293b] rounded-3xl border transition-all ${
                            isMonthFullyCompleted 
                              ? 'border-emerald-100 dark:border-emerald-950/40 shadow-sm' 
                              : isCurrentMonth 
                                ? 'border-purple-300 dark:border-purple-900 shadow-md ring-1 ring-purple-100 dark:ring-purple-950/20'
                                : 'border-slate-100 dark:border-slate-800 shadow-sm'
                          }`}
                        >
                          {/* HEAD CARD */}
                          <div 
                            onClick={() => setExpandedMonths(prev => ({ ...prev, [month.name]: !prev[month.name] }))}
                            className="p-4 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner transition-colors uppercase ${
                                isMonthFullyCompleted 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                  : isCurrentMonth
                                    ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}>
                                {month.name.substring(0, 3)}
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">
                                    {month.name}
                                  </h4>
                                  {isCurrentMonth && (
                                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest leading-none">
                                      Atual
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                                  {completedInMonth} de {monthTotalDays} dias concluidos
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                <div 
                                  className={`h-full rounded-full transition-all ${isMonthFullyCompleted ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                  style={{ width: `${(completedInMonth / monthTotalDays) * 100}%` }}
                                />
                              </div>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAnnualMonthAll(month);
                                }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                  isMonthFullyCompleted 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                    : 'border-2 border-slate-200 dark:border-slate-700 text-slate-300 hover:text-purple-500 hover:border-purple-300'
                                }`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              
                              <div className="text-slate-400 dark:text-slate-500 pl-1">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* MONTH DAYS DETAILS LIST */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-1 duration-200">
                              <div className="space-y-2 pt-3">
                                {monthDaysRange.map((dayNum) => {
                                  const day = fullAnnualPlan[dayNum - 1];
                                  if (!day) return null;
                                  
                                  const isDayCompleted = completedAnnual.includes(`day_${day.dayNumber}`);
                                  const isToday = day.dayNumber === currentDayNum;
                                  
                                  return (
                                    <div 
                                      key={day.dayNumber}
                                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                        isDayCompleted 
                                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-950/30' 
                                          : isToday
                                            ? 'bg-purple-50/10 dark:bg-purple-950/5 border-purple-100 dark:border-purple-900/40'
                                            : 'bg-slate-50/40 dark:bg-slate-800/30 border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button
                                          onClick={() => toggleAnnualDay(day.dayNumber)}
                                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                            isDayCompleted 
                                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'
                                          }`}
                                        >
                                          {isDayCompleted ? (
                                            <Check size={16} strokeWidth={3} />
                                          ) : (
                                            <span className="text-[10px] font-black">{day.dayNumber}</span>
                                          )}
                                        </button>
                                        
                                        <div className="flex-1 min-w-0 pr-2">
                                          <div className="flex items-center gap-2">
                                            <p className={`text-xs font-bold leading-tight uppercase transition-colors ${
                                              isDayCompleted 
                                                ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-70' 
                                                : isToday
                                                  ? 'text-purple-600 dark:text-purple-400'
                                                  : 'text-slate-700 dark:text-slate-200'
                                            }`}>
                                              Dia {day.dayNumber}
                                            </p>
                                            {isToday && (
                                              <span className="bg-purple-100 dark:bg-purple-900/40 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                Hoje
                                              </span>
                                            )}
                                          </div>
                                          <p className={`text-[11px] mt-0.5 tracking-tight font-extrabold truncate ${
                                            isDayCompleted 
                                              ? 'text-emerald-500' 
                                              : isToday
                                                ? 'text-[#6366f1] dark:text-[#818cf8]'
                                                : 'text-slate-500 dark:text-slate-400'
                                          }`}>
                                            {day.reading}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => onJumpToBible && onJumpToBible(day.suggestedBook, 1)}
                                        className={`p-2.5 rounded-xl flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider transition-all hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95 ${
                                          isDayCompleted
                                            ? 'text-emerald-500 hover:text-emerald-600'
                                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                                        }`}
                                      >
                                        <span className="hidden sm:inline">Ler agora</span>
                                        <BookOpen size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </>
      )}
    </div>
  );
});

export default BibleReading;
