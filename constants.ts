
import { UnitName, QuizQuestion } from './types';

export const COLORS = {
  PRIMARY_BLUE: '#0061f2',
  PRIMARY_YELLOW: '#FFD700',
  SECONDARY_BLUE: '#0052cc',
  LIGHT_YELLOW: '#fef08a'
};

export const PATHFINDER_CLASSES = [
  'Amigo', 'Companheiro', 'Pesquisador', 'Pioneiro', 'Excursionista', 'Guia', 'Líder em Treinamento'
];

export const LEADERSHIP_CLASSES = [
  'Classes Agrupadas', 'Líder', 'Líder Master', 'Líder Master Avançado'
];

export const LEADERSHIP_ROLES = [
  'Diretor (a)', 'Diretor (a) Associado (a)', 'Secretário (a)', 'Tesoureiro (a)', 
  'Capelão (ã)', 'Instrutor (a)', 'Conselheiro (a)', 'Conselheiro (a) Associado (a)'
];

export const PATHFINDER_ROLES = [
  'Capitão (ã)', 'Secretário (a)', 'Desbravador (a)', 'Aspirante'
];

export const getClassByAge = (age: number): string => {
  if (age === 10) return 'Amigo';
  if (age === 11) return 'Companheiro';
  if (age === 12) return 'Pesquisador';
  if (age === 13) return 'Pioneiro';
  if (age === 14) return 'Excursionista';
  if (age === 15) return 'Guia';
  if (age >= 16) return 'Líder em Treinamento';
  return '';
};

export const SCORE_CATEGORIES = [
  { id: 'punctuality', label: 'Pontualidade' },
  { id: 'uniform', label: 'Uniforme' },
  { id: 'material', label: 'Material' },
  { id: 'bible', label: 'Bíblia' },
  { id: 'voluntariness', label: 'Voluntariedade' },
  { id: 'activities', label: 'Atividades' },
  { id: 'treasury', label: 'Tesouraria' }
] as const;

export const UNIT_LOGOS = {
  [UnitName.AGUIA_DOURADA]: "https://lh3.googleusercontent.com/d/1dW1BIYPCcyzT2S2j_6P3L4pN0OeYy3Nk",
  [UnitName.GUERREIROS]: "https://lh3.googleusercontent.com/d/1a7KjLzygpkka-ryfEuf-uAVDe90aPVEm",
  [UnitName.LIDERANCA]: "https://lh3.googleusercontent.com/d/1KKE5U0rS6qVvXGXDIvElSGOvAtirf2Lx"
};

export const SPECIALTIES = [
  { name: 'Acampamento I', image: 'https://desbravadores.org.br/assets/especialidades/arte-de-acampar/acampamento-i.png' },
  { name: 'Arte de Acampar', image: 'https://desbravadores.org.br/assets/especialidades/arte-de-acampar/arte-de-acampar.png' },
  { name: 'Nós e Amarras', image: 'https://desbravadores.org.br/assets/especialidades/atividades-recreativas/nos-e-amarras.png' },
  { name: 'Primeiros Socorros - Básico', image: 'https://desbravadores.org.br/assets/especialidades/saude-e-ciencia/primeiros-socorros-basico.png' },
  { name: 'Cães', image: 'https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/caes.png' },
  { name: 'Gatos', image: 'https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/gatos.png' },
  { name: 'Astronomia', image: 'https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/astronomia.png' },
  { name: 'Aves', image: 'https://desbravadores.org.br/assets/especialidades/estudo-da-natureza/aves.png' },
  { name: 'Culinária I', image: 'https://desbravadores.org.br/assets/especialidades/atividades-domesticas/culinaria-i.png' },
  { name: 'Liderança de Juvenis', image: 'https://desbravadores.org.br/assets/especialidades/atividades-missionarias/lideranca-de-juvenis.png' },
  { name: 'Computação I', image: 'https://desbravadores.org.br/assets/especialidades/saude-e-ciencia/computacao-i.png' },
  { name: 'Natação I', image: 'https://desbravadores.org.br/assets/especialidades/atividades-recreativas/natacao-i.png' }
];

