
import { UnitName, QuizQuestion, BadgeDefinition, BadgeCategory } from './types';

export const APP_VERSION = '3.1.0';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'sentinela_fiel',
    name: 'Sentinela Fiel',
    category: BadgeCategory.COMMITMENT,
    description: 'Fidelidade no acesso ao app (Bronze: 1 dia, Prata: 7 dias, Ouro: 30 dias).',
    icon: 'Shield'
  },
  {
    id: 'escriba_veloz',
    name: 'Escriba Veloz',
    category: BadgeCategory.WISDOM,
    description: 'Sabedoria nos versículos (Bronze: Completar, Prata: Máx 1 erro, Ouro: Sem erros).',
    icon: 'Type'
  },
  {
    id: 'demolidor_blocos',
    name: 'Demolidor de Blocos',
    category: BadgeCategory.SKILL,
    description: 'Habilidade no Quebra-Blocos (Bronze: 1000 pts, Prata: 3000 pts, Ouro: 5000 pts).',
    icon: 'Gamepad2'
  },
  {
    id: 'voz_acampamento',
    name: 'Voz do Acampamento',
    category: BadgeCategory.FELLOWSHIP,
    description: 'Participação no chat (Bronze: 5 msgs, Prata: 20 msgs, Ouro: 100 msgs).',
    icon: 'MessageSquare'
  },
  {
    id: 'mestre_quiz',
    name: 'Mestre do Quiz',
    category: BadgeCategory.WISDOM,
    description: 'Excelência nos conhecimentos (Bronze: Nota 15, Prata: Nota 18, Ouro: Nota 20).',
    icon: 'Brain'
  },
  {
    id: 'explorador_trilhas',
    name: 'Explorador de Trilhas',
    category: BadgeCategory.SKILL,
    description: 'Domínio das especialidades (Bronze: 1 vitória, Prata: 5 vitórias, Ouro: 15 vitórias).',
    icon: 'Map'
  },
  {
    id: 'conquistador_biblico',
    name: 'Conquistador Bíblico',
    category: BadgeCategory.FELLOWSHIP,
    description: 'Leitura da Bíblia (Bronze: 1 cap, Prata: 10 caps, Ouro: 50 caps).',
    icon: 'Book'
  },
  {
    id: 'estudioso_medal',
    name: 'Medalha de Estudo',
    category: BadgeCategory.WISDOM,
    description: 'Estudo de especialidades (Bronze: 1 termo, Prata: 10 termos, Ouro: 50 termos).',
    icon: 'Medal'
  },
  {
    id: 'fidelidade_presenca',
    name: 'Mestre da Presença',
    category: BadgeCategory.COMMITMENT,
    description: 'Fidelidade absoluta: complete ciclos de check-in (7, 15, 30, 60 e 90 dias).',
    icon: 'CheckCircle2'
  },
  {
    id: 'mestre_especialidade',
    name: 'Mestre da Especialidade',
    category: BadgeCategory.WISDOM,
    description: 'Especialista em concluir estudos (Bronze: 10, Prata: 25, Ouro: 50, Diamante: 75, Mestre: 100).',
    icon: 'Shield'
  }
];

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
  'Sem classe', 'Classes Agrupadas', 'Líder', 'Líder Master', 'Líder Master Avançado'
];

