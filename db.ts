
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1 } from './types';

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

export const DatabaseService = {
  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (error) throw error;
      return data as Member[] || [];
    } catch (error) {
      return [];
    }
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    this.getMembers().then(callback);
    return supabase
      .channel('members_changes')
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

  // Added missing deleteMember method to fix property does not exist error in App.tsx
  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  // --- DESAFIOS 1x1 ---
  async createChallenge(challenge: Challenge1x1) {
    const { error } = await supabase.from('challenges').insert([challenge]);
    if (error) throw error;
  },

  async updateChallenge(id: string, updates: Partial<Challenge1x1>) {
    const { error } = await supabase.from('challenges').update(updates).eq('id', id);
    if (error) throw error;
  },

  subscribeToChallenges(memberId: string, callback: (challenge: Challenge1x1) => void) {
    return supabase
      .channel('challenges_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'challenges',
        filter: `or(challengerId.eq.${memberId},challengedId.eq.${memberId})`
      }, (payload) => {
        callback(payload.new as Challenge1x1);
      })
      .subscribe();
  },

  // --- USUÁRIOS ---
  async getUsers(): Promise<AuthUser[]> {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data as AuthUser[] || [];
    } catch (error) {
      return [];
    }
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase.from('users').upsert([user]);
    if (error) throw error;
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data as Announcement[] || [];
    } catch (error) {
      return [];
    }
  },

  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    this.getAnnouncements().then(callback);
    return supabase
      .channel('announcements_changes')
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
    try {
      const { data, error } = await supabase
        .from('EspecialidadesDBV')
        .select('*')
        .order('Nome', { ascending: true });
      if (error) throw error;
      return data as SpecialtyDBV[] || [];
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      return [];
    }
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

  async importSpecialtiesCSV(data: SpecialtyDBV[]) {
    const { error } = await supabase.from('EspecialidadesDBV').insert(data);
    if (error) throw error;
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDBV[]) => void) {
    this.getSpecialties().then(callback);
    return supabase
      .channel('specialties_dbv_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'EspecialidadesDBV' }, () => {
        this.getSpecialties().then(callback);
      })
      .subscribe();
  }
};