export const THREE_CLUES_DATA = [
  { answer: 'Moisés', clues: ['Foi deixado em um cesto no rio Nilo', 'Viu uma sarça ardente que não se consumia', 'Liderou o povo através do Mar Vermelho'] },
  { answer: 'Davi', clues: ['Era um jovem pastor de ovelhas', 'Derrotou um gigante com uma funda e uma pedra', 'Tornou-se o rei mais famoso de Israel'] },
  { answer: 'Noé', clues: ['Viveu em uma época de muita maldade na Terra', 'Construiu uma embarcação gigantesca de madeira', 'Sobreviveu a um dilúvio que durou 40 dias'] },
  { answer: 'Sansão', clues: ['Tinha uma força física extraordinária', 'Lutou contra um leão com as próprias mãos', 'Seu segredo estava em seus cabelos compridos'] },
  { answer: 'Ester', clues: ['Era uma jovem judia órfã', 'Tornou-se rainha da Pérsia', 'Salvou seu povo de um decreto de morte'] },
  { answer: 'Paulo', clues: ['Chamava-se Saulo antes de sua conversão', 'Escreveu a maior parte das cartas do Novo Testamento', 'Foi um grande missionário entre os gentios'] },
  { answer: 'Daniel', clues: ['Foi levado cativo para a Babilônia', 'Tinha o dom de interpretar sonhos', 'Foi jogado em uma cova com leões famintos'] },
  { answer: 'Brasão', clues: ['É um símbolo de identificação do clube', 'Cada parte dele tem um significado espiritual', 'É usado no uniforme oficial (D1)'] },
  { answer: 'Triângulo', clues: ['Representa o equilíbrio físico, mental e espiritual', 'É a forma geométrica do emblema D1', 'Simboliza a união entre os membros'] },
  { answer: 'Acampamento', clues: ['É uma das atividades favoritas dos desbravadores', 'Envolve montar barracas e cozinhar ao ar livre', 'É o local onde fazemos o fogo do conselho'] }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Categoria Desbravadores
  { id: 'd1', category: 'Desbravadores', question: 'Qual o significado do triângulo invertido no emblema D1?', options: ['Santíssima Trindade', 'Ordem, Hierarquia e Disciplina', 'Físico, Mental e Espiritual', 'Pai, Filho e Espírito Santo'], correctAnswer: 2 },
  { id: 'd2', category: 'Desbravadores', question: 'Quem foi o autor da letra do Hino dos Desbravadores?', options: ['John Hancock', 'Ismael Derani', 'Henry Bergh', 'Arthur Spalding'], correctAnswer: 1 },
  { id: 'd3', category: 'Desbravadores', question: 'Em que ano foi oficializado o Clube de Desbravadores pela Associação Geral?', options: ['1946', '1950', '1954', '1960'], correctAnswer: 1 },
  { id: 'd4', category: 'Desbravadores', question: 'Qual a cor que simboliza a pureza no uniforme?', options: ['Azul', 'Vermelho', 'Branco', 'Amarelo'], correctAnswer: 2 },
  { id: 'd5', category: 'Desbravadores', question: 'A espada no emblema D1 representa o quê?', options: ['O poder de Deus', 'A Bíblia', 'A proteção', 'A luta contra o mal'], correctAnswer: 1 },
  { id: 'd6', category: 'Desbravadores', question: 'O que significa a cor azul no triângulo?', options: ['Lealdade', 'Céu', 'Água', 'Nobreza'], correctAnswer: 0 },
  { id: 'd7', category: 'Desbravadores', question: 'Qual o lema dos Desbravadores?', options: ['Sempre Avante', 'Servir a Deus e ao Próximo', 'O amor de Cristo me motiva', 'Salvação e Serviço'], correctAnswer: 2 },
  { id: 'd8', category: 'Desbravadores', question: 'Quantas classes regulares existem?', options: ['4', '5', '6', '7'], correctAnswer: 2 },
  { id: 'd9', category: 'Desbravadores', question: 'O escudo no emblema representa o quê?', options: ['Proteção', 'Fé', 'Verdade', 'Deus'], correctAnswer: 1 },
  { id: 'd10', category: 'Desbravadores', question: 'Quem é o Diretor da Associação Geral atualmente?', options: ['Uderson Coelho', 'Alacy Barbosa', 'Busi Khumalo', 'Ted Wilson'], correctAnswer: 2 },
  
  // Categoria Bíblia
  { id: 'b1', category: 'Bíblia', question: 'Qual o menor livro da Bíblia em número de versículos?', options: ['Judas', 'Obadias', '2 João', 'Filemom'], correctAnswer: 2 },
  { id: 'b2', category: 'Bíblia', question: 'Quem foi o homem mais velho da Bíblia?', options: ['Noé', 'Matusalém', 'Adão', 'Enoque'], correctAnswer: 1 },
  { id: 'b3', category: 'Bíblia', question: 'Quantos discípulos Jesus tinha?', options: ['10', '12', '13', '7'], correctAnswer: 1 },
  { id: 'b4', category: 'Bíblia', question: 'Qual o primeiro livro da Bíblia?', options: ['Êxodo', 'Mateus', 'Gênesis', 'Salmos'], correctAnswer: 2 },
  { id: 'b5', category: 'Bíblia', question: 'Quem derrotou o gigante Golias?', options: ['Saul', 'Salomão', 'Davi', 'Sansão'], correctAnswer: 2 },
  { id: 'b6', category: 'Bíblia', question: 'Em que dia da criação o homem foi feito?', options: ['4º dia', '5º dia', '6º dia', '7º dia'], correctAnswer: 2 },
  { id: 'b7', category: 'Bíblia', question: 'Qual o nome da esposa de Abraão?', options: ['Rebeca', 'Sara', 'Raquel', 'Lia'], correctAnswer: 1 },
  { id: 'b8', category: 'Bíblia', question: 'Quantas pragas caíram sobre o Egito?', options: ['7', '10', '12', '3'], correctAnswer: 1 },
  { id: 'b9', category: 'Bíblia', question: 'Quem escreveu o livro de Apocalipse?', options: ['Paulo', 'Pedro', 'Tiago', 'João'], correctAnswer: 3 },
  { id: 'b10', category: 'Bíblia', question: 'Qual mar se abriu para o povo de Israel passar?', options: ['Mar Morto', 'Mar da Galileia', 'Mar Vermelho', 'Mar Mediterrâneo'], correctAnswer: 2 }
];
