
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
// ==========================================================
// 🚨 CONFIGURAÇÃO IMPORTANTE DO SUPABASE 🚨
// No seu painel do Supabase, vá em: Settings -> API Keys
// Copie a chave que está em "Project API Keys" -> linha "anon" / "public"
// Ela é bem grande e começa com "eyJ..."
// ==========================================================

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_QUE_COMECA_COM_EYJ'; 
<<<<<<< HEAD
=======
=======
// Credenciais configuradas conforme fornecido pelo usuário
const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xHik3IchBrSKg7kqn7rzng_0IokCHXm';
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DatabaseService = {
  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      if (error) throw error;
      return data as Member[] || [];
    } catch (error) {
<<<<<<< HEAD
=======
=======
    const { data, error } = await supabase
      .from('members')
      .select('*');
    if (error) {
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
      console.error('Erro ao buscar membros:', error);
      return [];
    }
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    this.getMembers().then(callback);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    // Inscrição para mudanças em tempo real
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
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
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    if (error) {
      console.error('Erro Supabase addMember:', error);
      throw error;
    }
<<<<<<< HEAD
=======
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
  },

  async updateMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
    if (error) {
      console.error('Erro Supabase updateMember:', error);
      throw error;
    }
<<<<<<< HEAD
=======
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
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
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
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
<<<<<<< HEAD
=======
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
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase
      .from('users')
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
      .upsert([user]);
    if (error) {
      console.error('Erro Supabase addUser:', error);
      throw error;
    }
<<<<<<< HEAD
=======
=======
      .upsert([user]); // Usa upsert para criar ou atualizar
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
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
<<<<<<< HEAD
=======
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
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
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
