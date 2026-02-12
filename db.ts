
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement } from './types';

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
// ==========================================================
// 🚨 CONFIGURAÇÃO IMPORTANTE DO SUPABASE 🚨
// No seu painel do Supabase, vá em: Settings -> API Keys
// Copie a chave que está em "Project API Keys" -> linha "anon" / "public"
// Ela é bem grande e começa com "eyJ..."
// ==========================================================

const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
<<<<<<< HEAD
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 

// Alerta de depuração para o desenvolvedor
if (SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM') {
  console.error("ERRO: Você esqueceu de configurar a SUPABASE_ANON_KEY no arquivo db.ts!");
}
=======
<<<<<<< HEAD
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM'; 
=======
const SUPABASE_ANON_KEY = 'COLE_AQUI_A_CHAVE_QUE_COMECA_COM_EYJ'; 
>>>>>>> a1aa7a633e7e549cc6b66d5978e0ad7c4874cc0e
<<<<<<< HEAD

// Alerta de depuração para o desenvolvedor
if (SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM') {
  console.error("ERRO: Você esqueceu de configurar a SUPABASE_ANON_KEY no arquivo db.ts!");
}
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
// Credenciais configuradas conforme fornecido pelo usuário
const SUPABASE_URL = 'https://lhcobtexredrovjbxaew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoY29idGV4cmVkcm92amJ4YWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUzMTgsImV4cCI6MjA4NjQzMTMxOH0.Uas2nsjazqZtQjenkmLC3Abzr1zh4Xcye1VK-OKOhpM';
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d

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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    // Inscrição para mudanças em tempo real
>>>>>>> cd0eb5e063378642ea76e75d5c586f142b67daaf
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 41847a016de112ad688e98a2f0b2a0b5b9747c46
>>>>>>> af6ab0391dedeb454b3b0bf70d524013d08dbc72
>>>>>>> 8253819b964e9cfcbcdcc0400016d0b361091f5a
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
>>>>>>> d37780d972bcd709df37aed863d9e3f91d0c0e36
>>>>>>> 1175349fe900ebb5959efa1273d800b029a3488d
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
