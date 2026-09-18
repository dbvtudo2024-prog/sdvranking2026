import { SpecialtyStudy, SpecialtyStudyQuestion } from '@/types';

/**
 * Normaliza uma chave de cabeçalho para comparação flexível
 */
export function normalizeHeaderKey(key: string): string {
  return String(key || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Busca valor em um objeto de linha CSV usando múltiplos aliases
 */
export function getRowValue(row: Record<string, any>, aliases: string[], defaultValue: any = ''): any {
  if (!row || typeof row !== 'object') return defaultValue;

  const normalizedRow: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    normalizedRow[normalizeHeaderKey(k)] = v;
  }

  for (const alias of aliases) {
    const normAlias = normalizeHeaderKey(alias);
    if (normalizedRow[normAlias] !== undefined && normalizedRow[normAlias] !== null && String(normalizedRow[normAlias]).trim() !== '') {
      return normalizedRow[normAlias];
    }
  }

  return defaultValue;
}

/**
 * Normaliza o índice de resposta correta (0 a 3)
 */
export function normalizeCorrectAnswer(val: any, options: string[]): number {
  if (val === undefined || val === null || String(val).trim() === '') return 0;

  const str = String(val).trim();
  const lower = str.toLowerCase();

  // Caso seja letra (A, B, C, D)
  if (lower === 'a' || lower === '1a') return 0;
  if (lower === 'b' || lower === '2b') return 1;
  if (lower === 'c' || lower === '3c') return 2;
  if (lower === 'd' || lower === '4d') return 3;

  // Caso seja número inteiro
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    // Se for 1, 2, 3, 4 converte para 0, 1, 2, 3
    if (num >= 1 && num <= 4) return num - 1;
    if (num >= 0 && num <= 3) return num;
  }

  // Se o valor fornecido corresponder exatamente ao texto de uma das opções
  const matchIndex = options.findIndex(opt => opt.trim().toLowerCase() === lower);
  if (matchIndex >= 0) return matchIndex;

  return 0;
}

/**
 * Extrai opções a partir de uma linha CSV
 */
export function extractQuestionOptions(row: Record<string, any>): string[] {
  // 1. Tentar colunas separadas: opcao1, opcao2, etc. ou opcao_a, opcao_b, etc.
  const opt1 = getRowValue(row, ['opcao1', 'opcao_1', 'option1', 'option_1', 'opcao_a', 'opcaoa', 'a', 'opt1', 'alternativa1', 'alternativa_a']);
  const opt2 = getRowValue(row, ['opcao2', 'opcao_2', 'option2', 'option_2', 'opcao_b', 'opcaob', 'b', 'opt2', 'alternativa2', 'alternativa_b']);
  const opt3 = getRowValue(row, ['opcao3', 'opcao_3', 'option3', 'option_3', 'opcao_c', 'opcaoc', 'c', 'opt3', 'alternativa3', 'alternativa_c']);
  const opt4 = getRowValue(row, ['opcao4', 'opcao_4', 'option4', 'option_4', 'opcao_d', 'opcaod', 'd', 'opt4', 'alternativa4', 'alternativa_d']);

  if (opt1 || opt2 || opt3 || opt4) {
    return [
      String(opt1 || '').trim(),
      String(opt2 || '').trim(),
      String(opt3 || '').trim(),
      String(opt4 || '').trim()
    ];
  }

  // 2. Tentar coluna unificada: options, opcoes, alternativas
  const rawCombined = getRowValue(row, ['options', 'opcoes', 'alternativas', 'respostas', 'choices']);
  if (rawCombined) {
    if (Array.isArray(rawCombined)) {
      return rawCombined.map(o => String(o || '').trim()).slice(0, 4);
    }
    const str = String(rawCombined).trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed.map(o => String(o || '').trim()).slice(0, 4);
      } catch {}
    }
    // Delimitador ponto e vírgula, pipe ou barra
    if (str.includes(';')) return str.split(';').map(s => s.trim()).filter(Boolean).slice(0, 4);
    if (str.includes('|')) return str.split('|').map(s => s.trim()).filter(Boolean).slice(0, 4);
    if (str.includes(',')) return str.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  }

  return ['', '', '', ''];
}

/**
 * Converte string bruta de questões (JSON ou texto estruturado) em array de SpecialtyStudyQuestion
 */
