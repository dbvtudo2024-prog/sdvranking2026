
import { QuizQuestion, ThreeCluesQuestion } from './types';

export const NEW_QUIZ_QUESTIONS: Omit<QuizQuestion, 'id'>[] = [
  // Desbravadores
  { category: 'Desbravadores', question: 'Qual o nome do primeiro Campori Sul-Americano?', options: ['A Vitória é do Senhor', 'Na Trilha da Esperança', 'Unidos na Esperança', 'Fé em Ação'], correct_answer: 0, tip: 'Realizado em 1983.' },
  { category: 'Desbravadores', question: 'Em que ano foi realizado o primeiro Campori da Divisão Sul-Americana?', options: ['1970', '1983', '1990', '2000'], correct_answer: 1, tip: 'Foi na década de 80.' },
  { category: 'Desbravadores', question: 'Quem é considerado o "pai" dos Desbravadores por ter escrito os primeiros materiais?', options: ['John Hancock', 'Arthur Spalding', 'Henry Bergh', 'C.D. Watson'], correct_answer: 1, tip: 'Inicia com A.' },
  { category: 'Desbravadores', question: 'Qual o significado da cor vermelha no triângulo dos desbravadores?', options: ['Coragem', 'Sacrifício de Cristo', 'Lealdade', 'Amor'], correct_answer: 1, tip: 'Lembra o que Jesus fez por nós.' },
  
  // Bíblia
  { category: 'Bíblia', question: 'Qual o nome do pai de João Batista?', options: ['José', 'Zacarias', 'Joaquim', 'Levi'], correct_answer: 1, tip: 'Ele era um sacerdote.' },
  { category: 'Bíblia', question: 'Quem foi a rainha que visitou Salomão para testar sua sabedoria?', options: ['Rainha de Sabá', 'Rainha Ester', 'Rainha Vasti', 'Rainha Jezabel'], correct_answer: 0, tip: 'Vio de uma terra distante.' },
  { category: 'Bíblia', question: 'Qual o nome da cidade onde Jesus nasceu?', options: ['Nazaré', 'Jerusalém', 'Belém', 'Jericó'], correct_answer: 2, tip: 'Cidade de Davi.' },
  { category: 'Bíblia', question: 'Quem foi o profeta que sucedeu Elias?', options: ['Eliseu', 'Isaías', 'Jeremias', 'Samuel'], correct_answer: 0, tip: 'Pediu porção dobrada do espírito.' },

  // Natureza
  { category: 'Natureza', question: 'Qual é o maior vulcão ativo do mundo?', options: ['Etna', 'Vesúvio', 'Mauna Loa', 'Fuji'], correct_answer: 2, tip: 'Localizado no Havaí.' },
  { category: 'Natureza', question: 'Qual é o elemento químico mais abundante no universo?', options: ['Oxigênio', 'Hélio', 'Hidrogênio', 'Carbono'], correct_answer: 2, tip: 'É o primeiro da tabela periódica.' },
  { category: 'Natureza', question: 'Qual é o animal que tem a gestação mais longa?', options: ['Baleia', 'Elefante', 'Girafa', 'Rinoceronte'], correct_answer: 1, tip: 'Dura cerca de 22 meses.' },
  { category: 'Natureza', question: 'Qual é a árvore que produz a cortiça?', options: ['Pinheiro', 'Sobreiro', 'Carvalho', 'Eucalipto'], correct_answer: 1, tip: 'Muito comum em Portugal.' },

  // Primeiros Socorros
  { category: 'Primeiros Socorros', question: 'O que fazer em caso de convulsão?', options: ['Segurar a língua', 'Dar água', 'Proteger a cabeça e afastar objetos', 'Fazer massagem cardíaca'], correct_answer: 2, tip: 'Evitar que a pessoa se machuque.' },
  { category: 'Primeiros Socorros', question: 'Qual a temperatura considerada normal para o corpo humano?', options: ['35°C', '36,5°C', '38°C', '39°C'], correct_answer: 1, tip: 'Média saudável.' },
  { category: 'Primeiros Socorros', question: 'O que é uma entorse?', options: ['Osso quebrado', 'Lesão nos ligamentos', 'Corte profundo', 'Queimadura'], correct_answer: 1, tip: 'Comum em torções de tornozelo.' },
  { category: 'Primeiros Socorros', question: 'Como agir em caso de asfixia por engasgo total?', options: ['Dar tapinhas nas costas', 'Manobra de Heimlich', 'Oferecer pão', 'Deitar a pessoa'], correct_answer: 1, tip: 'Pressão no diafragma.' },

  // Especialidades
  { category: 'Especialidades', question: 'Na especialidade de Mapas e Bússola, o que é a declinação magnética?', options: ['Erro da bússola', 'Diferença entre Norte Real e Norte Magnético', 'Atração por metais', 'Inclinação da agulha'], correct_answer: 1, tip: 'Varia de acordo com o local.' },
  { category: 'Especialidades', question: 'Qual o nome da especialidade que estuda os peixes?', options: ['Zoologia', 'Ictiologia', 'Entomologia', 'Ornitologia'], correct_answer: 1, tip: 'Termo técnico grego.' },
  { category: 'Especialidades', question: 'Na especialidade de Ordem Unida, o que significa o comando "Descansar"?', options: ['Sair de forma', 'Sentar', 'Posição de relaxamento mantendo a formação', 'Correr'], correct_answer: 2, tip: 'Mãos atrás das costas.' },
  { category: 'Especialidades', question: 'O que é um abrigo de emergência?', options: ['Uma casa de alvenaria', 'Construção temporária para proteção', 'Um hotel', 'Uma caverna natural'], correct_answer: 1, tip: 'Feito com o que estiver disponível.' }
];

