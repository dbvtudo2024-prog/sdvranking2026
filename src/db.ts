
import { createClient } from '@supabase/supabase-js';
import { Member, AuthUser, Announcement, Challenge1x1, QuizQuestion, ChatMessage, Devotional, ThreeCluesQuestion, SpecialtyStudy, SpecialtyDBV, CounselorDB, GameConfig, UserRole, UnitName, ClubUnit, DEFAULT_UNITS, sortUnitsWithLeadershipLast, BadgeLevel } from '@/types';
import { 
  DEFAULT_MEMBERS, 
  DEFAULT_ANNOUNCEMENTS, 
  DEFAULT_SPECIALTY_STUDIES, 
  DEFAULT_DEVOTIONALS, 
  NEW_QUIZ_QUESTIONS 
} from './seedData';
import { SPECIALTIES, QUIZ_QUESTIONS } from './constants';

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

  // Se ambos existem e parecem válidos nas posições corretas, usamos diretamente
  if (url && typeof url === 'string' && url.trim().startsWith('http') &&
      key && typeof key === 'string' && key.trim().length > 20 && key.includes('.')) {
    console.log("[getValidSupabaseConfig] Usando credenciais do ambiente diretamente:", url.trim());
    return { url: url.trim(), key: key.trim() };
  }

  // Normalização caso estejam invertidos/trocados no ambiente
  if (url && typeof url === 'string' && key && typeof key === 'string') {
    const urlIsJwt = !url.startsWith('http') && url.includes('.') && url.length > 50;
    const keyIsUrl = key.startsWith('http');
    if (urlIsJwt && keyIsUrl) {
      console.log("[getValidSupabaseConfig] Detectado credenciais trocadas no ambiente. Corrigindo posições...");
      const temp = url;
      url = key;
      key = temp;
    }
  }

  // Caso ainda não esteja completo, tenta extrair a referência do projeto do JWT para reconstruir a URL se possível
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
  if (key && typeof key === 'string' && key.includes('.')) {
    detectedRef = extractRefFromJwt(key);
  }

  if (detectedRef) {
    url = `https://${detectedRef}.supabase.co`;
    console.log("[getValidSupabaseConfig] URL de banco autodetectada a partir do JWT:", url);
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

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> => {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[DB Timeout] Operação excedeu o limite de ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 1, delay = 300): Promise<T> => {
  try {
    return await withTimeout(fn(), 2500);
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

const safeFetch = (...args: Parameters<typeof fetch>) => {
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch(...args);
  }
  return fetch(...args);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: safeFetch
  }
});

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

// Caches locais para otimização extrema e redução de carga no banco de dados (Supabase / Cloudflare D1)
export const DEFAULT_CLOUDFLARE_API_URL = 'https://broken-sound-84bf.dbvtudo2024.workers.dev';

export function getCloudflareApiUrl(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('sentinelas_cloudflare_api_url');
    if (local && local.trim().startsWith('http')) {
      return local.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta.env.VITE_CLOUDFLARE_API_URL || '').trim();
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_CLOUDFLARE_API_URL;
}

export function setCloudflareApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('sentinelas_cloudflare_api_url');
    } else {
      localStorage.setItem('sentinelas_cloudflare_api_url', url.trim());
    }
  }
}

export async function testCloudflareConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
  const apiUrl = (customUrl || getCloudflareApiUrl()).trim().replace(/\/+$/, '');
  if (!apiUrl || !apiUrl.startsWith('http')) {
    return { success: false, message: 'URL do Cloudflare Worker inválida ou não informada.' };
  }
  try {
    const res = await fetch(`${apiUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SELECT 1 as test' })
    });
    if (!res.ok) {
      return { success: false, message: `Erro HTTP ${res.status}: ${res.statusText}` };
    }
    const json = await res.json();
    if (json && (json.success || Array.isArray(json.results) || Array.isArray(json))) {
      return { success: true, message: 'Conexão com Cloudflare D1 estabelecida com sucesso!' };
    }
    return { success: false, message: 'Resposta inesperada do Cloudflare Worker.' };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err?.message || 'Erro desconhecido'}` };
  }
}

export async function runD1Query<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const apiUrl = getCloudflareApiUrl();
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params })
    });
    if (!res.ok) {
      console.warn(`[Cloudflare D1] Erro HTTP ${res.status} ao executar query`);
      return [];
    }
    const json = await res.json();
    if (Array.isArray(json.results)) return json.results;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    console.warn('[Cloudflare D1] Falha de comunicação com o Worker:', err);
    return [];
  }
}

// Lista oficial de todas as 16 tabelas originadas do Supabase que compõem o sistema
export const ALL_D1_TABLES = [
  'announcements',
  'Biblia_Completa',
  'conselheiros',
  'devotionals',
  'EspecialidadesDBV',
  'game_assets',
  'game_configs',
  'members',
  'messages',
  'puzzle_images',
  'quiz_questions',
  'scrambled_verses',
  'specialty_studies',
  'three_clues_questions',
  'users',
  'who_am_i_questions'
] as const;

export const D1_TABLE_CREATION_QUERIES = [
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, name TEXT, role TEXT, unit TEXT, password TEXT, active INTEGER, funcao TEXT, monthlyMedals TEXT, avatar TEXT, email TEXT);",
  "CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT, unit TEXT, role TEXT, rank TEXT, active INTEGER, birthDate TEXT, phone TEXT, stats TEXT);",
  "CREATE TABLE IF NOT EXISTS announcements (id TEXT PRIMARY KEY, title TEXT, content TEXT, date TEXT, author TEXT, target TEXT, pinned INTEGER, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS Biblia_Completa (id TEXT PRIMARY KEY, Livro TEXT, Capitulo INTEGER, Versiculo INTEGER, Texto TEXT, testamento TEXT, book_name TEXT, chapter INTEGER, verse_number INTEGER, text TEXT);",
  "CREATE TABLE IF NOT EXISTS conselheiros (id TEXT PRIMARY KEY, nome TEXT, name TEXT, unidade TEXT, unit TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS devotionals (id TEXT PRIMARY KEY, title TEXT, content TEXT, link TEXT, scheduled_for TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS EspecialidadesDBV (id TEXT PRIMARY KEY, Nome TEXT, Area TEXT, badgeUrl TEXT, imagem TEXT);",
  "CREATE TABLE IF NOT EXISTS game_assets (id TEXT PRIMARY KEY, game_type TEXT, name TEXT, url TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS game_configs (id TEXT PRIMARY KEY, type TEXT, config TEXT, updated_at TEXT);",
  "CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, sender_id TEXT, sender_name TEXT, sender_photo TEXT, text TEXT, unit TEXT, target TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS puzzle_images (id TEXT PRIMARY KEY, title TEXT, url TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS quiz_questions (id TEXT PRIMARY KEY, category TEXT, question TEXT, options TEXT, correct_answer INTEGER, tip TEXT, image_url TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS scrambled_verses (id TEXT PRIMARY KEY, title TEXT, reference TEXT, text TEXT, scheduled_for TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS specialty_studies (id TEXT PRIMARY KEY, name TEXT, pdfurl TEXT, video_url TEXT, specialty_image_url TEXT, category TEXT, questions TEXT, scheduled_for TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS three_clues_questions (id TEXT PRIMARY KEY, category TEXT, answer TEXT, clue1 TEXT, clue2 TEXT, clue3 TEXT, created_at TEXT);",
  "CREATE TABLE IF NOT EXISTS who_am_i_questions (id TEXT PRIMARY KEY, character TEXT, clues TEXT, tip TEXT, category TEXT, created_at TEXT);"
];

// Garante que todas as 16 tabelas existam no Cloudflare D1
export async function createAllD1Tables(): Promise<{ success: boolean; createdCount: number; errors: string[] }> {
  const errors: string[] = [];
  let createdCount = 0;
  for (const q of D1_TABLE_CREATION_QUERIES) {
    try {
      await runD1Query(q);
      createdCount++;
    } catch (e: any) {
      errors.push(e?.message || 'Erro ao executar query de tabela');
    }
  }
  return {
    success: errors.length === 0,
    createdCount,
    errors
  };
}