export function parseRawQuestionsField(raw: any): SpecialtyStudyQuestion[] {
  if (!raw) return [];

  // Se já for array
  if (Array.isArray(raw)) {
    return raw.map(q => {
      const opts = extractQuestionOptions(q);
      const questionText = getRowValue(q, ['question', 'pergunta', 'enunciado'], '');
      const rawAns = getRowValue(q, ['correct_answer', 'correctAnswer', 'resposta_correta', 'correta', 'gabarito'], 0);
      return {
        question: questionText || String(q.question || ''),
        options: opts.length === 4 ? opts : (q.options || ['', '', '', '']),
        correct_answer: normalizeCorrectAnswer(rawAns, opts)
      };
    }).filter(q => q.question.trim().length > 0);
  }

  if (typeof raw !== 'string') return [];

  const text = raw.trim();
  if (!text) return [];

  // 1. Tentar JSON.parse direto
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parseRawQuestionsField(parsed);
    }
  } catch {}

  // 2. Tentar reparar aspas duplas escapadas em CSV (ex: ""[{\"question\"...}]"")
  try {
    const unescaped = text
      .replace(/^"(.*)"$/, '$1')
      .replace(/""/g, '"')
      .replace(/\\"/g, '"');
    const parsed = JSON.parse(unescaped);
    if (Array.isArray(parsed)) {
      return parseRawQuestionsField(parsed);
    }
  } catch {}

  // 3. Tentar formato delimitado por quebra de linha ou ponto e vírgula (ex: Pergunta|Opcao1,Opcao2,Opcao3,Opcao4|0)
  const lines = text.split(/\r?\n|;/).map(l => l.trim()).filter(Boolean);
  const questions: SpecialtyStudyQuestion[] = [];

  for (const line of lines) {
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const qText = parts[0];
        const rawOpts = parts[1].split(',').map(o => o.trim());
        const ansRaw = parts[2] || '0';
        const opts = [rawOpts[0] || '', rawOpts[1] || '', rawOpts[2] || '', rawOpts[3] || ''];
        questions.push({
          question: qText,
          options: opts,
          correct_answer: normalizeCorrectAnswer(ansRaw, opts)
        });
      }
    }
  }

  return questions;
}

/**
 * Processa linhas de CSV para extrair lista de questões de estudo
 */
export function parseQuestionsFromCSV(rows: Record<string, any>[]): SpecialtyStudyQuestion[] {
  const list: SpecialtyStudyQuestion[] = [];

  for (const row of rows) {
    const questionText = String(getRowValue(row, ['question', 'pergunta', 'enunciado', 'questao', 'questão', 'titulo_pergunta', 'texto'])).trim();
    if (!questionText) continue;

    const options = extractQuestionOptions(row);
    const rawAnswer = getRowValue(row, ['correct_answer', 'correctAnswer', 'resposta_correta', 'gabarito', 'correta', 'resposta', 'alternativa_correta'], 0);
    const correct_answer = normalizeCorrectAnswer(rawAnswer, options);

    list.push({
      question: questionText,
      options,
      correct_answer
    });
  }

  return list;
}

/**
 * Processa linhas de CSV para extrair lista de Estudos de Especialidades completos.
 * Suporta:
 * 1) 1 linha = 1 Estudo completo com metadados e coluna questions
 * 2) Múltiplas linhas = Perguntas agrupadas por nome do estudo (ex: coluna 'estudo' ou 'name')
 */
