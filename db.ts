
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
// Credenciais configuradas conforme fornecido pelo usuário
const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xHik3IchBrSKg7kqn7rzng_0IokCHXm';
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DatabaseService = {
  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*');
      if (error) throw error;
      return data as Member[] || [];
    } catch (error) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    const { data, error } = await supabase
      .from('members')
      .select('*');
    if (error) {
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    // Inscrição para mudanças em tempo real
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
    if (error) {
      console.error('Erro Supabase addMember:', error);
      throw error;
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
  },

  async updateMember(member: Member) {
    const { error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id);
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
    if (error) {
      console.error('Erro Supabase updateMember:', error);
      throw error;
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
<<<<<<< HEAD
=======
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
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
  },

  async addUser(user: AuthUser) {
    const { error } = await supabase
      .from('users')
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
      .upsert([user]);
    if (error) {
      console.error('Erro Supabase addUser:', error);
      throw error;
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
      .upsert([user]); // Usa upsert para criar ou atualizar
    if (error) throw error;
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
<<<<<<< HEAD
=======
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
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
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
