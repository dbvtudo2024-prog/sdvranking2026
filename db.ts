
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

// Credenciais do Supabase
const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SpecialtyDB {
  id: string;
  name: string;
  image: string;
}

export const DatabaseService = {
  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      if (error) throw error;
      return data as Member[] || [];
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
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
    const { error } = await supabase
      .from('members')
      .insert([member]);
    if (error) throw error;
  },

  async updateMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id);
    if (error) throw error;
  },

  async deleteMember(id: string) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- USUÁRIOS ---
  async getUsers(): Promise<AuthUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) throw error;
      return data as AuthUser[] || [];
    } catch (error) {
      return [];
    }
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase
      .from('users')
      .upsert([user]);
    if (error) throw error;
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });
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
    const { error } = await supabase
      .from('announcements')
      .insert([ann]);
    if (error) throw error;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- ESPECIALIDADES ---
  async getSpecialties(): Promise<SpecialtyDB[]> {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as SpecialtyDB[] || [];
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      return [];
    }
  },

  async addSpecialty(spec: SpecialtyDB) {
    const { error } = await supabase
      .from('specialties')
      .insert([spec]);
    if (error) throw error;
  },

  async updateSpecialty(spec: SpecialtyDB) {
    const { error } = await supabase
      .from('specialties')
      .update(spec)
      .eq('id', spec.id);
    if (error) throw error;
  },

  async deleteSpecialty(id: string) {
    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDB[]) => void) {
    this.getSpecialties().then(callback);
    return supabase
      .channel('specialties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'specialties' }, () => {
        this.getSpecialties().then(callback);
      })
      .subscribe();
  }
};
