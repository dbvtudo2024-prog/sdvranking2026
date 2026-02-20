
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage } from './types';

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
}

export const DatabaseService = {
  // --- CHAT ---
  async getMessages(unit: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('unit', unit)
      .order('created_at', { ascending: true }) 
      .limit(50);
    
    if (error) throw error;
    return (data || []) as ChatMessage[];
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
    return (data || []) as Member[];
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    this.getMembers().then(callback);
    return supabase
      .channel('members_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        this.getMembers().then(callback);
      })
      .subscribe();
  },

  async addMember(member: Member) {
    await supabase.from('members').insert([member]);
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
    const { data } = await supabase.from('users').select('*');
    return (data || []) as AuthUser[];
  },

  async addUser(user: AuthUser) {
    await supabase.from('users').upsert([user]);
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
  }
};