export function parseSpecialtyStudiesFromRows(rows: Record<string, any>[]): SpecialtyStudy[] {
  if (!rows || rows.length === 0) return [];

  // Verifica se as linhas representam perguntas individuais agrupadas por estudo
  const hasQuestionInRows = rows.some(r => {
    const q = getRowValue(r, ['question', 'pergunta', 'enunciado', 'questao']);
    return Boolean(q && String(q).trim().length > 0);
  });

  const hasSeparateQuestionsColumn = rows.some(r => {
    const qs = getRowValue(r, ['questions', 'questoes', 'perguntas', 'quiz']);
    return Boolean(qs && String(qs).trim().length > 0);
  });

  // CASO 1: Perguntas individuais em cada linha do CSV agrupadas pelo nome do estudo
  if (hasQuestionInRows && !hasSeparateQuestionsColumn) {
    const studiesMap = new Map<string, {
      id?: string;
      name: string;
      pdfurl: string;
      video_url?: string;
      specialty_image_url?: string;
      category: string;
      scheduled_for?: string;
      created_at?: string;
      questions: SpecialtyStudyQuestion[];
    }>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const studyName = String(getRowValue(row, ['name', 'nome', 'estudo', 'nome_estudo', 'titulo', 'especialidade'], 'Estudo de Especialidade')).trim();
      const studyKey = studyName.toLowerCase();

      if (!studiesMap.has(studyKey)) {
        const id = String(getRowValue(row, ['id', 'ID'], '') || `study_${Date.now()}_${studiesMap.size + 1}`);
        const category = String(getRowValue(row, ['category', 'categoria', 'area'], 'Geral')).trim();
        const pdfurl = String(getRowValue(row, ['pdfurl', 'pdf_url', 'pdf', 'link_pdf', 'url_pdf', 'link'], '')).trim();
        const video_url = String(getRowValue(row, ['video_url', 'videoUrl', 'video', 'youtube'], '')).trim() || undefined;
        const specialty_image_url = String(getRowValue(row, ['specialty_image_url', 'imagem', 'badge', 'foto', 'image_url'], '')).trim() || undefined;
        const scheduled_for = String(getRowValue(row, ['scheduled_for', 'scheduledFor', 'agendamento', 'data'], '')).trim() || undefined;
        const created_at = String(getRowValue(row, ['created_at', 'createdAt', 'criado_em'], new Date().toISOString())).trim();

        studiesMap.set(studyKey, {
          id,
          name: studyName,
          category,
          pdfurl,
          video_url,
          specialty_image_url,
          scheduled_for,
          created_at,
          questions: []
        });
      }

      const study = studiesMap.get(studyKey)!;

      // Se a linha tem uma pergunta, adiciona
      const questionText = String(getRowValue(row, ['question', 'pergunta', 'enunciado', 'questao', 'questão', 'texto'])).trim();
      if (questionText) {
        const options = extractQuestionOptions(row);
        const rawAns = getRowValue(row, ['correct_answer', 'correctAnswer', 'resposta_correta', 'gabarito', 'correta'], 0);
        study.questions.push({
          question: questionText,
          options,
          correct_answer: normalizeCorrectAnswer(rawAns, options)
        });
      }
    }

    return Array.from(studiesMap.values()).map(s => ({
      id: s.id || `study_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: s.name,
      pdfurl: s.pdfurl,
      video_url: s.video_url,
      specialty_image_url: s.specialty_image_url,
      category: s.category || 'Geral',
      questions: s.questions,
      scheduled_for: s.scheduled_for,
      created_at: s.created_at || new Date().toISOString()
    }));
  }

  // CASO 2: 1 linha por estudo com metadados e coluna questions
  const studies: SpecialtyStudy[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = String(getRowValue(row, ['id', 'ID'], '') || `study_${Date.now()}_${i + 1}`);
    const name = String(getRowValue(row, ['name', 'nome', 'titulo', 'title', 'estudo', 'especialidade'], 'Novo Estudo')).trim();
    const pdfurl = String(getRowValue(row, ['pdfurl', 'pdf_url', 'pdf', 'link_pdf', 'url_pdf', 'link'], '')).trim();
    const video_url = String(getRowValue(row, ['video_url', 'videoUrl', 'video', 'youtube', 'link_video'], '')).trim() || undefined;
    const specialty_image_url = String(getRowValue(row, ['specialty_image_url', 'specialtyImageUrl', 'imagem', 'badge', 'foto', 'image_url'], '')).trim() || undefined;
    const category = String(getRowValue(row, ['category', 'categoria', 'area'], 'Geral')).trim();
    const scheduled_for = String(getRowValue(row, ['scheduled_for', 'scheduledFor', 'agendamento', 'data'], '')).trim() || undefined;
    const created_at = String(getRowValue(row, ['created_at', 'createdAt', 'criado_em'], new Date().toISOString())).trim();

    const rawQuestions = getRowValue(row, ['questions', 'questoes', 'perguntas', 'quiz'], null);
    let parsedQuestions: SpecialtyStudyQuestion[] = [];

    if (rawQuestions) {
      parsedQuestions = parseRawQuestionsField(rawQuestions);
    } else {
      // Verifica se a própria linha tem colunas individuais de pergunta
      const qText = String(getRowValue(row, ['question', 'pergunta', 'enunciado'], '')).trim();
      if (qText) {
        const opts = extractQuestionOptions(row);
        const ans = getRowValue(row, ['correct_answer', 'resposta_correta'], 0);
        parsedQuestions.push({
          question: qText,
          options: opts,
          correct_answer: normalizeCorrectAnswer(ans, opts)
        });
      }
    }

    studies.push({
      id,
      name,
      pdfurl,
      video_url,
      specialty_image_url,
      category,
      questions: parsedQuestions,
      scheduled_for,
      created_at
    });
  }

  return studies;
}

/**
 * Converte texto cru de CSV para array de objetos linha chave-valor
 */
export function parseCSVTextToRows(rawText: string): Record<string, any>[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  let separator = ',';
  const commas = (headerLine.match(/,/g) || []).length;
  const semicolons = (headerLine.match(/;/g) || []).length;
  const tabs = (headerLine.match(/\t/g) || []).length;
  if (tabs > commas && tabs > semicolons) separator = '\t';
  else if (semicolons >= commas) separator = ';';

  const parseCSVLine = (line: string, sep: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === sep && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.trim());
  };

  const headers = parseCSVLine(headerLine, separator).map(h => h.replace(/^["']|["']$/g, '').trim());
  const items: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], separator);
    if (values.length > 0 && values.some(v => v !== '')) {
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        if (h) {
          row[h] = values[idx] !== undefined ? values[idx] : '';
        }
      });
      items.push(row);
    }
  }

  return items;
}

/**
 * Processa texto em formato CSV ou JSON e retorna lista de SpecialtyStudy
 */
export function parseSpecialtyStudiesFromCSVText(rawText: string): SpecialtyStudy[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // Tentar JSON primeiro
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return parseSpecialtyStudiesFromRows(items);
    } catch {}
  }

  const rows = parseCSVTextToRows(trimmed);
  return parseSpecialtyStudiesFromRows(rows);
}

/**
 * Processa texto em formato CSV ou JSON e retorna lista de questões
 */
export function parseQuestionsFromCSVText(rawText: string): SpecialtyStudyQuestion[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return parseQuestionsFromCSV(items);
    } catch {}
  }

  const rows = parseCSVTextToRows(trimmed);
  return parseQuestionsFromCSV(rows);
}

/**
 * Gera conteúdo CSV para modelo de perguntas de estudo
 */
export function generateQuestionsCsvTemplate(): string {
  return [
    'pergunta,opcao_a,opcao_b,opcao_c,opcao_d,resposta_correta',
    '"Qual o nome científico do gato doméstico?","Felis catus","Panthera leo","Felis silvestris","Lynx lynx",0',
    '"Quantos dentes tem um gato adulto?","20","30","40","50",1',
    '"Qual sentido é mais desenvolvido no gato?","Paladar","Olfato","Audição","Visão",2'
  ].join('\n');
}

/**
 * Gera conteúdo CSV para modelo de estudos completos com perguntas
 */
export function generateSpecialtyStudiesCsvTemplate(): string {
  return [
    'nome,categoria,pdf_url,video_url,imagem,data_agendamento,pergunta,opcao_a,opcao_b,opcao_c,opcao_d,resposta_correta',
    '"Especialidade de Gatos","Natureza","https://exemplo.com/gatos.pdf","https://youtube.com/watch?v=123","https://exemplo.com/gatos.png","2026-05-01","Qual o nome científico do gato doméstico?","Felis catus","Panthera leo","Felis silvestris","Lynx lynx",0',
    '"Especialidade de Gatos","Natureza","https://exemplo.com/gatos.pdf","https://youtube.com/watch?v=123","https://exemplo.com/gatos.png","2026-05-01","Quantos dentes tem um gato adulto?","20","30","40","50",1',
    '"Especialidade de Nós","Habilidades Manuais","https://exemplo.com/nos.pdf","","https://exemplo.com/nos.png","2026-05-15","Qual nó é usado para unir cordas de espessuras diferentes?","Nó de Escota","Nó Direito","Lais de Guia","Catau",0'
  ].join('\n');
}