export const NEW_THREE_CLUES_QUESTIONS: Omit<ThreeCluesQuestion, 'id'>[] = [
  { clues: ['Fui um profeta', 'Fui levado ao céu em um redemoinho', 'Deixei minha capa para Eliseu'], answer: 'Elias', category: 'Bíblia' },
  { clues: ['Sou um mineral', 'Sou o mais duro da natureza', 'Usado em joias valiosas'], answer: 'Diamante', category: 'Natureza' },
  { clues: ['Sou um comando de marcha', 'Pé esquerdo inicia o movimento', 'Usado em desfiles'], answer: 'Ordinário Marche', category: 'Desbravadores' },
  { clues: ['Fui uma juíza de Israel', 'Liderei o povo na guerra', 'Ficava debaixo de uma palmeira'], answer: 'Débora', category: 'Bíblia' },
  { clues: ['Sou um gás essencial', 'Produzido pelas plantas', 'Necessário para respirar'], answer: 'Oxigênio', category: 'Natureza' },
  { clues: ['Sou um nó de ancoragem', 'Usado para iniciar amarras', 'Dá uma volta completa no mastro'], answer: 'Volta do Fiel', category: 'Desbravadores' },
  { clues: ['Fui o primeiro rei de Israel', 'Fui ungido por Samuel', 'Perdi o reino por desobediência'], answer: 'Saul', category: 'Bíblia' },
  { clues: ['Sou o sexto planeta', 'Tenho grandes anéis', 'Sou um gigante gasoso'], answer: 'Saturno', category: 'Natureza' },
  { clues: ['Sou uma especialidade', 'Estudo os astros e estrelas', 'Uso telescópios'], answer: 'Astronomia', category: 'Especialidades' },
  { clues: ['Fui o discípulo amado', 'Escrevi o livro de Apocalipse', 'Vivi na ilha de Patmos'], answer: 'João', category: 'Bíblia' },
  { clues: ['Sou o maior mamífero terrestre', 'Tenho uma longa tromba', 'Vivo na África e Ásia'], answer: 'Elefante', category: 'Natureza' },
  { clues: ['Sou o emblema principal', 'Tenho forma de triângulo', 'Usado na manga do uniforme'], answer: 'D1', category: 'Desbravadores' },
  { clues: ['Fui um profeta no exílio', 'Vi um vale de ossos secos', 'Tive visões de um novo templo'], answer: 'Ezequiel', category: 'Bíblia' },
  { clues: ['Sou um fenômeno luminoso', 'Ocorro nas regiões polares', 'Causado por ventos solares'], answer: 'Aurora', category: 'Natureza' },
  { clues: ['Sou a atividade principal', 'Dormimos em barracas', 'Fazemos fogo do conselho'], answer: 'Acampamento', category: 'Desbravadores' },
  { clues: ['Fui uma rainha famosa', 'Visitei Salomão', 'Vim de uma terra distante'], answer: 'Rainha de Sabá', category: 'Bíblia' },
  { clues: ['Sou um metal líquido', 'Usado em termômetros antigos', 'Sou tóxico se ingerido'], answer: 'Mercúrio', category: 'Natureza' },
  { clues: ['Sou o hino oficial', 'Composto por Henry Bergh', 'Cantado em posição de sentido'], answer: 'Hino dos Desbravadores', category: 'Desbravadores' },
  { clues: ['Fui o rei mais sábio', 'Construí o templo de Jerusalém', 'Filho de Davi'], answer: 'Salomão', category: 'Bíblia' },
  { clues: ['Sou a estrela central', 'A mais próxima da Terra', 'Fonte de luz e calor'], answer: 'Sol', category: 'Natureza' }
];