// Utilitário de Migração Integral para Cloudflare D1
export async function seedInitialDataToCloudflareD1(): Promise<{
  success: boolean;
  counts: { members: number; users: number; announcements: number; specialties: number; studies: number; devotionals: number; questions: number; gameConfigs: number };
  message: string;
}> {
  const apiUrl = getCloudflareApiUrl();
  if (!apiUrl) {
    return {
      success: false,
      counts: { members: 0, users: 0, announcements: 0, specialties: 0, studies: 0, devotionals: 0, questions: 0, gameConfigs: 0 },
      message: "URL do Cloudflare Worker (VITE_CLOUDFLARE_API_URL) não configurada."
    };
  }

  const counts = { members: 0, users: 0, announcements: 0, specialties: 0, studies: 0, devotionals: 0, questions: 0, gameConfigs: 0 };

  try {
    // 1. Criar todas as 16 tabelas no D1 se não existirem
    await createAllD1Tables();

    // 2. Popular Usuários base
    const baseUsers: AuthUser[] = [
      {
        id: "mem_ronaldo",
        name: "Ronaldo Sonic",
        email: "ronaldo",
        role: UserRole.LEADERSHIP,
        funcao: "Diretoria / Administrador",
        unit: UnitName.LIDERANCA,
        password: "123",
        active: 1,
        badges: [],
        photoUrl: ""
      },
      {
        id: "mem_davi",
        name: "Davi de Pin",
        email: "davi",
        role: UserRole.PATHFINDER,
        funcao: "Desbravador Campeão",
        unit: UnitName.AGUIA_DOURADA,
        password: "123",
        active: 1,
        badges: [
          { badgeId: "monthly_games_gold", monthLabel: "1º Lugar - Campeão dos Jogos", awardedAt: "2026-03-31", level: BadgeLevel.GOLD }
        ],
        photoUrl: ""
      },
      {
        id: "mem_joao",
        name: "João Silva",
        email: "joao",
        role: UserRole.PATHFINDER,
        funcao: "Desbravador",
        unit: UnitName.AGUIA_DOURADA,
        password: "123",
        active: 1,
        badges: [],
        photoUrl: ""
      },
      {
        id: "mem_maria",
        name: "Maria Oliveira",
        email: "maria",
        role: UserRole.PATHFINDER,
        funcao: "Desbravador",
        unit: UnitName.GUERREIROS,
        password: "123",
        active: 1,
        badges: [],
        photoUrl: ""
      }
    ];

    const currentCachedUser = localStorage.getItem("sentinelas_user");
    if (currentCachedUser) {
      try {
        const u = JSON.parse(currentCachedUser);
        if (u && !baseUsers.some(x => x.id === u.id || x.email === u.email)) {
          baseUsers.push(u);
        }
      } catch {}
    }

    for (const u of baseUsers) {
      await runD1Query(
        "INSERT OR REPLACE INTO users (id, username, name, role, unit, password, active, funcao, monthlyMedals, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          u.id,
          u.email || u.id,
          u.name,
          u.role,
          u.unit || "",
          u.password || "123456",
          1,
          u.funcao || u.role,
          JSON.stringify(u.badges || []),
          u.photoUrl || ""
        ]
      );
      counts.users++;
    }

    // 3. Popular Membros base
    for (const m of DEFAULT_MEMBERS) {
      await runD1Query(
        "INSERT OR REPLACE INTO members (id, name, unit, role, rank, active, birthDate, phone, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          m.id,
          m.name,
          m.unit,
          m.role,
          m.className || "",
          1,
          m.birthday || "",
          "",
          JSON.stringify({ scores: m.scores || [], badges: m.badges || [], stats: m.stats || {}, counselor: m.counselor || "" })
        ]
      );
      counts.members++;
    }

    // 4. Popular Avisos base
    for (let i = 0; i < DEFAULT_ANNOUNCEMENTS.length; i++) {
      const a = DEFAULT_ANNOUNCEMENTS[i];
      await runD1Query(
        "INSERT OR REPLACE INTO announcements (id, title, content, date, author, target, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [`ann_${i + 1}`, a.title, a.content, a.date, "Liderança", "all", 0]
      );
      counts.announcements++;
    }

    // 5. Popular Especialidades base
    for (let i = 0; i < SPECIALTIES.length; i++) {
      const s = SPECIALTIES[i];
      await runD1Query(
        "INSERT OR REPLACE INTO EspecialidadesDBV (id, Nome, Area, badgeUrl) VALUES (?, ?, ?, ?)",
        [`spec_${i + 1}`, s.name, "Geral", s.image]
      );
      counts.specialties++;
    }

    // 6. Popular Estudos de Especialidades base
    for (let i = 0; i < DEFAULT_SPECIALTY_STUDIES.length; i++) {
      const st = DEFAULT_SPECIALTY_STUDIES[i];
      await runD1Query(
        "INSERT OR REPLACE INTO specialty_studies (id, name, pdfurl, video_url, specialty_image_url, category, questions, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          `study_${i + 1}`,
          st.name,
          st.pdfurl || "",
          st.video_url || "",
          st.specialty_image_url || "",
          st.category || "Geral",
          JSON.stringify(st.questions || []),
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      counts.studies++;
    }

    // 7. Popular Devocionais base
    for (let i = 0; i < DEFAULT_DEVOTIONALS.length; i++) {
      const d = DEFAULT_DEVOTIONALS[i];
      await runD1Query(
        "INSERT OR REPLACE INTO devotionals (id, title, content, link, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [`dev_${i + 1}`, d.title, d.content, d.link || "", d.scheduled_for || new Date().toISOString(), new Date().toISOString()]
      );
      counts.devotionals++;
    }

    // 8. Popular Perguntas do Quiz
    const allQuiz = [...QUIZ_QUESTIONS, ...NEW_QUIZ_QUESTIONS.map((q, idx) => ({ id: `q_extra_${idx + 1}`, ...q }))];
    for (const q of allQuiz) {
      await runD1Query(
        "INSERT OR REPLACE INTO quiz_questions (id, category, question, options, correct_answer, tip, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [q.id, q.category, q.question, JSON.stringify(q.options), q.correct_answer, q.tip || "", q.image_url || ""]
      );
      counts.questions++;
    }

    // 9. Config de Jogos
    await runD1Query(
      "INSERT OR REPLACE INTO game_configs (id, type, config) VALUES (?, ?, ?)",
      ["1", "game_configs", JSON.stringify({ active: true, updatedAt: new Date().toISOString() })]
    );
    counts.gameConfigs++;

    // Salvar backup local de segurança
    try {
      localStorage.setItem("sentinelas_members_backup", JSON.stringify(DEFAULT_MEMBERS));
      localStorage.setItem("sentinelas_users_backup", JSON.stringify(baseUsers));
      localStorage.setItem("sentinelas_announcements_backup", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    } catch {}

    return {
      success: true,
      counts,
      message: "Cloudflare D1 populado com sucesso com catálogo e dados base!"
    };
  } catch (error: any) {
    console.error("Erro ao popular Cloudflare D1:", error);
    return {
      success: false,
      counts,
      message: error?.message || "Erro desconhecido ao popular D1."
    };
  }
}

