
import { Member, Score, AuthUser, UserRole } from '../types';

export const ADMIN_MASTER_EMAIL = 'ronaldosonic@gmail.com';

export const checkIsAdmin = (user: AuthUser | null | undefined): boolean => {
  if (!user) return false;
  const isLeadership = user.role === UserRole.LEADERSHIP;
  const isMasterEmail = user.email?.toLowerCase().trim() === ADMIN_MASTER_EMAIL.toLowerCase();
  return isLeadership || isMasterEmail;
};

export const parseScoreDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const scoreDate = new Date(dateStr);
  
  if (!isNaN(scoreDate.getTime())) {
    return scoreDate;
  }
  
  // Decodifica formato DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  
  return null;
};

export const getCycleStart = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const start = new Date(now);
  
  // O ciclo semanal começa domingo às 12:00
  if (day === 0 && hour < 12) {
    // Se é domingo antes das 12h, o ciclo começou no domingo anterior
    start.setDate(now.getDate() - 7);
  } else {
    // Caso contrário, começou no domingo mais recente (hoje ou dias atrás)
    start.setDate(now.getDate() - day);
  }
  
  start.setHours(12, 0, 0, 0);
  return start;
};

/**
 * Normaliza strings para comparação (remove acentos, espaços extras e converte para minúsculo)
 */
export const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export const findMemberForUser = (members: Member[], user: AuthUser | null | undefined): Member | undefined => {
  if (!user) return undefined;
  
  // Prioridade 1: ID exato
  const byId = members.find(m => String(m.id) === String(user.id));
  if (byId) return byId;

  // Prioridade 2: Nome normalizado
  const normalizedUserName = normalizeString(user.name || '');
  if (!normalizedUserName) return undefined;

  return members.find(m => normalizeString(m.name) === normalizedUserName);
};

export const checkPlayedThisWeek = (member: Member | null | undefined, gameId: string, category?: string): boolean => {
  if (!member || !member.scores) return false;
  
  const cycleStart = getCycleStart();
  
  return member.scores.some(s => {
    // Apenas pontos de JOGO (game) impedem nova jogada na semana
    if (s.type !== 'game') return false;

    const d = parseScoreDate(s.date);
    if (!d) return false;
    
    // De acordo com o ID do jogo
    const isSameGame = s.gameId === gameId || (s as any)[gameId] !== undefined;
    
    // Se for quiz, verifica também a categoria (opcional)
    if (gameId === 'quiz' && category) {
      const isSameCategory = s.quizCategory === category || (s as any)[category] !== undefined;
      return d >= cycleStart && isSameGame && isSameCategory;
    }
    
    return d >= cycleStart && isSameGame;
  });
};

export const isGameTimeAvailable = (day: number, hour: number, overrides: { [key: string]: boolean }, gameId: string, user: AuthUser | null | undefined): boolean => {
  if (checkIsAdmin(user)) return true;
  if (overrides[gameId]) return true;

  // Janela expandida: Domingo (12h) até Sábado (23:59)
  if (day === 0) return hour >= 12;
  if (day >= 1 && day <= 6) return true;
  
  return false;
};

/**
 * Adiciona uma pontuação de forma segura, evitando duplicatas no mesmo ciclo
 */
export const safeAddScore = (currentScores: Score[], newScore: Score): Score[] => {
  const cycleStart = getCycleStart();
  
  // Verifica se já existe uma pontuação para este jogo/categoria dentro deste ciclo
  const alreadyExists = currentScores.some(s => {
    const d = parseScoreDate(s.date);
    if (!d) return false;
    
    const isSameGame = s.gameId === newScore.gameId || (s as any)[newScore.gameId!] !== undefined;
    
    if (newScore.gameId === 'quiz' && newScore.quizCategory) {
      const isSameCategory = s.quizCategory === newScore.quizCategory || (s as any)[newScore.quizCategory] !== undefined;
      return d >= cycleStart && isSameGame && isSameCategory;
    }
    
    return d >= cycleStart && isSameGame;
  });

  if (alreadyExists) {
    console.warn(`[GameUtils] Tentativa de duplicar pontuação para ${newScore.gameId} ignorada.`);
    return currentScores;
  }

  return [...currentScores, newScore];
};
