
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage, Devotional, ThreeCluesQuestion, SpecialtyStudy } from '@/types';

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SpecialtyDBV {
  id?: number;
  created_at?: string;
  ID: string;
  Nome: string;
  Questoes: string;
  Sigla: string;
  Imagem: string;
  Categoria: string;
  Nivel: string;
  Ano: string;
  Origem: string;
  Like: boolean;
  Cor: string;
}

export interface CounselorDB {
  id?: string | number;
  name: string;
  created_at?: string;
}

export interface GameConfig {
  id: number;
  quiz_override: boolean;
  memory_override: boolean;
  specialty_override: boolean;
  three_clues_override: boolean;
  puzzle_override: boolean;
}

export const DatabaseService = {
  // --- CHAT ---
  async getMessages(unit: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('unit', unit)
      .order('created_at', { ascending: false }) 
      .limit(50);
    
    if (error) throw error;
    // Reverse to show oldest first (standard chat behavior)
    return ((data || []) as ChatMessage[]).reverse();
  },

  async sendMessage(msg: ChatMessage) {
    const payload = {
      sender_id: String(msg.sender_id),
      sender_name: msg.sender_name,
      sender_photo: msg.sender_photo || '',
      text: msg.text,
      unit: msg.unit,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('messages').insert([payload]);
    if (error) {
      console.error("Erro ao enviar:", error);
      throw error;
    }
  },

  // Escuta TODAS as mensagens e deixa o App filtrar
  subscribeAllMessages(callback: (msg: ChatMessage) => void, onStatus?: (status: string) => void) {
    const channelId = `chat_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, payload => {
        console.log("Evento Postgres recebido!", payload);
        callback(payload.new as ChatMessage);
      })
      .subscribe((status) => {
        console.log(`Status da Conexão Realtime (${channelId}):`, status);
        if (onStatus) onStatus(status);
      });
      
    return channel;
  },

  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from('members').select('*');
    if (error) {
      console.error("Erro ao buscar membros:", error);
      throw error;
    }
    return (data || []) as Member[];
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    this.getMembers().then(callback).catch(err => console.error("Erro no subscribeMembers:", err));
    return supabase
      .channel('members_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        this.getMembers().then(callback).catch(err => console.error("Erro no update realtime members:", err));
      })
      .subscribe();
  },

  async addMember(member: Member) {
    const { error } = await supabase.from('members').insert([member]);
    if (error) {
      console.error("Erro ao adicionar membro:", error);
      throw error;
    }
  },

  async updateMember(member: Member) {
    await supabase.from('members').update(member).eq('id', member.id);
  },

  async deleteMember(id: string) {
    await supabase.from('members').delete().eq('id', id);
  },

  // --- CONSELHEIROS ---
  async getCounselors(): Promise<CounselorDB[]> {
    const { data, error } = await supabase
      .from('conselheiros')
      .select('id, created_at, name:nome') 
      .order('nome', { ascending: true });
    
    if (error) return [];
    return data as any[];
  },

  async addCounselor(name: string) {
    await supabase.from('conselheiros').insert([{ nome: name }]);
  },

  async updateCounselor(id: string | number, name: string) {
    await supabase.from('conselheiros').update({ nome: name }).eq('id', id);
  },

  async deleteCounselor(id: string | number) {
    await supabase.from('conselheiros').delete().eq('id', id);
  },

  subscribeCounselors(callback: (counselors: CounselorDB[]) => void) {
    this.getCounselors().then(callback);
    return supabase
      .channel('conselheiros_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conselheiros' }, () => {
        this.getCounselors().then(callback);
      })
      .subscribe();
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    return (data || []) as Announcement[];
  },

  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    this.getAnnouncements().then(callback);
    return supabase
      .channel('announcements_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        this.getAnnouncements().then(callback);
      })
      .subscribe();
  },

  async addAnnouncement(ann: Announcement) {
    await supabase.from('announcements').insert([ann]);
  },

  async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  },

  // --- ESPECIALIDADES ---
  async getSpecialties(): Promise<SpecialtyDBV[]> {
    const { data, error } = await supabase.from('EspecialidadesDBV').select('*').order('Nome', { ascending: true });
    return (data || []) as SpecialtyDBV[];
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDBV[]) => void) {
    this.getSpecialties().then(callback);
    return supabase
      .channel('specialties_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'EspecialidadesDBV' }, () => {
        this.getSpecialties().then(callback);
      })
      .subscribe();
  },

  async addSpecialty(spec: SpecialtyDBV) {
    await supabase.from('EspecialidadesDBV').insert([spec]);
  },

  async updateSpecialty(spec: SpecialtyDBV) {
    await supabase.from('EspecialidadesDBV').update(spec).eq('id', spec.id);
  },

  async deleteSpecialty(id: number) {
    await supabase.from('EspecialidadesDBV').delete().eq('id', id);
  },

  async seedSpecialties(specialties: Omit<SpecialtyDBV, 'id' | 'created_at'>[]) {
    await supabase.from('EspecialidadesDBV').insert(specialties);
  },

  // --- CONFIGURAÇÕES DE JOGOS ---
  async getGameConfigs(): Promise<GameConfig | null> {
    const { data } = await supabase.from('game_configs').select('*').eq('id', 1).single();
    return data as GameConfig;
  },

  async updateGameConfig(updates: Partial<GameConfig>) {
    await supabase.from('game_configs').update(updates).eq('id', 1);
  },

  subscribeGameConfigs(callback: (config: GameConfig) => void) {
    this.getGameConfigs().then(config => config && callback(config));
    return supabase
      .channel('game_configs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_configs' }, (payload) => {
        callback(payload.new as GameConfig);
      })
      .subscribe();
  },

  // --- QUESTÕES DO QUIZ ---
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    const { data } = await supabase.from('quiz_questions').select('*').order('created_at', { ascending: false });
    return (data || []).map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer ?? q.correctAnswer 
    })) as QuizQuestion[];
  },

  async addQuizQuestion(q: Omit<QuizQuestion, 'id'>) {
    const payload = {
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer
    };
    await supabase.from('quiz_questions').insert([payload]);
  },

  async updateQuizQuestion(q: QuizQuestion) {
    const payload = {
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer
    };
    await supabase.from('quiz_questions').update(payload).eq('id', q.id);
  },

  async deleteQuizQuestion(id: string) {
    await supabase.from('quiz_questions').delete().eq('id', id);
  },

  async seedQuizQuestions(questions: Omit<QuizQuestion, 'id'>[]) {
    const payload = questions.map(q => ({
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer
    }));
    await supabase.from('quiz_questions').insert(payload);
  },

  subscribeQuizQuestions(callback: (questions: QuizQuestion[]) => void) {
    this.getQuizQuestions().then(callback);
    return supabase
      .channel('quiz_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_questions' }, () => {
        this.getQuizQuestions().then(callback);
      })
      .subscribe();
  },

  // --- USUÁRIOS ---
  async getUsers(): Promise<AuthUser[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
    return (data || []) as AuthUser[];
  },

  async addUser(user: AuthUser) {
    // Removemos o campo 'counselor' pois ele pertence à tabela 'members', não 'users'
    const { counselor, ...userPayload } = user;
    const { error } = await supabase.from('users').upsert([userPayload]);
    if (error) {
      console.error("Erro ao adicionar usuário:", error);
      throw error;
    }
  },

  async createChallenge(challenge: Challenge1x1) {
    await supabase.from('challenges').insert([challenge]);
  },

  async updateChallenge(id: string, updates: Partial<Challenge1x1>) {
    await supabase.from('challenges').update(updates).eq('id', id);
  },

  subscribeChallenges(callback: (challenge: Challenge1x1) => void) {
    const channelId = `challenges_global`;
    return supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'challenges' 
      }, payload => {
        callback(payload.new as Challenge1x1);
      })
      .on('broadcast', { event: 'new_challenge' }, payload => {
        callback(payload.payload as Challenge1x1);
      })
      .subscribe();
  },

  async broadcastChallenge(challenge: Challenge1x1) {
    await supabase.channel('challenges_global').send({
      type: 'broadcast',
      event: 'new_challenge',
      payload: challenge
    });
  },

  // --- PRESENÇA / DIGITANDO ---
  subscribeTyping(unit: string, onUpdate: (typingUsers: {id: string, name: string}[]) => void) {
    const channel = supabase.channel(`typing_${unit}`, {
      config: {
        presence: {
          key: unit,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: {id: string, name: string}[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.isTyping) {
              typing.push({ id: p.id, name: p.name });
            }
          });
        });
        onUpdate(typing);
      })
      .subscribe();

    return channel;
  },

  async setTypingStatus(channel: any, user: AuthUser, isTyping: boolean) {
    await channel.track({
      id: user.id,
      name: user.name,
      isTyping: isTyping,
      lastSeen: new Date().toISOString()
    });
  },

  // --- LEITURA BÍBLICA ---
  async getBibleProgress(userId: string): Promise<any[]> {
    const { data } = await supabase.from('bible_reading').select('*').eq('user_id', userId);
    return data || [];
  },

  async updateBibleProgress(userId: string, planId: string, completedItems: string[]) {
    await supabase.from('bible_reading').upsert([{
      user_id: userId,
      plan_id: planId,
      completed_items: completedItems,
      last_updated: new Date().toISOString()
    }], { onConflict: 'user_id,plan_id' });
  },

  // --- BÍBLIA COMPLETA ---
  async getBibleBooks(): Promise<string[]> {
    // Querying only the first verse of the first chapter of each book to get the list of books efficiently
    const { data, error } = await supabase
      .from('Biblia_Completa')
      .select('book_name')
      .eq('chapter', '1')
      .eq('verse_number', '1')
      .order('id', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar livros:", error);
      return [];
    }
    if (!data) return [];
    return data.map(d => d.book_name);
  },

  async getBibleChapters(book: string): Promise<number[]> {
    const { data, error } = await supabase
      .from('Biblia_Completa')
      .select('chapter')
      .eq('book_name', book)
      .eq('verse_number', '1') // One row per chapter
      .order('id', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar capítulos:", error);
      return [];
    }
    if (!data) return [];
    const chapters = data.map(d => parseInt(d.chapter));
    return Array.from(new Set(chapters)).sort((a, b) => a - b);
  },

  async getBibleVerses(book: string, chapter: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('Biblia_Completa')
      .select('verse_number, text')
      .eq('book_name', book)
      .eq('chapter', String(chapter))
      .order('id', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar versículos:", error);
      return [];
    }
    return (data || []).map(v => ({
      Versiculo: parseInt(v.verse_number),
      Texto: v.text
    }));
  },

  async searchBible(term: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('Biblia_Completa')
      .select('book_name, chapter, verse_number, text')
      .ilike('text', `%${term}%`)
      .limit(50);
    
    if (error) {
      console.error("Erro na busca bíblica:", error);
      return [];
    }
    return (data || []).map(v => ({
      Livro: v.book_name,
      Capitulo: parseInt(v.chapter),
      Versiculo: parseInt(v.verse_number),
      Texto: v.text
    }));
  },

  async getVerseOfTheDay(): Promise<any> {
    // Deterministic seed based on date (changes at 7 AM)
    const now = new Date();
    // Adjust by 7 hours so it changes at 7 AM
    const adjusted = new Date(now.getTime() - (7 * 60 * 60 * 1000));
    const dateStr = adjusted.toISOString().split('T')[0];
    
    // Simple hash of the date string to get a deterministic number
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Get total count of verses
    const { count } = await supabase
      .from('Biblia_Completa')
      .select('*', { count: 'exact', head: true });
    
    const total = count || 31102;
    const offset = seed % total;

    // Fetch the verse at that offset
    const { data } = await supabase
      .from('Biblia_Completa')
      .select('book_name, chapter, verse_number, text')
      .range(offset, offset);
    
    if (data && data.length > 0) {
      return {
        livro: data[0].book_name,
        cap: parseInt(data[0].chapter),
        ver: parseInt(data[0].verse_number),
        texto: data[0].text
      };
    }
    return null;
  },

  async getDevotional(): Promise<Devotional | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Erro ao buscar devocional:", error);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  async getDevotionalHistory(limit: number = 10): Promise<Devotional[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Erro ao buscar histórico de devocionais:", error);
      return [];
    }
    return data || [];
  },

  async getAllDevotionals(): Promise<Devotional[]> {
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .order('scheduled_for', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar todos os devocionais:", error);
      return [];
    }
    return data || [];
  },

  async createDevotional(devotional: Omit<Devotional, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('devotionals')
      .insert([devotional]);
    
    if (error) throw error;
  },

  async deleteDevotional(id: number): Promise<void> {
    const { error } = await supabase
      .from('devotionals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- JOGO 3 DICAS ---
  async getThreeCluesQuestions(): Promise<ThreeCluesQuestion[]> {
    const { data } = await supabase.from('three_clues_questions').select('*').order('created_at', { ascending: false });
    return (data || []) as ThreeCluesQuestion[];
  },

  async addThreeCluesQuestion(q: Omit<ThreeCluesQuestion, 'id'>) {
    console.log("Tentando salvar questão:", q);
    const { error } = await supabase.from('three_clues_questions').insert([q]);
    if (error) {
      console.error("Erro Supabase (add):", error);
      throw error;
    }
  },

  async updateThreeCluesQuestion(q: ThreeCluesQuestion) {
    const { id, created_at, ...updates } = q;
    const { error } = await supabase.from('three_clues_questions').update(updates).eq('id', id);
    if (error) {
      console.error("Erro Supabase (update):", error);
      throw error;
    }
  },

  async deleteThreeCluesQuestion(id: string) {
    const { error } = await supabase.from('three_clues_questions').delete().eq('id', id);
    if (error) {
      console.error("Erro Supabase (delete):", error);
      throw error;
    }
  },

  async seedThreeCluesQuestions(questions: Omit<ThreeCluesQuestion, 'id'>[]) {
    console.log("Tentando importar questões:", questions);
    const { error } = await supabase.from('three_clues_questions').insert(questions);
    if (error) {
      console.error("Erro Supabase (seed):", error);
      throw error;
    }
  },

  async seedHistoryStudy() {
    const study: Omit<SpecialtyStudy, 'id'> = {
      name: "História do Velho Testamento",
      pdfurl: "https://drive.google.com/file/d/1c5LZ2VHm5mPY_LjszYVA1QsuwBTSSvtX/view",
      puzzle_image_url: "https://picsum.photos/seed/bible-history/800/800",
      category: "Bíblia",
      questions: [
        {
          question: "Qual é o primeiro livro da Bíblia?",
          options: ["Êxodo", "Gênesis", "Levítico", "Números"],
          correct_answer: 1
        },
        {
          question: "Quem construiu a arca para sobreviver ao dilúvio?",
          options: ["Abraão", "Isaque", "Noé", "Jacó"],
          correct_answer: 2
        },
        {
          question: "Qual profeta liderou o povo de Israel na saída do Egito?",
          options: ["Josué", "Moisés", "Arão", "Calebe"],
          correct_answer: 1
        },
        {
          question: "Quem derrotou o gigante Golias com uma funda e uma pedra?",
          options: ["Saul", "Salomão", "Davi", "Sansão"],
          correct_answer: 2
        },
        {
          question: "Qual rei de Israel era conhecido por sua imensa sabedoria?",
          options: ["Davi", "Salomão", "Saul", "Roboão"],
          correct_answer: 1
        },
        {
          question: "Quem foi vendido por seus irmãos e se tornou governador no Egito?",
          options: ["Benjamim", "José", "Rúben", "Judá"],
          correct_answer: 1
        },
        {
          question: "Qual profeta foi levado ao céu em um redemoinho com um carro de fogo?",
          options: ["Eliseu", "Elias", "Isaías", "Jeremias"],
          correct_answer: 1
        },
        {
          question: "Quem foi o sucessor de Moisés e liderou a conquista de Jericó?",
          options: ["Calebe", "Josué", "Gideão", "Sansão"],
          correct_answer: 1
        },
        {
          question: "Qual livro do Velho Testamento contém 150 cânticos e orações?",
          options: ["Provérbios", "Eclesiastes", "Salmos", "Cantares"],
          correct_answer: 2
        },
        {
          question: "Quem foi o profeta que interpretou os sonhos do rei Nabucodonosor na Babilônia?",
          options: ["Ezequiel", "Daniel", "Oséias", "Amós"],
          correct_answer: 1
        }
      ]
    };
    
    // Check if it already exists to avoid duplicates
    const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
    if (data && data.length > 0) {
      console.log("Estudo já existe.");
      return;
    }

    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) throw error;
  },

  // --- ESTUDO DE ESPECIALIDADES (PDF + QUIZ) ---
  async getSpecialtyStudies(): Promise<SpecialtyStudy[]> {
    const { data, error } = await supabase.from('specialty_studies').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Erro ao buscar estudos:", error);
      return [];
    }
    return (data || []) as SpecialtyStudy[];
  },

  async addSpecialtyStudy(study: Omit<SpecialtyStudy, 'id'>) {
    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) {
      console.error("Erro ao adicionar estudo:", error);
      throw error;
    }
  },

  async updateSpecialtyStudy(study: SpecialtyStudy) {
    const { id, created_at, ...updates } = study;
    const { error } = await supabase.from('specialty_studies').update(updates).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar estudo:", error);
      throw error;
    }
  },

  async deleteSpecialtyStudy(id: string) {
    const { error } = await supabase.from('specialty_studies').delete().eq('id', id);
    if (error) {
      console.error("Erro ao deletar estudo:", error);
      throw error;
    }
  },

  subscribeSpecialtyStudies(callback: (studies: SpecialtyStudy[]) => void) {
    this.getSpecialtyStudies().then(callback);
    return supabase
      .channel('specialty_studies_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'specialty_studies' }, () => {
        this.getSpecialtyStudies().then(callback);
      })
      .subscribe();
  },

  subscribeThreeCluesQuestions(callback: (questions: ThreeCluesQuestion[]) => void) {
    this.getThreeCluesQuestions().then(callback);
    return supabase
      .channel('three_clues_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'three_clues_questions' }, () => {
        this.getThreeCluesQuestions().then(callback);
      })
      .subscribe();
  },

  // --- QUEBRA-CABEÇA ---
  async getPuzzleImages(): Promise<any[]> {
    const { data, error } = await supabase.from('puzzle_images').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Erro ao buscar imagens do quebra-cabeça:", error);
      return [];
    }
    return data || [];
  },

  async addPuzzleImage(image: { url: string, title: string }) {
    const { error } = await supabase.from('puzzle_images').insert([image]);
    if (error) {
      console.error("Erro ao adicionar imagem do quebra-cabeça:", error);
      throw error;
    }
  },

  async deletePuzzleImage(id: string) {
    const { error } = await supabase.from('puzzle_images').delete().eq('id', id);
    if (error) {
      console.error("Erro ao deletar imagem do quebra-cabeça:", error);
      throw error;
    }
  },

  subscribePuzzleImages(callback: (images: any[]) => void) {
    this.getPuzzleImages().then(callback);
    return supabase
      .channel('puzzle_images_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puzzle_images' }, () => {
        this.getPuzzleImages().then(callback);
      })
      .subscribe();
  }
};