// Utilitário de Migração Integral para Cloudflare D1 (com fallback resiliente quando o Supabase estiver travado)
export async function migrateAllDataToCloudflareD1(): Promise<{
  success: boolean;
  counts: { members: number; users: number; announcements: number; specialties: number; gameConfigs: number; studies: number; devotionals: number };
  message: string;
}> {
  const apiUrl = getCloudflareApiUrl();
  if (!apiUrl) {
    return {
      success: false,
      counts: { members: 0, users: 0, announcements: 0, specialties: 0, gameConfigs: 0, studies: 0, devotionals: 0 },
      message: "URL do Cloudflare Worker (VITE_CLOUDFLARE_API_URL) não configurada."
    };
  }

  const counts = { members: 0, users: 0, announcements: 0, specialties: 0, gameConfigs: 0, studies: 0, devotionals: 0 };

  try {
    // 0. Garantir que todas as 16 tabelas existam
    await createAllD1Tables();

    // 1. Migrar Usuários (se Supabase travou ou retornou <= 1, mescla com backup local e usuários base)
    let usersList: AuthUser[] = [];
    try {
      const { data } = await supabase.from("users").select("*");
      if (data && data.length > 0) usersList = data as AuthUser[];
    } catch (e) {
      console.warn("Falha ao ler usuários do Supabase, tentando backup local...");
    }
    
    // Mescla com backup local se Supabase veio vazio ou incompleto
    const cachedUsers = localStorage.getItem("sentinelas_users_backup");
    if (cachedUsers) {
      try {
        const parsed = JSON.parse(cachedUsers) as AuthUser[];
        for (const u of parsed) {
          if (!usersList.some(x => x.id === u.id || x.email === u.email)) {
            usersList.push(u);
          }
        }
      } catch {}
    }

    // Incluir usuário logado
    const loggedUser = localStorage.getItem("sentinelas_user");
    if (loggedUser) {
      try {
        const u = JSON.parse(loggedUser);
        if (u && !usersList.some(x => x.id === u.id || x.email === u.email)) {
          usersList.push(u);
        }
      } catch {}
    }

    // Se ainda vazio ou com menos de 2 usuários, insere os usuários base
    if (usersList.length <= 1) {
      const baseDefaults: AuthUser[] = [
        { id: "mem_ronaldo", name: "Ronaldo Sonic", email: "ronaldo", role: UserRole.LEADERSHIP, funcao: "Diretoria / Administrador", unit: UnitName.LIDERANCA, password: "123", active: 1, badges: [], photoUrl: "" },
        { id: "mem_davi", name: "Davi de Pin", email: "davi", role: UserRole.PATHFINDER, funcao: "Desbravador Campeão", unit: UnitName.AGUIA_DOURADA, password: "123", active: 1, badges: [{ badgeId: "monthly_games_gold", monthLabel: "1º Lugar - Campeão dos Jogos", awardedAt: "2026-03-31", level: BadgeLevel.GOLD }], photoUrl: "" },
        { id: "mem_joao", name: "João Silva", email: "joao", role: UserRole.PATHFINDER, funcao: "Desbravador", unit: UnitName.AGUIA_DOURADA, password: "123", active: 1, badges: [], photoUrl: "" },
        { id: "mem_maria", name: "Maria Oliveira", email: "maria", role: UserRole.PATHFINDER, funcao: "Desbravador", unit: UnitName.GUERREIROS, password: "123", active: 1, badges: [], photoUrl: "" }
      ];
      for (const bu of baseDefaults) {
        if (!usersList.some(x => x.id === bu.id || x.email === bu.email)) {
          usersList.push(bu);
        }
      }
    }

    for (const u of usersList) {
      await runD1Query(
        "INSERT OR REPLACE INTO users (id, username, name, role, unit, password, active, funcao, monthlyMedals, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          u.id,
          u.email || u.id,
          u.name,
          u.role,
          u.unit || "",
          u.password || "123456",
          1,
          u.funcao || u.role,
          JSON.stringify(u.badges || []),
          u.photoUrl || ""
        ]
      );
      counts.users++;
    }

    // 2. Migrar Membros (se Supabase travou, mescla com backup local e DEFAULT_MEMBERS)
    let membersList: Member[] = [];
    try {
      const { data } = await supabase.from("members").select("*");
      if (data && data.length > 0) membersList = data as Member[];
    } catch (e) {
      console.warn("Falha ao ler membros do Supabase, tentando backup local...");
    }

    const cachedMembers = localStorage.getItem("sentinelas_members_backup");
    if (cachedMembers) {
      try {
        const parsed = JSON.parse(cachedMembers) as Member[];
        for (const m of parsed) {
          if (!membersList.some(x => x.id === m.id)) {
            membersList.push(m);
          }
        }
      } catch {}
    }

    if (membersList.length <= 1) {
      for (const dm of DEFAULT_MEMBERS) {
        if (!membersList.some(x => x.id === dm.id)) {
          membersList.push(dm);
        }
      }
    }

    for (const m of membersList) {
      await runD1Query(
        "INSERT OR REPLACE INTO members (id, name, unit, role, rank, active, birthDate, phone, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          m.id,
          m.name,
          m.unit,
          m.role,
          m.className || "",
          1,
          m.birthday || "",
          "",
          JSON.stringify({ scores: m.scores || [], badges: m.badges || [], stats: m.stats || {}, counselor: m.counselor || "" })
        ]
      );
      counts.members++;
    }

    // 3. Migrar Avisos
    let announcementsList: Announcement[] = [];
    try {
      const { data } = await supabase.from("announcements").select("*");
      if (data && data.length > 0) announcementsList = data as Announcement[];
    } catch (e) {
      console.warn("Falha ao ler avisos do Supabase, tentando backup local...");
    }
    if (announcementsList.length === 0) {
      const cached = localStorage.getItem("sentinelas_announcements_backup");
      if (cached) announcementsList = JSON.parse(cached);
    }
    if (announcementsList.length === 0) {
      announcementsList = DEFAULT_ANNOUNCEMENTS.map((a, idx) => ({
        id: `ann_${idx + 1}`,
        ...a,
        author: "Liderança",
        target: "all" as const
      }));
    }
    for (const a of announcementsList) {
      await runD1Query(
        "INSERT OR REPLACE INTO announcements (id, title, content, date, author, target, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [a.id, a.title, a.content, a.date, a.author || "Liderança", a.target || "all", a.pinned ? 1 : 0]
      );
      counts.announcements++;
    }

    // 4. Migrar Especialidades
    let specList: SpecialtyDBV[] = [];
    try {
      const { data } = await supabase.from("EspecialidadesDBV").select("*");
      if (data && data.length > 0) specList = data as SpecialtyDBV[];
    } catch (e) {
      console.warn("Falha ao ler especialidades do Supabase...");
    }
    if (specList.length === 0) {
      specList = SPECIALTIES.map((s, idx) => ({
        id: idx + 1,
        ID: `spec_${idx + 1}`,
        Nome: s.name,
        Categoria: "Geral",
        Imagem: s.image,
        Questoes: "[]",
        Sigla: `S${idx + 1}`,
        Nivel: "1",
        Ano: "2026",
        Origem: "DSA",
        Like: false,
        Cor: "#2563eb"
      } as SpecialtyDBV));
    }
    for (const s of specList) {
      await runD1Query(
        "INSERT OR REPLACE INTO EspecialidadesDBV (id, Nome, Area, badgeUrl) VALUES (?, ?, ?, ?)",
        [String(s.id || s.Nome), s.Nome, s.Categoria || "Geral", s.Imagem || ""]
      );
      counts.specialties++;
    }

    // 5. Migrar Estudos de Especialidades
    let studiesList: SpecialtyStudy[] = [];
    try {
      const { data } = await supabase.from("specialty_studies").select("*");
      if (data && data.length > 0) studiesList = data as SpecialtyStudy[];
    } catch {}
    if (studiesList.length === 0) {
      studiesList = DEFAULT_SPECIALTY_STUDIES.map((st, idx) => ({
        id: `study_${idx + 1}`,
        ...st
      })) as any[];
    }
    for (const st of studiesList) {
      await runD1Query(
        "INSERT OR REPLACE INTO specialty_studies (id, name, pdfurl, video_url, specialty_image_url, category, questions, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          st.id,
          st.name,
          st.pdfurl || "",
          st.video_url || "",
          st.specialty_image_url || "",
          st.category || "Geral",
          typeof st.questions === "string" ? st.questions : JSON.stringify(st.questions || []),
          st.scheduled_for || new Date().toISOString(),
          st.created_at || new Date().toISOString()
        ]
      );
      counts.studies++;
    }

    // 6. Migrar Devocionais
    let devList: Devotional[] = [];
    try {
      const { data } = await supabase.from("devotionals").select("*");
      if (data && data.length > 0) devList = data as Devotional[];
    } catch {}
    if (devList.length === 0) {
      devList = DEFAULT_DEVOTIONALS.map((d, idx) => ({
        id: `dev_${idx + 1}`,
        ...d
      })) as any[];
    }
    for (const d of devList) {
      await runD1Query(
        "INSERT OR REPLACE INTO devotionals (id, title, content, link, scheduled_for, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [d.id, d.title, d.content, d.link || "", d.scheduled_for || new Date().toISOString(), new Date().toISOString()]
      );
      counts.devotionals++;
    }

    // 7. Migrar Configs de Jogos
    try {
      const { data: gConfig } = await supabase.from("game_configs").select("*").eq("id", 1).maybeSingle();
      if (gConfig) {
        await runD1Query(
          "INSERT OR REPLACE INTO game_configs (id, type, config) VALUES (?, ?, ?)",
          ["1", "game_configs", JSON.stringify(gConfig)]
        );
        counts.gameConfigs++;
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar game_configs para D1:", e);
    }

    return {
      success: true,
      counts,
      message: `Migração concluída com sucesso para o Cloudflare D1 (${counts.members} membros, ${counts.users} usuários, ${counts.specialties} especialidades, ${counts.studies} estudos)!`
    };
  } catch (error: any) {
    console.error("Erro durante a migração para Cloudflare D1:", error);
    return {
      success: false,
      counts,
      message: error?.message || "Erro desconhecido durante a migração."
    };
  }
}

let cachedBibleKeys: { bookKey: string; chapterKey: string; verseKey: string; textKey: string } | null = null;
const bibleChaptersCache: Record<string, number[]> = {};
const bibleVersesCache: Record<string, any[]> = {};

