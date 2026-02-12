
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

// ==========================================================
// 🚨 CONFIGURAÇÃO IMPORTANTE DO SUPABASE 🚨
// No seu painel do Supabase, vá em: Settings -> API Keys
// Copie a chave que está em "Project API Keys" -> linha "anon" / "public"
// Ela é bem grande e começa com "eyJ..."
// ==========================================================

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_QUE_COMECA_COM_EYJ'; 

// Alerta de depuração para o desenvolvedor
if (SUPABASE_ANON_KEY === 'COLE_AQUI_A_CHAVE_QUE_COMECA_COM_EYJ') {
  console.error("ERRO: Você esqueceu de configurar a SUPABASE_ANON_KEY no arquivo db.ts!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      .on('postgres_changes', { event: '*', table: 'members' }, () => {
        this.getMembers().then(callback);
      })
      .subscribe();
  },

  async addMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .insert([member]);
    if (error) {
      console.error('Erro Supabase addMember:', error);
      throw error;
    }
  },

  async updateMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id);
    if (error) {
      console.error('Erro Supabase updateMember:', error);
      throw error;
    }
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
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase
      .from('users')
      .upsert([user]);
    if (error) {
      console.error('Erro Supabase addUser:', error);
      throw error;
    }
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
      console.error('Erro ao buscar avisos:', error);
      return [];
    }
  },

  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    this.getAnnouncements().then(callback);

    return supabase
      .channel('announcements_changes')
      .on('postgres_changes', { event: '*', table: 'announcements' }, () => {
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
  }
};