export const LEADERSHIP_ROLES = [
  'Diretor (a)', 'Diretor (a) Associado (a)', 'Secretário (a)', 'Tesoureiro (a)', 
  'Capelão (ã)', 'Instrutor (a)', 'Conselheiro (a)', 'Conselheiro (a) Associado (a)', 'Ancião', 'Apoio', 'Pastor'
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

export const WHO_AM_I_DATA = [
  { answer: 'Gideão', clues: ['Fui o quinto juiz de Israel', 'Pedi um sinal a Deus usando um velo de lã', 'Venci os midianitas com apenas 300 homens'], category: 'Bíblico' },
  { answer: 'Jonas', clues: ['Tentei fugir da presença de Deus indo para Társis', 'Fui engolido por um grande peixe', 'Preguei o arrependimento na cidade de Nínive'], category: 'Bíblico' },
  { answer: 'Rute', clues: ['Fui uma moça moabita que seguiu sua sogra Noemi', 'Disse: "O teu povo é o meu povo, o teu Deus é o meu Deus"', 'Casei-me com Boaz e tornei-me ancestral de Davi'], category: 'Bíblico' },
  { answer: 'Elias', clues: ['Fui um profeta que desafiou os profetas de Baal no Monte Carmelo', 'Fui alimentado por corvos junto ao ribeiro de Querite', 'Fui levado ao céu em um redemoinho por um carro de fogo'], category: 'Bíblico' },
  { answer: 'Pedro', clues: ['Fui um pescador chamado por Jesus para ser pescador de homens', 'Andei sobre as águas por um breve momento', 'Neguei Jesus três vezes antes do galo cantar'], category: 'Bíblico' },
  { answer: 'José', clues: ['Ganhei uma túnica colorida de meu pai Jacó', 'Fui vendido como escravo pelos meus próprios irmãos', 'Tornei-me governador do Egito após interpretar os sonhos do Faraó'], category: 'Bíblico' },
  { answer: 'João Batista', clues: ['Vivia no deserto e me alimentava de gafanhotos e mel silvestre', 'Preparei o caminho para a vinda do Messias', 'Batizei Jesus no rio Jordão'], category: 'Bíblico' },
  { answer: 'Débora', clues: ['Fui a única mulher a servir como juíza em Israel', 'Era também profetisa e esposa de Lapidote', 'Liderei o exército junto com Baraque contra os cananeus'], category: 'Bíblico' },
  { answer: 'Salomão', clues: ['Pedi sabedoria a Deus para governar o povo', 'Construí o primeiro grande Templo em Jerusalém', 'Fui o rei mais rico e sábio de Israel'], category: 'Bíblico' },
  { answer: 'Marta', clues: ['Era irmã de Maria e Lázaro', 'Ficava muito ocupada com os serviços da casa', 'Jesus me disse que Maria escolheu a melhor parte'], category: 'Bíblico' }
];

export const SCRAMBLED_VERSES_DATA = [
  { title: 'Gênesis 1:1', text: 'No princípio criou Deus os céus e a terra.' },
  { title: 'João 3:16', text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.' },
  { title: 'Salmo 23:1', text: 'O Senhor é o meu pastor, nada me faltará.' },
  { title: 'Filipenses 4:13', text: 'Tudo posso naquele que me fortalece.' },
  { title: 'Salmo 119:105', text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.' },
  { title: 'Josué 1:9', text: 'Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes.' },
  { title: 'Mateus 5:14', text: 'Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte.' },
  { title: 'Provérbios 3:5', text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.' },
  { title: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.' },
  { title: 'Apocalipse 21:4', text: 'E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor.' }
];

export const PUZZLE_IMAGES_DATA = [
  { title: 'Acampamento', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Bíblia e Café', url: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Natureza Montanhas', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Fogo do Conselho', url: 'https://images.unsplash.com/photo-1473679408190-0693dd22fe6a?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Desbravadores em Marcha', url: 'https://images.unsplash.com/photo-1533234458684-d4ba71586448?auto=format&fit=crop&q=80&w=1000' }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Categoria Desbravadores
  { id: 'd1', category: 'Desbravadores', question: 'Qual o significado do triângulo invertido no emblema D1?', options: ['Santíssima Trindade', 'Ordem, Hierarquia e Disciplina', 'Físico, Mental e Espiritual', 'Pai, Filho e Espírito Santo'], correct_answer: 2 },
  { id: 'd2', category: 'Desbravadores', question: 'Quem foi o autor da letra do Hino dos Desbravadores?', options: ['John Hancock', 'Ismael Derani', 'Henry Bergh', 'Arthur Spalding'], correct_answer: 1 },
  { id: 'd3', category: 'Desbravadores', question: 'Em que ano foi oficializado o Clube de Desbravadores pela Associação Geral?', options: ['1946', '1950', '1954', '1960'], correct_answer: 1 },
  { id: 'd4', category: 'Desbravadores', question: 'Qual a cor que simboliza a pureza no uniforme?', options: ['Azul', 'Vermelho', 'Branco', 'Amarelo'], correct_answer: 2 },
  { id: 'd5', category: 'Desbravadores', question: 'A espada no emblema D1 representa o quê?', options: ['O poder de Deus', 'A Bíblia', 'A proteção', 'A luta contra o mal'], correct_answer: 1 },
  { id: 'd6', category: 'Desbravadores', question: 'O que significa a cor azul no triângulo?', options: ['Lealdade', 'Céu', 'Água', 'Nobreza'], correct_answer: 0 },
  { id: 'd7', category: 'Desbravadores', question: 'Qual o lema dos Desbravadores?', options: ['Sempre Avante', 'Servir a Deus e ao Próximo', 'O amor de Cristo me motiva', 'Salvação e Serviço'], correct_answer: 2 },
  { id: 'd8', category: 'Desbravadores', question: 'Quantas classes regulares existem?', options: ['4', '5', '6', '7'], correct_answer: 2 },
  { id: 'd9', category: 'Desbravadores', question: 'O escudo no emblema representa o quê?', options: ['Proteção', 'Fé', 'Verdade', 'Deus'], correct_answer: 1 },
  { id: 'd10', category: 'Desbravadores', question: 'Quem é o Diretor da Associação Geral atualmente?', options: ['Uderson Coelho', 'Alacy Barbosa', 'Busi Khumalo', 'Ted Wilson'], correct_answer: 2 },
  
  // Categoria Bíblia
  { id: 'b1', category: 'Bíblia', question: 'Qual o menor livro da Bíblia em número de versículos?', options: ['Judas', 'Obadias', '2 João', 'Filemom'], correct_answer: 2 },
  { id: 'b2', category: 'Bíblia', question: 'Quem foi o homem mais velho da Bíblia?', options: ['Noé', 'Matusalém', 'Adão', 'Enoque'], correct_answer: 1 },
  { id: 'b3', category: 'Bíblia', question: 'Quantos discípulos Jesus tinha?', options: ['10', '12', '13', '7'], correct_answer: 1 },
  { id: 'b4', category: 'Bíblia', question: 'Qual o primeiro livro da Bíblia?', options: ['Êxodo', 'Mateus', 'Gênesis', 'Salmos'], correct_answer: 2 },
  { id: 'b5', category: 'Bíblia', question: 'Quem derrotou o gigante Golias?', options: ['Saul', 'Salomão', 'Davi', 'Sansão'], correct_answer: 2 },
  { id: 'b6', category: 'Bíblia', question: 'Em que dia da criação o homem foi feito?', options: ['4º dia', '5º dia', '6º dia', '7º dia'], correct_answer: 2 },
  { id: 'b7', category: 'Bíblia', question: 'Qual o nome da esposa de Abraão?', options: ['Rebeca', 'Sara', 'Raquel', 'Lia'], correct_answer: 1 },
  { id: 'b8', category: 'Bíblia', question: 'Quantas pragas caíram sobre o Egito?', options: ['7', '10', '12', '3'], correct_answer: 1 },
  { id: 'b9', category: 'Bíblia', question: 'Quem escreveu o livro de Apocalipse?', options: ['Paulo', 'Pedro', 'Tiago', 'João'], correct_answer: 3 },
  { id: 'b10', category: 'Bíblia', question: 'Qual mar se abriu para o povo de Israel passar?', options: ['Mar Morto', 'Mar da Galileia', 'Mar Vermelho', 'Mar Mediterrâneo'], correct_answer: 2 },
  
  // Categoria Natureza
  { id: 'n1', category: 'Natureza', question: 'Qual destas árvores é conhecida por ser a maior do mundo em volume?', options: ['Carvalho', 'Sequóia Gigante', 'Pinheiro', 'Eucalipto'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=512' },
  { id: 'n2', category: 'Natureza', question: 'Qual animal é conhecido como o "Rei da Selva"?', options: ['Tigre', 'Elefante', 'Leão', 'Gorila'], correct_answer: 2, image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=512' },
  { id: 'n3', category: 'Natureza', question: 'Qual é o maior mamífero marinho?', options: ['Tubarão Branco', 'Baleia Azul', 'Orca', 'Golfinho'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&q=80&w=512' },
  { id: 'n4', category: 'Natureza', question: 'Quantas patas tem uma aranha?', options: ['6', '8', '10', '12'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1525869916826-972885c91c1e?auto=format&fit=crop&q=80&w=512' },
  { id: 'n5', category: 'Natureza', question: 'Qual destes pássaros é famoso por não conseguir voar?', options: ['Águia', 'Beija-flor', 'Avestruz', 'Pardal'], correct_answer: 2, image_url: 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?auto=format&fit=crop&q=80&w=512' },
  { id: 'n6', category: 'Natureza', question: 'Qual é o nome desta flor?', options: ['Rosa', 'Girassol', 'Margarida', 'Tulipa'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=512' },
  { id: 'n7', category: 'Natureza', question: 'Que animal é este?', options: ['Esquilo', 'Castor', 'Marmota', 'Guaxinim'], correct_answer: 0, image_url: 'https://images.unsplash.com/photo-1507666405821-4223cf1ad7fc?auto=format&fit=crop&q=80&w=512' },
  { id: 'n8', category: 'Natureza', question: 'Qual o nome desta árvore?', options: ['Ipê Amarelo', 'Jacarandá', 'Seringueira', 'Pau-Brasil'], correct_answer: 0, image_url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=512' },
  { id: 'n9', category: 'Natureza', question: 'Identifique esta constelação:', options: ['Orion', 'Cruzeiro do Sul', 'Ursa Maior', 'Escorpião'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=512' },
  { id: 'n10', category: 'Natureza', question: 'Que tipo de nuvem é esta?', options: ['Cirrus', 'Cumulus', 'Stratus', 'Nimbus'], correct_answer: 1, image_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=512' },

  // Categoria Primeiros Socorros
  { id: 'ps1', category: 'Primeiros Socorros', question: 'O que deve ser feito em caso de queimadura leve?', options: ['Passar manteiga', 'Colocar gelo direto', 'Lavar com água corrente fria', 'Furar as bolhas'], correct_answer: 2, tip: 'Água corrente fria ajuda a resfriar a pele sem causar choque térmico ou infecções.' },
  { id: 'ps2', category: 'Primeiros Socorros', question: 'Qual o número do SAMU no Brasil?', options: ['190', '192', '193', '153'], correct_answer: 1, tip: '192 é o número do Serviço de Atendimento Móvel de Urgência.' },
  { id: 'ps3', category: 'Primeiros Socorros', question: 'O que fazer se alguém estiver engasgado e não conseguir tossir?', options: ['Dar água', 'Fazer a Manobra de Heimlich', 'Deitar a pessoa', 'Esperar passar'], correct_answer: 1, tip: 'A Manobra de Heimlich ajuda a expulsar o objeto que está obstruindo as vias aéreas.' },
  { id: 'ps4', category: 'Primeiros Socorros', question: 'Como estancar um sangramento externo abundante?', options: ['Fazer pressão direta com pano limpo', 'Lavar com sabão', 'Passar álcool', 'Não mexer'], correct_answer: 0, tip: 'A pressão direta ajuda a comprimir os vasos sanguíneos e iniciar a coagulação.' },
  { id: 'ps5', category: 'Primeiros Socorros', question: 'Em caso de suspeita de fratura, qual a primeira medida?', options: ['Tentar colocar o osso no lugar', 'Massagear o local', 'Imobilizar a região', 'Passar pomada'], correct_answer: 2, tip: 'Imobilizar evita que o osso quebrado cause danos a nervos ou vasos sanguíneos.' },
  { id: 'ps6', category: 'Primeiros Socorros', question: 'O que fazer em caso de picada de cobra?', options: ['Fazer um torniquete', 'Sugar o veneno', 'Manter a vítima calma e levar ao hospital', 'Cortar o local da picada'], correct_answer: 2, tip: 'Manter a calma evita que o veneno se espalhe mais rápido. O hospital aplicará o soro antiofídico.' },
  { id: 'ps7', category: 'Primeiros Socorros', question: 'Como ajudar alguém tendo uma convulsão?', options: ['Segurar a língua da pessoa', 'Colocar algo na boca', 'Proteger a cabeça e afastar objetos próximos', 'Dar água'], correct_answer: 2, tip: 'Nunca coloque nada na boca. Apenas evite que a pessoa se machuque batendo a cabeça.' },
  { id: 'ps8', category: 'Primeiros Socorros', question: 'Qual a primeira atitude ao encontrar alguém inconsciente?', options: ['Tentar acordar com tapas', 'Verificar se o local é seguro e checar resposta', 'Começar massagem cardíaca direto', 'Chamar pelo nome'], correct_answer: 1, tip: 'Segurança em primeiro lugar para o socorrista, depois avalie a vítima.' },
  { id: 'ps9', category: 'Primeiros Socorros', question: 'O que significa a sigla RCP?', options: ['Retorno de Circulação Pulmonar', 'Reanimação Cardiopulmonar', 'Resgate de Corpo Parado', 'Reação de Coração e Pulmão'], correct_answer: 1, tip: 'A Reanimação Cardiopulmonar é essencial para manter o fluxo de sangue no cérebro.' },
  { id: 'ps10', category: 'Primeiros Socorros', question: 'Em caso de desmaio, como posicionar a pessoa?', options: ['Sentada', 'Deitada com as pernas elevadas', 'De bruços', 'De pé'], correct_answer: 1, tip: 'Elevar as pernas ajuda o sangue a retornar mais facilmente para o cérebro.' },

  // Categoria Especialidades
  { id: 'e1', category: 'Especialidades', question: 'Qual o nó utilizado para unir duas cordas de espessuras diferentes?', options: ['Nó de Escota', 'Nó Direito', 'Lais de Guia', 'Catau'], correct_answer: 0 },
  { id: 'e2', category: 'Especialidades', question: 'Na especialidade de Astronomia, qual o nome da estrela mais próxima da Terra depois do Sol?', options: ['Sirius', 'Proxima Centauri', 'Betelgeuse', 'Vega'], correct_answer: 1 },
  { id: 'e3', category: 'Especialidades', question: 'Qual o principal objetivo da especialidade de Arte de Acampar?', options: ['Aprender a fazer fogo', 'Saber montar barracas', 'Desenvolver autossuficiência e contato com a natureza', 'Ganhar um distintivo'], correct_answer: 2 },
  { id: 'e4', category: 'Especialidades', question: 'Na especialidade de Cães, qual sentido é mais desenvolvido nesses animais?', options: ['Visão', 'Audição', 'Olfato', 'Tato'], correct_answer: 2 },
  { id: 'e5', category: 'Especialidades', question: 'Qual destes é um requisito básico da especialidade de Natação I?', options: ['Nadar 1km', 'Saber mergulhar de cabeça', 'Nadar 25 metros sem parar', 'Fazer saltos ornamentais'], correct_answer: 2 },
  { id: 'e6', category: 'Especialidades', question: 'Na especialidade de Gatos, qual a principal característica dos felinos?', options: ['Garras retráteis', 'Visão noturna ruim', 'Não gostam de dormir', 'São animais de matilha'], correct_answer: 0 },
  { id: 'e7', category: 'Especialidades', question: 'Qual o nome do nó que nunca corre e é usado para fazer uma alça fixa?', options: ['Nó de Correr', 'Lais de Guia', 'Nó de Pescador', 'Nó de Oito'], correct_answer: 1 },
  { id: 'e8', category: 'Especialidades', question: 'Na especialidade de Computação I, o que significa a sigla CPU?', options: ['Central de Processamento Único', 'Unidade Central de Processamento', 'Computador Pessoal de Usuário', 'Controle de Processos Úteis'], correct_answer: 1 },
  { id: 'e9', category: 'Especialidades', question: 'Qual destes é um item essencial para um acampamento de desbravadores?', options: ['Videogame', 'Bíblia e material de estudo', 'Televisão', 'Móveis pesados'], correct_answer: 1 },
  { id: 'e10', category: 'Especialidades', question: 'Na especialidade de Aves, qual o nome do maior pássaro do mundo?', options: ['Águia Real', 'Condor', 'Avestruz', 'Ema'], correct_answer: 2 }
];
