
import { QuizQuestion, ThreeCluesQuestion } from './types';

export const NEW_QUIZ_QUESTIONS: Omit<QuizQuestion, 'id'>[] = [
  // Desbravadores
  { category: 'Desbravadores', question: 'Qual é o significado da cor branca no triângulo dos desbravadores?', options: ['Pureza', 'Lealdade', 'Sacrifício', 'Coragem'], correct_answer: 0, tip: 'Refere-se à vida pura que o desbravador deve ter.' },
  { category: 'Desbravadores', question: 'Em que ano o Clube de Desbravadores foi aceito oficialmente pela Conferência Geral?', options: ['1946', '1950', '1954', '1960'], correct_answer: 1, tip: 'Foi na metade do século XX.' },
  { category: 'Desbravadores', question: 'Qual é a forma geométrica do emblema D1?', options: ['Círculo', 'Quadrado', 'Triângulo', 'Pentágono'], correct_answer: 2, tip: 'Tem três lados.' },
  { category: 'Desbravadores', question: 'Quem compôs o Hino dos Desbravadores em 1949?', options: ['Henry Bergh', 'John Hancock', 'Arthur Spalding', 'C.D. Watson'], correct_answer: 0, tip: 'Inicia com H.' },
  
  // Bíblia
  { category: 'Bíblia', question: 'Quantos capítulos tem o livro de Salmos?', options: ['100', '119', '150', '200'], correct_answer: 2, tip: 'É o maior livro da Bíblia.' },
  { category: 'Bíblia', question: 'Qual é o menor livro da Bíblia em número de versículos?', options: ['Obadias', 'Filemon', '2 João', '3 João'], correct_answer: 2, tip: 'Fica no Novo Testamento.' },
  { category: 'Bíblia', question: 'Quem foi o profeta que viu um vale de ossos secos?', options: ['Isaías', 'Jeremias', 'Ezequiel', 'Daniel'], correct_answer: 2, tip: 'Escreveu um livro com 48 capítulos.' },
  { category: 'Bíblia', question: 'Qual era a profissão de Lucas, o escritor do evangelho?', options: ['Pescador', 'Cobrador de impostos', 'Médico', 'Carpinteiro'], correct_answer: 2, tip: 'Ele cuidava de doentes.' },

  // Natureza
  { category: 'Natureza', question: 'Qual é a maior ave do mundo?', options: ['Águia', 'Condor', 'Avestruz', 'Ema'], correct_answer: 2, tip: 'Ela não voa, mas corre muito.' },
  { category: 'Natureza', question: 'Como se chama o processo pelo qual as plantas produzem seu alimento?', options: ['Respiração', 'Transpiração', 'Fotossíntese', 'Germinação'], correct_answer: 2, tip: 'Envolve luz solar e clorofila.' },
  { category: 'Natureza', question: 'Qual é o único mamífero que pode voar verdadeiramente?', options: ['Esquilo-voador', 'Morcego', 'Pássaro', 'Borboleta'], correct_answer: 1, tip: 'Tem hábitos noturnos.' },
  { category: 'Natureza', question: 'Quantos corações tem um polvo?', options: ['1', '2', '3', '4'], correct_answer: 2, tip: 'É um número ímpar maior que 1.' },

  // Primeiros Socorros
  { category: 'Primeiros Socorros', question: 'O que significa a sigla RCP?', options: ['Retorno Cardíaco Pulmonar', 'Reanimação Cardiopulmonar', 'Resgate com Pressão', 'Reação Cardiovascular'], correct_answer: 1, tip: 'Usado em paradas cardiorrespiratórias.' },
  { category: 'Primeiros Socorros', question: 'Qual o primeiro passo ao encontrar uma pessoa inconsciente?', options: ['Fazer massagem cardíaca', 'Chamar ajuda', 'Verificar a segurança do local', 'Dar água'], correct_answer: 2, tip: 'Segurança em primeiro lugar.' },
  { category: 'Primeiros Socorros', question: 'Como tratar uma queimadura leve de primeiro grau?', options: ['Passar manteiga', 'Colocar gelo direto', 'Água corrente fria', 'Passar pasta de dente'], correct_answer: 2, tip: 'Apenas resfriar sem agredir.' },
  { category: 'Primeiros Socorros', question: 'Qual manobra é usada para desengasgar uma pessoa?', options: ['Manobra de Valsalva', 'Manobra de Heimlich', 'Manobra de Leopold', 'Manobra de Epley'], correct_answer: 1, tip: 'Pressão no abdômen.' },

  // Especialidades
  { category: 'Especialidades', question: 'Na especialidade de Astronomia, qual estrela é a mais próxima da Terra depois do Sol?', options: ['Sirius', 'Betelgeuse', 'Próxima Centauri', 'Polaris'], correct_answer: 2, tip: 'Faz parte do sistema Alpha Centauri.' },
  { category: 'Especialidades', question: 'Na especialidade de Acampamento, qual a distância mínima entre a fogueira e as barracas?', options: ['1 metro', '3 metros', '5 metros', '10 metros'], correct_answer: 1, tip: 'Segurança contra faíscas.' },
  { category: 'Especialidades', question: 'Qual nó é conhecido como "o rei dos nós"?', options: ['Nó Direito', 'Nó de Escota', 'Lais de Guia', 'Catau'], correct_answer: 2, tip: 'Forma uma alça fixa.' },
  { category: 'Especialidades', question: 'Para onde aponta a agulha magnética da bússola?', options: ['Norte Geográfico', 'Norte Magnético', 'Sul Magnético', 'Leste'], correct_answer: 1, tip: 'Atraída pelo campo magnético da Terra.' }
];

