
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage } from './types';

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SpecialtyDBV {
  id?: number;
  createdAt?: string;
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

export interface SpecialtyQuestion {
  id: string;
  specialty_id: number;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface CounselorDB {
  id?: string | number;
  name: string;
  createdAt?: string;
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
      .order('createdAt', { ascending: true }) 
      .limit(50);
    
    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }
    
    return (data || []).map(m => ({
      ...m,
      createdAt: m.createdAt || new Date().toISOString()
    })) as ChatMessage[];
  },

  async sendMessage(msg: ChatMessage) {
    const { id, ...payload } = msg;
    const { error } = await supabase.from('messages').insert([payload]);
    if (error) {
      console.error("Erro ao inserir mensagem:", error);
      throw error;
    }
  },

  subscribeMessages(unit: string, callback: (msg: ChatMessage) => void) {
    return supabase
      .channel(`chat_${unit}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `unit=eq.${unit}` }, payload => {
        const newMsg = payload.new as any;
        callback({
          ...newMsg,
          createdAt: newMsg.createdAt || new Date().toISOString()
        });
      })
      .subscribe();
  },

  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from('members').select('*');
    if (error) return [];
    return data as Member[];
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
    const { error } = await supabase.from('members').insert([member]);
    if (error) throw error;
  },

  async updateMember(member: Member) {
    const { error } = await supabase.from('members').update(member).eq('id', member.id);
    if (error) throw error;
  },

  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CONSELHEIROS ---
  async getCounselors(): Promise<CounselorDB[]> {
    const { data, error } = await supabase
      .from('conselheiros')
      .select('id, createdAt:createdAt, name:nome') 
      .order('nome', { ascending: true });
    
    if (error) {
      // Caso a tabela conselheiros use outro nome de coluna, tenta ID como fallback
      const fallback = await supabase.from('conselheiros').select('id, nome').order('nome', { ascending: true });
      if (fallback.error) return [];
      return fallback.data.map((d: any) => ({ id: d.id, name: d.nome })) as any[];
    }
    return data as any[];
  },

  async addCounselor(name: string) {
    const { error } = await supabase.from('conselheiros').insert([{ nome: name }]);
    if (error) throw error;
  },

  async updateCounselor(id: string | number, name: string) {
    const { error } = await supabase.from('conselheiros').update({ nome: name }).eq('id', id);
    if (error) throw error;
  },

  async deleteCounselor(id: string | number) {
    const { error } = await supabase.from('conselheiros').delete().eq('id', id);
    if (error) throw error;
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
    if (error) return [];
    return data as Announcement[];
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
    const { error } = await supabase.from('announcements').insert([ann]);
    if (error) throw error;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // --- ESPECIALIDADES ---
  async getSpecialties(): Promise<SpecialtyDBV[]> {
    const { data, error } = await supabase.from('EspecialidadesDBV').select('*').order('Nome', { ascending: true });
    if (error) return [];
    return data as SpecialtyDBV[];
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
    const { error } = await supabase.from('EspecialidadesDBV').insert([spec]);
    if (error) throw error;
  },

  async updateSpecialty(spec: SpecialtyDBV) {
    const { error } = await supabase.from('EspecialidadesDBV').update(spec).eq('id', spec.id);
    if (error) throw error;
  },

  async deleteSpecialty(id: number) {
    const { error } = await supabase.from('EspecialidadesDBV').delete().eq('id', id);
    if (error) throw error;
  },

  async seedSpecialties(specialties: Omit<SpecialtyDBV, 'id' | 'createdAt'>[]) {
    const { error } = await supabase.from('EspecialidadesDBV').insert(specialties);
    if (error) {
      console.error("Erro ao migrar especialidades:", error);
      throw error;
    }
  },

  // --- CONFIGURAÇÕES DE JOGOS (OVERRIDE) ---
  async getGameConfigs(): Promise<GameConfig | null> {
    const { data, error } = await supabase.from('game_configs').select('*').eq('id', 1).single();
    if (error) return null;
    return data as GameConfig;
  },

  async updateGameConfig(updates: Partial<GameConfig>) {
    const { error } = await supabase.from('game_configs').update(updates).eq('id', 1);
    if (error) throw error;
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
    // Tenta ordenar por createdAt, senão ID
    const { data, error } = await supabase.from('quiz_questions').select('*').order('id', { ascending: false });
    if (error) return [];
    
    return data.map(q => ({
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
    const { error } = await supabase.from('quiz_questions').insert([payload]);
    if (error) throw error;
  },

  async updateQuizQuestion(q: QuizQuestion) {
    const payload = {
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer
    };
    const { error } = await supabase.from('quiz_questions').update(payload).eq('id', q.id);
    if (error) throw error;
  },

  async deleteQuizQuestion(id: string) {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) throw error;
  },

  async seedQuizQuestions(questions: Omit<QuizQuestion, 'id'>[]) {
    const payload = questions.map(q => ({
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer
    }));
    const { error } = await supabase.from('quiz_questions').insert(payload);
    if (error) {
      console.error("Erro ao migrar questões do quiz:", error);
      throw error;
    }
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

  // --- USUÁRIOS E DESAFIOS ---
  async getUsers(): Promise<AuthUser[]> {
    const { data, error } = await supabase.from('users').select('*');
    return (error ? [] : data) as AuthUser[];
  },

  async addUser(user: AuthUser) {
    await supabase.from('users').upsert([user]);
  },

  async createChallenge(challenge: Challenge1x1) {
    const { error } = await supabase.from('challenges').insert([challenge]);
    if (error) throw error;
  },

  async updateChallenge(id: string, updates: Partial<Challenge1x1>) {
    const { error } = await supabase.from('challenges').update(updates).eq('id', id);
    if (error) throw error;
  }
};
