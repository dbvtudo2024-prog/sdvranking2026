
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage, Devotional, ThreeCluesQuestion, SpecialtyStudy, SpecialtyDBV, CounselorDB, GameConfig } from '@/types';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | undefined>;
  }
}

const DEFAULT_URL = 'https://heuotluvniqozsuwcnpi.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldW90bHV2bmlxb3pzdXdjbnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTg5NDcsImV4cCI6MjA4ODgzNDk0N30.IPeNpraSXp_Zup8Lc57LaOcchqt7SVkPk0Crozvr1Jk';

const getValidSupabaseConfig = () => {
  let url = import.meta.env.VITE_SUPABASE_URL;
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const extractRefFromJwt = (jwt: string): string | null => {
    try {
      if (jwt && jwt.includes('.')) {
        const parts = jwt.split('.');
        if (parts[1]) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decoded = atob(payloadBase64);
          const parsed = JSON.parse(decoded);
          if (parsed && parsed.ref) {
            return parsed.ref;
          }
        }
      }
    } catch (e) {
      console.warn("[getValidSupabaseConfig] Falha ao extrair projeto do JWT:", e);
    }
    return null;
  };

  let detectedRef = null;
  if (key && key.includes('.')) {
    detectedRef = extractRefFromJwt(key);
  }
  if (!detectedRef && url && url.includes('.')) {
    detectedRef = extractRefFromJwt(url);
    const temp = url;
    url = key;
    key = temp;
  }

  if (detectedRef) {
    url = `https://${detectedRef}.supabase.co`;
    console.log("[getValidSupabaseConfig] URL de banco autodetectada com sucesso:", url);
  }

  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    url = DEFAULT_URL;
  }
  if (!key || typeof key !== 'string' || key.trim() === '') {
    key = DEFAULT_KEY;
  }
  return { url: url.trim(), key: key.trim() };
};

