
import React, { useState, useEffect } from 'react';
import { AuthUser } from '@/types';
import { DatabaseService } from '@/db';
import { BookOpen, CheckCircle2, Circle, ChevronRight, History, Loader2, Search, ChevronLeft } from 'lucide-react';

interface BibleReadingProps {
  user: AuthUser;
  onBack: () => void;
}

interface ReadingItem {
  id: string;
  title: string;
  reference: string;
  order: number;
}

const CHRONOLOGICAL_PLAN: ReadingItem[] = [
  { id: 'c1', title: 'A Criação e o Início', reference: 'Gênesis 1-11', order: 1 },
  { id: 'c2', title: 'O Homem de Uz', reference: 'Jó 1-42', order: 2 },
  { id: 'c3', title: 'A Aliança com os Patriarcas', reference: 'Gênesis 12-50', order: 3 },
  { id: 'c4', title: 'A Saída do Egito', reference: 'Êxodo 1-18', order: 4 },
  { id: 'c5', title: 'A Lei no Sinai', reference: 'Êxodo 19-40; Levítico', order: 5 },
  { id: 'c6', title: 'A Caminhada no Deserto', reference: 'Números; Deuteronômio', order: 6 },
  { id: 'c7', title: 'A Conquista de Canaã', reference: 'Josué', order: 7 },
  { id: 'c8', title: 'O Tempo dos Juízes', reference: 'Juízes; Rute', order: 8 },
  { id: 'c9', title: 'O Início da Monarquia', reference: '1 Samuel', order: 9 },
  { id: 'c10', title: 'O Reinado de Davi', reference: '2 Samuel; 1 Crônicas; Salmos', order: 10 },
  { id: 'c11', title: 'O Reinado de Salomão', reference: '1 Reis 1-11; 2 Crônicas 1-9; Provérbios; Eclesiastes', order: 11 },
  { id: 'c12', title: 'O Reino Dividido', reference: '1 Reis 12-22; 2 Reis; 2 Crônicas 10-36', order: 12 },
  { id: 'c13', title: 'Profetas do Exílio', reference: 'Isaías; Jeremias; Ezequiel; Daniel', order: 13 },
  { id: 'c14', title: 'O Retorno do Exílio', reference: 'Esdras; Neemias; Ester; Ageu; Zacarias; Malaquias', order: 14 },
  { id: 'c15', title: 'A Vida de Jesus', reference: 'Mateus; Marcos; Lucas; João', order: 15 },
  { id: 'c16', title: 'A Igreja Primitiva', reference: 'Atos', order: 16 },
  { id: 'c17', title: 'As Cartas de Paulo', reference: 'Romanos a Filemon', order: 17 },
  { id: 'c18', title: 'As Cartas Gerais', reference: 'Hebreus a Judas', order: 18 },
  { id: 'c19', title: 'A Revelação Final', reference: 'Apocalipse', order: 19 },
];

const BibleReading: React.FC<BibleReadingProps> = ({ user, onBack }) => {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'cronologica'>('cronologica');

  useEffect(() => {
    loadProgress();
  }, [user.id]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getBibleProgress(user.id);
      const planProgress = data.find((p: any) => p.plan_id === 'chronological');
      if (planProgress) {
        setCompletedItems(planProgress.completed_items || []);
      }
    } catch (err) {
      console.error("Erro ao carregar progresso bíblico:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    const newCompleted = completedItems.includes(itemId)
      ? completedItems.filter(id => id !== itemId)
      : [...completedItems, itemId];
    
    setCompletedItems(newCompleted);
    
    try {
      await DatabaseService.updateBibleProgress(user.id, 'chronological', newCompleted);
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    }
  };

  const filteredItems = CHRONOLOGICAL_PLAN.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const progressPercentage = Math.round((completedItems.length / CHRONOLOGICAL_PLAN.length) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* PROGRESSO */}
      <div className="bg-white px-6 pt-4 pb-6 shadow-sm shrink-0">
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso Total</span>
            <span className="text-lg font-black text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
            {completedItems.length} de {CHRONOLOGICAL_PLAN.length} marcos concluídos
          </p>
        </div>
      </div>

      {/* CATEGORIAS E BUSCA */}
      <div className="px-6 pt-4 pb-2 shrink-0">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setActiveCategory('cronologica')}
            className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeCategory === 'cronologica' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            <History size={14} /> Ordem Cronológica
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Buscar livro ou marco..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 transition-colors"
          />
        </div>
      </div>

      {/* LISTA DE LEITURA */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando Plano...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum marco encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {filteredItems.map((item) => {
              const isCompleted = completedItems.includes(item.id);
              return (
                <button 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all active:scale-[0.98] ${isCompleted ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-50 shadow-sm'}`}
                >
                  <div className={`shrink-0 transition-colors ${isCompleted ? 'text-blue-600' : 'text-slate-200'}`}>
                    {isCompleted ? <CheckCircle2 size={28} fill="currentColor" className="text-white" /> : <Circle size={28} />}
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <h4 className={`font-black text-sm uppercase tracking-tight leading-tight truncate ${isCompleted ? 'text-blue-900' : 'text-slate-700'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isCompleted ? 'text-blue-400' : 'text-slate-400'}`}>
                      {item.reference}
                    </p>
                  </div>

                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isCompleted ? 'bg-blue-200/50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleReading;