export const NEW_WHO_AM_I_QUESTIONS = [
  { clues: ['Fui o sucessor de Moisés', 'Liderei a conquista de Canaã', 'Fiz o sol parar em Gibeão'], answer: 'Josué' },
  { clues: ['Fui um profeta do fogo', 'Fui alimentado por corvos', 'Subi ao céu num redemoinho'], answer: 'Elias' },
  { clues: ['Fui a esposa de Isaque', 'Mãe de Esaú e Jacó', 'Fui escolhida junto a um poço'], answer: 'Rebeca' },
  { clues: ['Fui um dos doze espias', 'Tive um espírito diferente', 'Entrei na terra prometida com Josué'], answer: 'Calebe' },
  { clues: ['Fui o sucessor de Elias', 'Curei a lepra de Naamã', 'Vi cavalos de fogo'], answer: 'Eliseu' },
  { clues: ['Fui a irmã de Moisés', 'Liderei as mulheres com tamboris', 'Fiquei leprosa por murmurar'], answer: 'Miriã' },
  { clues: ['Fui o primeiro rei de Israel', 'Era muito alto', 'Consultei uma feiticeira'], answer: 'Saul' },
  { clues: ['Fui um profeta na Babilônia', 'Vi a glória de Deus em visões', 'Comi um rolo de pergaminho'], answer: 'Ezequiel' },
  { clues: ['Fui o apóstolo amado', 'Escrevi três cartas e um evangelho', 'Fui exilado em Patmos'], answer: 'João' },
  { clues: ['Fui a sogra de Rute', 'Perdi meu marido e filhos', 'Voltei para Belém com Rute'], answer: 'Noemi' },
  { clues: ['Fui um rei temente a Deus', 'Orei quando estava doente', 'Deus acrescentou 15 anos à minha vida'], answer: 'Ezequias' },
  { clues: ['Fui o filho da promessa', 'Quase fui oferecido em sacrifício', 'Pai de Esaú e Jacó'], answer: 'Isaque' },
  { clues: ['Fui a esposa amada de Jacó', 'Trabalharam 14 anos por mim', 'Mãe de José e Benjamim'], answer: 'Raquel' },
  { clues: ['Fui o profeta das lamentações', 'Fui jogado em uma cisterna', 'Vivi a queda de Jerusalém'], answer: 'Jeremias' },
  { clues: ['Fui um centurião romano', 'Minha esmola e orações subiram a Deus', 'Pedro me visitou'], answer: 'Cornélio' },
  { clues: ['Fui o pai de João Batista', 'Fiquei mudo por não crer no anjo', 'Era da ordem de Abias'], answer: 'Zacarias' },
  { clues: ['Fui a mãe de João Batista', 'Era prima de Maria', 'Deus tirou minha vergonha na velhice'], answer: 'Isabel' },
  { clues: ['Fui um publicano rico', 'Era de pequena estatura', 'Subi em um sicômoro para ver Jesus'], answer: 'Zaqueu' },
  { clues: ['Fui o primeiro mártir da igreja', 'Tinha o rosto como de um anjo', 'Fui apedrejado'], answer: 'Estêvão' },
  { clues: ['Fui um mestre da lei', 'Fui a Jesus de noite', 'Ajudei a sepultar o corpo de Cristo'], answer: 'Nicodemos' }
];

