
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
    if (s.gameId === key) return acc + (Number(s.points) || Number(s[key]) || 0);
    if (s[key] !== undefined) return acc + (Number(s[key]) || 0);
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

export const calculateMonthlyGamesTotal = (member: Member, monthYear: string) => {
  // monthYear format: "YYYY-MM"
  if (!member || !member.scores || !Array.isArray(member.scores)) return 0;
  
  return member.scores
    .filter(s => {
      if (!s.date) return false;
      let scoreMStr = '';
      
      // Handle YYYY-MM-DD or YYYY-MM
      if (s.date.includes('-')) {
        const parts = s.date.split('-');
        if (parts.length >= 2) scoreMStr = `${parts[0]}-${parts[1].padStart(2, '0')}`;
      }
      // Handle DD/MM/YYYY or DD/MM
      else if (s.date.includes('/')) {
        const parts = s.date.split('/');
        if (parts.length === 3) scoreMStr = `${parts[2]}-${parts[1].padStart(2, '0')}`;
        else if (parts.length === 2) {
          // Assuming MM/YYYY if month > 12? No, let's be careful.
          // Usually it's DD/MM/YYYY.
        }
      }
      
      return scoreMStr === monthYear;
    })
    .reduce((acc, s) => {
      let monthTotal = 0;
      const scoreObj = s as any;
      
      GAME_KEYS.forEach(key => {
        if (scoreObj.gameId === key) {
          monthTotal += (Number(scoreObj.points) || Number(scoreObj[key]) || 0);
        } else if (scoreObj[key] !== undefined) {
          monthTotal += (Number(scoreObj[key]) || 0);
        }
      });
      
      return acc + monthTotal;
    }, 0);
};
