
import { Member, Score } from '@/types';

export const GAME_KEYS = [
  'quiz', 'memoryGame', 'specialtyGame', 'threeCluesGame', 
  'puzzleGame', 'knotsGame', 'specialtyTrailGame', 
  'scrambledVerseGame', 'natureIdGame', 'firstAidGame'
];

export const GAMES_METADATA: { [key: string]: { label: string, shortLabel: string } } = {
  quiz: { label: 'Quiz', shortLabel: 'Q' },
  memoryGame: { label: 'Memória', shortLabel: 'M' },
  specialtyGame: { label: 'Brasões', shortLabel: 'E' },
  threeCluesGame: { label: '3 Dicas', shortLabel: '3D' },
  puzzleGame: { label: 'Puzzle', shortLabel: 'P' },
  knotsGame: { label: 'Nós', shortLabel: 'N' },
  specialtyTrailGame: { label: 'Trilha', shortLabel: 'T' },
  scrambledVerseGame: { label: 'Versículo', shortLabel: 'V' },
  natureIdGame: { label: 'Natureza', shortLabel: 'Nat' },
  firstAidGame: { label: 'Socorros', shortLabel: 'Soc' }
};

export const calculateSpecific = (member: Member, key: string) => {
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  return member.scores.reduce((acc, curr) => {
    const s = curr as any;
    
    // Se o registro tem gameId, verificamos se bate com a chave
    if (s.gameId !== undefined) {
      if (s.gameId === key) return acc + (Number(s.points) || Number(s[key]) || 0);
      return acc;
    }
    
    // Se não tem gameId, verificamos se tem a chave diretamente (compatibilidade com histórico)
    // Mas garantimos que não seja um registro puramente semanal
    if (s[key] !== undefined) {
      // Se for explicitamente 'weekly', ignoramos para cálculos de jogos
      if (s.type === 'weekly') return acc;
      return acc + (Number(s[key]) || 0);
    }
    
    return acc;
  }, 0);
};

export const calculateWeeklyTotal = (member: Member) => {
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  return member.scores.reduce((acc, curr) => {
    const isWeekly = curr.type === 'weekly' || (!curr.type && !curr.gameId && !curr.quizCategory);
    if (!isWeekly) return acc;
    
    return acc + 
      (Number(curr.punctuality) || 0) + 
      (Number(curr.uniform) || 0) + 
      (Number(curr.material) || 0) + 
      (Number(curr.bible) || 0) + 
      (Number(curr.voluntariness) || 0) + 
      (Number(curr.activities) || 0) + 
      (Number(curr.treasury) || 0);
  }, 0);
};

export const calculateGamesTotal = (member: Member) => {
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  
  // O total de jogos deve ser exatamente a soma dos jogos listados na imagem (GAME_KEYS)
  return GAME_KEYS.reduce((acc, key) => acc + calculateSpecific(member, key), 0);
};

export const calculateMonthlySpecific = (member: Member, key: string, monthYear: string) => {
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  return member.scores
    .filter(s => {
      if (!s.date) return false;
      let scoreMStr = '';
      if (s.date.includes('-')) {
        const parts = s.date.split('-');
        if (parts.length >= 2) scoreMStr = `${parts[0]}-${parts[1].padStart(2, '0')}`;
      } else if (s.date.includes('/')) {
        const parts = s.date.split('/');
        if (parts.length === 3) scoreMStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
      }
      return scoreMStr === monthYear;
    })
    .reduce((acc, curr) => {
      const s = curr as any;
      if (s.type === 'weekly') return acc;
      if (s.gameId === key) return acc + (Number(s.points) || Number(s[key]) || 0);
      if (s[key] !== undefined) return acc + (Number(s[key]) || 0);
      return acc;
    }, 0);
};

export const calculateMonthlyGamesTotal = (member: Member, monthYear: string) => {
  // monthYear format: "YYYY-MM"
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  
  return member.scores
    .filter(s => {
      if (!s.date) return false;
      
      // Filtro de data
      let scoreMStr = '';
      
      // Padronizar para YYYY-MM
      if (s.date.includes('-')) {
        const parts = s.date.split('-');
        if (parts.length >= 2) {
          // Se for YYYY-MM-DD
          if (parts[0].length === 4) {
            scoreMStr = `${parts[0]}-${parts[1].padStart(2, '0')}`;
          } 
          // Se for DD-MM-YYYY
          else if (parts[2]?.length === 4) {
            scoreMStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
          }
        }
      }
      else if (s.date.includes('/')) {
        const parts = s.date.split('/');
        if (parts.length === 3) {
          // DD/MM/YYYY
          scoreMStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
        } else if (parts.length === 2) {
          // MM/YYYY ou DD/MM
          const year = parts[1].length === 4 ? parts[1] : parts[0].length === 4 ? parts[0] : '';
          const month = parts[1].length === 4 ? parts[0] : parts[1];
          if (year) scoreMStr = `${year}-${month.padStart(2, '0')}`;
        }
      }
      
      return scoreMStr === monthYear;
    })
    .reduce((acc, s) => {
      let monthTotal = 0;
      const scoreObj = s as any;
      
      // CRITICAL: Apenas soma se for Explicitamente um Jogo (previne entrada de pontos bíblicos semanais)
      const hasWeeklyFields = scoreObj.uniform !== undefined || scoreObj.bible !== undefined || scoreObj.punctuality !== undefined || scoreObj.material !== undefined;
      const isGame = scoreObj.type === 'game' || scoreObj.gameId !== undefined || GAME_KEYS.some(k => scoreObj[k] !== undefined) || (scoreObj.points !== undefined && !hasWeeklyFields);

      if (isGame) {
        // Se tem gameId definido, ele DEVE estar no GAME_KEYS para ser contado no ranking mensal de jogos
        if (scoreObj.gameId !== undefined) {
          if (GAME_KEYS.includes(scoreObj.gameId)) {
            monthTotal = (Number(scoreObj.points) || Number(scoreObj[scoreObj.gameId]) || 0);
          }
          // Caso contrário (ex: specialtyStudy, mahjong, etc), não somamos nada ao ranking mensal de jogos
        } else {
          // Fallback para quando não tem gameId (registros históricos ou compatibilidade)
          GAME_KEYS.forEach(key => {
            if (scoreObj[key] !== undefined && scoreObj.type !== 'weekly') {
              monthTotal += (Number(scoreObj[key]) || 0);
            }
          });
          
          // Se ainda for zero mas é um registro de jogo antigo sem campos específicos (apenas 'points')
          if (monthTotal === 0 && scoreObj.points && !hasWeeklyFields) {
            monthTotal = Number(scoreObj.points);
          }
        }
      }
      
      return acc + monthTotal;
    }, 0);
};
