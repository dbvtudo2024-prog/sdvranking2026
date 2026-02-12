
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

<<<<<<< HEAD
// ==========================================================
// 🚨 CONFIGURAÇÃO IMPORTANTE DO SUPABASE 🚨
// No seu painel do Supabase, vá em: Settings -> API Keys
// Copie a chave que está em "Project API Keys" -> linha "anon" / "public"
// Ela é bem grande e começa com "eyJ..."
// ==========================================================

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_QUE_COMECA_COM_EYJ'; 
=======
// Credenciais configuradas conforme fornecido pelo usuário
const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xHik3IchBrSKg7kqn7rzng_0IokCHXm';
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DatabaseService = {
  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
<<<<<<< HEAD
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      if (error) throw error;
      return data as Member[] || [];
    } catch (error) {
=======
    const { data, error } = await supabase
      .from('members')
      .select('*');
    if (error) {
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
      console.error('Erro ao buscar membros:', error);
      return [];
    }
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    this.getMembers().then(callback);

<<<<<<< HEAD
=======
    // Inscrição para mudanças em tempo real
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
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
<<<<<<< HEAD
    if (error) {
      console.error('Erro Supabase addMember:', error);
      throw error;
    }
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
  },

  async updateMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id);
<<<<<<< HEAD
    if (error) {
      console.error('Erro Supabase updateMember:', error);
      throw error;
    }
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
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
<<<<<<< HEAD
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
=======
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
    return data as AuthUser[];
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase
      .from('users')
<<<<<<< HEAD
      .upsert([user]);
    if (error) {
      console.error('Erro Supabase addUser:', error);
      throw error;
    }
=======
      .upsert([user]); // Usa upsert para criar ou atualizar
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
<<<<<<< HEAD
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
=======
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Erro ao buscar avisos:', error);
      return [];
    }
    return data as Announcement[];
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
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
