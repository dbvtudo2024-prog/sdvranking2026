
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage, Devotional, ThreeCluesQuestion, SpecialtyStudy, SpecialtyDBV, CounselorDB, GameConfig } from '@/types';

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Escuta mensagens filtradas por unidade ou todas
  subscribeMessages(unit: string | null, callback: (msg: ChatMessage) => void) {
    const channelId = `chat_${unit || 'all'}_${Math.random().toString(36).substring(7)}`;
    const filter = unit ? { table: 'messages', filter: `unit=eq.${unit}` } : { table: 'messages' };
    
    return supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        ...filter
      }, payload => {
        callback(payload.new as ChatMessage);
      })
      .subscribe();
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

  // --- REALTIME CONSOLIDADO ---
  // Reduz a carga no banco usando um único canal para múltiplas tabelas
  subscribeGlobalData(callbacks: {
    onMembers?: (members: Member[]) => void,
    onAnnouncements?: (announcements: Announcement[]) => void,
    onCounselors?: (counselors: CounselorDB[]) => void,
    onGameConfigs?: (config: GameConfig) => void,
    onChallenges?: (challenge: Challenge1x1) => void
  }) {
    const channelId = `global_updates_${Math.random().toString(36).substring(7)}`;
    console.log(`[Realtime] Iniciando canal global: ${channelId}`);
    const channel = supabase.channel(channelId);

    // Fetch initial data
    if (callbacks.onMembers) {
      console.log("[Realtime] Buscando membros iniciais...");
      this.getMembers().then(data => {
        console.log(`[Realtime] ${data.length} membros carregados.`);
        callbacks.onMembers!(data);
      }).catch(err => console.error("[Realtime] Erro membros iniciais:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, async (payload) => {
        console.log("[Realtime] Mudança em members:", payload.eventType);
        const members = await this.getMembers();
        callbacks.onMembers!(members);
      });
    }

    if (callbacks.onAnnouncements) {
      console.log("[Realtime] Buscando avisos iniciais...");
      this.getAnnouncements().then(data => {
        console.log(`[Realtime] ${data.length} avisos carregados.`);
        callbacks.onAnnouncements!(data);
      }).catch(err => console.error("[Realtime] Erro avisos iniciais:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, async (payload) => {
        console.log("[Realtime] Mudança em announcements:", payload.eventType);
        const announcements = await this.getAnnouncements();
        callbacks.onAnnouncements!(announcements);
      });
    }

    if (callbacks.onCounselors) {
      console.log("[Realtime] Buscando conselheiros iniciais...");
      this.getCounselors().then(data => {
        console.log(`[Realtime] ${data.length} conselheiros carregados.`);
        callbacks.onCounselors!(data);
      }).catch(err => console.error("[Realtime] Erro conselheiros iniciais:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'conselheiros' }, async (payload) => {
        console.log("[Realtime] Mudança em conselheiros:", payload.eventType);
        const counselors = await this.getCounselors();
        callbacks.onCounselors!(counselors);
      });
    }

    if (callbacks.onGameConfigs) {
      console.log("[Realtime] Buscando configs iniciais...");
      this.getGameConfigs().then(config => {
        if (config) {
          console.log("[Realtime] Configs carregadas.");
          callbacks.onGameConfigs!(config);
        }
      }).catch(err => console.error("[Realtime] Erro configs iniciais:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'game_configs' }, async (payload) => {
        console.log("[Realtime] Mudança em game_configs:", payload.eventType);
        const config = await this.getGameConfigs();
        if (config) callbacks.onGameConfigs!(config);
      });
    }

    if (callbacks.onChallenges) {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, payload => {
        console.log("[Realtime] Novo desafio recebido!");
        callbacks.onChallenges!(payload.new as Challenge1x1);
      });
    }

    return channel.subscribe((status) => {
      console.log(`[Realtime] Status do canal ${channelId}:`, status);
    });
  },

  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    return withRetry(async () => {
      console.log("[DB] Buscando membros...");
      const { data, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) {
        console.error("[DB] Erro ao buscar membros:", error);
        throw error;
      }
      console.log(`[DB] ${data?.length || 0} membros encontrados.`);
      if (data && data.length > 0) {
        console.log("[DB] Colunas em members:", Object.keys(data[0]));
      }
      return (data || []) as Member[];
    });
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    let localMembers: Member[] = [];
    this.getMembers().then(data => {
      localMembers = data;
      callback(localMembers);
    }).catch(err => console.error("Erro no subscribeMembers:", err));

    return supabase
      .channel('members_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, payload => {
        if (payload.eventType === 'INSERT') {
          localMembers = [...localMembers, payload.new as Member];
        } else if (payload.eventType === 'UPDATE') {
          localMembers = localMembers.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m);
        } else if (payload.eventType === 'DELETE') {
          localMembers = localMembers.filter(m => m.id !== payload.old.id);
        }
        callback([...localMembers]);
      })
      .subscribe();
  },

  async addMember(member: Member) {
    const payload = {
      id: member.id,
      name: member.name,
      role: member.role,
      age: member.age,
      className: member.className,
      joinedAt: member.joinedAt,
      birthday: member.birthday,
      counselor: member.counselor,
      unit: member.unit,
      scores: member.scores,
      photoUrl: member.photoUrl
    };
    const { error } = await supabase.from('members').insert([payload]);
    if (error) {
      console.error("Erro ao adicionar membro:", error);
      throw error;
    }
  },

  async updateMember(member: Member) {
    const { id, ...updates } = member;
    const payload = {
      name: updates.name,
      role: updates.role,
      age: updates.age,
      className: updates.className,
      joinedAt: updates.joinedAt,
      birthday: updates.birthday,
      counselor: updates.counselor,
      unit: updates.unit,
      scores: updates.scores,
      photoUrl: updates.photoUrl
    };
    const { error } = await supabase.from('members').update(payload).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar membro no Supabase:", error);
      throw error;
    }
  },

  async updateMembers(members: Member[]) {
    const payloads = members.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      age: m.age,
      className: m.className,
      joinedAt: m.joinedAt,
      birthday: m.birthday,
      counselor: m.counselor,
      unit: m.unit,
      scores: m.scores,
      photoUrl: m.photoUrl
    }));
    const { error } = await supabase.from('members').upsert(payloads);
    if (error) {
      console.error("Erro ao atualizar múltiplos membros:", error);
      throw error;
    }
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
    let localCounselors: CounselorDB[] = [];
    this.getCounselors().then(data => {
      localCounselors = data;
      callback(localCounselors);
    });

    return supabase
      .channel('conselheiros_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conselheiros' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = [...localCounselors, newC];
        } else if (payload.eventType === 'UPDATE') {
          const updatedC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = localCounselors.map(c => c.id === payload.new.id ? updatedC : c);
        } else if (payload.eventType === 'DELETE') {
          localCounselors = localCounselors.filter(c => c.id !== payload.old.id);
        }
        callback([...localCounselors].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .subscribe();
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    console.log("[DB] Buscando avisos...");
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) {
      console.error("[DB] Erro ao buscar avisos:", error);
      return [];
    }
    console.log(`[DB] ${data?.length || 0} avisos encontrados.`);
    return (data || []) as Announcement[];
  },

  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    let localAnnouncements: Announcement[] = [];
    this.getAnnouncements().then(data => {
      localAnnouncements = data;
      callback(localAnnouncements);
    });

    return supabase
      .channel('announcements_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
        if (payload.eventType === 'INSERT') {
          localAnnouncements = [payload.new as Announcement, ...localAnnouncements];
        } else if (payload.eventType === 'UPDATE') {
          localAnnouncements = localAnnouncements.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a);
        } else if (payload.eventType === 'DELETE') {
          localAnnouncements = localAnnouncements.filter(a => a.id !== payload.old.id);
        }
        callback([...localAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .subscribe();
  },

  async addAnnouncement(ann: Announcement) {
    await supabase.from('announcements').insert([ann]);
  },

  async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  },

  async seedAnnouncements(announcements: Omit<Announcement, 'id'>[]) {
    for (const ann of announcements) {
      const { data } = await supabase.from('announcements').select('id').eq('title', ann.title).eq('date', ann.date);
      if (!data || data.length === 0) {
        await this.addAnnouncement({
          ...ann,
          id: Math.random().toString(36).substr(2, 9)
        } as Announcement);
      }
    }
  },

  // --- ESPECIALIDADES ---
  async getSpecialties(): Promise<SpecialtyDBV[]> {
    const { data, error } = await supabase.from('EspecialidadesDBV').select('*').order('Nome', { ascending: true });
    return (data || []) as SpecialtyDBV[];
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDBV[]) => void) {
    let localSpecialties: SpecialtyDBV[] = [];
    this.getSpecialties().then(data => {
      localSpecialties = data;
      callback(localSpecialties);
    });

    return supabase
      .channel('specialties_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'EspecialidadesDBV' }, payload => {
        if (payload.eventType === 'INSERT') {
          localSpecialties = [...localSpecialties, payload.new as SpecialtyDBV];
        } else if (payload.eventType === 'UPDATE') {
          localSpecialties = localSpecialties.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s);
        } else if (payload.eventType === 'DELETE') {
          localSpecialties = localSpecialties.filter(s => s.id !== payload.old.id);
        }
        callback([...localSpecialties].sort((a, b) => a.Nome.localeCompare(b.Nome)));
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

  async seedSpecialties(specialties: any[]) {
    for (const s of specialties) {
      const { data } = await supabase.from('EspecialidadesDBV').select('id').eq('Nome', s.name);
      if (!data || data.length === 0) {
        await this.addSpecialty({
          Nome: s.name,
          Imagem: s.image,
          Categoria: s.category || 'Geral',
          Like: false
        });
      }
    }
  },

  // --- CONFIGURAÇÕES DE JOGOS ---
  async getGameConfigs(): Promise<GameConfig | null> {
    const { data } = await supabase.from('game_configs').select('*').eq('id', 1).single();
    if (!data) return null;
    return {
      ...data,
      quiz_override: data.quiz_override ?? false,
      memory_override: data.memory_override ?? false,
      specialty_override: data.specialty_override ?? false,
      three_clues_override: data.three_clues_override ?? false,
      puzzle_override: data.puzzle_override ?? false,
      knots_override: data.knots_override ?? false,
      specialty_trail_override: data.specialty_trail_override ?? false,
      scrambled_verse_override: data.scrambled_verse_override ?? false,
      nature_id_override: data.nature_id_override ?? false,
      first_aid_override: data.first_aid_override ?? false,
      brick_breaker_override: data.brick_breaker_override ?? false,
      mahjong_override: data.mahjong_override ?? false,
    } as GameConfig;
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
    return (data || []).map(q => {
      let category = q.category;
      let question = q.question;

      // Lógica de mapeamento reverso: extrai a subcategoria do prefixo da pergunta
      if (q.category === 'Desbravadores') {
        if (q.question.startsWith('[Natureza] ')) {
          category = 'Natureza';
          question = q.question.replace('[Natureza] ', '');
        } else if (q.question.startsWith('[Primeiros Socorros] ')) {
          category = 'Primeiros Socorros';
          question = q.question.replace('[Primeiros Socorros] ', '');
        } else if (q.question.startsWith('[Especialidades] ')) {
          category = 'Especialidades';
          question = q.question.replace('[Especialidades] ', '');
        }
      }

      return {
        id: q.id,
        category: category as any,
        question: question,
        options: q.options,
        correct_answer: q.correct_answer,
        image_url: q.image_url,
        tip: q.tip
      };
    }) as QuizQuestion[];
  },

  async getQuizCategories(): Promise<string[]> {
    const { data, error } = await supabase.from('quiz_questions').select('category');
    if (error) return ['Desbravadores', 'Bíblia', 'Natureza', 'Primeiros Socorros', 'Especialidades'];
    const categories = Array.from(new Set(data.map(d => d.category)));
    return categories.length > 0 ? categories : ['Desbravadores', 'Bíblia', 'Natureza', 'Primeiros Socorros', 'Especialidades'];
  },

  async addQuizQuestion(q: Omit<QuizQuestion, 'id'>) {
    let dbCategory = q.category;
    let dbQuestion = q.question;

    // Mapeia categorias extras para 'Desbravadores' com prefixo no texto
    if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
      dbCategory = 'Desbravadores';
      dbQuestion = `[${q.category}] ${q.question}`;
    }

    const payload = {
      category: dbCategory,
      question: dbQuestion,
      options: q.options,
      correct_answer: q.correct_answer,
      image_url: q.image_url,
      tip: q.tip
    };
    const { error } = await supabase.from('quiz_questions').insert([payload]);
    if (error) {
      console.error("Erro ao adicionar questão no Supabase:", error);
      throw error;
    }
  },

  async updateQuizQuestion(q: QuizQuestion) {
    let dbCategory = q.category;
    let dbQuestion = q.question;

    if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
      dbCategory = 'Desbravadores';
      dbQuestion = `[${q.category}] ${q.question}`;
    }

    const payload = {
      category: dbCategory,
      question: dbQuestion,
      options: q.options,
      correct_answer: q.correct_answer,
      image_url: q.image_url,
      tip: q.tip
    };
    const { error } = await supabase.from('quiz_questions').update(payload).eq('id', q.id);
    if (error) throw error;
  },

  async deleteQuizQuestion(id: string) {
    await supabase.from('quiz_questions').delete().eq('id', id);
  },

  async seedQuizQuestions(questions: Omit<QuizQuestion, 'id'>[]) {
    try {
      // 1. Buscar todas as questões existentes para evitar duplicatas em uma única consulta
      const { data: existing, error: fetchError } = await supabase.from('quiz_questions').select('category, question');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => `${e.category}|${e.question.trim()}`));

      const toInsert = [];
      for (const q of questions) {
        let dbCategory = q.category;
        let dbQuestion = q.question.trim();

        if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
          dbCategory = 'Desbravadores';
          dbQuestion = `[${q.category}] ${dbQuestion}`;
        }

        if (!existingSet.has(`${dbCategory}|${dbQuestion}`)) {
          toInsert.push({
            category: dbCategory,
            question: dbQuestion,
            options: q.options,
            correct_answer: q.correct_answer,
            image_url: q.image_url,
            tip: q.tip
          });
        }
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('quiz_questions').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedQuizQuestions:", error);
      throw error;
    }
  },

  subscribeQuizQuestions(callback: (questions: QuizQuestion[]) => void) {
    let localQuestions: QuizQuestion[] = [];
    
    const mapQ = (q: any): QuizQuestion => {
      let category = q.category;
      let question = q.question;
      if (q.category === 'Desbravadores') {
        if (q.question.startsWith('[Natureza] ')) {
          category = 'Natureza';
          question = q.question.replace('[Natureza] ', '');
        } else if (q.question.startsWith('[Primeiros Socorros] ')) {
          category = 'Primeiros Socorros';
          question = q.question.replace('[Primeiros Socorros] ', '');
        } else if (q.question.startsWith('[Especialidades] ')) {
          category = 'Especialidades';
          question = q.question.replace('[Especialidades] ', '');
        }
      }
      return {
        id: q.id,
        category: category as any,
        question: question,
        options: q.options,
        correct_answer: q.correct_answer,
        image_url: q.image_url,
        tip: q.tip
      };
    };

    this.getQuizQuestions().then(data => {
      localQuestions = data;
      callback(localQuestions);
    });

    return supabase
      .channel('quiz_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_questions' }, payload => {
        if (payload.eventType === 'INSERT') {
          localQuestions = [mapQ(payload.new), ...localQuestions];
        } else if (payload.eventType === 'UPDATE') {
          localQuestions = localQuestions.map(q => q.id === payload.new.id ? mapQ(payload.new) : q);
        } else if (payload.eventType === 'DELETE') {
          localQuestions = localQuestions.filter(q => q.id !== payload.old.id);
        }
        callback([...localQuestions]);
      })
      .subscribe();
  },

  // --- ARENA 1x1 ---




  // --- USUÁRIOS ---
  async getUsers(): Promise<AuthUser[]> {
    return withRetry(async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
      }
      return (data || []) as AuthUser[];
    });
  },

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao buscar usuário por e-mail:", error);
        throw error;
      }
      return data as AuthUser | null;
    });
  },

  async addUser(user: AuthUser) {
    // Removemos o campo 'counselor' pois ele pertence à tabela 'members', não 'users'
    const { counselor, ...userPayload } = user;
    const payload = {
      id: userPayload.id,
      name: userPayload.name,
      role: userPayload.role,
      funcao: userPayload.funcao,
      unit: userPayload.unit,
      age: userPayload.age,
      className: userPayload.className,
      birthday: userPayload.birthday,
      email: userPayload.email,
      photoUrl: userPayload.photoUrl
    };
    const { error } = await supabase.from('users').upsert([payload]);
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
    try {
      const { data: existing, error: fetchError } = await supabase.from('three_clues_questions').select('answer');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => e.answer.trim().toLowerCase()));

      const toInsert = questions.filter(q => !existingSet.has(q.answer.trim().toLowerCase()));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('three_clues_questions').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedThreeCluesQuestions:", error);
      throw error;
    }
  },

  async seedHistoryStudy() {
    const study: Omit<SpecialtyStudy, 'id'> = {
      name: "História do Velho Testamento",
      pdfurl: "https://drive.google.com/file/d/1c5LZ2VHm5mPY_LjszYVA1QsuwBTSSvtX/view",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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

  async seedNatureStudy() {
    const study: Omit<SpecialtyStudy, 'id'> = {
      name: "Estudo da Natureza",
      pdfurl: "https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/estudo-da-natureza.pdf",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Natureza",
      questions: [
        {
          question: "Qual é o processo pelo qual as plantas produzem seu próprio alimento?",
          options: ["Respiração", "Fotossíntese", "Transpiração", "Germinação"],
          correct_answer: 1
        },
        {
          question: "Qual destes animais é um anfíbio?",
          options: ["Cobra", "Sapo", "Tartaruga", "Jacaré"],
          correct_answer: 1
        },
        {
          question: "Como se chama o fenômeno da transformação da lagarta em borboleta?",
          options: ["Evolução", "Metamorfose", "Crescimento", "Mutação"],
          correct_answer: 1
        },
        {
          question: "Qual é o maior oceano da Terra?",
          options: ["Atlântico", "Índico", "Pacífico", "Ártico"],
          correct_answer: 2
        },
        {
          question: "Qual gás os humanos expiram e as plantas absorvem?",
          options: ["Oxigênio", "Nitrogênio", "Dióxido de Carbono", "Hidrogênio"],
          correct_answer: 2
        },
        {
          question: "Qual é a principal fonte de energia para a vida na Terra?",
          options: ["Lua", "Vento", "Sol", "Água"],
          correct_answer: 2
        },
        {
          question: "O que as abelhas coletam das flores para fazer mel?",
          options: ["Pólen", "Néctar", "Sementes", "Pétalas"],
          correct_answer: 1
        },
        {
          question: "Qual destes é um recurso natural renovável?",
          options: ["Petróleo", "Carvão", "Energia Solar", "Gás Natural"],
          correct_answer: 2
        },
        {
          question: "Como se chama o estudo dos animais?",
          options: ["Botânica", "Geologia", "Zoologia", "Ecologia"],
          correct_answer: 2
        },
        {
          question: "Qual é a camada de ar que envolve a Terra?",
          options: ["Litosfera", "Hidrosfera", "Atmosfera", "Biosfera"],
          correct_answer: 2
        }
      ]
    };

    const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
    if (data && data.length > 0) return;

    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) throw error;
  },

  async seedSpecialtyStudies(studies: Omit<SpecialtyStudy, 'id'>[]) {
    for (const study of studies) {
      const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
      if (!data || data.length === 0) {
        const { error } = await supabase.from('specialty_studies').insert([study]);
        if (error) console.error("Erro ao inserir estudo de especialidade:", error);
      }
    }
  },

  async seedMembers(members: Omit<Member, 'id'>[]) {
    for (const m of members) {
      const { data } = await supabase.from('members').select('id').eq('name', m.name);
      if (!data || data.length === 0) {
        await this.addMember({
          ...m,
          id: Math.random().toString(36).substr(2, 9)
        } as Member);
      }
    }
  },

  // --- ESTUDO DE ESPECIALIDADES (PDF + QUIZ) ---
  async getSpecialtyStudies(): Promise<SpecialtyStudy[]> {
    console.log("[DB] Buscando estudos...");
    const { data, error } = await supabase.from('specialty_studies').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("[DB] Erro ao buscar estudos:", error);
      return [];
    }
    console.log(`[DB] ${data?.length || 0} estudos encontrados.`);
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
    let localStudies: SpecialtyStudy[] = [];
    console.log("[Realtime] Iniciando assinatura de estudos...");
    this.getSpecialtyStudies().then(data => {
      console.log(`[Realtime] ${data.length} estudos carregados inicialmente.`);
      localStudies = data;
      callback(localStudies);
    }).catch(err => console.error("[Realtime] Erro estudos iniciais:", err));

    return supabase
      .channel('specialty_studies_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'specialty_studies' }, payload => {
        console.log("[Realtime] Mudança em specialty_studies:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          localStudies = [payload.new as SpecialtyStudy, ...localStudies];
        } else if (payload.eventType === 'UPDATE') {
          localStudies = localStudies.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s);
        } else if (payload.eventType === 'DELETE') {
          localStudies = localStudies.filter(s => s.id !== payload.old.id);
        }
        callback([...localStudies]);
      })
      .subscribe((status) => {
        console.log("[Realtime] Status do canal de estudos:", status);
      });
  },

  subscribeThreeCluesQuestions(callback: (questions: ThreeCluesQuestion[]) => void) {
    let localQuestions: ThreeCluesQuestion[] = [];
    this.getThreeCluesQuestions().then(data => {
      localQuestions = data;
      callback(localQuestions);
    });

    return supabase
      .channel('three_clues_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'three_clues_questions' }, payload => {
        if (payload.eventType === 'INSERT') {
          localQuestions = [payload.new as ThreeCluesQuestion, ...localQuestions];
        } else if (payload.eventType === 'UPDATE') {
          localQuestions = localQuestions.map(q => q.id === payload.new.id ? { ...q, ...payload.new } : q);
        } else if (payload.eventType === 'DELETE') {
          localQuestions = localQuestions.filter(q => q.id !== payload.old.id);
        }
        callback([...localQuestions]);
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

  async seedPuzzleImages(images: { title: string, url: string }[]) {
    for (const img of images) {
      const { data } = await supabase.from('puzzle_images').select('id').eq('title', img.title);
      if (!data || data.length === 0) {
        await this.addPuzzleImage(img);
      }
    }
  },

  subscribePuzzleImages(callback: (images: any[]) => void) {
    let localImages: any[] = [];
    this.getPuzzleImages().then(data => {
      localImages = data;
      callback(localImages);
    });

    return supabase
      .channel('puzzle_images_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puzzle_images' }, payload => {
        if (payload.eventType === 'INSERT') {
          localImages = [payload.new, ...localImages];
        } else if (payload.eventType === 'UPDATE') {
          localImages = localImages.map(img => img.id === payload.new.id ? { ...img, ...payload.new } : img);
        } else if (payload.eventType === 'DELETE') {
          localImages = localImages.filter(img => img.id !== payload.old.id);
        }
        callback([...localImages]);
      })
      .subscribe();
  },

  async seedGameAssets(assets: { game_type: string, name: string, url: string }[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('game_assets').select('game_type, name');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => `${e.game_type}|${e.name.trim().toLowerCase()}`));

      const toInsert = assets.filter(a => !existingSet.has(`${a.game_type}|${a.name.trim().toLowerCase()}`));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('game_assets').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedGameAssets:", error);
      throw error;
    }
  },

  // --- ATIVOS DE JOGOS (IMAGENS DINÂMICAS) ---
  async getGameAssets(gameType: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('game_assets')
      .select('*')
      .eq('game_type', gameType);
    
    if (error) {
      console.error(`Erro ao buscar ativos para ${gameType}:`, error);
      return [];
    }
    return data || [];
  },

  async updateGameAsset(id: number, url: string) {
    const { error } = await supabase
      .from('game_assets')
      .update({ url })
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- VERSÍCULO EMBARALHADO ---
  async getScrambledVerses(): Promise<any[]> {
    const { data } = await supabase.from('scrambled_verses').select('*').order('created_at', { ascending: false });
    return (data || []) as any[];
  },

  async addScrambledVerse(v: any) {
    const { error } = await supabase.from('scrambled_verses').insert([v]);
    if (error) throw error;
  },

  async updateScrambledVerse(v: any) {
    const { id, created_at, ...updates } = v;
    const { error } = await supabase.from('scrambled_verses').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteScrambledVerse(id: string) {
    const { error } = await supabase.from('scrambled_verses').delete().eq('id', id);
    if (error) throw error;
  },

  async seedScrambledVerses(verses: any[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('scrambled_verses').select('title');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => e.title.trim().toLowerCase()));

      const toInsert = verses.filter(v => !existingSet.has(v.title.trim().toLowerCase()));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('scrambled_verses').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedScrambledVerses:", error);
      throw error;
    }
  },

  subscribeScrambledVerses(callback: (verses: any[]) => void) {
    let localVerses: any[] = [];
    this.getScrambledVerses().then(data => {
      localVerses = data;
      callback(localVerses);
    });

    return supabase
      .channel('scrambled_verses_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scrambled_verses' }, payload => {
        if (payload.eventType === 'INSERT') {
          localVerses = [payload.new, ...localVerses];
        } else if (payload.eventType === 'UPDATE') {
          localVerses = localVerses.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v);
        } else if (payload.eventType === 'DELETE') {
          localVerses = localVerses.filter(v => v.id !== payload.old.id);
        }
        callback([...localVerses]);
      })
      .subscribe();
  }
};
