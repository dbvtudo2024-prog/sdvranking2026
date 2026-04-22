
import { Member, Score } from '../types';

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

export const checkPlayedThisWeek = (member: Member | null | undefined, gameId: string, category?: string): boolean => {
  if (!member || !member.scores) return false;
  
  const cycleStart = getCycleStart();
  
  return member.scores.some(s => {
    const d = parseScoreDate(s.date);
    if (!d) return false;
    
    // De acordo com o ID do jogo
    const isSameGame = s.gameId === gameId || (s as any)[gameId] !== undefined;
    
    // Se for quiz, verifica também a categoria
    if (gameId === 'quiz' && category) {
      const isSameCategory = s.quizCategory === category || (s as any)[category] !== undefined;
      return d >= cycleStart && isSameGame && isSameCategory;
    }
    
    return d >= cycleStart && isSameGame;
  });
};

export const isGameTimeAvailable = (day: number, hour: number, overrides: { [key: string]: boolean }, gameId: string, isAdmin: boolean): boolean => {
  if (isAdmin) return true;
  if (overrides[gameId]) return true;

  // Regra padrão: Domingo (12h) até Quarta (23:59)
  if (day === 0) return hour >= 12;
  if (day >= 1 && day <= 3) return true;
  
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
