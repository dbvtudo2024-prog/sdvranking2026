
export enum UserRole {
  LEADERSHIP = 'Liderança',
  PATHFINDER = 'Desbravador'
}

export enum UnitName {
  AGUIA_DOURADA = 'Águia Dourada',
  GUERREIROS = 'Guerreiros',
  LIDERANCA = 'Liderança'
}

export interface ChatMessage {
  id?: string | number;
  sender_id: string;
  sender_name: string;
  sender_photo?: string;
  text: string;
  unit: 'Geral' | UnitName;
  created_at: string;
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
  challenge1x1?: number;
  threeCluesGame?: number;
  puzzleGame?: number;
  specialtyStudyScore?: number;
  specialtyStudyId?: string;
  specialtyStudyName?: string;
}

export interface Member {
  id: string;
  name: string;
  role: UserRole;
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

export interface BibleReadingProgress {
  id?: string;
  user_id: string;
  plan_id: string;
  completed_items: string[];
  last_updated: string;
}

export interface QuizQuestion {
  id: string;
  category: 'Desbravadores' | 'Bíblia';
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ThreeCluesQuestion {
  id: string;
  clues: string[];
  answer: string;
  category: string;
  created_at?: string;
}

export interface SpecialtyStudyQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface SpecialtyStudy {
  id: string;
  name: string;
  pdfUrl: string;
  category: string;
  questions: SpecialtyStudyQuestion[];
  created_at?: string;
}

export interface Challenge1x1 {
  id: string;
  challengerId: string;
  challengedId: string;
  challengerName: string;
  status: 'pending' | 'accepted' | 'declined' | 'playing' | 'finished';
  currentQuestion: number;
  scores: { [memberId: string]: number };
  questionIds: string[];
  lastAnsweredBy?: string;
  winnerId?: string;
}

export interface Devotional {
  id?: number;
  created_at?: string;
  title: string;
  link: string;
  content: string;
  scheduled_for: string;
}

export interface PuzzleImage {
  id: string;
  url: string;
  title: string;
  created_at?: string;
}