export const NEW_THREE_CLUES_QUESTIONS: Omit<ThreeCluesQuestion, 'id'>[] = [
  { clues: ['Foi um rei', 'Escreveu Eclesiastes', 'Filho de Davi'], answer: 'Salomão', category: 'Bíblia' },
  { clues: ['É um animal', 'Tem pescoço longo', 'Vive na savana'], answer: 'Girafa', category: 'Natureza' },
  { clues: ['É um objeto', 'Mostra o caminho', 'Tem uma agulha'], answer: 'Bússola', category: 'Desbravadores' },
  { clues: ['Líder do Êxodo', 'Abriu o Mar Vermelho', 'Recebeu os 10 Mandamentos'], answer: 'Moisés', category: 'Bíblia' },
  { clues: ['Maior planeta do sistema solar', 'Tem uma grande mancha vermelha', 'É um gigante gasoso'], answer: 'Júpiter', category: 'Natureza' },
  { clues: ['Usado para unir cordas de mesma espessura', 'Nó básico', 'Parece dois laços entrelaçados'], answer: 'Nó Direito', category: 'Desbravadores' },
  { clues: ['Primeiro livro da Bíblia', 'Significa "Origem"', 'Narra a criação'], answer: 'Gênesis', category: 'Bíblia' },
  { clues: ['Ave que não voa', 'Nativa da Austrália', 'Parecida com a Ema'], answer: 'Emu', category: 'Natureza' },
  { clues: ['Símbolo dos Desbravadores', 'Representa a Bíblia', 'Cor amarela'], answer: 'Escudo', category: 'Desbravadores' },
  { clues: ['Traiu Jesus', 'Por 30 moedas de prata', 'Era um dos doze'], answer: 'Judas Iscariotes', category: 'Bíblia' },
  { clues: ['Fenômeno das luzes no norte', 'Causado por ventos solares', 'Cores verde e roxo'], answer: 'Aurora Boreal', category: 'Natureza' },
  { clues: ['Especialidade de artes manuais', 'Usa fios e nós', 'Cria painéis e suportes'], answer: 'Macramê', category: 'Especialidades' },
  { clues: ['Profeta engolido por um grande peixe', 'Tentou fugir de Nínive', 'Ficou 3 dias no ventre'], answer: 'Jonas', category: 'Bíblia' },
  { clues: ['Maior oceano do mundo', 'Banha a Ásia e América', 'Nome dado por Fernão de Magalhães'], answer: 'Oceano Pacífico', category: 'Natureza' },
  { clues: ['Nó usado para encurtar cordas', 'Evita cortar a corda', 'Tem nome de parte de animal'], answer: 'Catau', category: 'Desbravadores' },
  { clues: ['Mãe de Jesus', 'Casada com José', 'De Nazaré'], answer: 'Maria', category: 'Bíblia' },
  { clues: ['Satélite natural da Terra', 'Tem fases', 'Influencia as marés'], answer: 'Lua', category: 'Natureza' },
  { clues: ['Livro de leis e rituais', 'Terceiro livro da Bíblia', 'Nome de uma tribo'], answer: 'Levítico', category: 'Bíblia' },
  { clues: ['Animal que muda de cor', 'Tem olhos independentes', 'Língua comprida'], answer: 'Camaleão', category: 'Natureza' },
  { clues: ['Fundador do Clube de Desbravadores', 'Líder de jovens', 'Iniciou em Santa Ana'], answer: 'John Hancock', category: 'Desbravadores' }
];