export const NEW_SCRAMBLED_VERSES = [
  { title: 'Salmos 46:10', text: 'Aquietai-vos e sabei que eu sou Deus' },
  { title: 'Mateus 11:28', text: 'Vinde a mim todos os que estais cansados e oprimidos' },
  { title: 'Isaías 41:10', text: 'Não temas porque eu sou contigo não te assombres' },
  { title: 'Jeremias 29:11', text: 'Porque eu bem sei os pensamentos que tenho sobre vós' },
  { title: 'Salmos 37:4', text: 'Deleita-te também no Senhor e ele te concederá os desejos do teu coração' },
  { title: 'Provérbios 16:3', text: 'Consagra ao Senhor as tuas obras e teus pensamentos serão estabelecidos' },
  { title: 'Filipenses 4:19', text: 'O meu Deus segundo as suas riquezas suprirá todas as vossas necessidades' },
  { title: 'Salmos 121:1', text: 'Elevo os meus olhos para os montes de onde virá o meu socorro' },
  { title: 'Mateus 28:20', text: 'E eis que eu estou convosco todos os dias até a consumação dos séculos' },
  { title: 'Romanos 12:21', text: 'Não te deixes vencer do mal mas vence o mal com o bem' },
  { title: 'Salmos 1:1', text: 'Bem-aventurado o homem que não anda segundo o conselho dos ímpios' },
  { title: '1 João 4:8', text: 'Aquele que não ama não conhece a Deus porque Deus é amor' },
  { title: 'Salmos 100:1', text: 'Celebrai com júbilo ao Senhor todas as terras' },
  { title: 'Mateus 7:7', text: 'Pedi e dar-se-vos-á buscai e encontrareis batei e abrir-se-vos-á' },
  { title: 'Salmos 119:11', text: 'Escondi a tua palavra no meu coração para não pecar contra ti' },
  { title: 'Provérbios 22:6', text: 'Instrui a criança no caminho em que deve andar' },
  { title: 'Hebreus 13:8', text: 'Jesus Cristo é o mesmo ontem e hoje e eternamente' },
  { title: 'Salmos 19:1', text: 'Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos' },
  { title: 'João 14:6', text: 'Eu sou o caminho e a verdade e a vida ninguém vem ao Pai senão por mim' },
  { title: 'Salmos 34:7', text: 'O anjo do Senhor acampa-se ao redor dos que o temem e os livra' }
];

export const NEW_KNOTS_ASSETS = [
  { game_type: 'knots', name: 'Nó de Pescador', url: 'https://www.animatedknots.com/assets/images/fishermans-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Correr', url: 'https://www.animatedknots.com/assets/images/slip-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Algema', url: 'https://www.animatedknots.com/assets/images/handcuff-knot.jpg' },
  { game_type: 'knots', name: 'Nó de Cadeira de Bombeiro', url: 'https://www.animatedknots.com/assets/images/firemans-chair-knot.jpg' },
  { game_type: 'knots', name: 'Volta da Ribeira', url: 'https://www.animatedknots.com/assets/images/timber-hitch.jpg' },
  { game_type: 'knots', name: 'Nó Prusik', url: 'https://www.animatedknots.com/assets/images/prusik-knot.jpg' }
];