const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = getValidSupabaseConfig();

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FALLBACK_BIBLE: Record<string, Record<number, { Versiculo: number; Texto: string }[]>> = {
  "Gênesis": {
    1: [
      { Versiculo: 1, Texto: "No princípio, criou Deus os céus e a terra." },
      { Versiculo: 2, Texto: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." },
      { Versiculo: 3, Texto: "E disse Deus: Haja luz. E houve luz." },
      { Versiculo: 4, Texto: "E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas." },
      { Versiculo: 5, Texto: "E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro." }
    ]
  },
  "Salmos": {
    23: [
      { Versiculo: 1, Texto: "O Senhor é o meu pastor; nada me faltará." },
      { Versiculo: 2, Texto: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
      { Versiculo: 3, Texto: "Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome." },
      { Versiculo: 4, Texto: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam." },
      { Versiculo: 5, Texto: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda." },
      { Versiculo: 6, Texto: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na Casa do Senhor por longos dias." }
    ],
    46: [
      { Versiculo: 1, Texto: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia." },
      { Versiculo: 10, Texto: "Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações, serei exaltado na terra." }
    ],
    119: [
      { Versiculo: 9, Texto: "Como purificará o jovem o seu caminho? Observando-o conforme a tua palavra." },
      { Versiculo: 11, Texto: "Escondi a tua palavra no meu coração, para não pecar contra ti." },
      { Versiculo: 105, Texto: "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." }
    ]
  },
  "Mateus": {
    1: [
      { Versiculo: 1, Texto: "Livro da geração de Jesus Cristo, Filho de Davi, Filho de Abraão." }
    ],
    5: [
      { Versiculo: 1, Texto: "E Jesus, vendo a multidão, subiu a um monte, e, assentando-se, aproximaram-se dele os seus discípulos;" },
      { Versiculo: 2, Texto: "e, abrindo a boca, os ensinava, dizendo:" },
      { Versiculo: 3, Texto: "Bem-aventurados os pobres de espírito, porque deles é o Reino dos céus;" },
      { Versiculo: 4, Texto: "bem-aventurados os que choram, porque eles serão consolados;" },
      { Versiculo: 5, Texto: "bem-aventurados os mansos, porque eles herdarão a terra;" },
      { Versiculo: 6, Texto: "bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos;" },
      { Versiculo: 7, Texto: "bem-aventurados os misericordiosos, porque eles alcançarão misericórdia;" },
      { Versiculo: 8, Texto: "bem-aventurados os limpos de coração, porque eles verão a Deus;" },
      { Versiculo: 9, Texto: "bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus;" },
      { Versiculo: 10, Texto: "bem-aventurados os que sofrem perseguição por causa da justiça, porque deles é o Reino dos céus." }
    ]
  },
  "João": {
    1: [
      { Versiculo: 1, Texto: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
      { Versiculo: 2, Texto: "Ele estava no princípio com Deus." },
      { Versiculo: 3, Texto: "Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez." },
      { Versiculo: 4, Texto: "Nele estava a vida, e a vida era a luz dos homens;" },
      { Versiculo: 14, Texto: "E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, como a glória do Unigênito do Pai, cheio de graça e de verdade." }
    ],
    3: [
      { Versiculo: 16, Texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." }
    ],
    14: [
      { Versiculo: 1, Texto: "Não se turbe o vosso coração; credes em Deus, crede também em mim." },
      { Versiculo: 6, Texto: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim." }
    ]
  }
};

const FALLBACK_DEVOTIONALS: Devotional[] = [
  {
    id: -1,
    title: "Firmes Como a Rocha",
    content: "Como desbravadores, somos chamados a estar firmes nas verdades de Deus. Em Mateus 7:24, Jesus diz que aquele que ouve Suas palavras e as pratica é como o homem prudente que edificou sua casa sobre a rocha. Diante das tempestades da vida ou de decisões difíceis na escola e no dia a dia, lembre-se de que a nossa única base segura é Jesus Cristo. Permaneça firme na oração e no estudo da Bíblia hoje!",
    link: "https://www.adventistas.org/pt/desbravadores/",
    scheduled_for: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: -2,
    title: "O Guia do Caminho",
    content: "Lâmpada para os meus pés é a tua palavra e luz, para o meu caminho (Salmo 119:105). Imagine fazer uma trilha na floresta à noite sem nenhuma luz - seria impossível não tropeçar! Muitas vezes tentamos caminhar pelas nossas próprias forças sem consultar a Deus. A Bíblia é o mapa supremo e a luz de navegação que Ele nos deu. Antes de iniciar qualquer atividade no dia de hoje, abra o Mapa e peça direção de Deus.",
    link: "https://www.adventistas.org/pt/desbravadores/",
    scheduled_for: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: -3,
    title: "O Escudo da Fé",
    content: "Em Efésios 6:16, a Bíblia nos incentiva a tomar o escudo da fé, com o qual poderemos apagar todos os dardos inflamados do maligno. Um desbravador preparado sabe que o escudo da fé não vem de nossa própria justiça, mas sim de confiar inteiramente no Senhor. Exercite sua fé hoje compartilhando bondade e mantendo seus pensamentos focados em coisas elevadas e puras.",
    link: "https://www.adventistas.org/pt/desbravadores/",
    scheduled_for: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: -4,
    title: "Uma Mensagem a Compartilhar",
    content: "Ide por todo o mundo, pregai o evangelho a toda criatura (Marcos 16:15). Ser desbravador é também ser um mensageiro. O triângulo em nosso uniforme nos desafia a desenvolver as áreas física, mental e espiritual para servir. Compartilhe hoje uma palavra de esperança com um amigo ou familiar que esteja passando por dificuldades. A mensagem do advento deve ser levada a todo o mundo em nossa geração!",
    link: "https://www.adventistas.org/pt/desbravadores/",
    scheduled_for: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

export const DatabaseService = {
  // --- CHAT ---
  async getMessages(unit: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('unit', unit)
      .order('created_at', { ascending: false }) 
      .limit(50);
    
    if (error) throw error;
    // Reverse to show oldest first (standard chat behavior)
    return ((data || []) as ChatMessage[]).reverse();
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

  // Escuta mensagens filtradas por unidade ou todas
  subscribeMessages(unit: string | null, callback: (msg: ChatMessage) => void) {
    const channelId = `chat_${unit || 'all'}_${Math.random().toString(36).substring(7)}`;
    const filter = unit ? { table: 'messages', filter: `unit=eq.${unit}` } : { table: 'messages' };
    
    return supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        ...filter
      }, payload => {
        callback(payload.new as ChatMessage);
      })
      .subscribe();
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

  // --- REALTIME CONSOLIDADO ---
  // Reduz a carga no banco usando um único canal para múltiplas tabelas
  subscribeGlobalData(callbacks: {
    onMembers?: (members: Member[]) => void,
    onAnnouncements?: (announcements: Announcement[]) => void,
    onCounselors?: (counselors: CounselorDB[]) => void,
    onGameConfigs?: (config: GameConfig) => void,
    onChallenges?: (challenge: Challenge1x1) => void
  }) {
    const channelId = `global_updates_${Math.random().toString(36).substring(7)}`;
    console.log(`[Realtime] Iniciando canal global: ${channelId}`);
    const channel = supabase.channel(channelId);

    let localMembers: Member[] = [];
    let localAnnouncements: Announcement[] = [];
    let localCounselors: CounselorDB[] = [];

    // Auxiliary to ensure consistent config data
    const transformConfig = (data: any): GameConfig => ({
      ...data,
      quiz_override: data.quiz_override ?? false,
      quiz_allowed_day: data.quiz_allowed_day ?? null,
      memory_override: data.memory_override ?? false,
      memory_allowed_day: data.memory_allowed_day ?? null,
      specialty_override: data.specialty_override ?? false,
      specialty_allowed_day: data.specialty_allowed_day ?? null,
      three_clues_override: data.three_clues_override ?? false,
      three_clues_allowed_day: data.three_clues_allowed_day ?? null,
      puzzle_override: data.puzzle_override ?? false,
      puzzle_allowed_day: data.puzzle_allowed_day ?? null,
      knots_override: data.knots_override ?? false,
      knots_allowed_day: data.knots_allowed_day ?? null,
      specialty_trail_override: data.specialty_trail_override ?? false,
      specialty_trail_allowed_day: data.specialty_trail_allowed_day ?? null,
      scrambled_verse_override: data.scrambled_verse_override ?? false,
      scrambled_verse_allowed_day: data.scrambled_verse_allowed_day ?? null,
      nature_id_override: data.nature_id_override ?? false,
      nature_id_allowed_day: data.nature_id_allowed_day ?? null,
      first_aid_override: data.first_aid_override ?? false,
      first_aid_allowed_day: data.first_aid_allowed_day ?? null,
      brick_breaker_override: data.brick_breaker_override ?? false,
      brick_breaker_allowed_day: data.brick_breaker_allowed_day ?? null,
      mahjong_override: data.mahjong_override ?? false,
      mahjong_allowed_day: data.mahjong_allowed_day ?? null,
    });

    // Fetch initial data and setup logic for each table
    if (callbacks.onMembers) {
      console.log("[Realtime] Buscando membros...");
      this.getMembers().then(data => {
        localMembers = data;
        callbacks.onMembers!(localMembers);
      }).catch(err => console.error("[Realtime] Erro ao buscar membros:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, payload => {
        console.log("[Realtime] Mudança em members:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          localMembers = [...localMembers, payload.new as Member];
        } else if (payload.eventType === 'UPDATE') {
          localMembers = localMembers.map(m => String(m.id) === String(payload.new.id) ? { ...m, ...payload.new } : m);
        } else if (payload.eventType === 'DELETE') {
          localMembers = localMembers.filter(m => String(m.id) !== String(payload.old.id));
        }
        callbacks.onMembers!([...localMembers]);
      });
    }

    if (callbacks.onAnnouncements) {
      console.log("[Realtime] Buscando anúncios...");
      this.getAnnouncements().then(data => {
        localAnnouncements = data;
        callbacks.onAnnouncements!(localAnnouncements);
      }).catch(err => console.error("[Realtime] Erro ao buscar anúncios:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
        console.log("[Realtime] Mudança em announcements:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          localAnnouncements = [payload.new as Announcement, ...localAnnouncements];
        } else if (payload.eventType === 'UPDATE') {
          localAnnouncements = localAnnouncements.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a);
        } else if (payload.eventType === 'DELETE') {
          localAnnouncements = localAnnouncements.filter(a => a.id !== payload.old.id);
        }
        callbacks.onAnnouncements!([...localAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });
    }

    if (callbacks.onCounselors) {
      console.log("[Realtime] Buscando conselheiros...");
      this.getCounselors().then(data => {
        localCounselors = data;
        callbacks.onCounselors!(localCounselors);
      }).catch(err => console.error("[Realtime] Erro ao buscar conselheiros:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'conselheiros' }, payload => {
        console.log("[Realtime] Mudança em conselheiros:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          const newC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = [...localCounselors, newC];
        } else if (payload.eventType === 'UPDATE') {
          const updatedC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = localCounselors.map(c => c.id === payload.new.id ? updatedC : c);
        } else if (payload.eventType === 'DELETE') {
          localCounselors = localCounselors.filter(c => c.id !== payload.old.id);
        }
        callbacks.onCounselors!([...localCounselors].sort((a, b) => a.name.localeCompare(b.name)));
      });
    }

    if (callbacks.onGameConfigs) {
      console.log("[Realtime] Buscando game configs...");
      this.getGameConfigs().then(config => {
        if (config) callbacks.onGameConfigs!(config);
      }).catch(err => console.error("[Realtime] Erro ao buscar game configs:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'game_configs' }, payload => {
        console.log("[Realtime] Mudança em game_configs:", payload.eventType);
        if (payload.new) callbacks.onGameConfigs!(transformConfig(payload.new));
      });
    }

    if (callbacks.onChallenges) {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, payload => {
        callbacks.onChallenges!(payload.new as Challenge1x1);
      });
    }

    return channel.subscribe((status) => {
      console.log(`[Realtime] Status do canal ${channelId}:`, status);
    });
  },

  // --- MEMBROS ---
  async getMembers(): Promise<Member[]> {
    return withRetry(async () => {
      console.log("[DB] Buscando membros...");
      const { data, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) {
        console.error("[DB] Erro ao buscar membros:", error);
        throw error;
      }
      console.log(`[DB] ${data?.length || 0} membros encontrados.`);
      if (data && data.length > 0) {
        console.log("[DB] Colunas em members:", Object.keys(data[0]));
      }
      return (data || []).map(m => ({
        ...m,
        badges: m.badges || [],
        scores: m.scores || [],
        stats: m.stats || {}
      })) as Member[];
    });
  },

  subscribeMembers(callback: (members: Member[]) => void) {
    let localMembers: Member[] = [];
    this.getMembers().then(data => {
      localMembers = data;
      callback(localMembers);
    }).catch(err => console.error("Erro no subscribeMembers:", err));

    return supabase
      .channel('members_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, payload => {
        if (payload.eventType === 'INSERT') {
          localMembers = [...localMembers, payload.new as Member];
        } else if (payload.eventType === 'UPDATE') {
          localMembers = localMembers.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m);
        } else if (payload.eventType === 'DELETE') {
          localMembers = localMembers.filter(m => m.id !== payload.old.id);
        }
        callback([...localMembers]);
      })
      .subscribe();
  },

  async addMember(member: Member) {
    const payload: any = {
      id: member.id,
      name: member.name,
      role: member.role,
      age: member.age,
      className: member.className,
      joinedAt: member.joinedAt,
      birthday: member.birthday,
      counselor: member.counselor,
      unit: member.unit,
      scores: member.scores,
      photoUrl: member.photoUrl,
      badges: member.badges,
      stats: member.stats
    };
    
    try {
      const { error } = await supabase.from('members').insert([payload]);
      if (error) {
        if (error.code === 'PGRST204' || error.message?.toLowerCase().includes('column')) {
          console.warn("Removendo colunas extras (badges/stats) por não existirem na tabela 'members':", error.message);
          const fallbackPayload = { ...payload };
          delete fallbackPayload.badges;
          delete fallbackPayload.stats;
          
          const { error: retryError } = await supabase.from('members').insert([fallbackPayload]);
          if (retryError) {
            throw retryError;
          }
          return;
        }
        throw error;
      }
    } catch (e) {
      console.error("Erro ao adicionar membro:", e);
      throw e;
    }
  },

  async updateMember(member: Member) {
    const { id, ...updates } = member;
    const payload: any = {
      name: updates.name,
      role: updates.role,
      age: updates.age,
      className: updates.className,
      joinedAt: updates.joinedAt,
      birthday: updates.birthday,
      counselor: updates.counselor,
      unit: updates.unit,
      scores: updates.scores,
      photoUrl: updates.photoUrl
    };

    // Só inclui badges e stats se existirem no objeto (ajuda na migração)
    if (updates.badges) payload.badges = updates.badges;
    if (updates.stats) payload.stats = updates.stats;

    try {
      const { error } = await supabase.from('members').update(payload).eq('id', id);
      if (error) {
        if (error.code === 'PGRST204' || error.message?.toLowerCase().includes('column')) {
          console.warn("Removendo colunas extras (badges/stats) por não existirem na tabela 'members' no update:", error.message);
          const fallbackPayload = { ...payload };
          delete fallbackPayload.badges;
          delete fallbackPayload.stats;
          
          const { error: retryError } = await supabase.from('members').update(fallbackPayload).eq('id', id);
          if (retryError) {
            throw retryError;
          }
          return;
        }
        throw error;
      }
    } catch (e) {
      console.error("Erro ao atualizar membro no Supabase:", e);
      throw e;
    }
  },

  async updateMembers(members: Member[]) {
    const payloads = members.map(m => {
      const p: any = {
        id: m.id,
        name: m.name,
        role: m.role,
        age: m.age,
        className: m.className,
        joinedAt: m.joinedAt,
        birthday: m.birthday,
        counselor: m.counselor,
        unit: m.unit,
        scores: m.scores,
        photoUrl: m.photoUrl
      };
      if (m.badges) p.badges = m.badges;
      if (m.stats) p.stats = m.stats;
      return p;
    });

    try {
      const { error } = await supabase.from('members').upsert(payloads);
      if (error) {
        if (error.code === 'PGRST204' || error.message?.toLowerCase().includes('column')) {
          console.warn("Removendo colunas extras (badges/stats) no upsert de múltiplos de 'members':", error.message);
          const fallbackPayloads = payloads.map(p => {
            const fp = { ...p };
            delete fp.badges;
            delete fp.stats;
            return fp;
          });
          const { error: retryError } = await supabase.from('members').upsert(fallbackPayloads);
          if (retryError) {
            throw retryError;
          }
          return;
        }
        throw error;
      }
    } catch (e) {
      console.error("Erro ao atualizar múltiplos membros:", e);
      throw e;
    }
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
    let localCounselors: CounselorDB[] = [];
    this.getCounselors().then(data => {
      localCounselors = data;
      callback(localCounselors);
    });

    return supabase
      .channel('conselheiros_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conselheiros' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = [...localCounselors, newC];
        } else if (payload.eventType === 'UPDATE') {
          const updatedC = { id: payload.new.id, name: payload.new.nome, created_at: payload.new.created_at };
          localCounselors = localCounselors.map(c => c.id === payload.new.id ? updatedC : c);
        } else if (payload.eventType === 'DELETE') {
          localCounselors = localCounselors.filter(c => c.id !== payload.old.id);
        }
        callback([...localCounselors].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .subscribe();
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    console.log("[DB] Buscando avisos...");
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) {
      console.error("[DB] Erro ao buscar avisos:", error);
      return [];
    }
    console.log(`[DB] ${data?.length || 0} avisos encontrados.`);
    return (data || []) as Announcement[];
  },

  subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
    let localAnnouncements: Announcement[] = [];
    this.getAnnouncements().then(data => {
      localAnnouncements = data;
      callback(localAnnouncements);
    });

    return supabase
      .channel('announcements_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
        if (payload.eventType === 'INSERT') {
          localAnnouncements = [payload.new as Announcement, ...localAnnouncements];
        } else if (payload.eventType === 'UPDATE') {
          localAnnouncements = localAnnouncements.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a);
        } else if (payload.eventType === 'DELETE') {
          localAnnouncements = localAnnouncements.filter(a => a.id !== payload.old.id);
        }
        callback([...localAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .subscribe();
  },

  async addAnnouncement(ann: Announcement) {
    await supabase.from('announcements').insert([ann]);
  },

  async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  },

  async seedAnnouncements(announcements: Omit<Announcement, 'id'>[]) {
    for (const ann of announcements) {
      const { data } = await supabase.from('announcements').select('id').eq('title', ann.title).eq('date', ann.date);
      if (!data || data.length === 0) {
        await this.addAnnouncement({
          ...ann,
          id: Math.random().toString(36).substr(2, 9)
        } as Announcement);
      }
    }
  },

  // --- ESPECIALIDADES ---
  async getSpecialties(): Promise<SpecialtyDBV[]> {
    const { data, error } = await supabase.from('EspecialidadesDBV').select('*').order('Nome', { ascending: true });
    return (data || []) as SpecialtyDBV[];
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDBV[]) => void) {
    let localSpecialties: SpecialtyDBV[] = [];
    this.getSpecialties().then(data => {
      localSpecialties = data;
      callback(localSpecialties);
    });

    return supabase
      .channel('specialties_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'EspecialidadesDBV' }, payload => {
        if (payload.eventType === 'INSERT') {
          localSpecialties = [...localSpecialties, payload.new as SpecialtyDBV];
        } else if (payload.eventType === 'UPDATE') {
          localSpecialties = localSpecialties.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s);
        } else if (payload.eventType === 'DELETE') {
          localSpecialties = localSpecialties.filter(s => s.id !== payload.old.id);
        }
        callback([...localSpecialties].sort((a, b) => a.Nome.localeCompare(b.Nome)));
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

  async seedSpecialties(specialties: any[]) {
    for (const s of specialties) {
      const { data } = await supabase.from('EspecialidadesDBV').select('id').eq('Nome', s.name);
      if (!data || data.length === 0) {
        await this.addSpecialty({
          Nome: s.name,
          Imagem: s.image,
          Categoria: s.category || 'Geral',
          Like: false
        });
      }
    }
  },

  // --- CONFIGURAÇÕES DE JOGOS ---
  async getGameConfigs(): Promise<GameConfig | null> {
    const { data, error } = await supabase.from('game_configs').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      return {
        id: 1,
        quiz_override: false,
        quiz_allowed_day: null,
        memory_override: false,
        memory_allowed_day: null,
        specialty_override: false,
        specialty_allowed_day: null,
        three_clues_override: false,
        three_clues_allowed_day: null,
        puzzle_override: false,
        puzzle_allowed_day: null,
        knots_override: false,
        knots_allowed_day: null,
        specialty_trail_override: false,
        specialty_trail_allowed_day: null,
        scrambled_verse_override: false,
        scrambled_verse_allowed_day: null,
        nature_id_override: false,
        nature_id_allowed_day: null,
        first_aid_override: false,
        first_aid_allowed_day: null,
        brick_breaker_override: false,
        brick_breaker_allowed_day: null,
        mahjong_override: false,
        mahjong_allowed_day: null,
        last_monthly_award_month: null
      } as GameConfig;
    }
    return {
      ...data,
      quiz_override: data.quiz_override ?? false,
      quiz_allowed_day: data.quiz_allowed_day ?? null,
      memory_override: data.memory_override ?? false,
      memory_allowed_day: data.memory_allowed_day ?? null,
      specialty_override: data.specialty_override ?? false,
      specialty_allowed_day: data.specialty_allowed_day ?? null,
      three_clues_override: data.three_clues_override ?? false,
      three_clues_allowed_day: data.three_clues_allowed_day ?? null,
      puzzle_override: data.puzzle_override ?? false,
      puzzle_allowed_day: data.puzzle_allowed_day ?? null,
      knots_override: data.knots_override ?? false,
      knots_allowed_day: data.knots_allowed_day ?? null,
      specialty_trail_override: data.specialty_trail_override ?? false,
      specialty_trail_allowed_day: data.specialty_trail_allowed_day ?? null,
      scrambled_verse_override: data.scrambled_verse_override ?? false,
      scrambled_verse_allowed_day: data.scrambled_verse_allowed_day ?? null,
      nature_id_override: data.nature_id_override ?? false,
      nature_id_allowed_day: data.nature_id_allowed_day ?? null,
      first_aid_override: data.first_aid_override ?? false,
      first_aid_allowed_day: data.first_aid_allowed_day ?? null,
      brick_breaker_override: data.brick_breaker_override ?? false,
      brick_breaker_allowed_day: data.brick_breaker_allowed_day ?? null,
      mahjong_override: data.mahjong_override ?? false,
      mahjong_allowed_day: data.mahjong_allowed_day ?? null,
      last_monthly_award_month: data.last_monthly_award_month
    } as GameConfig;
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
    return (data || []).map(q => {
      let category = q.category;
      let question = q.question;

      // Lógica de mapeamento reverso: extrai a subcategoria do prefixo da pergunta
      if (q.category === 'Desbravadores') {
        if (q.question.startsWith('[Natureza] ')) {
          category = 'Natureza';
          question = q.question.replace('[Natureza] ', '');
        } else if (q.question.startsWith('[Primeiros Socorros] ')) {
          category = 'Primeiros Socorros';
          question = q.question.replace('[Primeiros Socorros] ', '');
        } else if (q.question.startsWith('[Especialidades] ')) {
          category = 'Especialidades';
          question = q.question.replace('[Especialidades] ', '');
        }
      }

      return {
        id: q.id,
        category: category as any,
        question: question,
        options: q.options,
        correct_answer: q.correct_answer,
        image_url: q.image_url,
        tip: q.tip
      };
    }) as QuizQuestion[];
  },

  async getQuizCategories(): Promise<string[]> {
    const { data, error } = await supabase.from('quiz_questions').select('category');
    if (error) return ['Desbravadores', 'Bíblia', 'Natureza', 'Primeiros Socorros', 'Especialidades'];
    const categories = Array.from(new Set(data.map(d => d.category)));
    return categories.length > 0 ? categories : ['Desbravadores', 'Bíblia', 'Natureza', 'Primeiros Socorros', 'Especialidades'];
  },

  async addQuizQuestion(q: Omit<QuizQuestion, 'id'>) {
    let dbCategory = q.category;
    let dbQuestion = q.question;

    // Mapeia categorias extras para 'Desbravadores' com prefixo no texto
    if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
      dbCategory = 'Desbravadores';
      dbQuestion = `[${q.category}] ${q.question}`;
    }

    const payload = {
      category: dbCategory,
      question: dbQuestion,
      options: q.options,
      correct_answer: q.correct_answer,
      image_url: q.image_url,
      tip: q.tip
    };
    const { error } = await supabase.from('quiz_questions').insert([payload]);
    if (error) {
      console.error("Erro ao adicionar questão no Supabase:", error);
      throw error;
    }
  },

  async updateQuizQuestion(q: QuizQuestion) {
    let dbCategory = q.category;
    let dbQuestion = q.question;

    if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
      dbCategory = 'Desbravadores';
      dbQuestion = `[${q.category}] ${q.question}`;
    }

    const payload = {
      category: dbCategory,
      question: dbQuestion,
      options: q.options,
      correct_answer: q.correct_answer,
      image_url: q.image_url,
      tip: q.tip
    };
    const { error } = await supabase.from('quiz_questions').update(payload).eq('id', q.id);
    if (error) throw error;
  },

  async deleteQuizQuestion(id: string) {
    await supabase.from('quiz_questions').delete().eq('id', id);
  },

  async seedQuizQuestions(questions: Omit<QuizQuestion, 'id'>[]) {
    try {
      // 1. Buscar todas as questões existentes para evitar duplicatas em uma única consulta
      const { data: existing, error: fetchError } = await supabase.from('quiz_questions').select('category, question');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => `${e.category}|${e.question.trim()}`));

      const toInsert = [];
      for (const q of questions) {
        let dbCategory = q.category;
        let dbQuestion = q.question.trim();

        if (['Natureza', 'Primeiros Socorros', 'Especialidades'].includes(q.category)) {
          dbCategory = 'Desbravadores';
          dbQuestion = `[${q.category}] ${dbQuestion}`;
        }

        if (!existingSet.has(`${dbCategory}|${dbQuestion}`)) {
          toInsert.push({
            category: dbCategory,
            question: dbQuestion,
            options: q.options,
            correct_answer: q.correct_answer,
            image_url: q.image_url,
            tip: q.tip
          });
        }
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('quiz_questions').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedQuizQuestions:", error);
      throw error;
    }
  },

  subscribeQuizQuestions(callback: (questions: QuizQuestion[]) => void) {
    let localQuestions: QuizQuestion[] = [];
    
    const mapQ = (q: any): QuizQuestion => {
      let category = q.category;
      let question = q.question;
      if (q.category === 'Desbravadores') {
        if (q.question.startsWith('[Natureza] ')) {
          category = 'Natureza';
          question = q.question.replace('[Natureza] ', '');
        } else if (q.question.startsWith('[Primeiros Socorros] ')) {
          category = 'Primeiros Socorros';
          question = q.question.replace('[Primeiros Socorros] ', '');
        } else if (q.question.startsWith('[Especialidades] ')) {
          category = 'Especialidades';
          question = q.question.replace('[Especialidades] ', '');
        }
      }
      return {
        id: q.id,
        category: category as any,
        question: question,
        options: q.options,
        correct_answer: q.correct_answer,
        image_url: q.image_url,
        tip: q.tip
      };
    };

    this.getQuizQuestions().then(data => {
      localQuestions = data;
      callback(localQuestions);
    });

    return supabase
      .channel('quiz_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_questions' }, payload => {
        if (payload.eventType === 'INSERT') {
          localQuestions = [mapQ(payload.new), ...localQuestions];
        } else if (payload.eventType === 'UPDATE') {
          localQuestions = localQuestions.map(q => q.id === payload.new.id ? mapQ(payload.new) : q);
        } else if (payload.eventType === 'DELETE') {
          localQuestions = localQuestions.filter(q => q.id !== payload.old.id);
        }
        callback([...localQuestions]);
      })
      .subscribe();
  },

  // --- ARENA 1x1 ---




  // --- USUÁRIOS ---
  async getUsers(): Promise<AuthUser[]> {
    return withRetry(async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        throw error;
      }
      return (data || []) as AuthUser[];
    });
  },

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email);
      
      if (error) {
        console.error("Erro ao buscar usuário por e-mail:", error);
        throw error;
      }
      if (data && data.length > 0) {
        return data[0] as AuthUser;
      }
      return null;
    });
  },

  async addUser(user: AuthUser) {
    // Save all fields to users table including stats and badges
    const payload: any = {
      id: user.id,
      name: user.name,
      role: user.role,
      funcao: user.funcao,
      unit: user.unit,
      age: user.age,
      className: user.className,
      birthday: user.birthday,
      email: user.email,
      password: user.password,
      photoUrl: user.photoUrl,
      stats: user.stats,
      badges: user.badges
    };
    
    try {
      const { error } = await supabase.from('users').upsert([payload]);
      if (error) {
        if (error.code === 'PGRST204' || error.message?.toLowerCase().includes('column')) {
          console.warn("Removendo colunas extras (badges/stats) por não existirem na tabela 'users':", error.message);
          const fallbackPayload = { ...payload };
          delete fallbackPayload.badges;
          delete fallbackPayload.stats;
          
          const { error: retryError } = await supabase.from('users').upsert([fallbackPayload]);
          if (retryError) {
            throw retryError;
          }
          return;
        }
        throw error;
      }
    } catch (e) {
      console.error("Erro ao adicionar usuário:", e);
      throw e;
    }
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
  },

  // --- LEITURA BÍBLICA ---
  async getBibleProgress(userId: string): Promise<any[]> {
    const { data } = await supabase.from('bible_reading').select('*').eq('user_id', userId);
    return data || [];
  },

  async updateBibleProgress(userId: string, planId: string, completedItems: string[]) {
    await supabase.from('bible_reading').upsert([{
      user_id: userId,
      plan_id: planId,
      completed_items: completedItems,
      last_updated: new Date().toISOString()
    }], { onConflict: 'user_id,plan_id' });
  },

  // --- BÍBLIA COMPLETA ---
  async getBibleBooks(): Promise<string[]> {
    return [
      "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
      "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias",
      "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Isaías", "Jeremias",
      "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas",
      "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
      "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios",
      "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
      "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
      "1 João", "2 João", "3 João", "Judas", "Apocalipse"
    ];
  },

  async getBibleChapters(book: string): Promise<number[]> {
    try {
      const { data: colsData, error: colsErr } = await supabase
        .from('Biblia_Completa')
        .select('*')
        .limit(1);

      let bookKey = 'book_name';
      let chapterKey = 'chapter';
      let verseKey = 'verse_number';

      if (!colsErr && colsData && colsData.length > 0) {
        const row = colsData[0];
        const keys = Object.keys(row);
        const b = keys.find(k => k.toLowerCase() === 'book_name' || k.toLowerCase() === 'livro' || k.toLowerCase() === 'book');
        const c = keys.find(k => k.toLowerCase() === 'chapter' || k.toLowerCase() === 'capitulo');
        const v = keys.find(k => k.toLowerCase() === 'verse_number' || k.toLowerCase() === 'versiculo' || k.toLowerCase() === 'verse');
        if (b) bookKey = b;
        if (c) chapterKey = c;
        if (v) verseKey = v;
      }

      // Tenta recuperar no banco
      const { data, error } = await supabase
        .from('Biblia_Completa')
        .select(chapterKey)
        .eq(bookKey, book);

      if (!error && data && data.length > 0) {
        const chapters = data.map(d => parseInt(d[chapterKey]));
        const uniqueChapters = Array.from(new Set(chapters)).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (uniqueChapters.length > 0) {
          return uniqueChapters;
        }
      }
    } catch (err) {
      console.error("Erro ao buscar capítulos dinamicamente:", err);
    }

    // Fallback se falhar ou estiver vazio
    if (FALLBACK_BIBLE[book]) {
      const chapters = Object.keys(FALLBACK_BIBLE[book]).map(Number);
      return chapters.sort((a, b) => a - b);
    }
    return Array.from({ length: 28 }, (_, i) => i + 1);
  },

  async getBibleVerses(book: string, chapter: number): Promise<any[]> {
    try {
      const { data: colsData, error: colsErr } = await supabase
        .from('Biblia_Completa')
        .select('*')
        .limit(1);

      let bookKey = 'book_name';
      let chapterKey = 'chapter';
      let verseKey = 'verse_number';
      let textKey = 'text';

      if (!colsErr && colsData && colsData.length > 0) {
        const row = colsData[0];
        const keys = Object.keys(row);
        const b = keys.find(k => k.toLowerCase() === 'book_name' || k.toLowerCase() === 'livro' || k.toLowerCase() === 'book');
        const c = keys.find(k => k.toLowerCase() === 'chapter' || k.toLowerCase() === 'capitulo');
        const v = keys.find(k => k.toLowerCase() === 'verse_number' || k.toLowerCase() === 'versiculo' || k.toLowerCase() === 'verse');
        const t = keys.find(k => k.toLowerCase() === 'text' || k.toLowerCase() === 'texto');
        if (b) bookKey = b;
        if (c) chapterKey = c;
        if (v) verseKey = v;
        if (t) textKey = t;
      }

      // Busca versículos
      const { data, error } = await supabase
        .from('Biblia_Completa')
        .select(`${verseKey}, ${textKey}`)
        .eq(bookKey, book)
        .or(`${chapterKey}.eq.${chapter},${chapterKey}.eq."${chapter}"`);

      if (!error && data && data.length > 0) {
        return data.map(v => ({
          Versiculo: parseInt(v[verseKey]),
          Texto: v[textKey]
        })).sort((a, b) => a.Versiculo - b.Versiculo);
      }
    } catch (e) {
      console.error("Erro ao buscar versículos dinamicamente:", e);
    }

    const fbBook = FALLBACK_BIBLE[book];
    if (fbBook && fbBook[chapter]) {
      return fbBook[chapter];
    }
    return [];
  },

  async searchBible(term: string): Promise<any[]> {
    try {
      const { data: colsData, error: colsErr } = await supabase
        .from('Biblia_Completa')
        .select('*')
        .limit(1);

      let bookKey = 'book_name';
      let chapterKey = 'chapter';
      let verseKey = 'verse_number';
      let textKey = 'text';

      if (!colsErr && colsData && colsData.length > 0) {
        const row = colsData[0];
        const keys = Object.keys(row);
        const b = keys.find(k => k.toLowerCase() === 'book_name' || k.toLowerCase() === 'livro' || k.toLowerCase() === 'book');
        const c = keys.find(k => k.toLowerCase() === 'chapter' || k.toLowerCase() === 'capitulo');
        const v = keys.find(k => k.toLowerCase() === 'verse_number' || k.toLowerCase() === 'versiculo' || k.toLowerCase() === 'verse');
        const t = keys.find(k => k.toLowerCase() === 'text' || k.toLowerCase() === 'texto');
        if (b) bookKey = b;
        if (c) chapterKey = c;
        if (v) verseKey = v;
        if (t) textKey = t;
      }

      const { data, error } = await supabase
        .from('Biblia_Completa')
        .select(`${bookKey}, ${chapterKey}, ${verseKey}, ${textKey}`)
        .ilike(textKey, `%${term}%`)
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map(v => ({
          Livro: v[bookKey],
          Capitulo: parseInt(v[chapterKey]),
          Versiculo: parseInt(v[verseKey]),
          Texto: v[textKey]
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar termo na Bíblia:", e);
    }

    // Fallback local search
    const results: any[] = [];
    const lowerTerm = term.toLowerCase();
    for (const [bName, chaps] of Object.entries(FALLBACK_BIBLE)) {
      for (const [cNum, vers] of Object.entries(chaps)) {
        for (const vObj of vers) {
          if (vObj.Texto.toLowerCase().includes(lowerTerm)) {
            results.push({
              Livro: bName,
              Capitulo: Number(cNum),
              Versiculo: vObj.Versiculo,
              Texto: vObj.Texto
            });
            if (results.length >= 50) return results;
          }
        }
      }
    }
    return results;
  },

  async getVerseOfTheDay(): Promise<any> {
    const now = new Date();
    const adjusted = new Date(now.getTime() - (7 * 60 * 60 * 1000));
    const dateStr = adjusted.toISOString().split('T')[0];
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    try {
      const { data: colsData, error: colsErr } = await supabase
        .from('Biblia_Completa')
        .select('*')
        .limit(1);

      let bookKey = 'book_name';
      let chapterKey = 'chapter';
      let verseKey = 'verse_number';
      let textKey = 'text';

      if (!colsErr && colsData && colsData.length > 0) {
        const row = colsData[0];
        const keys = Object.keys(row);
        const b = keys.find(k => k.toLowerCase() === 'book_name' || k.toLowerCase() === 'livro' || k.toLowerCase() === 'book');
        const c = keys.find(k => k.toLowerCase() === 'chapter' || k.toLowerCase() === 'capitulo');
        const v = keys.find(k => k.toLowerCase() === 'verse_number' || k.toLowerCase() === 'versiculo' || k.toLowerCase() === 'verse');
        const t = keys.find(k => k.toLowerCase() === 'text' || k.toLowerCase() === 'texto');
        if (b) bookKey = b;
        if (c) chapterKey = c;
        if (v) verseKey = v;
        if (t) textKey = t;
      }

      // Get count
      const { count } = await supabase
        .from('Biblia_Completa')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        const offset = seed % count;
        const { data, error } = await supabase
          .from('Biblia_Completa')
          .select(`${bookKey}, ${chapterKey}, ${verseKey}, ${textKey}`)
          .range(offset, offset);

        if (!error && data && data.length > 0) {
          return {
            livro: data[0][bookKey],
            cap: parseInt(data[0][chapterKey]),
            ver: parseInt(data[0][verseKey]),
            texto: data[0][textKey]
          };
        }
      }
    } catch (e) {
      console.error("Erro ao carregar versículo do dia dinamicamente:", e);
    }

    // Fallback se falhar
    const allVerses: { bName: string; cNum: number; ver: number; text: string }[] = [];
    for (const [bName, chaps] of Object.entries(FALLBACK_BIBLE)) {
      for (const [cNum, vers] of Object.entries(chaps)) {
        for (const v of vers) {
          allVerses.push({
            bName,
            cNum: Number(cNum),
            ver: v.Versiculo,
            text: v.Texto
          });
        }
      }
    }
    if (allVerses.length > 0) {
      const selected = allVerses[seed % allVerses.length];
      return {
        livro: selected.bName,
        cap: selected.cNum,
        ver: selected.ver,
        texto: selected.text
      };
    }
    return null;
  },

  async getDevotional(): Promise<Devotional | null> {
    const now = new Date().toISOString();
    let { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: false })
      .limit(1);
    
    // Se a consulta por data falhar ou retornar vazia (pelo fuso estar um pouco diferente do local),
    // busca do banco o devocional mais recente cadastrado, de forma a nunca deixar vazio se houver devocionais!
    if (error || !data || data.length === 0) {
      const { data: fallbackData, error: fbError } = await supabase
        .from('devotionals')
        .select('*')
        .order('scheduled_for', { ascending: false })
        .limit(1);
        
      if (!fbError && fallbackData && fallbackData.length > 0) {
        return fallbackData[0];
      }
      return FALLBACK_DEVOTIONALS[0] || null;
    }
    return data[0];
  },

  async getDevotionalHistory(limit: number = 10): Promise<Devotional[]> {
    const now = new Date().toISOString();
    let { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: false })
      .limit(limit);
    
    // Se vier vazio, tenta buscar sem o limite rígido de data para garantir que os devocionais do usuário apareçam!
    if (error || !data || data.length === 0) {
      const { data: fallbackData, error: fbError } = await supabase
        .from('devotionals')
        .select('*')
        .order('scheduled_for', { ascending: false })
        .limit(limit);
        
      if (!fbError && fallbackData && fallbackData.length > 0) {
        return fallbackData;
      }
      return FALLBACK_DEVOTIONALS;
    }
    return data || [];
  },

  async getAllDevotionals(): Promise<Devotional[]> {
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .order('scheduled_for', { ascending: false });
    
    if (error || !data || data.length === 0) {
      return FALLBACK_DEVOTIONALS;
    }
    return data || [];
  },

  async createDevotional(devotional: Omit<Devotional, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('devotionals')
      .insert([devotional]);
    
    if (error) throw error;
  },

  async deleteDevotional(id: number): Promise<void> {
    const { error } = await supabase
      .from('devotionals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- JOGO 3 DICAS ---
  async getThreeCluesQuestions(): Promise<ThreeCluesQuestion[]> {
    const { data } = await supabase.from('three_clues_questions').select('*').order('created_at', { ascending: false });
    return (data || []) as ThreeCluesQuestion[];
  },

  async addThreeCluesQuestion(q: Omit<ThreeCluesQuestion, 'id'>) {
    console.log("Tentando salvar questão:", q);
    const { error } = await supabase.from('three_clues_questions').insert([q]);
    if (error) {
      console.error("Erro Supabase (add):", error);
      throw error;
    }
  },

  async updateThreeCluesQuestion(q: ThreeCluesQuestion) {
    const { id, created_at, ...updates } = q;
    const { error } = await supabase.from('three_clues_questions').update(updates).eq('id', id);
    if (error) {
      console.error("Erro Supabase (update):", error);
      throw error;
    }
  },

  async deleteThreeCluesQuestion(id: string) {
    const { error } = await supabase.from('three_clues_questions').delete().eq('id', id);
    if (error) {
      console.error("Erro Supabase (delete):", error);
      throw error;
    }
  },

  async seedThreeCluesQuestions(questions: Omit<ThreeCluesQuestion, 'id'>[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('three_clues_questions').select('answer');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => e.answer.trim().toLowerCase()));

      const toInsert = questions.filter(q => !existingSet.has(q.answer.trim().toLowerCase()));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('three_clues_questions').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedThreeCluesQuestions:", error);
      throw error;
    }
  },

  async seedHistoryStudy() {
    const study: Omit<SpecialtyStudy, 'id'> = {
      name: "História do Velho Testamento",
      pdfurl: "https://drive.google.com/file/d/1c5LZ2VHm5mPY_LjszYVA1QsuwBTSSvtX/view",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Bíblia",
      questions: [
        {
          question: "Qual é o primeiro livro da Bíblia?",
          options: ["Êxodo", "Gênesis", "Levítico", "Números"],
          correct_answer: 1
        },
        {
          question: "Quem construiu a arca para sobreviver ao dilúvio?",
          options: ["Abraão", "Isaque", "Noé", "Jacó"],
          correct_answer: 2
        },
        {
          question: "Qual profeta liderou o povo de Israel na saída do Egito?",
          options: ["Josué", "Moisés", "Arão", "Calebe"],
          correct_answer: 1
        },
        {
          question: "Quem derrotou o gigante Golias com uma funda e uma pedra?",
          options: ["Saul", "Salomão", "Davi", "Sansão"],
          correct_answer: 2
        },
        {
          question: "Qual rei de Israel era conhecido por sua imensa sabedoria?",
          options: ["Davi", "Salomão", "Saul", "Roboão"],
          correct_answer: 1
        },
        {
          question: "Quem foi vendido por seus irmãos e se tornou governador no Egito?",
          options: ["Benjamim", "José", "Rúben", "Judá"],
          correct_answer: 1
        },
        {
          question: "Qual profeta foi levado ao céu em um redemoinho com um carro de fogo?",
          options: ["Eliseu", "Elias", "Isaías", "Jeremias"],
          correct_answer: 1
        },
        {
          question: "Quem foi o sucessor de Moisés e liderou a conquista de Jericó?",
          options: ["Calebe", "Josué", "Gideão", "Sansão"],
          correct_answer: 1
        },
        {
          question: "Qual livro do Velho Testamento contém 150 cânticos e orações?",
          options: ["Provérbios", "Eclesiastes", "Salmos", "Cantares"],
          correct_answer: 2
        },
        {
          question: "Quem foi o profeta que interpretou os sonhos do rei Nabucodonosor na Babilônia?",
          options: ["Ezequiel", "Daniel", "Oséias", "Amós"],
          correct_answer: 1
        }
      ]
    };
    
    // Check if it already exists to avoid duplicates
    const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
    if (data && data.length > 0) {
      console.log("Estudo já existe.");
      return;
    }

    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) throw error;
  },

  async seedNatureStudy() {
    const study: Omit<SpecialtyStudy, 'id'> = {
      name: "Estudo da Natureza",
      pdfurl: "https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/estudo-da-natureza.pdf",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Natureza",
      questions: [
        {
          question: "Qual é o processo pelo qual as plantas produzem seu próprio alimento?",
          options: ["Respiração", "Fotossíntese", "Transpiração", "Germinação"],
          correct_answer: 1
        },
        {
          question: "Qual destes animais é um anfíbio?",
          options: ["Cobra", "Sapo", "Tartaruga", "Jacaré"],
          correct_answer: 1
        },
        {
          question: "Como se chama o fenômeno da transformação da lagarta em borboleta?",
          options: ["Evolução", "Metamorfose", "Crescimento", "Mutação"],
          correct_answer: 1
        },
        {
          question: "Qual é o maior oceano da Terra?",
          options: ["Atlântico", "Índico", "Pacífico", "Ártico"],
          correct_answer: 2
        },
        {
          question: "Qual gás os humanos expiram e as plantas absorvem?",
          options: ["Oxigênio", "Nitrogênio", "Dióxido de Carbono", "Hidrogênio"],
          correct_answer: 2
        },
        {
          question: "Qual é a principal fonte de energia para a vida na Terra?",
          options: ["Lua", "Vento", "Sol", "Água"],
          correct_answer: 2
        },
        {
          question: "O que as abelhas coletam das flores para fazer mel?",
          options: ["Pólen", "Néctar", "Sementes", "Pétalas"],
          correct_answer: 1
        },
        {
          question: "Qual destes é um recurso natural renovável?",
          options: ["Petróleo", "Carvão", "Energia Solar", "Gás Natural"],
          correct_answer: 2
        },
        {
          question: "Como se chama o estudo dos animais?",
          options: ["Botânica", "Geologia", "Zoologia", "Ecologia"],
          correct_answer: 2
        },
        {
          question: "Qual é a camada de ar que envolve a Terra?",
          options: ["Litosfera", "Hidrosfera", "Atmosfera", "Biosfera"],
          correct_answer: 2
        }
      ]
    };

    const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
    if (data && data.length > 0) return;

    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) throw error;
  },

  async seedSpecialtyStudies(studies: Omit<SpecialtyStudy, 'id'>[]) {
    for (const study of studies) {
      const { data } = await supabase.from('specialty_studies').select('id').eq('name', study.name);
      if (!data || data.length === 0) {
        const { error } = await supabase.from('specialty_studies').insert([study]);
        if (error) console.error("Erro ao inserir estudo de especialidade:", error);
      }
    }
  },

  async seedMembers(members: Omit<Member, 'id'>[]) {
    for (const m of members) {
      const { data } = await supabase.from('members').select('id').eq('name', m.name);
      if (!data || data.length === 0) {
        await this.addMember({
          ...m,
          id: Math.random().toString(36).substr(2, 9)
        } as Member);
      }
    }
  },

  // --- ESTUDO DE ESPECIALIDADES (PDF + QUIZ) ---
  async getSpecialtyStudies(): Promise<SpecialtyStudy[]> {
    console.log("[DB] Buscando estudos...");
    const { data, error } = await supabase.from('specialty_studies').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("[DB] Erro ao buscar estudos:", error);
      return [];
    }
    console.log(`[DB] ${data?.length || 0} estudos encontrados.`);
    return (data || []) as SpecialtyStudy[];
  },

  async addSpecialtyStudy(study: Omit<SpecialtyStudy, 'id'>) {
    console.log("[DB] Adicionando novo estudo de especialidade:", study.name);
    const { error } = await supabase.from('specialty_studies').insert([study]);
    if (error) {
      console.error("[DB] Erro ao adicionar estudo:", error);
      // Se o erro for de coluna inexistente, tentamos salvar sem a data de agendamento
      if (error.message.includes('scheduled_for') || error.code === 'PGRST100' || (error as any).status === 404) {
        console.warn("[DB] Tentando salvar sem coluna 'scheduled_for'...");
        const { scheduled_for, ...studyWithoutSchedule } = study;
        const { error: retryError } = await supabase.from('specialty_studies').insert([studyWithoutSchedule]);
        if (retryError) {
          console.error("[DB] Erro na tentativa de contingência:", retryError);
          throw retryError;
        }
        return;
      }
      throw error;
    }
  },

  async updateSpecialtyStudy(study: SpecialtyStudy) {
    console.log("[DB] Atualizando estudo de especialidade:", study.name);
    const { id, created_at, ...updates } = study;
    const { error } = await supabase.from('specialty_studies').update(updates).eq('id', id);
    if (error) {
      console.error("[DB] Erro ao atualizar estudo:", error);
      if (error.message.includes('scheduled_for') || error.code === 'PGRST100' || (error as any).status === 404) {
        const { scheduled_for, ...updatesWithoutSchedule } = updates;
        const { error: retryError } = await supabase.from('specialty_studies').update(updatesWithoutSchedule).eq('id', id);
        if (retryError) throw retryError;
        return;
      }
      throw error;
    }
  },

  async deleteSpecialtyStudy(id: string) {
    const { error } = await supabase.from('specialty_studies').delete().eq('id', id);
    if (error) {
      console.error("Erro ao deletar estudo:", error);
      throw error;
    }
  },

  subscribeSpecialtyStudies(callback: (studies: SpecialtyStudy[]) => void) {
    let localStudies: SpecialtyStudy[] = [];
    console.log("[Realtime] Iniciando assinatura de estudos...");
    this.getSpecialtyStudies().then(data => {
      console.log(`[Realtime] ${data.length} estudos carregados inicialmente.`);
      localStudies = data;
      callback(localStudies);
    }).catch(err => console.error("[Realtime] Erro estudos iniciais:", err));

    return supabase
      .channel('specialty_studies_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'specialty_studies' }, payload => {
        console.log("[Realtime] Mudança em specialty_studies:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          localStudies = [payload.new as SpecialtyStudy, ...localStudies];
        } else if (payload.eventType === 'UPDATE') {
          localStudies = localStudies.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s);
        } else if (payload.eventType === 'DELETE') {
          localStudies = localStudies.filter(s => s.id !== payload.old.id);
        }
        callback([...localStudies]);
      })
      .subscribe((status) => {
        console.log("[Realtime] Status do canal de estudos:", status);
      });
  },

  subscribeThreeCluesQuestions(callback: (questions: ThreeCluesQuestion[]) => void) {
    let localQuestions: ThreeCluesQuestion[] = [];
    this.getThreeCluesQuestions().then(data => {
      localQuestions = data;
      callback(localQuestions);
    });

    return supabase
      .channel('three_clues_questions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'three_clues_questions' }, payload => {
        if (payload.eventType === 'INSERT') {
          localQuestions = [payload.new as ThreeCluesQuestion, ...localQuestions];
        } else if (payload.eventType === 'UPDATE') {
          localQuestions = localQuestions.map(q => q.id === payload.new.id ? { ...q, ...payload.new } : q);
        } else if (payload.eventType === 'DELETE') {
          localQuestions = localQuestions.filter(q => q.id !== payload.old.id);
        }
        callback([...localQuestions]);
      })
      .subscribe();
  },

  // --- QUEBRA-CABEÇA ---
  async getPuzzleImages(): Promise<any[]> {
    const { data, error } = await supabase.from('puzzle_images').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Erro ao buscar imagens do quebra-cabeça:", error);
      return [];
    }
    return data || [];
  },

  async addPuzzleImage(image: { url: string, title: string }) {
    const { error } = await supabase.from('puzzle_images').insert([image]);
    if (error) {
      console.error("Erro ao adicionar imagem do quebra-cabeça:", error);
      throw error;
    }
  },

  async deletePuzzleImage(id: string) {
    const { error } = await supabase.from('puzzle_images').delete().eq('id', id);
    if (error) {
      console.error("Erro ao deletar imagem do quebra-cabeça:", error);
      throw error;
    }
  },

  async seedPuzzleImages(images: { title: string, url: string }[]) {
    for (const img of images) {
      const { data } = await supabase.from('puzzle_images').select('id').eq('title', img.title);
      if (!data || data.length === 0) {
        await this.addPuzzleImage(img);
      }
    }
  },

  subscribePuzzleImages(callback: (images: any[]) => void) {
    let localImages: any[] = [];
    this.getPuzzleImages().then(data => {
      localImages = data;
      callback(localImages);
    });

    return supabase
      .channel('puzzle_images_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puzzle_images' }, payload => {
        if (payload.eventType === 'INSERT') {
          localImages = [payload.new, ...localImages];
        } else if (payload.eventType === 'UPDATE') {
          localImages = localImages.map(img => img.id === payload.new.id ? { ...img, ...payload.new } : img);
        } else if (payload.eventType === 'DELETE') {
          localImages = localImages.filter(img => img.id !== payload.old.id);
        }
        callback([...localImages]);
      })
      .subscribe();
  },

  async seedGameAssets(assets: { game_type: string, name: string, url: string }[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('game_assets').select('game_type, name');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => `${e.game_type}|${e.name.trim().toLowerCase()}`));

      const toInsert = assets.filter(a => !existingSet.has(`${a.game_type}|${a.name.trim().toLowerCase()}`));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('game_assets').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedGameAssets:", error);
      throw error;
    }
  },

  // --- ATIVOS DE JOGOS (IMAGENS DINÂMICAS) ---
  async getGameAssets(gameType: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('game_assets')
      .select('*')
      .eq('game_type', gameType);
    
    if (error) {
      console.error(`Erro ao buscar ativos para ${gameType}:`, error);
      return [];
    }
    return data || [];
  },

  async updateGameAsset(id: number, url: string) {
    const { error } = await supabase
      .from('game_assets')
      .update({ url })
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- VERSÍCULO EMBARALHADO ---
  async getScrambledVerses(): Promise<any[]> {
    const { data } = await supabase.from('scrambled_verses').select('*').order('created_at', { ascending: false });
    return (data || []) as any[];
  },

  async addScrambledVerse(v: any) {
    const { error } = await supabase.from('scrambled_verses').insert([v]);
    if (error) throw error;
  },

  async updateScrambledVerse(v: any) {
    const { id, created_at, ...updates } = v;
    const { error } = await supabase.from('scrambled_verses').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteScrambledVerse(id: string) {
    const { error } = await supabase.from('scrambled_verses').delete().eq('id', id);
    if (error) throw error;
  },

  async seedScrambledVerses(verses: any[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('scrambled_verses').select('title');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => e.title.trim().toLowerCase()));

      const toInsert = verses.filter(v => !existingSet.has(v.title.trim().toLowerCase()));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('scrambled_verses').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedScrambledVerses:", error);
      throw error;
    }
  },

  async seedDevotionals(devotionals: Omit<Devotional, 'id' | 'created_at'>[]) {
    try {
      const { data: existing, error: fetchError } = await supabase.from('devotionals').select('title');
      if (fetchError) throw fetchError;

      const existingSet = new Set((existing || []).map(e => e.title.trim().toLowerCase()));

      const toInsert = devotionals.filter(v => !existingSet.has(v.title.trim().toLowerCase()));

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('devotionals').insert(toInsert);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Erro no seedDevotionals:", error);
      throw error;
    }
  },

  subscribeScrambledVerses(callback: (verses: any[]) => void) {
    let localVerses: any[] = [];
    this.getScrambledVerses().then(data => {
      localVerses = data;
      callback(localVerses);
    });

    return supabase
      .channel('scrambled_verses_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scrambled_verses' }, payload => {
        if (payload.eventType === 'INSERT') {
          localVerses = [payload.new, ...localVerses];
        } else if (payload.eventType === 'UPDATE') {
          localVerses = localVerses.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v);
        } else if (payload.eventType === 'DELETE') {
          localVerses = localVerses.filter(v => v.id !== payload.old.id);
        }
        callback([...localVerses]);
      })
      .subscribe();
  }
};