export const NEW_WHO_AM_I_QUESTIONS = [
  { clues: ['Fui o primeiro homem criado', 'Vivi no Jardim do Éden', 'Minha esposa foi Eva'], answer: 'Adão' },
  { clues: ['Construí uma arca', 'Sobrevivi ao dilúvio', 'Tive três filhos: Sem, Cam e Jafé'], answer: 'Noé' },
  { clues: ['Fui vendido por meus irmãos', 'Me tornei governador do Egito', 'Interpretava sonhos'], answer: 'José' },
  { clues: ['Derrubei Golias com uma pedra', 'Fui o segundo rei de Israel', 'Escrevi muitos Salmos'], answer: 'Davi' },
  { clues: ['Fui a mulher mais sábia de Israel', 'Julgava o povo debaixo de uma palmeira', 'Fui profetisa'], answer: 'Débora' },
  { clues: ['Fui jogado na cova dos leões', 'Orava três vezes ao dia', 'Vivi na Babilônia'], answer: 'Daniel' },
  { clues: ['Fui o homem mais forte da Bíblia', 'Perdi minha força quando cortaram meu cabelo', 'Lutei contra os filisteus'], answer: 'Sansão' },
  { clues: ['Fui a rainha que salvou o povo judeu', 'Casada com o rei Assuero', 'Meu primo era Mardoqueu'], answer: 'Ester' },
  { clues: ['Fui o pai de muitas nações', 'Saí de Ur dos Caldeus', 'Tive um filho chamado Isaque'], answer: 'Abraão' },
  { clues: ['Fui o profeta que subiu ao céu num carro de fogo', 'Orei para cair fogo do céu no Monte Carmelo', 'Fui alimentado por corvos'], answer: 'Elias' },
  { clues: ['Fui o discípulo que negou Jesus três vezes', 'Era pescador', 'Jesus me chamou de "Pedra"'], answer: 'Pedro' },
  { clues: ['Fui o apóstolo dos gentios', 'Tive uma visão no caminho de Damasco', 'Escrevi muitas cartas no Novo Testamento'], answer: 'Paulo' },
  { clues: ['Fui a mãe de Samuel', 'Orei fervorosamente no templo', 'Era estéril antes de Deus me ouvir'], answer: 'Ana' },
  { clues: ['Fui o homem mais rico e sábio', 'Construí o primeiro templo em Jerusalém', 'Filho de Davi'], answer: 'Salomão' },
  { clues: ['Fui o precursor de Jesus', 'Pregava no deserto', 'Batizei Jesus no rio Jordão'], answer: 'João Batista' },
  { clues: ['Fui ressuscitado por Jesus após 4 dias', 'Irmão de Marta e Maria', 'Vivia em Betânia'], answer: 'Lázaro' },
  { clues: ['Fui o sucessor de Moisés', 'Liderei a conquista de Jericó', 'Fiz o sol parar'], answer: 'Josué' },
  { clues: ['Fui a primeira mulher', 'Comi do fruto proibido', 'Mãe de Caim e Abel'], answer: 'Eva' },
  { clues: ['Fui o profeta que chorou por Jerusalém', 'Conhecido como o "profeta chorão"', 'Vivi durante o exílio'], answer: 'Jeremias' },
  { clues: ['Fui a esposa de Isaque', 'Mãe de Esaú e Jacó', 'Encontrada junto a um poço'], answer: 'Rebeca' }
];