// Cache em memória com expiração (TTL) para evitar chamadas excessivas e estouro de limites
let memoryMembersCache: { data: Member[]; timestamp: number } | null = null;
let memorySpecialtiesCache: { data: SpecialtyDBV[]; timestamp: number } | null = null;
let memoryUsersCache: { data: AuthUser[]; timestamp: number } | null = null;
let memoryGameConfigsCache: { data: GameConfig; timestamp: number } | null = null;
let memoryAnnouncementsCache: { data: Announcement[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos de cache para leituras repetitivas

async function detectBibleKeys(): Promise<{ bookKey: string; chapterKey: string; verseKey: string; textKey: string }> {
  if (cachedBibleKeys) return cachedBibleKeys;
  
  const localKeys = localStorage.getItem('supabase_bible_detected_keys');
  if (localKeys) {
    try {
      cachedBibleKeys = JSON.parse(localKeys);
      return cachedBibleKeys!;
    } catch (e) {
      console.warn("Erro ao ler chaves da Bíblia no localStorage:", e);
    }
  }

  try {
    const { data, error } = await supabase
      .from('Biblia_Completa')
      .select('*')
      .limit(1);

    let bookKey = 'book_name';
    let chapterKey = 'chapter';
    let verseKey = 'verse_number';
    let textKey = 'text';

    if (!error && data && data.length > 0) {
      const row = data[0];
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

    cachedBibleKeys = { bookKey, chapterKey, verseKey, textKey };
    localStorage.setItem('supabase_bible_detected_keys', JSON.stringify(cachedBibleKeys));
    return cachedBibleKeys;
  } catch (err) {
    console.error("Erro ao detectar chaves da Bíblia:", err);
    return { bookKey: 'book_name', chapterKey: 'chapter', verseKey: 'verse_number', textKey: 'text' };
  }
}

export const DatabaseService = {
  // --- CHAT ---
  async getMessages(unit: string): Promise<ChatMessage[]> {
    return withRetry(async () => {
      console.log(`[DB] Buscando mensagens para a unidade: ${unit}...`);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('unit', unit)
        .order('created_at', { ascending: false }) 
        .limit(50);
      
      if (error) {
        console.error("[DB] Erro ao carregar mensagens:", error);
        throw error;
      }
      // Reverse to show oldest first (standard chat behavior)
      return ((data || []) as ChatMessage[]).reverse();
    });
  },

  async sendMessage(msg: ChatMessage) {
    return withRetry(async () => {
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
        console.error("[DB] Erro ao enviar mensagem:", error);
        throw error;
      }
    });
  },

  // Escuta mensagens filtradas por unidade ou todas de forma resiliente via filtro local
  subscribeMessages(unit: string | null, callback: (msg: ChatMessage) => void) {
    const channelId = `chat_${unit || 'all'}_${Math.random().toString(36).substring(7)}`;
    
    // Filtro no lado do cliente é infinitamente mais robusto do que dependência da infraestrutura de replicação do Supabase Realtime
    return supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, payload => {
        const newMsg = payload.new as ChatMessage;
        if (!unit || newMsg.unit === unit) {
          console.log(`[Realtime - Chat] Nova mensagem correspondente para a unidade ${unit}:`, newMsg);
          callback(newMsg);
        }
      })
      .subscribe();
  },

  // Escuta TODAS as mensagens e deixa o App filtrar de forma resiliente
  subscribeAllMessages(callback: (msg: ChatMessage) => void, onStatus?: (status: string) => void) {
    const channelId = `chat_all_global_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, payload => {
        const newMsg = payload.new as ChatMessage;
        console.log("[Realtime - Chat Global] Mudança percebida em messages:", newMsg);
        callback(newMsg);
      })
      .subscribe((status) => {
        console.log(`Status da Conexão Realtime Chat Global (${channelId}):`, status);
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
    onChallenges?: (challenge: Challenge1x1) => void,
    onUnits?: (units: ClubUnit[]) => void
  }) {
    const channelId = `global_updates_${Math.random().toString(36).substring(7)}`;
    console.log(`[Realtime] Iniciando canal global: ${channelId}`);
    const channel = supabase.channel(channelId);

    let localMembers: Member[] = [];
    let localAnnouncements: Announcement[] = [];
    let localCounselors: CounselorDB[] = [];
    let localUnits: ClubUnit[] = [];

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
      }).catch(err => console.warn("[Realtime] Erro ao buscar membros:", err));

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
      }).catch(err => console.warn("[Realtime] Erro ao buscar anúncios:", err));

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
      }).catch(err => console.warn("[Realtime] Erro ao buscar conselheiros:", err));

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
      }).catch(err => console.warn("[Realtime] Erro ao buscar game configs:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'game_configs' }, payload => {
        console.log("[Realtime] Mudança em game_configs:", payload.eventType);
        if (payload.new) callbacks.onGameConfigs!(transformConfig(payload.new));
      });
    }

    if (callbacks.onUnits) {
      console.log("[Realtime] Buscando unidades...");
      this.getUnits().then(data => {
        localUnits = sortUnitsWithLeadershipLast(data);
        callbacks.onUnits!(localUnits);
      }).catch(err => console.warn("[Realtime] Erro ao buscar unidades:", err));

      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, payload => {
        console.log("[Realtime] Mudança em units:", payload.eventType);
        if (payload.eventType === 'INSERT') {
          const newU: ClubUnit = {
            id: payload.new.id,
            name: payload.new.name || payload.new.nome,
            color: payload.new.color || payload.new.cor,
            logoUrl: payload.new.logo_url || payload.new.logoUrl,
            isCustom: payload.new.is_custom ?? payload.new.isCustom ?? true,
            created_at: payload.new.created_at
          };
          if (!localUnits.some(u => u.id === newU.id || u.name.toLowerCase() === newU.name.toLowerCase())) {
            localUnits = [...localUnits, newU];
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedU: ClubUnit = {
            id: payload.new.id,
            name: payload.new.name || payload.new.nome,
            color: payload.new.color || payload.new.cor,
            logoUrl: payload.new.logo_url || payload.new.logoUrl,
            isCustom: payload.new.is_custom ?? payload.new.isCustom ?? true,
            created_at: payload.new.created_at
          };
          localUnits = localUnits.map(u => u.id === payload.new.id ? updatedU : u);
        } else if (payload.eventType === 'DELETE') {
          localUnits = localUnits.filter(u => u.id !== payload.old.id);
        }
        localUnits = sortUnitsWithLeadershipLast(localUnits);
        callbacks.onUnits!(localUnits);
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
  async getMembers(forceRefresh = false): Promise<Member[]> {
    if (!forceRefresh && memoryMembersCache && Date.now() - memoryMembersCache.timestamp < CACHE_TTL_MS) {
      return memoryMembersCache.data;
    }

    try {
      return await withRetry(async () => {
        console.log("[DB] Buscando membros...");
        const { data, error } = await supabase
          .from('members')
          .select('*');
        
        if (error) {
          console.warn("[DB] Aviso ao buscar membros:", error.message || error);
          throw error;
        }
        console.log(`[DB] ${data?.length || 0} membros encontrados.`);
        const list = (data || []).map(m => ({
          ...m,
          badges: m.badges || [],
          scores: m.scores || [],
          stats: m.stats || {}
        })) as Member[];
        
        memoryMembersCache = { data: list, timestamp: Date.now() };

        try {
          localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
        } catch (e) {
          console.warn("[getMembers] Erro ao salvar cache de membros:", e);
        }
        return list;
      });
    } catch (error) {
      console.warn("[DB] Falha de conexão ao buscar membros no Supabase. Tentando Cloudflare D1 e backup local.");
      
      // Tentativa de recuperação via Cloudflare D1
      try {
        const d1Rows = await runD1Query<any>('SELECT * FROM members WHERE active = 1');
        if (d1Rows && d1Rows.length > 0) {
          const list: Member[] = d1Rows.map(r => {
            let statsData: any = {};
            try {
              statsData = typeof r.stats === 'string' ? JSON.parse(r.stats) : (r.stats || {});
            } catch (e) {
              statsData = {};
            }
            return {
              id: r.id,
              name: r.name,
              role: r.role,
              className: r.rank || '',
              joinedAt: r.created_at || '',
              birthday: r.birthDate || '',
              counselor: statsData.counselor || '',
              unit: r.unit,
              scores: statsData.scores || [],
              photoUrl: r.avatar || '',
              badges: statsData.badges || [],
              stats: statsData.stats || {}
            } as Member;
          });
          memoryMembersCache = { data: list, timestamp: Date.now() };
          try {
            localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
          } catch (e) {}
          return list;
        }
      } catch (e) {
        console.warn("[getMembers] Falha ao consultar Cloudflare D1:", e);
      }

      if (memoryMembersCache && memoryMembersCache.data.length > 0) {
        return memoryMembersCache.data;
      }
      try {
        const cached = localStorage.getItem('sentinelas_members_backup');
        if (cached) {
          const parsed = JSON.parse(cached) as Member[];
          if (parsed && parsed.length > 0) {
            memoryMembersCache = { data: parsed, timestamp: Date.now() };
            return parsed;
          }
        }
      } catch (e) {
        console.warn("[getMembers] Erro ao consultar backup local de membros:", e);
      }
      return DEFAULT_MEMBERS;
    }
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

    // Backup local preventivo
    try {
      const cachedStr = localStorage.getItem('sentinelas_members_backup');
      let list: Member[] = cachedStr ? JSON.parse(cachedStr) : [];
      list = list.filter(m => String(m.id) !== String(member.id));
      list.push(member);
      localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
      memoryMembersCache = { data: list, timestamp: Date.now() };
    } catch (e) {
      console.warn("[addMember] Erro no backup local:", e);
    }
    
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
      console.error("Erro ao adicionar membro no Supabase:", e);
    }

    // Gravação assíncrona paralela no Cloudflare D1
    try {
      runD1Query(
        `INSERT OR REPLACE INTO members (id, name, unit, role, rank, active, birthDate, phone, stats)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.id,
          member.name,
          member.unit,
          member.role,
          member.className || '',
          1,
          member.birthday || '',
          '',
          JSON.stringify({ scores: member.scores || [], badges: member.badges || [], stats: member.stats || {}, counselor: member.counselor || '' })
        ]
      ).catch(err => console.warn("[D1 Sync] Erro assíncrono ao sincronizar membro:", err));
    } catch (e) {}
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

    // Backup local preventivo
    try {
      const cachedStr = localStorage.getItem('sentinelas_members_backup');
      let list: Member[] = cachedStr ? JSON.parse(cachedStr) : [];
      list = list.map(m => String(m.id) === String(id) ? { ...m, ...payload, id } : m);
      localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
      memoryMembersCache = { data: list, timestamp: Date.now() };
    } catch (e) {
      console.warn("[updateMember] Erro no backup local:", e);
    }

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
    }

    // Gravação assíncrona paralela no Cloudflare D1
    try {
      runD1Query(
        `INSERT OR REPLACE INTO members (id, name, unit, role, rank, active, birthDate, phone, stats)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.id,
          member.name,
          member.unit,
          member.role,
          member.className || '',
          1,
          member.birthday || '',
          '',
          JSON.stringify({ scores: member.scores || [], badges: member.badges || [], stats: member.stats || {}, counselor: member.counselor || '' })
        ]
      ).catch(err => console.warn("[D1 Sync] Erro assíncrono ao sincronizar membro:", err));
    } catch (e) {}
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

    // Backup local preventivo
    try {
      const cachedStr = localStorage.getItem('sentinelas_members_backup');
      let list: Member[] = cachedStr ? JSON.parse(cachedStr) : [];
      payloads.forEach(payload => {
        list = list.map(m => String(m.id) === String(payload.id) ? { ...m, ...payload } : m);
        if (!list.some(m => String(m.id) === String(payload.id))) {
          list.push(payload);
        }
      });
      localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
      memoryMembersCache = { data: list, timestamp: Date.now() };
    } catch (e) {
      console.warn("[updateMembers] Erro no backup local:", e);
    }

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
    }
  },

  async deleteMember(id: string) {
    try {
      const cachedStr = localStorage.getItem('sentinelas_members_backup');
      if (cachedStr) {
        let list: Member[] = JSON.parse(cachedStr);
        list = list.filter(m => String(m.id) !== String(id));
        localStorage.setItem('sentinelas_members_backup', JSON.stringify(list));
        memoryMembersCache = { data: list, timestamp: Date.now() };
      }
    } catch (e) {
      console.warn("[deleteMember] Erro ao atualizar cache local:", e);
    }
    await supabase.from('members').delete().eq('id', id);
    try {
      runD1Query('DELETE FROM members WHERE id = ?', [id]).catch(err => console.warn("[D1 Sync] Erro ao deletar membro no D1:", err));
    } catch (e) {}
  },

  // --- CONSELHEIROS ---
  async getCounselors(): Promise<CounselorDB[]> {
    try {
      const { data, error } = await supabase
        .from('conselheiros')
        .select('id, created_at, name:nome') 
        .order('nome', { ascending: true });
      
      if (error) {
        console.warn("[DB] Aviso ao buscar conselheiros:", error.message || error);
        return [];
      }
      return (data || []) as any[];
    } catch (e) {
      console.warn("[getCounselors] Falha ao buscar conselheiros:", e);
      return [];
    }
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

  // --- UNIDADES DO CLUBE ---
  async getUnits(): Promise<ClubUnit[]> {
    try {
      return await withRetry(async () => {
        console.log("[DB] Buscando unidades...");
        const { data, error } = await supabase.from('units').select('*').order('name', { ascending: true });
        if (error) {
          console.warn("[DB] Aviso ao buscar unidades no Supabase (usando fallback):", error.message || error);
          throw error;
        }
        if (data && data.length > 0) {
          const list: ClubUnit[] = data.map((u: any) => ({
            id: u.id || `unit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: u.name || u.nome,
            color: u.color || u.cor || '#0061f2',
            logoUrl: u.logoUrl || u.logo_url || u.logo,
            isCustom: u.isCustom ?? u.is_custom ?? true,
            created_at: u.created_at
          }));
          const sortedList = sortUnitsWithLeadershipLast(list);
          try {
            localStorage.setItem('sentinelas_units_backup', JSON.stringify(sortedList));
          } catch (e) {
            console.warn("[getUnits] Erro ao salvar cache de unidades:", e);
          }
          return sortedList;
        }
        throw new Error('Nenhuma unidade retornada pelo Supabase');
      }, 1, 200);
    } catch (err) {
      try {
        const cached = localStorage.getItem('sentinelas_units_backup');
        if (cached) {
          const parsed = JSON.parse(cached) as ClubUnit[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sortUnitsWithLeadershipLast(parsed);
          }
        }
      } catch (e) {
        console.warn("[getUnits] Erro ao consultar backup local de unidades:", e);
      }
      return DEFAULT_UNITS;
    }
  },

  async addUnit(unit: ClubUnit): Promise<ClubUnit> {
    const fullUnit: ClubUnit = {
      ...unit,
      id: unit.id || `unit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: unit.created_at || new Date().toISOString()
    };

    // Backup local imediato
    try {
      const cached = localStorage.getItem('sentinelas_units_backup');
      let list: ClubUnit[] = cached ? JSON.parse(cached) : [...DEFAULT_UNITS];
      if (!list.some(u => u.name.toLowerCase() === fullUnit.name.toLowerCase())) {
        list = sortUnitsWithLeadershipLast([...list, fullUnit]);
        localStorage.setItem('sentinelas_units_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[addUnit] Erro no backup local:", e);
    }

    // Tenta persistir no Supabase
    try {
      const { error } = await supabase.from('units').insert([{
        id: fullUnit.id,
        name: fullUnit.name,
        color: fullUnit.color,
        logo_url: fullUnit.logoUrl,
        is_custom: fullUnit.isCustom ?? true
      }]);
      if (error) {
        console.warn("[DB] Aviso ao inserir unidade no Supabase:", error.message || error);
      }
    } catch (e) {
      console.warn("[addUnit] Erro ao salvar unidade no Supabase:", e);
    }

    return fullUnit;
  },

  async updateUnit(oldUnit: ClubUnit, updatedUnit: ClubUnit): Promise<ClubUnit> {
    // 1. Atualizar backup local
    try {
      const cached = localStorage.getItem('sentinelas_units_backup');
      let list: ClubUnit[] = cached ? JSON.parse(cached) : [...DEFAULT_UNITS];
      const index = list.findIndex(u => u.id === oldUnit.id || u.name.toLowerCase() === oldUnit.name.toLowerCase());
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedUnit };
      } else {
        list.push(updatedUnit);
      }
      list = sortUnitsWithLeadershipLast(list);
      localStorage.setItem('sentinelas_units_backup', JSON.stringify(list));
    } catch (e) {
      console.warn("[updateUnit] Erro no backup local:", e);
    }

    // 2. Persistir no Supabase
    try {
      const { error } = await supabase.from('units').upsert([{
        id: updatedUnit.id || oldUnit.id,
        name: updatedUnit.name,
        color: updatedUnit.color,
        logo_url: updatedUnit.logoUrl,
        is_custom: updatedUnit.isCustom ?? true
      }], { onConflict: 'id' });

      if (error) {
        console.warn("[updateUnit] Aviso ao atualizar unidade no Supabase:", error.message || error);
      }

      // Se o nome da unidade mudou, atualiza os membros no Supabase
      if (oldUnit.name.trim().toLowerCase() !== updatedUnit.name.trim().toLowerCase()) {
        try {
          const { error: memberError } = await supabase
            .from('members')
            .update({ unit: updatedUnit.name })
            .eq('unit', oldUnit.name);
          if (memberError) {
            console.warn("[updateUnit] Aviso ao atualizar membros da unidade:", memberError.message || memberError);
          }
        } catch (mErr) {
          console.warn("[updateUnit] Erro ao sincronizar membros no Supabase:", mErr);
        }
      }
    } catch (e) {
      console.warn("[updateUnit] Erro ao salvar alterações no Supabase:", e);
    }

    return updatedUnit;
  },

  async deleteUnit(unitId: string, unitName?: string): Promise<void> {
    // Remover do backup local
    try {
      const cached = localStorage.getItem('sentinelas_units_backup');
      if (cached) {
        let list: ClubUnit[] = JSON.parse(cached);
        list = list.filter(u => u.id !== unitId && (!unitName || u.name.toLowerCase() !== unitName.toLowerCase()));
        localStorage.setItem('sentinelas_units_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[deleteUnit] Erro no backup local:", e);
    }

    // Tentar deletar no Supabase
    try {
      const { error } = await supabase.from('units').delete().eq('id', unitId);
      if (error && unitName) {
        await supabase.from('units').delete().eq('name', unitName);
      }
    } catch (e) {
      console.warn("[deleteUnit] Erro ao deletar unidade no Supabase:", e);
    }
  },

  subscribeUnits(callback: (units: ClubUnit[]) => void) {
    let localUnits: ClubUnit[] = [];
    this.getUnits().then(data => {
      localUnits = sortUnitsWithLeadershipLast(data);
      callback(localUnits);
    }).catch(() => {
      localUnits = sortUnitsWithLeadershipLast(DEFAULT_UNITS);
      callback(localUnits);
    });

    return supabase
      .channel('units_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newU: ClubUnit = {
            id: payload.new.id,
            name: payload.new.name || payload.new.nome,
            color: payload.new.color || payload.new.cor,
            logoUrl: payload.new.logo_url || payload.new.logoUrl,
            isCustom: payload.new.is_custom ?? payload.new.isCustom ?? true,
            created_at: payload.new.created_at
          };
          if (!localUnits.some(u => u.id === newU.id || u.name.toLowerCase() === newU.name.toLowerCase())) {
            localUnits = [...localUnits, newU];
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedU: ClubUnit = {
            id: payload.new.id,
            name: payload.new.name || payload.new.nome,
            color: payload.new.color || payload.new.cor,
            logoUrl: payload.new.logo_url || payload.new.logoUrl,
            isCustom: payload.new.is_custom ?? payload.new.isCustom ?? true,
            created_at: payload.new.created_at
          };
          localUnits = localUnits.map(u => u.id === payload.new.id ? updatedU : u);
        } else if (payload.eventType === 'DELETE') {
          localUnits = localUnits.filter(u => u.id !== payload.old.id);
        }
        localUnits = sortUnitsWithLeadershipLast(localUnits);
        callback([...localUnits]);
      })
      .subscribe();
  },

  // --- AVISOS ---
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      return await withRetry(async () => {
        console.log("[DB] Buscando avisos...");
        const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
        if (error) {
          console.warn("[DB] Erro de consulta ao buscar avisos:", error.message || error);
          throw error;
        }
        console.log(`[DB] ${data?.length || 0} avisos encontrados.`);
        const list = (data || []) as Announcement[];
        try {
          localStorage.setItem('sentinelas_announcements_backup', JSON.stringify(list));
        } catch (e) {
          console.warn("[getAnnouncements] Erro ao salvar cache de avisos:", e);
        }
        return list;
      });
    } catch (err) {
      console.warn("[DB] Falha de conexão ao buscar avisos. Tentando Cloudflare D1 e backup local.");
      try {
        const d1Rows = await runD1Query<any>('SELECT * FROM announcements ORDER BY date DESC');
        if (d1Rows && d1Rows.length > 0) {
          return d1Rows.map(r => ({
            id: r.id,
            title: r.title,
            content: r.content,
            date: r.date,
            author: r.author || 'Liderança',
            target: (r.target as any) || 'all',
            pinned: Boolean(r.pinned)
          }));
        }
      } catch (e) {}

      try {
        const cached = localStorage.getItem('sentinelas_announcements_backup');
        if (cached) {
          const parsed = JSON.parse(cached) as Announcement[];
          if (parsed && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn("[getAnnouncements] Erro ao ler backup local de avisos:", e);
      }
      return DEFAULT_ANNOUNCEMENTS.map((a, idx) => ({
        id: `ann_${idx + 1}`,
        title: a.title,
        content: a.content,
        date: a.date,
        author: 'Liderança',
        target: 'all' as const
      }));
    }
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
    try {
      const cachedStr = localStorage.getItem('sentinelas_announcements_backup');
      let list: Announcement[] = cachedStr ? JSON.parse(cachedStr) : [];
      list = [ann, ...list.filter(a => a.id !== ann.id)];
      localStorage.setItem('sentinelas_announcements_backup', JSON.stringify(list));
    } catch (e) {
      console.warn("[addAnnouncement] Erro no backup local:", e);
    }
    try {
      await supabase.from('announcements').insert([ann]);
    } catch (e) {
      console.warn("Erro ao adicionar aviso no Supabase:", e);
    }
  },

  async deleteAnnouncement(id: string) {
    try {
      const cachedStr = localStorage.getItem('sentinelas_announcements_backup');
      if (cachedStr) {
        let list: Announcement[] = JSON.parse(cachedStr);
        list = list.filter(a => a.id !== id);
        localStorage.setItem('sentinelas_announcements_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[deleteAnnouncement] Erro no backup local:", e);
    }
    try {
      await supabase.from('announcements').delete().eq('id', id);
    } catch (e) {
      console.warn("Erro ao deletar aviso no Supabase:", e);
    }
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
  async getSpecialties(forceRefresh = false): Promise<SpecialtyDBV[]> {
    if (!forceRefresh && memorySpecialtiesCache && memorySpecialtiesCache.data.length > 0 && Date.now() - memorySpecialtiesCache.timestamp < CACHE_TTL_MS) {
      return memorySpecialtiesCache.data;
    }

    try {
      const { data, error } = await supabase.from('EspecialidadesDBV').select('*').order('Nome', { ascending: true });
      if (!error && data && data.length > 0) {
        const list = data as SpecialtyDBV[];
        memorySpecialtiesCache = { data: list, timestamp: Date.now() };
        return list;
      }
    } catch (e) {
      console.warn("[getSpecialties] Falha ao consultar especialidades no Supabase:", e);
    }

    // Tentar Cloudflare D1
    try {
      const d1Rows = await runD1Query<any>('SELECT * FROM EspecialidadesDBV ORDER BY Nome ASC');
      if (d1Rows && d1Rows.length > 0) {
        const list = d1Rows.map(r => ({
          id: r.id,
          Nome: r.Nome,
          Categoria: r.Area || 'Geral',
          Imagem: r.badgeUrl || '',
          Like: false
        })) as SpecialtyDBV[];
        memorySpecialtiesCache = { data: list, timestamp: Date.now() };
        return list;
      }
    } catch (e) {}

    // Fallback garantido usando o catálogo padrão
    const fallbackList: SpecialtyDBV[] = SPECIALTIES.map((s, idx) => ({
      id: idx + 1,
      ID: `spec_${idx + 1}`,
      Nome: s.name,
      Categoria: 'Geral',
      Imagem: s.image,
      Questoes: '[]',
      Sigla: `S${idx + 1}`,
      Nivel: '1',
      Ano: '2026',
      Origem: 'DSA',
      Like: false,
      Cor: '#2563eb'
    } as SpecialtyDBV));
    memorySpecialtiesCache = { data: fallbackList, timestamp: Date.now() };
    return fallbackList;
  },

  subscribeSpecialties(callback: (specialties: SpecialtyDBV[]) => void) {
    let localSpecialties: SpecialtyDBV[] = [];
    this.getSpecialties().then(data => {
      localSpecialties = data;
      callback(localSpecialties);
    }).catch(err => console.warn("[Realtime] Erro ao carregar especialidades:", err));

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
    const defaultConfigs: GameConfig = {
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
    };

    try {
      const { data, error } = await supabase.from('game_configs').select('*').eq('id', 1).maybeSingle();
      if (error || !data) {
        return defaultConfigs;
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
        last_monthly_award_month: data.last_monthly_award_month ?? null
      } as GameConfig;
    } catch (e) {
      console.warn("[getGameConfigs] Falha ao consultar game_configs:", e);
      return defaultConfigs;
    }
  },

  async updateGameConfig(updates: Partial<GameConfig>) {
    try {
      await supabase.from('game_configs').update(updates).eq('id', 1);
    } catch (e) {
      console.warn("[updateGameConfig] Erro ao atualizar configurações:", e);
    }
  },

  subscribeGameConfigs(callback: (config: GameConfig) => void) {
    this.getGameConfigs().then(config => config && callback(config)).catch(err => console.warn("[Realtime] Erro game configs:", err));
    return supabase
      .channel('game_configs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_configs' }, (payload) => {
        callback(payload.new as GameConfig);
      })
      .subscribe();
  },

  // --- QUESTÕES DO QUIZ ---
  async getQuizQuestions(): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase.from('quiz_questions').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("[DB] Aviso ao buscar quiz_questions:", error.message || error);
        return [];
      }
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
    } catch (e) {
      console.warn("[getQuizQuestions] Falha ao consultar questões do quiz:", e);
      return [];
    }
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
  async getUsers(forceRefresh = false): Promise<AuthUser[]> {
    if (!forceRefresh && memoryUsersCache && Date.now() - memoryUsersCache.timestamp < CACHE_TTL_MS) {
      return memoryUsersCache.data;
    }

    try {
      return await withRetry(async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
          console.error("Erro ao buscar usuários:", error);
          throw error;
        }
        const usersList = (data || []) as AuthUser[];
        memoryUsersCache = { data: usersList, timestamp: Date.now() };
        try {
          localStorage.setItem('sentinelas_users_backup', JSON.stringify(usersList));
        } catch (e) {
          console.warn("[getUsers] Erro ao salvar backup local de usuários:", e);
        }
        return usersList;
      });
    } catch (err) {
      console.warn("[getUsers] Falha de conexão. Usando backup local de usuários se disponível.");
      if (memoryUsersCache && memoryUsersCache.data.length > 0) {
        return memoryUsersCache.data;
      }
      try {
        const cached = localStorage.getItem('sentinelas_users_backup');
        if (cached) {
          const parsed = JSON.parse(cached) as AuthUser[];
          memoryUsersCache = { data: parsed, timestamp: Date.now() };
          return parsed;
        }
      } catch (e) {
        console.error("[getUsers] Erro ao ler backup local de usuários:", e);
      }
      return [];
    }
  },

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const prefix = cleanEmail.split('@')[0];
    const isRonaldo = cleanEmail.includes('ronaldo') || cleanEmail === 'ronaldosonic@gmail.com';

    // 1. Tentar no Supabase com múltiplos critérios de busca
    try {
      const supabaseUser = await withRetry(async () => {
        // Tenta por email direto
        let { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail);

        // Se não achou ou deu erro de coluna, tenta por username
        if ((!data || data.length === 0)) {
          try {
            const userRes = await supabase
              .from('users')
              .select('*')
              .ilike('username', cleanEmail);
            if (userRes.data && userRes.data.length > 0) {
              data = userRes.data;
            }
          } catch (e) {}
        }

        // Se não achou e tem prefixo antes do @ (ex: ronaldo para ronaldoSonic@gmail.com)
        if ((!data || data.length === 0) && prefix && prefix !== cleanEmail) {
          try {
            const prefixRes = await supabase
              .from('users')
              .select('*')
              .or(`email.ilike.${prefix},username.ilike.${prefix},id.ilike.${prefix}`);
            if (prefixRes.data && prefixRes.data.length > 0) {
              data = prefixRes.data;
            }
          } catch (e) {}
        }

        // Se for Ronaldo e ainda não achou, tenta pelo id 'mem_ronaldo'
        if ((!data || data.length === 0) && isRonaldo) {
          try {
            const ronaldoRes = await supabase
              .from('users')
              .select('*')
              .or('id.eq.mem_ronaldo,name.ilike.%Ronaldo%');
            if (ronaldoRes.data && ronaldoRes.data.length > 0) {
              data = ronaldoRes.data;
            }
          } catch (e) {}
        }

        if (data && data.length > 0) {
          const uData = data[0];
          const user: AuthUser = {
            id: uData.id || `mem_${prefix}`,
            name: uData.name || (isRonaldo ? 'Ronaldo Sonic' : prefix.toUpperCase()),
            role: uData.role || (isRonaldo ? UserRole.LEADERSHIP : UserRole.PATHFINDER),
            funcao: uData.funcao || (isRonaldo ? 'Diretoria / Administrador' : 'Desbravador'),
            unit: uData.unit || (isRonaldo ? UnitName.LIDERANCA : UnitName.GUERREIROS),
            age: uData.age || (isRonaldo ? 35 : 14),
            className: uData.className || (isRonaldo ? 'Líder' : 'Desbravador'),
            birthday: uData.birthday || (isRonaldo ? '1990-03-29' : ''),
            email: uData.email || uData.username || cleanEmail,
            password: uData.password || (isRonaldo ? '123' : '123456'),
            photoUrl: uData.photoUrl || uData.avatar || (isRonaldo ? 'https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx' : ''),
            stats: uData.stats || { totalLogins: 1, totalMessages: 0, checkInStreak: 0 },
            badges: uData.badges || (typeof uData.monthlyMedals === 'string' ? JSON.parse(uData.monthlyMedals || '[]') : (uData.monthlyMedals || []))
          };

          // Atualiza cache local
          try {
            const cachedStr = localStorage.getItem('sentinelas_users_backup');
            let list: AuthUser[] = cachedStr ? JSON.parse(cachedStr) : [];
            list = list.filter(u => u.email.trim().toLowerCase() !== cleanEmail && u.id !== user.id);
            list.push(user);
            localStorage.setItem('sentinelas_users_backup', JSON.stringify(list));
          } catch (e) {}

          return user;
        }

        return null;
      });

      if (supabaseUser) {
        return supabaseUser;
      }
    } catch (err) {
      console.warn("[getUserByEmail] Erro ao consultar Supabase para:", cleanEmail, err);
    }

    // 2. Tentar Cloudflare D1
    try {
      const d1Rows = await runD1Query<any>(
        'SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(name) = ? OR LOWER(id) = ? LIMIT 1',
        [cleanEmail, cleanEmail, cleanEmail]
      );
      if (d1Rows && d1Rows.length > 0) {
        const r = d1Rows[0];
        let badges: any[] = [];
        try {
          badges = typeof r.monthlyMedals === 'string' ? JSON.parse(r.monthlyMedals) : (r.monthlyMedals || []);
        } catch (e) {}
        const user: AuthUser = {
          id: r.id,
          name: r.name,
          role: r.role,
          funcao: r.funcao || r.role,
          unit: r.unit,
          age: 14,
          className: 'Desbravador',
          birthday: '',
          email: r.username || cleanEmail,
          password: r.password || (isRonaldo ? '123' : '123456'),
          photoUrl: r.avatar || (isRonaldo ? 'https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx' : ''),
          stats: { totalLogins: 1, totalMessages: 0, checkInStreak: 0 },
          badges
        };
        return user;
      }
    } catch (e) {
      console.warn("[getUserByEmail] Falha ao buscar no Cloudflare D1:", e);
    }

    // 3. Tentar Backup Local de Usuários (sentinelas_users_backup)
    try {
      const cachedStr = localStorage.getItem('sentinelas_users_backup');
      if (cachedStr) {
        const list: AuthUser[] = JSON.parse(cachedStr);
        const found = list.find(u => {
          const uEmail = (u.email || '').trim().toLowerCase();
          const uName = (u.name || '').trim().toLowerCase();
          const uId = (u.id || '').trim().toLowerCase();
          return uEmail === cleanEmail || 
                 uEmail === prefix || 
                 uId === cleanEmail || 
                 (prefix && uEmail.startsWith(prefix)) ||
                 (isRonaldo && (uId === 'mem_ronaldo' || uName.includes('ronaldo') || uEmail.includes('ronaldo')));
        });
        if (found) {
          console.log("[getUserByEmail] Usuário encontrado no backup local offline:", found.name);
          return found;
        }
      }
    } catch (e) {
      console.error("[getUserByEmail] Erro ao consultar backup local:", e);
    }

    // 4. Tentar Backup Local de Membros (sentinelas_members_backup e DEFAULT_MEMBERS)
    try {
      const cachedMembers = localStorage.getItem('sentinelas_members_backup');
      let mList: Member[] = cachedMembers ? JSON.parse(cachedMembers) : [];
      if (mList.length === 0) {
        mList = [...DEFAULT_MEMBERS];
      }
      
      const foundMem = mList.find(m => {
        const mEmail = ((m as any).email || '').trim().toLowerCase();
        const mName = (m.name || '').trim().toLowerCase();
        const mId = (m.id || '').trim().toLowerCase();
        return mEmail === cleanEmail || 
               mId === cleanEmail || 
               (isRonaldo && (mId === 'mem_ronaldo' || mName.includes('ronaldo') || mEmail.includes('ronaldo')));
      });

      if (foundMem) {
        console.log("[getUserByEmail] Membro correspondente encontrado no backup local:", foundMem.name);
        return {
          id: foundMem.id,
          name: foundMem.name,
          role: foundMem.role as any,
          funcao: (foundMem as any).funcao || (foundMem.role === UserRole.LEADERSHIP ? 'Diretoria / Administrador' : 'Desbravador'),
          unit: foundMem.unit,
          age: foundMem.age || (isRonaldo ? 35 : 14),
          className: foundMem.className || (isRonaldo ? 'Líder' : 'Desbravador'),
          birthday: foundMem.birthday || (isRonaldo ? '1990-03-29' : ''),
          email: (foundMem as any).email || cleanEmail,
          password: (foundMem as any).password || (isRonaldo ? '123' : '123456'),
          photoUrl: foundMem.photoUrl || (isRonaldo ? 'https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx' : ''),
          stats: foundMem.stats || { totalLogins: 1, totalMessages: 0, checkInStreak: 0 },
          badges: foundMem.badges || []
        } as AuthUser;
      }
    } catch (e) {
      console.error("[getUserByEmail] Erro ao buscar correspondência de membro:", e);
    }

    // 5. Fallback para Ronaldo / Liderança / Usuário Geral
    if (isRonaldo) {
      console.log("[getUserByEmail] Gerando usuário Ronaldo Master garantido.");
      return {
        id: 'mem_ronaldo',
        name: 'Ronaldo Sonic',
        role: UserRole.LEADERSHIP,
        funcao: 'Diretoria / Administrador',
        unit: UnitName.LIDERANCA,
        age: 35,
        className: 'Líder',
        birthday: '1990-03-29',
        email: cleanEmail,
        password: '123',
        photoUrl: 'https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx',
        stats: { totalLogins: 1, totalMessages: 0, checkInStreak: 0 },
        badges: []
      } as AuthUser;
    }

    const isLeadership = cleanEmail.includes('admin') || cleanEmail.includes('lider');
    return {
      id: 'offline_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      name: prefix.toUpperCase(),
      role: isLeadership ? UserRole.LEADERSHIP : UserRole.PATHFINDER,
      funcao: isLeadership ? 'Liderança' : 'Desbravador',
      unit: isLeadership ? UnitName.LIDERANCA : UnitName.GUERREIROS,
      age: isLeadership ? 28 : 14,
      className: isLeadership ? 'Líder' : 'Guia',
      birthday: '1998-05-15',
      email: cleanEmail,
      password: '123456',
      photoUrl: 'https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx',
      stats: { totalLogins: 1, totalMessages: 0, checkInStreak: 0 },
      badges: []
    } as AuthUser;
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
    
    // Salva preventivamente no backup local sempre
    try {
      const cachedStr = localStorage.getItem('sentinelas_users_backup');
      let list: AuthUser[] = cachedStr ? JSON.parse(cachedStr) : [];
      list = list.filter(u => String(u.id) !== String(user.id) && u.email.trim().toLowerCase() !== user.email.trim().toLowerCase());
      list.push(user);
      localStorage.setItem('sentinelas_users_backup', JSON.stringify(list));
    } catch (e) {
      console.warn("[addUser] Erro ao salvar backup de usuários local:", e);
    }

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
      console.warn("Aviso ao adicionar usuário no Supabase:", e);
    }

    // Gravação assíncrona paralela no Cloudflare D1
    try {
      runD1Query(
        `INSERT OR REPLACE INTO users (id, username, name, role, unit, password, active, funcao, monthlyMedals, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email || user.id,
          user.name,
          user.role,
          user.unit || '',
          user.password || '123456',
          1,
          user.funcao || user.role,
          JSON.stringify(user.badges || []),
          user.photoUrl || ''
        ]
      ).catch(err => console.warn("[D1 Sync] Erro assíncrono ao sincronizar usuário:", err));
    } catch (e) {}
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
    // Tentar ler do cache em memória
    if (bibleChaptersCache[book]) {
      return bibleChaptersCache[book];
    }

    // Tentar ler do localStorage
    const cachedLocal = localStorage.getItem(`bible_chapters_${book}`);
    if (cachedLocal) {
      try {
        const parsed = JSON.parse(cachedLocal);
        bibleChaptersCache[book] = parsed;
        return parsed;
      } catch (e) {
        console.warn("Erro ao ler capítulos cacheado:", e);
      }
    }

    try {
      const keys = await detectBibleKeys();
      const bookKey = keys.bookKey;
      const chapterKey = keys.chapterKey;

      const { data, error } = await supabase
        .from('Biblia_Completa')
        .select(chapterKey)
        .eq(bookKey, book);

      if (!error && data && data.length > 0) {
        const chapters = data.map(d => parseInt(d[chapterKey]));
        const uniqueChapters = Array.from(new Set(chapters)).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (uniqueChapters.length > 0) {
          bibleChaptersCache[book] = uniqueChapters;
          localStorage.setItem(`bible_chapters_${book}`, JSON.stringify(uniqueChapters));
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
    const cacheKey = `${book}_${chapter}`;
    if (bibleVersesCache[cacheKey]) {
      return bibleVersesCache[cacheKey];
    }

    try {
      const keys = await detectBibleKeys();
      const bookKey = keys.bookKey;
      const chapterKey = keys.chapterKey;
      const verseKey = keys.verseKey;
      const textKey = keys.textKey;

      const { data, error } = await supabase
        .from('Biblia_Completa')
        .select(`${verseKey}, ${textKey}`)
        .eq(bookKey, book)
        .or(`${chapterKey}.eq.${chapter},${chapterKey}.eq."${chapter}"`);

      if (!error && data && data.length > 0) {
        const formatted = data.map(v => ({
          Versiculo: parseInt(v[verseKey]),
          Texto: v[textKey]
        })).sort((a, b) => a.Versiculo - b.Versiculo);

        // Armazenar apenas em memória de sessão rápida para otimizar UI sem estourar cota de localStorage
        bibleVersesCache[cacheKey] = formatted;
        return formatted;
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
      const keys = await detectBibleKeys();
      const bookKey = keys.bookKey;
      const chapterKey = keys.chapterKey;
      const verseKey = keys.verseKey;
      const textKey = keys.textKey;

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
    
    // Tenta ler do cache do localStorage primeiro para economizar requisições do dia
    const dateCacheKey = `bible_verse_of_the_day_${dateStr}`;
    const cachedDayVerse = localStorage.getItem(dateCacheKey);
    if (cachedDayVerse) {
      try {
        return JSON.parse(cachedDayVerse);
      } catch (e) {
        console.warn("Erro ao desserializar versículo do dia cacheado:", e);
      }
    }

    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    try {
      const keys = await detectBibleKeys();
      const bookKey = keys.bookKey;
      const chapterKey = keys.chapterKey;
      const verseKey = keys.verseKey;
      const textKey = keys.textKey;

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
          const dayVerse = {
            livro: data[0][bookKey],
            cap: parseInt(data[0][chapterKey]),
            ver: parseInt(data[0][verseKey]),
            texto: data[0][textKey]
          };
          localStorage.setItem(dateCacheKey, JSON.stringify(dayVerse));
          return dayVerse;
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
      const dayVerse = {
        livro: selected.bName,
        cap: selected.cNum,
        ver: selected.ver,
        texto: selected.text
      };
      // Guarda em cache de fallback
      localStorage.setItem(dateCacheKey, JSON.stringify(dayVerse));
      return dayVerse;
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

  async updateDevotional(id: number, devotional: Partial<Omit<Devotional, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('devotionals')
      .update(devotional)
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- JOGO 3 DICAS ---
  async getThreeCluesQuestions(): Promise<ThreeCluesQuestion[]> {
    try {
      const { data, error } = await supabase.from('three_clues_questions').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("[DB] Aviso ao buscar 3 dicas:", error.message || error);
        return [];
      }
      return (data || []) as ThreeCluesQuestion[];
    } catch (e) {
      console.warn("[getThreeCluesQuestions] Falha ao buscar 3 dicas:", e);
      return [];
    }
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

  async seedMembers(members: (Omit<Member, 'id'> | Member)[]) {
    for (const m of members) {
      const { data } = await supabase.from('members').select('id').eq('name', m.name);
      if (!data || data.length === 0) {
        await this.addMember({
          ...m,
          id: (m as any).id || Math.random().toString(36).substr(2, 9)
        } as Member);
      }
    }
  },

  // --- ESTUDO DE ESPECIALIDADES (PDF + QUIZ) ---
  async getSpecialtyStudies(): Promise<SpecialtyStudy[]> {
    try {
      return await withRetry(async () => {
        console.log("[DB] Buscando estudos...");
        const { data, error } = await supabase.from('specialty_studies').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn("[DB] Aviso ao buscar estudos:", error.message || error);
          throw error;
        }
        console.log(`[DB] ${data?.length || 0} estudos encontrados.`);
        const list = (data || []) as SpecialtyStudy[];
        try {
          localStorage.setItem('sentinelas_specialty_studies_backup', JSON.stringify(list));
        } catch (e) {
          console.warn("[getSpecialtyStudies] Erro ao salvar cache de estudos:", e);
        }
        return list;
      });
    } catch (err) {
      console.warn("[DB] Falha de conexão ao buscar estudos. Tentando Cloudflare D1 e backup local.");
      try {
        const d1Rows = await runD1Query<any>('SELECT * FROM specialty_studies ORDER BY created_at DESC');
        if (d1Rows && d1Rows.length > 0) {
          return d1Rows.map(r => ({
            id: r.id,
            name: r.name,
            pdfurl: r.pdfurl,
            video_url: r.video_url,
            specialty_image_url: r.specialty_image_url,
            category: r.category || 'Geral',
            questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : (r.questions || []),
            scheduled_for: r.scheduled_for,
            created_at: r.created_at
          })) as SpecialtyStudy[];
        }
      } catch (e) {}

      try {
        const cached = localStorage.getItem('sentinelas_specialty_studies_backup');
        if (cached) {
          const parsed = JSON.parse(cached) as SpecialtyStudy[];
          if (parsed && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn("[getSpecialtyStudies] Erro ao consultar backup local de estudos:", e);
      }
      return DEFAULT_SPECIALTY_STUDIES.map((st, idx) => ({
        id: `study_${idx + 1}`,
        ...st
      })) as SpecialtyStudy[];
    }
  },

  async addSpecialtyStudy(study: Omit<SpecialtyStudy, 'id'>) {
    console.log("[DB] Adicionando novo estudo de especialidade:", study.name);
    
    // Backup local preventivo
    const tempId = 'study_' + Date.now();
    const newStudyItem = { ...study, id: tempId, created_at: new Date().toISOString() } as SpecialtyStudy;
    try {
      const cachedStr = localStorage.getItem('sentinelas_specialty_studies_backup');
      let list: SpecialtyStudy[] = cachedStr ? JSON.parse(cachedStr) : [];
      list = [newStudyItem, ...list];
      localStorage.setItem('sentinelas_specialty_studies_backup', JSON.stringify(list));
    } catch (e) {
      console.warn("[addSpecialtyStudy] Erro no backup local:", e);
    }

    try {
      const { error } = await supabase.from('specialty_studies').insert([study]);
      if (error) {
        console.warn("[DB] Aviso ao adicionar estudo:", error.message || error);
        if (error.message?.includes('scheduled_for') || error.code === 'PGRST100' || (error as any).status === 404) {
          console.warn("[DB] Tentando salvar sem coluna 'scheduled_for'...");
          const { scheduled_for, ...studyWithoutSchedule } = study;
          const { error: retryError } = await supabase.from('specialty_studies').insert([studyWithoutSchedule]);
          if (retryError) {
            console.warn("[DB] Falha na contingência de salvar estudo:", retryError.message || retryError);
          }
        }
      }
    } catch (e) {
      console.warn("[addSpecialtyStudy] Erro ao salvar no Supabase:", e);
    }
  },

  async updateSpecialtyStudy(study: SpecialtyStudy) {
    console.log("[DB] Atualizando estudo de especialidade:", study.name);
    try {
      const cachedStr = localStorage.getItem('sentinelas_specialty_studies_backup');
      if (cachedStr) {
        let list: SpecialtyStudy[] = JSON.parse(cachedStr);
        list = list.map(s => s.id === study.id ? { ...s, ...study } : s);
        localStorage.setItem('sentinelas_specialty_studies_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[updateSpecialtyStudy] Erro no backup local:", e);
    }

    const { id, created_at, ...updates } = study;
    try {
      const { error } = await supabase.from('specialty_studies').update(updates).eq('id', id);
      if (error) {
        console.warn("[DB] Aviso ao atualizar estudo:", error.message || error);
        if (error.message?.includes('scheduled_for') || error.code === 'PGRST100' || (error as any).status === 404) {
          const { scheduled_for, ...updatesWithoutSchedule } = updates;
          const { error: retryError } = await supabase.from('specialty_studies').update(updatesWithoutSchedule).eq('id', id);
          if (retryError) console.warn("[DB] Erro no retry de atualização de estudo:", retryError);
        }
      }
    } catch (e) {
      console.warn("[updateSpecialtyStudy] Erro ao atualizar no Supabase:", e);
    }
  },

  async deleteSpecialtyStudy(id: string) {
    try {
      const cachedStr = localStorage.getItem('sentinelas_specialty_studies_backup');
      if (cachedStr) {
        let list: SpecialtyStudy[] = JSON.parse(cachedStr);
        list = list.filter(s => s.id !== id);
        localStorage.setItem('sentinelas_specialty_studies_backup', JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[deleteSpecialtyStudy] Erro no backup local:", e);
    }
    try {
      const { error } = await supabase.from('specialty_studies').delete().eq('id', id);
      if (error) {
        console.warn("[DB] Aviso ao deletar estudo:", error.message || error);
      }
    } catch (e) {
      console.warn("[deleteSpecialtyStudy] Erro ao deletar no Supabase:", e);
    }
  },

  subscribeSpecialtyStudies(callback: (studies: SpecialtyStudy[]) => void) {
    let localStudies: SpecialtyStudy[] = [];
    console.log("[Realtime] Iniciando assinatura de estudos...");
    this.getSpecialtyStudies().then(data => {
      console.log(`[Realtime] ${data.length} estudos carregados inicialmente.`);
      localStudies = data;
      callback(localStudies);
    }).catch(err => console.warn("[Realtime] Erro estudos iniciais:", err));

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
    try {
      const { data, error } = await supabase.from('puzzle_images').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("[DB] Aviso ao buscar imagens do quebra-cabeça:", error.message || error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn("[getPuzzleImages] Falha ao consultar puzzle_images:", e);
      return [];
    }
  },

  async addPuzzleImage(image: { url: string, title: string }) {
    try {
      const { error } = await supabase.from('puzzle_images').insert([image]);
      if (error) {
        console.warn("Aviso ao adicionar imagem do quebra-cabeça:", error.message || error);
      }
    } catch (e) {
      console.warn("[addPuzzleImage] Erro:", e);
    }
  },

  async deletePuzzleImage(id: string) {
    try {
      const { error } = await supabase.from('puzzle_images').delete().eq('id', id);
      if (error) {
        console.warn("Aviso ao deletar imagem do quebra-cabeça:", error.message || error);
      }
    } catch (e) {
      console.warn("[deletePuzzleImage] Erro:", e);
    }
  },

  async seedPuzzleImages(images: { title: string, url: string }[]) {
    for (const img of images) {
      try {
        const { data } = await supabase.from('puzzle_images').select('id').eq('title', img.title);
        if (!data || data.length === 0) {
          await this.addPuzzleImage(img);
        }
      } catch (e) {
        // ignora
      }
    }
  },

  subscribePuzzleImages(callback: (images: any[]) => void) {
    let localImages: any[] = [];
    this.getPuzzleImages().then(data => {
      localImages = data;
      callback(localImages);
    }).catch(err => console.warn("[Realtime] Erro ao carregar puzzle images:", err));

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
      console.warn("Aviso no seedGameAssets:", error);
    }
  },

  // --- ATIVOS DE JOGOS (IMAGENS DINÂMICAS) ---
  async getGameAssets(gameType: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('game_assets')
        .select('*')
        .eq('game_type', gameType);
      
      if (error) {
        console.warn(`[DB] Aviso ao buscar ativos para ${gameType}:`, error.message || error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn(`[getGameAssets] Falha para ${gameType}:`, e);
      return [];
    }
  },

  async updateGameAsset(id: number, url: string) {
    try {
      const { error } = await supabase
        .from('game_assets')
        .update({ url })
        .eq('id', id);
      
      if (error) throw error;
    } catch (e) {
      console.warn("[updateGameAsset] Erro:", e);
    }
  },

  // --- VERSÍCULO EMBARALHADO ---
  async getScrambledVerses(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('scrambled_verses').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("[DB] Aviso ao buscar scrambled_verses:", error.message || error);
        return [];
      }
      return (data || []) as any[];
    } catch (e) {
      console.warn("[getScrambledVerses] Falha:", e);
      return [];
    }
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
