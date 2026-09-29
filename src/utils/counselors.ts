import { Member, UserRole, UnitName, isLeadershipUnit, ClubUnit } from '../types';

/**
 * Normaliza uma string removendo acentos, caracteres especiais e espaços extras.
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Conjunto de termos proibidos para nomes de pessoas conselheiras.
 * Inclui cargos, funções da diretoria/liderança, classes, placeholders e unidades conhecidas.
 */
const FORBIDDEN_COUNSELOR_TERMS = new Set<string>([
  // Cargos e funções de Liderança
  'diretor',
  'diretora',
  'diretor a',
  'diretora a',
  'diretor associado',
  'diretora associada',
  'diretor a associado a',
  'secretario',
  'secretaria',
  'secretario a',
  'secretaria a',
  'tesoureiro',
  'tesoureira',
  'tesoureiro a',
  'capelao',
  'capela',
  'capelao a',
  'instrutor',
  'instrutora',
  'instrutor a',
  'conselheiro',
  'conselheira',
  'conselheiro a',
  'conselheiro associado',
  'conselheira associada',
  'conselheiro a associado a',
  'anciao',
  'apoio',
  'pastor',
  // Cargos de Desbravadores
  'capitao',
  'capita',
  'capitao a',
  'desbravador',
  'desbravadora',
  'desbravador a',
  'aspirante',
  // Classes e ranks
  'sem classe',
  'classes agrupadas',
  'lider',
  'lider master',
  'lider master avancado',
  'lider em treinamento',
  // Placeholders / textos de sistema
  'sem conselheiro',
  'n a',
  'na',
  'diretoria',
  'nenhum',
  'escolher conselheiro',
  'selecione',
  'selecionar',
  'a definir',
  'conselheiros',
  'cargo',
  'funcao',
  'setor',
  // Unidades padrão e conhecidas
  'aguia dourada',
  'guerreiros',
  'lideranca'
]);

/**
 * Valida se uma string é um nome de pessoa legítimo para conselheiro(a),
 * rejeitando cargos, funções, unidades e textos de placeholder.
 */
export function isValidCounselorPersonName(
  name: string | null | undefined, 
  customUnits?: Array<{ name: string }> | ClubUnit[]
): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;

  const normalized = normalizeText(trimmed);

  if (FORBIDDEN_COUNSELOR_TERMS.has(normalized)) {
    return false;
  }

  // Verifica unidades customizadas
  if (customUnits && Array.isArray(customUnits)) {
    for (const u of customUnits) {
      if (u && u.name) {
        const uNorm = normalizeText(u.name);
        if (normalized === uNorm) return false;
      }
    }
  }

  return true;
}

/**
 * Verifica se um membro possui a função de Conselheiro (a) ou Conselheiro (a) Associado (a).
 * Avalia os campos: counselor (utilizado pela liderança para armazenar o cargo/função),
 * funcao, cargo, position e role.
 */
export function isCounselorOrAssociate(member: Member | any): boolean {
  if (!member) return false;

  const roleText = normalizeText(typeof member.role === 'string' ? member.role : '');
  const counselorField = normalizeText(member.counselor || '');
  const funcaoField = normalizeText(member.funcao || '');
  const cargoField = normalizeText(member.cargo || '');
  const positionField = normalizeText(member.position || '');

  const combined = `${roleText} | ${counselorField} | ${funcaoField} | ${cargoField} | ${positionField}`;

  // Se o cargo contiver "diretor" e NÃO contiver "conselheir", é da diretoria executiva, não conselheiro
  if (combined.includes('diretor') && !combined.includes('conselheir')) {
    return false;
  }

  // Verifica termos de conselheiro e associado
  const hasConselheiro = combined.includes('conselheir'); // conselheiro, conselheira, conselheiro(a)
  const hasAssociado = combined.includes('associad');     // conselheiro associado, associado(a), etc.

  return hasConselheiro || hasAssociado;
}

/**
 * Compatibilidade legada para isLeadershipCounselor
 */
export function isLeadershipCounselor(member: Member | any): boolean {
  return isCounselorOrAssociate(member);
}

/**
 * Constrói a lista oficial de nomes de conselheiros vinda do banco de dados:
 * 1. Dos membros cadastrados que possuem a função de Conselheiro ou Associado.
 * 2. Da tabela conselheiros do banco de dados (cadastrados pelo admin).
 * 3. Sem nomes mock fictícios ou hardcoded.
 */
export function extractCounselorNameList(params: {
  counselorsData?: Array<{ name?: string; nome?: string }>;
  members?: Member[];
  unitsList?: Array<{ name: string }> | ClubUnit[];
}): string[] {
  const { counselorsData = [], members = [], unitsList = [] } = params;
  const names = new Set<string>();

  // 1. Membros do banco com função de Conselheiro ou Associado
  (members || []).forEach(m => {
    if (isCounselorOrAssociate(m)) {
      const rawName = (m.name || '').trim();
      if (isValidCounselorPersonName(rawName, unitsList)) {
        names.add(rawName);
      }
    }
  });

  // 2. Registros da tabela conselheiros do banco de dados
  const mockNamesToIgnore = new Set(['carlos', 'ana']);
  (counselorsData || []).forEach(c => {
    const rawName = (c.name || (c as any).nome || '').trim();
    const normalized = normalizeText(rawName);
    if (!mockNamesToIgnore.has(normalized) && isValidCounselorPersonName(rawName, unitsList)) {
      names.add(rawName);
    }
  });

  // Deduplicação inteligente de nomes parciais (ex: prefere o nome completo "João Gabriel Guerreiro de souza" a "João Gabriel")
  const list = Array.from(names);
  const deduplicated = list.filter(shortName => {
    const normShort = normalizeText(shortName);
    const hasLonger = list.some(longerName => {
      if (longerName === shortName) return false;
      const normLong = normalizeText(longerName);
      return normLong.startsWith(normShort + ' ') || normLong.endsWith(' ' + normShort);
    });
    return !hasLonger;
  });

  return deduplicated.sort((a, b) => a.localeCompare(b));
}
