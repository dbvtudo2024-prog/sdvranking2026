
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

export interface CounselorDB {
  id?: string | number;
  name: string;
  created_at?: string;
}

export const DatabaseService = {
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
      .select('id, created_at, name:nome') 
      .order('nome', { ascending: true });
    if (error) return [];
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

  async importSpecialtiesCSV(specialties: SpecialtyDBV[]) {
    const { error } = await supabase.from('EspecialidadesDBV').insert(specialties);
    if (error) throw error;
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
