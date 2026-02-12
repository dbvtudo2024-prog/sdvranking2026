
export enum UserRole {
  LEADERSHIP = 'Liderança',
  PATHFINDER = 'Desbravador'
}

export enum UnitName {
  AGUIA_DOURADA = 'Águia Dourada',
  GUERREIROS = 'Guerreiros',
  LIDERANCA = 'Liderança'
}

export interface Score {
  date: string;
  punctuality: number;
  uniform: number;
  material: number;
  bible: number;
  voluntariness: number;
  activities: number;
  treasury: number;
  quiz?: number;
  quizCategory?: 'Desbravadores' | 'Bíblia';
  memoryGame?: number;
  specialtyGame?: number;
}

export interface Member {
  id: string;
  name: string;
  role: UserRole; // Adicionado para identificar no ranking
  age: number;
  className: string;
  joinedAt: string;
  counselor: string;
  unit: UnitName;
  scores: Score[];
  photoUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  funcao?: string;
  unit?: UnitName;
  age?: number;
  className?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  counselor?: string;
}

export interface QuizQuestion {
  id: string;
  category: 'Desbravadores' | 'Bíblia';
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizState {
  lastPlayed: Record<string, string>; // userId_category -> ISO Date
  adminOverride: boolean;
}