export const NEW_SCRAMBLED_VERSES = [
  { title: 'João 3:16', verse: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito' },
  { title: 'Salmos 23:1', verse: 'O Senhor é o meu pastor nada me faltará' },
  { title: 'Filipenses 4:13', verse: 'Tudo posso naquele que me fortalece' },
  { title: 'Gênesis 1:1', verse: 'No princípio criou Deus os céus e a terra' },
  { title: 'Josué 1:9', verse: 'Não to mandei eu Sê forte e corajoso' },
  { title: 'Salmos 119:105', verse: 'Lâmpada para os meus pés é tua palavra e luz para o meu caminho' },
  { title: 'Provérbios 3:5', verse: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento' },
  { title: 'Mateus 5:14', verse: 'Vós sois a luz do mundo não se pode esconder uma cidade edificada sobre um monte' },
  { title: 'Romanos 8:28', verse: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus' },
  { title: 'Isaías 40:31', verse: 'Mas os que esperam no Senhor renovarão as suas forças subirão com asas como águias' },
  { title: '1 Coríntios 13:13', verse: 'Agora pois permanecem a fé a esperança e o amor estes três mas o maior destes é o amor' },
  { title: 'Efésios 6:1', verse: 'Vós filhos sede obedientes a vossos pais no Senhor porque isto é justo' },
  { title: 'Tiago 4:7', verse: 'Sujeitai-vos pois a Deus resisti ao diabo e ele fugirá de vós' },
  { title: 'Apocalipse 21:4', verse: 'E Deus limpará de seus olhos toda a lágrima e não haverá mais morte' },
  { title: 'Hebreus 11:1', verse: 'Ora a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem' },
  { title: 'Gálatas 5:22', verse: 'Mas o fruto do Espírito é amor gozo paz longanimidade benignidade bondade fé' },
  { title: 'Salmos 46:1', verse: 'Deus é o nosso refúgio e fortaleza socorro bem presente na angústia' },
  { title: 'Mateus 6:33', verse: 'Mas buscai primeiro o reino de Deus e a sua justiça e todas estas coisas vos serão acrescentadas' },
  { title: '2 Timóteo 1:7', verse: 'Porque Deus não nos deu o espírito de temor mas de fortaleza e de amor e de moderação' },
  { title: 'Salmos 37:5', verse: 'Entrega o teu caminho ao Senhor confia nele e ele o fará' }
];

export const NEW_SPECIALTY_STUDY_QUESTIONS = [
  {
    name: "Especialidade de Astronomia",
    pdfurl: "https://www.adventistas.org/pt/desbravadores/especialidades/astronomia/",
    puzzle_image_url: "https://picsum.photos/seed/astronomy/800/800",
    category: "Natureza",
    questions: [
      { question: "Qual é a estrela mais próxima da Terra?", options: ["Sirius", "Sol", "Betelgeuse", "Polaris"], correct_answer: 1 },
      { question: "Quantos planetas existem no nosso sistema solar?", options: ["7", "8", "9", "10"], correct_answer: 1 },
      { question: "Qual planeta é conhecido como o Planeta Vermelho?", options: ["Vênus", "Marte", "Júpiter", "Saturno"], correct_answer: 1 },
      { question: "Qual é o maior planeta do sistema solar?", options: ["Terra", "Saturno", "Júpiter", "Netuno"], correct_answer: 2 },
      { question: "O que é uma constelação?", options: ["Um grupo de planetas", "Um grupo de estrelas que formam um padrão", "Uma galáxia distante", "Um buraco negro"], correct_answer: 1 },
      { question: "Qual é o nome da nossa galáxia?", options: ["Andrômeda", "Via Láctea", "Sombreiro", "Triângulo"], correct_answer: 1 },
      { question: "Quem foi o primeiro homem a pisar na Lua?", options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "John Glenn"], correct_answer: 1 },
      { question: "Qual planeta tem os anéis mais visíveis?", options: ["Júpiter", "Urano", "Saturno", "Netuno"], correct_answer: 2 },
      { question: "O que causa as estações do ano?", options: ["A distância da Terra ao Sol", "A inclinação do eixo da Terra", "A rotação da Lua", "As manchas solares"], correct_answer: 1 },
      { question: "Qual é a estrela que indica o Norte no hemisfério norte?", options: ["Estrela Polar", "Cruzeiro do Sul", "Antares", "Vega"], correct_answer: 0 },
      { question: "Qual é o planeta mais quente do sistema solar?", options: ["Mercúrio", "Vênus", "Marte", "Júpiter"], correct_answer: 1 },
      { question: "O que é um cometa?", options: ["Uma estrela cadente", "Uma bola de gelo e poeira com cauda", "Um planeta pequeno", "Um satélite artificial"], correct_answer: 1 },
      { question: "Qual é a principal força que mantém os planetas em órbita?", options: ["Magnetismo", "Gravidade", "Eletricidade", "Inércia"], correct_answer: 1 },
      { question: "Quanto tempo a luz do Sol leva para chegar à Terra?", options: ["8 segundos", "8 minutos", "8 horas", "8 dias"], correct_answer: 1 },
      { question: "Qual é o menor planeta do sistema solar?", options: ["Mercúrio", "Marte", "Vênus", "Plutão"], correct_answer: 0 },
      { question: "O que é um eclipse solar?", options: ["A Terra passa entre o Sol e a Lua", "A Lua passa entre o Sol e a Terra", "O Sol passa entre a Terra e a Lua", "Um planeta passa na frente do Sol"], correct_answer: 1 },
      { question: "Qual é a cor das estrelas mais quentes?", options: ["Vermelho", "Amarelo", "Azul", "Branco"], correct_answer: 2 },
      { question: "O que é um ano-luz?", options: ["Uma medida de tempo", "Uma medida de distância", "A velocidade da luz", "Um ano bissexto"], correct_answer: 1 },
      { question: "Qual planeta gira de lado?", options: ["Júpiter", "Urano", "Saturno", "Netuno"], correct_answer: 1 },
      { question: "O que é o cinturão de asteroides?", options: ["Uma região entre Marte e Júpiter", "Os anéis de Saturno", "A borda do sistema solar", "Uma galáxia vizinha"], correct_answer: 0 }
    ]
  }
];

export const NEW_KNOTS_ASSETS = [
  { game_type: 'knots', name: 'Nó de Pescador', url: 'https://www.animatedknots.com/assets/images/fishermans-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Correr', url: 'https://www.animatedknots.com/assets/images/slip-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Algema', url: 'https://www.animatedknots.com/assets/images/handcuff-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Cadeira de Bombeiro', url: 'https://www.animatedknots.com/assets/images/firemans-chair-knot.jpg' },
  { game_type: 'knots', name: 'Volta da Ribeira', url: 'https://www.animatedknots.com/assets/images/timber-hitch.jpg' },
  { game_type: 'knots', name: 'Nó Prusik', url: 'https://www.animatedknots.com/assets/images/prusik-knot.jpg' }
];
