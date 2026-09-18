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
  'lideranca',
  'esperanca'
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
 * Verifica se um membro pertence à Liderança e possui cargo/função de
 * Conselheiro (a) ou Conselheiro (a) Associado (a).
 */
export function isLeadershipCounselor(member: Member | any): boolean {
  if (!member) return false;

  // Verifica se é membro da liderança
  const isLead = 
    member.role === UserRole.LEADERSHIP || 
    (typeof member.role === 'string' && member.role.toLowerCase() === 'leadership') || 
    isLeadershipUnit(member.unit) || 
    member.unit === UnitName.LIDERANCA || 
    (typeof member.unit === 'string' && normalizeText(member.unit).includes('lideran'));

  if (!isLead) return false;

  // Obtém o cargo/função do membro de liderança (geralmente em member.counselor)
  const roleOrCargo = normalizeText(
    member.counselor || 
    member.funcao || 
    member.position || 
    member.cargo || 
    ''
  );

  return roleOrCargo.includes('conselheir');
}

/**
 * Constrói a lista oficial e limpa de nomes de conselheiros:
 * 1. Do banco de dados (tabela conselheiros / counselorsData).
 * 2. Da liderança que esteja como Conselheiro (a) ou Conselheiro (a) Associado (a).
 * 3. Conselheiros reconhecidos do clube (fallback padrão).
 * 
 * Rejeita qualquer cargo ('Apoio', 'Diretor (a)', etc.) ou unidade ('Esperança', etc.).
 */
export function extractCounselorNameList(params: {
  counselorsData?: Array<{ name?: string; nome?: string }>;
  members?: Member[];
  unitsList?: Array<{ name: string }> | ClubUnit[];
}): string[] {
  const { counselorsData = [], members = [], unitsList = [] } = params;
  const names = new Set<string>();

  // 1. Do banco de dados (tabela conselheiros)
  (counselorsData || []).forEach(c => {
    const rawName = (c.name || (c as any).nome || '').trim();
    if (isValidCounselorPersonName(rawName, unitsList)) {
      names.add(rawName);
    }
  });

  // 2. Da liderança que esteja como Conselheiro (a) ou Conselheiro (a) Associado (a)
  (members || []).forEach(m => {
    if (isLeadershipCounselor(m)) {
      const rawName = (m.name || '').trim();
      if (isValidCounselorPersonName(rawName, unitsList)) {
        names.add(rawName);
      }
    }
  });

  // 3. Conselheiros oficiais das unidades Águia Dourada e Guerreiros
  const officialDefaults = ['Carlos Souza', 'Carlos', 'Ana Paula', 'Ana', 'Ronaldo Sonic', 'Priscila'];
  officialDefaults.forEach(name => {
    if (isValidCounselorPersonName(name, unitsList)) {
      names.add(name);
    }
  });

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
