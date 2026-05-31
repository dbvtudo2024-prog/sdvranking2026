export interface ChronologicalDay {
  dayNumber: number;
  reading: string;
  suggestedBook: string; // Used to help mapping to the online Bible
}

export interface ChronologicalWeek {
  weekNumber: number;
  days: ChronologicalDay[];
}

export const CHRONOLOGICAL_WEEKS: ChronologicalWeek[] = [
  {
    weekNumber: 1,
    days: [
      { dayNumber: 1, reading: "Gênesis 1 a 3", suggestedBook: "Gênesis" },
      { dayNumber: 2, reading: "Gênesis 4 a 7", suggestedBook: "Gênesis" },
      { dayNumber: 3, reading: "Gênesis 8 a 11", suggestedBook: "Gênesis" },
      { dayNumber: 4, reading: "Jó 1 a 5", suggestedBook: "Jó" },
      { dayNumber: 5, reading: "Jó 6 a 9", suggestedBook: "Jó" },
      { dayNumber: 6, reading: "Jó 10 a 13", suggestedBook: "Jó" },
      { dayNumber: 7, reading: "Jó 14 a 16", suggestedBook: "Jó" }
    ]
  },
  {
    weekNumber: 2,
    days: [
      { dayNumber: 1, reading: "Jó 17 a 20", suggestedBook: "Jó" },
      { dayNumber: 2, reading: "Jó 21 a 23", suggestedBook: "Jó" },
      { dayNumber: 3, reading: "Jó 24 a 28", suggestedBook: "Jó" },
      { dayNumber: 4, reading: "Jó 29 a 31", suggestedBook: "Jó" },
      { dayNumber: 5, reading: "Jó 32 a 34", suggestedBook: "Jó" },
      { dayNumber: 6, reading: "Jó 35 a 37", suggestedBook: "Jó" },
      { dayNumber: 7, reading: "Jó 38 e 39", suggestedBook: "Jó" }
    ]
  },
  {
    weekNumber: 3,
    days: [
      { dayNumber: 1, reading: "Jó 40 a 42", suggestedBook: "Jó" },
      { dayNumber: 2, reading: "Gênesis 12 a 15", suggestedBook: "Gênesis" },
      { dayNumber: 3, reading: "Gênesis 16 a 18", suggestedBook: "Gênesis" },
      { dayNumber: 4, reading: "Gênesis 19 a 21", suggestedBook: "Gênesis" },
      { dayNumber: 5, reading: "Gênesis 22 a 24", suggestedBook: "Gênesis" },
      { dayNumber: 6, reading: "Gênesis 25 e 26", suggestedBook: "Gênesis" },
      { dayNumber: 7, reading: "Gênesis 27 a 29", suggestedBook: "Gênesis" }
    ]
  },
  {
    weekNumber: 4,
    days: [
      { dayNumber: 1, reading: "Gênesis 30 e 31", suggestedBook: "Gênesis" },
      { dayNumber: 2, reading: "Gênesis 32 a 34", suggestedBook: "Gênesis" },
      { dayNumber: 3, reading: "Gênesis 35 a 37", suggestedBook: "Gênesis" },
      { dayNumber: 4, reading: "Gênesis 38 a 40", suggestedBook: "Gênesis" },
      { dayNumber: 5, reading: "Gênesis 41 e 42", suggestedBook: "Gênesis" },
      { dayNumber: 6, reading: "Gênesis 43 a 45", suggestedBook: "Gênesis" },
      { dayNumber: 7, reading: "Gênesis 46 e 47", suggestedBook: "Gênesis" }
    ]
  },
  {
    weekNumber: 5,
    days: [
      { dayNumber: 1, reading: "Gênesis 48 a 50", suggestedBook: "Gênesis" },
      { dayNumber: 2, reading: "Êxodo 1 a 3", suggestedBook: "Êxodo" },
      { dayNumber: 3, reading: "Êxodo 4 a 6", suggestedBook: "Êxodo" },
      { dayNumber: 4, reading: "Êxodo 7 a 9", suggestedBook: "Êxodo" },
      { dayNumber: 5, reading: "Êxodo 10 a 12", suggestedBook: "Êxodo" },
      { dayNumber: 6, reading: "Êxodo 13 a 15", suggestedBook: "Êxodo" },
      { dayNumber: 7, reading: "Êxodo 16 a 18", suggestedBook: "Êxodo" }
    ]
  },
  {
    weekNumber: 6,
    days: [
      { dayNumber: 1, reading: "Êxodo 19 a 21", suggestedBook: "Êxodo" },
      { dayNumber: 2, reading: "Êxodo 22 a 24", suggestedBook: "Êxodo" },
      { dayNumber: 3, reading: "Êxodo 25 a 27", suggestedBook: "Êxodo" },
      { dayNumber: 4, reading: "Êxodo 28 e 29", suggestedBook: "Êxodo" },
      { dayNumber: 5, reading: "Êxodo 30 a 32", suggestedBook: "Êxodo" },
      { dayNumber: 6, reading: "Êxodo 33 a 35", suggestedBook: "Êxodo" },
      { dayNumber: 7, reading: "Êxodo 36 a 38", suggestedBook: "Êxodo" }
    ]
  },
  {
    weekNumber: 7,
    days: [
      { dayNumber: 1, reading: "Êxodo 39 e 40", suggestedBook: "Êxodo" },
      { dayNumber: 2, reading: "Levítico 1 a 4", suggestedBook: "Levítico" },
      { dayNumber: 3, reading: "Levítico 5 a 7", suggestedBook: "Levítico" },
      { dayNumber: 4, reading: "Levítico 8 a 10", suggestedBook: "Levítico" },
      { dayNumber: 5, reading: "Levítico 11 a 13", suggestedBook: "Levítico" },
      { dayNumber: 6, reading: "Levítico 14 e 15", suggestedBook: "Levítico" },
      { dayNumber: 7, reading: "Levítico 16 a 18", suggestedBook: "Levítico" }
    ]
  },
  {
    weekNumber: 8,
    days: [
      { dayNumber: 1, reading: "Levítico 19 a 21", suggestedBook: "Levítico" },
      { dayNumber: 2, reading: "Levítico 22 e 23", suggestedBook: "Levítico" },
      { dayNumber: 3, reading: "Levítico 24 a 26", suggestedBook: "Levítico" },
      { dayNumber: 4, reading: "Levítico 27 e 28", suggestedBook: "Levítico" },
      { dayNumber: 5, reading: "Números 1 e 2", suggestedBook: "Números" },
      { dayNumber: 6, reading: "Números 3 e 4", suggestedBook: "Números" },
      { dayNumber: 7, reading: "Números 5 e 6", suggestedBook: "Números" }
    ]
  },
  {
    weekNumber: 9,
    days: [
      { dayNumber: 1, reading: "Números 7", suggestedBook: "Números" },
      { dayNumber: 2, reading: "Números 8 a 10", suggestedBook: "Números" },
      { dayNumber: 3, reading: "Números 11 a 13", suggestedBook: "Números" },
      { dayNumber: 4, reading: "Nm 14 e 15; Salmo 90", suggestedBook: "Números" },
      { dayNumber: 5, reading: "Números 16 e 17", suggestedBook: "Números" },
      { dayNumber: 6, reading: "Números 18 a 20", suggestedBook: "Números" },
      { dayNumber: 7, reading: "Números 21 e 22", suggestedBook: "Números" }
    ]
  },
  {
    weekNumber: 10,
    days: [
      { dayNumber: 1, reading: "Números 23 a 25", suggestedBook: "Números" },
      { dayNumber: 2, reading: "Números 26 e 27", suggestedBook: "Números" },
      { dayNumber: 3, reading: "Números 28 a 30", suggestedBook: "Números" },
      { dayNumber: 4, reading: "Números 31 e 32", suggestedBook: "Números" },
      { dayNumber: 5, reading: "Números 33 e 34", suggestedBook: "Números" },
      { dayNumber: 6, reading: "Números 35 e 36", suggestedBook: "Números" },
      { dayNumber: 7, reading: "Deuteronômio 1 e 2", suggestedBook: "Deuteronômio" }
    ]
  },
  {
    weekNumber: 11,
    days: [
      { dayNumber: 1, reading: "Deuteronômio 3 e 4", suggestedBook: "Deuteronômio" },
      { dayNumber: 2, reading: "Deuteronômio 5 a 7", suggestedBook: "Deuteronômio" },
      { dayNumber: 3, reading: "Deuteronômio 8 a 10", suggestedBook: "Deuteronômio" },
      { dayNumber: 4, reading: "Deuteronômio 11 a 13", suggestedBook: "Deuteronômio" },
      { dayNumber: 5, reading: "Deuteronômio 14 a 16", suggestedBook: "Deuteronômio" },
      { dayNumber: 6, reading: "Deuteronômio 17 a 20", suggestedBook: "Deuteronômio" },
      { dayNumber: 7, reading: "Deuteronômio 21 a 23", suggestedBook: "Deuteronômio" }
    ]
  },
  {
    weekNumber: 12,
    days: [
      { dayNumber: 1, reading: "Deuteronômio 24 a 27", suggestedBook: "Deuteronômio" },
      { dayNumber: 2, reading: "Deuteronômio 28 e 29", suggestedBook: "Deuteronômio" },
      { dayNumber: 3, reading: "Deuteronômio 30 e 31", suggestedBook: "Deuteronômio" },
      { dayNumber: 4, reading: "Dt 32 a 34; Salmo 91", suggestedBook: "Deuteronômio" },
      { dayNumber: 5, reading: "Josué 1 a 4", suggestedBook: "Josué" },
      { dayNumber: 6, reading: "Josué 5 a 8", suggestedBook: "Josué" },
      { dayNumber: 7, reading: "Josué 9 a 11", suggestedBook: "Josué" }
    ]
  },
  {
    weekNumber: 13,
    days: [
      { dayNumber: 1, reading: "Josué 12 a 15", suggestedBook: "Josué" },
      { dayNumber: 2, reading: "Josué 16 a 18", suggestedBook: "Josué" },
      { dayNumber: 3, reading: "Josué 19 a 21", suggestedBook: "Josué" },
      { dayNumber: 4, reading: "Josué 22 a 24", suggestedBook: "Josué" },
      { dayNumber: 5, reading: "Juízes 1 e 2", suggestedBook: "Juízes" },
      { dayNumber: 6, reading: "Juízes 3 a 5", suggestedBook: "Juízes" },
      { dayNumber: 7, reading: "Juízes 6 e 7", suggestedBook: "Juízes" }
    ]
  },
  {
    weekNumber: 14,
    days: [
      { dayNumber: 1, reading: "Juízes 8 e 9", suggestedBook: "Juízes" },
      { dayNumber: 2, reading: "Juízes 10 a 12", suggestedBook: "Juízes" },
      { dayNumber: 3, reading: "Juízes 13 a 15", suggestedBook: "Juízes" },
      { dayNumber: 4, reading: "Juízes 16 a 18", suggestedBook: "Juízes" },
      { dayNumber: 5, reading: "Juízes 19 a 21", suggestedBook: "Juízes" },
      { dayNumber: 6, reading: "Rute 1 a 4", suggestedBook: "Rute" },
      { dayNumber: 7, reading: "1 Samuel 1 a 3", suggestedBook: "1 Samuel" }
    ]
  },
  {
    weekNumber: 15,
    days: [
      { dayNumber: 1, reading: "1 Samuel 4 a 8", suggestedBook: "1 Samuel" },
      { dayNumber: 2, reading: "1 Samuel 9 a 12", suggestedBook: "1 Samuel" },
      { dayNumber: 3, reading: "1 Samuel 13 e 14", suggestedBook: "1 Samuel" },
      { dayNumber: 4, reading: "1 Samuel 15 a 17", suggestedBook: "1 Samuel" },
      { dayNumber: 5, reading: "1 Sm 18 a 20; Sl 11, 59", suggestedBook: "1 Samuel" },
      { dayNumber: 6, reading: "1 Samuel 21 a 24", suggestedBook: "1 Samuel" },
      { dayNumber: 7, reading: "Sl 7, 27, 31, 34 e 52", suggestedBook: "Salmos" }
    ]
  },
  {
    weekNumber: 16,
    days: [
      { dayNumber: 1, reading: "Sl 56, 120, 140 a 142", suggestedBook: "Salmos" },
      { dayNumber: 2, reading: "1 Samuel 25 a 27", suggestedBook: "1 Samuel" },
      { dayNumber: 3, reading: "Sl 17, 35, 54, 63", suggestedBook: "Salmos" },
      { dayNumber: 4, reading: "1 Sm 28 a 31; Sl 18", suggestedBook: "1 Samuel" },
      { dayNumber: 5, reading: "Sl 121, 123 a 125, 128 a 130", suggestedBook: "Salmos" },
      { dayNumber: 6, reading: "2 Samuel 1 a 4", suggestedBook: "2 Samuel" },
      { dayNumber: 7, reading: "Sl 6, 8 a 10, 14, 16, 19, 21", suggestedBook: "Salmos" }
    ]
  },
  {
    weekNumber: 17,
    days: [
      { dayNumber: 1, reading: "1 Crônicas 1 e 2", suggestedBook: "1 Crônicas" },
      { dayNumber: 2, reading: "Sl 43 a 45, 49, 84, 85, 87", suggestedBook: "Salmos" },
      { dayNumber: 3, reading: "1 Crônicas 3 a 5", suggestedBook: "1 Crônicas" },
      { dayNumber: 4, reading: "Sl 73, 77 e 78", suggestedBook: "Salmos" },
      { dayNumber: 5, reading: "1 Crônicas 6", suggestedBook: "1 Crônicas" },
      { dayNumber: 6, reading: "Sl 81, 88, 92 e 93", suggestedBook: "Salmos" },
      { dayNumber: 7, reading: "1 Crônicas 7 a 10", suggestedBook: "1 Crônicas" }
    ]
  },
  {
    weekNumber: 18,
    days: [
      { dayNumber: 1, reading: "Salmos 102 a 104", suggestedBook: "Salmos" },
      { dayNumber: 2, reading: "2 Sm 5:1-10 e 1 Cr 11-12", suggestedBook: "2 Samuel" },
      { dayNumber: 3, reading: "Salmos 127 e 133", suggestedBook: "Salmos" },
      { dayNumber: 4, reading: "Salmos 106 e 107", suggestedBook: "Salmos" },
      { dayNumber: 5, reading: "2 Sm 5:11-25; 2 Sm 6; 1 Cr 13-16", suggestedBook: "1 Crônicas" },
      { dayNumber: 6, reading: "Sl 1-2, 15, 22-24, 47 e 68", suggestedBook: "Salmos" },
      { dayNumber: 7, reading: "Sl 89, 96, 100, 101, 105 e 132", suggestedBook: "Salmos" }
    ]
  },
  {
    weekNumber: 19,
    days: [
      { dayNumber: 1, reading: "2 Sm 7; 1 Cr 17", suggestedBook: "2 Samuel" },
      { dayNumber: 2, reading: "Sl 25, 29, 33, 36 e 39", suggestedBook: "Salmos" },
      { dayNumber: 3, reading: "2 Sm 8-9; 1 Cr 18", suggestedBook: "2 Samuel" },
      { dayNumber: 4, reading: "Sl 50, 53, 60 e 75", suggestedBook: "Salmos" },
      { dayNumber: 5, reading: "2 Sm 10; 1 Cr 19; Sl 20", suggestedBook: "2 Samuel" },
      { dayNumber: 6, reading: "Sl 65 a 67, 69 e 70", suggestedBook: "Salmos" },
      { dayNumber: 7, reading: "2 Sm 11 e 12; 1 Cr 20", suggestedBook: "2 Samuel" }
    ]
  },
  {
    weekNumber: 20,
    days: [
      { dayNumber: 1, reading: "Sl 32, 51, 86 e 122", suggestedBook: "Salmos" },
      { dayNumber: 2, reading: "2 Samuel 13-15", suggestedBook: "2 Samuel" },
      { dayNumber: 3, reading: "Sl 3-4, 12-13, 28, 55", suggestedBook: "Salmos" },
      { dayNumber: 4, reading: "2 Samuel 16 a 18", suggestedBook: "2 Samuel" },
      { dayNumber: 5, reading: "Sl 26, 40, 58, 61-62, 64", suggestedBook: "Salmos" },
      { dayNumber: 6, reading: "2 Samuel 19-21", suggestedBook: "2 Samuel" },
      { dayNumber: 7, reading: "Salmos 5, 38, 41-42", suggestedBook: "Salmos" }
    ]
  },
  {
    weekNumber: 21,
    days: [
      { dayNumber: 1, reading: "2 Sm 22-23; Sl 57", suggestedBook: "2 Samuel" },
      { dayNumber: 2, reading: "Salmos 95, 97-99", suggestedBook: "Salmos" },
      { dayNumber: 3, reading: "2 Sm 24; 1 Cr 21-22; Salmo 30", suggestedBook: "1 Crônicas" },
      { dayNumber: 4, reading: "Salmos 108 a 110", suggestedBook: "Salmos" },
      { dayNumber: 5, reading: "1 Crônicas 23-25", suggestedBook: "1 Crônicas" },
      { dayNumber: 6, reading: "Sl 131, 138-139, 143-145", suggestedBook: "Salmos" },
      { dayNumber: 7, reading: "1 Crônicas 26-29", suggestedBook: "1 Crônicas" }
    ]
  },
  {
    weekNumber: 22,
    days: [
      { dayNumber: 1, reading: "Salmos 111 a 118", suggestedBook: "Salmos" },
      { dayNumber: 2, reading: "1 Rs 1-2; Sl 37, 94", suggestedBook: "1 Reis" },
      { dayNumber: 3, reading: "Salmos 119:1-88", suggestedBook: "Salmos" },
      { dayNumber: 4, reading: "1 Reis 3-4; 2 Cr 1; Salmo 72", suggestedBook: "1 Reis" },
      { dayNumber: 5, reading: "Salmos 119: 89-176", suggestedBook: "Salmos" },
      { dayNumber: 6, reading: "Cantares 1 a 8", suggestedBook: "Cantares" },
      { dayNumber: 7, reading: "Provérbios 1-3", suggestedBook: "Provérbios" }
    ]
  },
  {
    weekNumber: 23,
    days: [
      { dayNumber: 1, reading: "Provérbios 4 a 6", suggestedBook: "Provérbios" },
      { dayNumber: 2, reading: "Provérbios 7 a 9", suggestedBook: "Provérbios" },
      { dayNumber: 3, reading: "Provérbios 10 a 12", suggestedBook: "Provérbios" },
      { dayNumber: 4, reading: "Provérbios 13 a 15", suggestedBook: "Provérbios" },
      { dayNumber: 5, reading: "Provérbios 16 a 18", suggestedBook: "Provérbios" },
      { dayNumber: 6, reading: "Provérbios 19 a 21", suggestedBook: "Provérbios" },
      { dayNumber: 7, reading: "Provérbios 22 a 24", suggestedBook: "Provérbios" }
    ]
  },
  {
    weekNumber: 24,
    days: [
      { dayNumber: 1, reading: "1 Rs 5-6; 2 Cr 2-3", suggestedBook: "1 Reis" },
      { dayNumber: 2, reading: "1 Reis 7; 2 Cr 4", suggestedBook: "1 Reis" },
      { dayNumber: 3, reading: "1 Reis 8; 2 Cr 5", suggestedBook: "1 Reis" },
      { dayNumber: 4, reading: "2 Cr 6 e 7; Sl 136", suggestedBook: "2 Crônicas" },
      { dayNumber: 5, reading: "Sl 134, 146-150", suggestedBook: "Salmos" },
      { dayNumber: 6, reading: "1 Reis 9; 2 Cr 8", suggestedBook: "1 Reis" },
      { dayNumber: 7, reading: "Pv 25 e 26", suggestedBook: "Provérbios" }
    ]
  },
  {
    weekNumber: 25,
    days: [
      { dayNumber: 1, reading: "Provérbios 27 a 29", suggestedBook: "Provérbios" },
      { dayNumber: 2, reading: "Eclesiastes 1 a 6", suggestedBook: "Eclesiastes" },
      { dayNumber: 3, reading: "Eclesiastes 7 a 12", suggestedBook: "Eclesiastes" },
      { dayNumber: 4, reading: "1 Reis 10-11", suggestedBook: "1 Reis" },
      { dayNumber: 5, reading: "2 Crônicas 9", suggestedBook: "2 Crônicas" },
      { dayNumber: 6, reading: "Provérbios 30 e 31", suggestedBook: "Provérbios" },
      { dayNumber: 7, reading: "1 Rs 12 a 14; 2 Cr 10 a 12", suggestedBook: "1 Reis" }
    ]
  },
  {
    weekNumber: 26,
    days: [
      { dayNumber: 1, reading: "1 Reis 15:1-24; 2 Crônicas 13-16", suggestedBook: "1 Reis" },
      { dayNumber: 2, reading: "1 Reis 15:25-34; 1 Reis 16; 2 Crônicas 17", suggestedBook: "1 Reis" },
      { dayNumber: 3, reading: "1 Reis 17-19", suggestedBook: "1 Reis" },
      { dayNumber: 4, reading: "1 Reis 20-21", suggestedBook: "1 Reis" },
      { dayNumber: 5, reading: "1 Reis 22; 2 Cr 18", suggestedBook: "1 Reis" },
      { dayNumber: 6, reading: "2 Crônicas 19-23", suggestedBook: "2 Crônicas" },
      { dayNumber: 7, reading: "Obadias; Sl 82-83", suggestedBook: "Obadias" }
    ]
  },
  {
    weekNumber: 27,
    days: [
      { dayNumber: 1, reading: "2 Reis 1 a 4", suggestedBook: "2 Reis" },
      { dayNumber: 2, reading: "2 Reis 5 a 8", suggestedBook: "2 Reis" },
      { dayNumber: 3, reading: "2 Reis 9 a 11", suggestedBook: "2 Reis" },
      { dayNumber: 4, reading: "2 Reis 12-13; 2 Crônicas 24", suggestedBook: "2 Reis" },
      { dayNumber: 5, reading: "2 Reis 14; 2 Crônicas 25", suggestedBook: "2 Reis" },
      { dayNumber: 6, reading: "Jonas 1 a 4", suggestedBook: "Jonas" },
      { dayNumber: 7, reading: "2 Reis 15; 2 Crônicas 26", suggestedBook: "2 Reis" }
    ]
  },
  {
    weekNumber: 28,
    days: [
      { dayNumber: 1, reading: "Isaías 1 a 4", suggestedBook: "Isaías" },
      { dayNumber: 2, reading: "Isaías 5 a 8", suggestedBook: "Isaías" },
      { dayNumber: 3, reading: "Amós 1 a 5", suggestedBook: "Amós" },
      { dayNumber: 4, reading: "Amós 6 a 9", suggestedBook: "Amós" },
      { dayNumber: 5, reading: "2 Cr 27; Is 9-12", suggestedBook: "Isaías" },
      { dayNumber: 6, reading: "Miquéias 1 a 7", suggestedBook: "Miquéias" },
      { dayNumber: 7, reading: "2 Cr 28; 2 Rs 16-17", suggestedBook: "2 Reis" }
    ]
  },
  {
    weekNumber: 29,
    days: [
      { dayNumber: 1, reading: "Isaías 13 a 17", suggestedBook: "Isaías" },
      { dayNumber: 2, reading: "Isaías 18 a 22", suggestedBook: "Isaías" },
      { dayNumber: 3, reading: "Isaías 23 a 27", suggestedBook: "Isaías" },
      { dayNumber: 4, reading: "2 Rs 18:1-8; 2 Cr 29-31; Salmo 48", suggestedBook: "Isaías" },
      { dayNumber: 5, reading: "Oséias 1 a 7", suggestedBook: "Oséias" },
      { dayNumber: 6, reading: "Oséias 8 a 14", suggestedBook: "Oséias" },
      { dayNumber: 7, reading: "Isaías 28 a 30", suggestedBook: "Isaías" }
    ]
  },
  {
    weekNumber: 30,
    days: [
      { dayNumber: 1, reading: "Isaías 31 a 34", suggestedBook: "Isaías" },
      { dayNumber: 2, reading: "Isaías 35 e 36", suggestedBook: "Isaías" },
      { dayNumber: 3, reading: "Is 37 a 39; Sl 76", suggestedBook: "Isaías" },
      { dayNumber: 4, reading: "Isaías 40 a 43", suggestedBook: "Isaías" },
      { dayNumber: 5, reading: "Isaías 44 a 48", suggestedBook: "Isaías" },
      { dayNumber: 6, reading: "2 Rs 18:9-37; 2 Rs 19; Salmos 135", suggestedBook: "Isaías" },
      { dayNumber: 7, reading: "Isaías 49 a 53", suggestedBook: "Isaías" }
    ]
  },
  {
    weekNumber: 31,
    days: [
      { dayNumber: 1, reading: "Isaías 54 a 58", suggestedBook: "Isaías" },
      { dayNumber: 2, reading: "Isaías 59 a 63", suggestedBook: "Isaías" },
      { dayNumber: 3, reading: "Isaías 64 a 66", suggestedBook: "Isaías" },
      { dayNumber: 4, reading: "2 Reis 20 e 21", suggestedBook: "2 Reis" },
      { dayNumber: 5, reading: "2 Crônicas 32 e 33", suggestedBook: "2 Crônicas" },
      { dayNumber: 6, reading: "Naum 1 a 3", suggestedBook: "Naum" },
      { dayNumber: 7, reading: "2 Rs 22-23; 2 Cr 34-35", suggestedBook: "2 Reis" }
    ]
  },
  {
    weekNumber: 32,
    days: [
      { dayNumber: 1, reading: "Sofonias 1 a 3", suggestedBook: "Sofonias" },
      { dayNumber: 2, reading: "Jeremias 1 a 3", suggestedBook: "Jeremias" },
      { dayNumber: 3, reading: "Jeremias 4 a 6", suggestedBook: "Jeremias" },
      { dayNumber: 4, reading: "Jeremias 7 a 9", suggestedBook: "Jeremias" },
      { dayNumber: 5, reading: "Jeremias 10 a 13", suggestedBook: "Jeremias" },
      { dayNumber: 6, reading: "Jeremias 14 a 17", suggestedBook: "Jeremias" },
      { dayNumber: 7, reading: "Jeremias 18 a 22", suggestedBook: "Jeremias" }
    ]
  },
  {
    weekNumber: 33,
    days: [
      { dayNumber: 1, reading: "Jeremias 23 a 25", suggestedBook: "Jeremias" },
      { dayNumber: 2, reading: "Jeremias 26 a 29", suggestedBook: "Jeremias" },
      { dayNumber: 3, reading: "Jeremias 30 e 31", suggestedBook: "Jeremias" },
      { dayNumber: 4, reading: "Jeremias 32 a 34", suggestedBook: "Jeremias" },
      { dayNumber: 5, reading: "Jeremias 35 a 37", suggestedBook: "Jeremias" },
      { dayNumber: 6, reading: "Jr 38 a 40; Sl 74 e 79", suggestedBook: "Jeremias" },
      { dayNumber: 7, reading: "2 Rs 24-25; 2 Cr 36", suggestedBook: "2 Reis" }
    ]
  },
  {
    weekNumber: 34,
    days: [
      { dayNumber: 1, reading: "Habacuque 1 a 3", suggestedBook: "Habacuque" },
      { dayNumber: 2, reading: "Jeremias 41 a 45", suggestedBook: "Jeremias" },
      { dayNumber: 3, reading: "Jeremias 46 a 48", suggestedBook: "Jeremias" },
      { dayNumber: 4, reading: "Jeremias 49 e 50", suggestedBook: "Jeremias" },
      { dayNumber: 5, reading: "Jeremias 51 e 52", suggestedBook: "Jeremias" },
      { dayNumber: 6, reading: "Lm 1 e 2; 3:1-36", suggestedBook: "Lamentações" },
      { dayNumber: 7, reading: "Lm 3:37-66; 4-5", suggestedBook: "Lamentações" }
    ]
  },
  {
    weekNumber: 35,
    days: [
      { dayNumber: 1, reading: "Ezequiel 1 a 4", suggestedBook: "Ezequiel" },
      { dayNumber: 2, reading: "Ezequiel 5 a 8", suggestedBook: "Ezequiel" },
      { dayNumber: 3, reading: "Ezequiel 9 a 12", suggestedBook: "Ezequiel" },
      { dayNumber: 4, reading: "Ezequiel 13 a 15", suggestedBook: "Ezequiel" },
      { dayNumber: 5, reading: "Ezequiel 16 e 17", suggestedBook: "Ezequiel" },
      { dayNumber: 6, reading: "Ezequiel 18 e 19", suggestedBook: "Ezequiel" },
      { dayNumber: 7, reading: "Ezequiel 20 e 21", suggestedBook: "Ezequiel" }
    ]
  },
  {
    weekNumber: 36,
    days: [
      { dayNumber: 1, reading: "Ezequiel 22 e 23", suggestedBook: "Ezequiel" },
      { dayNumber: 2, reading: "Ezequiel 24 a 27", suggestedBook: "Ezequiel" },
      { dayNumber: 3, reading: "Ezequiel 28 a 31", suggestedBook: "Ezequiel" },
      { dayNumber: 4, reading: "Ezequiel 32 a 34", suggestedBook: "Ezequiel" },
      { dayNumber: 5, reading: "Ezequiel 35 a 37", suggestedBook: "Ezequiel" },
      { dayNumber: 6, reading: "Ezequiel 38 e 39", suggestedBook: "Ezequiel" },
      { dayNumber: 7, reading: "Ezequiel 40 e 41", suggestedBook: "Ezequiel" }
    ]
  },
  {
    weekNumber: 37,
    days: [
      { dayNumber: 1, reading: "Ezequiel 42 e 43", suggestedBook: "Ezequiel" },
      { dayNumber: 2, reading: "Ezequiel 44 e 45", suggestedBook: "Ezequiel" },
      { dayNumber: 3, reading: "Ezequiel 46 a 48", suggestedBook: "Ezequiel" },
      { dayNumber: 4, reading: "Joel 1 a 3", suggestedBook: "Joel" },
      { dayNumber: 5, reading: "Daniel 1 a 3", suggestedBook: "Daniel" },
      { dayNumber: 6, reading: "Daniel 4 a 6", suggestedBook: "Daniel" },
      { dayNumber: 7, reading: "Daniel 7 a 9", suggestedBook: "Daniel" }
    ]
  },
  {
    weekNumber: 38,
    days: [
      { dayNumber: 1, reading: "Daniel 10 a 12", suggestedBook: "Daniel" },
      { dayNumber: 2, reading: "Esdras 1 a 3", suggestedBook: "Esdras" },
      { dayNumber: 3, reading: "Ed. 4 a 6; Sl 137", suggestedBook: "Esdras" },
      { dayNumber: 4, reading: "Ageu 1 e 2", suggestedBook: "Ageu" },
      { dayNumber: 5, reading: "Zacarias 1 a 7", suggestedBook: "Zacarias" },
      { dayNumber: 6, reading: "Zacarias 8 a 14", suggestedBook: "Zacarias" },
      { dayNumber: 7, reading: "Ester 1 a 5", suggestedBook: "Ester" }
    ]
  },
  {
    weekNumber: 39,
    days: [
      { dayNumber: 1, reading: "Ester 6 a 10", suggestedBook: "Ester" },
      { dayNumber: 2, reading: "Esdras 7 a 10", suggestedBook: "Esdras" },
      { dayNumber: 3, reading: "Neemias 1 a 5", suggestedBook: "Neemias" },
      { dayNumber: 4, reading: "Neemias 6 e 7", suggestedBook: "Neemias" },
      { dayNumber: 5, reading: "Neemias 8 a 10", suggestedBook: "Neemias" },
      { dayNumber: 6, reading: "Ne 11 a 13; Sl 126", suggestedBook: "Neemias" },
      { dayNumber: 7, reading: "Malaquias 1 a 4", suggestedBook: "Malaquias" }
    ]
  },
  {
    weekNumber: 40,
    days: [
      { dayNumber: 1, reading: "Lc 1; Jo 1:1-14", suggestedBook: "Lucas" },
      { dayNumber: 2, reading: "Mt 1; Lc 2:1-38", suggestedBook: "Mateus" },
      { dayNumber: 3, reading: "Mt 2; Lc 2:39-52", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "Mt 3; Mc 1; Lc 3", suggestedBook: "Mateus" },
      { dayNumber: 5, reading: "Mt 4; Lucas 4 e 5; João 1:15-51", suggestedBook: "Lucas" },
      { dayNumber: 6, reading: "João 2 a 4", suggestedBook: "João" },
      { dayNumber: 7, reading: "Marcos 2", suggestedBook: "Marcos" }
    ]
  },
  {
    weekNumber: 41,
    days: [
      { dayNumber: 1, reading: "João 5", suggestedBook: "João" },
      { dayNumber: 2, reading: "Mateus 12:1-21; Marcos 3; Lucas 6", suggestedBook: "Mateus" },
      { dayNumber: 3, reading: "Mateus 5 a 7", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "Mt 8:1-13; Lc 7", suggestedBook: "Mateus" },
      { dayNumber: 5, reading: "Mateus 11", suggestedBook: "Mateus" },
      { dayNumber: 6, reading: "Mt 12:22-50", suggestedBook: "Mateus" },
      { dayNumber: 7, reading: "Mt 13; Lucas 8", suggestedBook: "Mateus" }
    ]
  },
  {
    weekNumber: 42,
    days: [
      { dayNumber: 1, reading: "Mt 8:14-34; Mc 4 e 5", suggestedBook: "Mateus" },
      { dayNumber: 2, reading: "Mateus 9 e 10", suggestedBook: "Mateus" },
      { dayNumber: 3, reading: "Mateus 14; Mc 6; Lucas 9:1-17", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "João 6", suggestedBook: "João" },
      { dayNumber: 5, reading: "Mt 15; Mc 7", suggestedBook: "Mateus" },
      { dayNumber: 6, reading: "Mateus 16; Marcos 8; Lucas 9:18-27", suggestedBook: "Mateus" },
      { dayNumber: 7, reading: "Mateus 17; Marcos 9; Lucas 9:28-62", suggestedBook: "Mateus" }
    ]
  },
  {
    weekNumber: 43,
    days: [
      { dayNumber: 1, reading: "Mateus 18", suggestedBook: "Mateus" },
      { dayNumber: 2, reading: "João 7 e 8", suggestedBook: "João" },
      { dayNumber: 3, reading: "João 9:1-41; João 10:1-21", suggestedBook: "João" },
      { dayNumber: 4, reading: "Lucas 10 e 11; João 10:22-42", suggestedBook: "Lucas" },
      { dayNumber: 5, reading: "Lucas 12 e 13", suggestedBook: "Lucas" },
      { dayNumber: 6, reading: "Lucas 14 e 15", suggestedBook: "Lucas" },
      { dayNumber: 7, reading: "Lc 16; Lc 17:1-10", suggestedBook: "Lucas" }
    ]
  },
  {
    weekNumber: 44,
    days: [
      { dayNumber: 1, reading: "João 11", suggestedBook: "João" },
      { dayNumber: 2, reading: "Lucas 17:11-37; Lucas 18:1-14", suggestedBook: "Lucas" },
      { dayNumber: 3, reading: "Mt 19; Mc 10", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "Mateus 20 e 21", suggestedBook: "Mateus" },
      { dayNumber: 5, reading: "Lc 17:11-37; 19:1-48", suggestedBook: "Lucas" },
      { dayNumber: 6, reading: "Mc 11; Jo 12", suggestedBook: "Marcos" },
      { dayNumber: 7, reading: "Mt 22; Mc 12", suggestedBook: "Mateus" }
    ]
  },
  {
    weekNumber: 45,
    days: [
      { dayNumber: 1, reading: "Mt 23; Lc 20 e 21", suggestedBook: "Mateus" },
      { dayNumber: 2, reading: "Marcos 13", suggestedBook: "Marcos" },
      { dayNumber: 3, reading: "Mateus 24", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "Mateus 25", suggestedBook: "Mateus" },
      { dayNumber: 5, reading: "Mt 26; Mc 14", suggestedBook: "Mateus" },
      { dayNumber: 6, reading: "Lc 22; João 13", suggestedBook: "Lucas" },
      { dayNumber: 7, reading: "João 14 a 17", suggestedBook: "João" }
    ]
  },
  {
    weekNumber: 46,
    days: [
      { dayNumber: 1, reading: "Mt 27; Mc 15", suggestedBook: "Mateus" },
      { dayNumber: 2, reading: "Lc 23; Jo 18 e 19", suggestedBook: "Lucas" },
      { dayNumber: 3, reading: "Mt 28; Mc 16", suggestedBook: "Mateus" },
      { dayNumber: 4, reading: "Lc 24; Jo 20 e 21", suggestedBook: "Lucas" },
      { dayNumber: 5, reading: "Atos 1 a 3", suggestedBook: "Atos" },
      { dayNumber: 6, reading: "Atos 4 a 6", suggestedBook: "Atos" },
      { dayNumber: 7, reading: "Atos 7 e 8", suggestedBook: "Atos" }
    ]
  },
  {
    weekNumber: 47,
    days: [
      { dayNumber: 1, reading: "Atos 9 e 10", suggestedBook: "Atos" },
      { dayNumber: 2, reading: "Atos 11 e 12", suggestedBook: "Atos" },
      { dayNumber: 3, reading: "Atos 13 e 14", suggestedBook: "Atos" },
      { dayNumber: 4, reading: "Tiago 1 a 5", suggestedBook: "Tiago" },
      { dayNumber: 5, reading: "Atos 15 e 16", suggestedBook: "Atos" },
      { dayNumber: 6, reading: "Gálatas 1 a 3", suggestedBook: "Gálatas" },
      { dayNumber: 7, reading: "Gálatas 4 a 6", suggestedBook: "Gálatas" }
    ]
  },
  {
    weekNumber: 48,
    days: [
      { dayNumber: 1, reading: "Atos 17; 18:1-18", suggestedBook: "Atos" },
      { dayNumber: 2, reading: "1 Ts 1 a 5; 2 Ts 1 a 3", suggestedBook: "1 Tessalonicenses" },
      { dayNumber: 3, reading: "Atos 18:19-28; 19:1-41", suggestedBook: "Atos" },
      { dayNumber: 4, reading: "1 Co 1 a 4", suggestedBook: "1 Coríntios" },
      { dayNumber: 5, reading: "1 Co 5 a 8", suggestedBook: "1 Coríntios" },
      { dayNumber: 6, reading: "1 Co 9 a 11", suggestedBook: "1 Coríntios" },
      { dayNumber: 7, reading: "1 Co 12 a 14", suggestedBook: "1 Coríntios" }
    ]
  },
  {
    weekNumber: 49,
    days: [
      { dayNumber: 1, reading: "1 Co 15 e 16", suggestedBook: "1 Coríntios" },
      { dayNumber: 2, reading: "2 Co 1 a 4", suggestedBook: "2 Coríntios" },
      { dayNumber: 3, reading: "2 Co 5 a 9", suggestedBook: "2 Coríntios" },
      { dayNumber: 4, reading: "2 Co 10 a 13", suggestedBook: "2 Coríntios" },
      { dayNumber: 5, reading: "Atos 20:1-3; Rm 1 a 3", suggestedBook: "Romanos" },
      { dayNumber: 6, reading: "Romanos 4 a 7", suggestedBook: "Romanos" },
      { dayNumber: 7, reading: "Rm 8 a 10", suggestedBook: "Romanos" }
    ]
  },
  {
    weekNumber: 50,
    days: [
      { dayNumber: 1, reading: "Rm 11 a 13", suggestedBook: "Romanos" },
      { dayNumber: 2, reading: "Rm 14 a 16", suggestedBook: "Romanos" },
      { dayNumber: 3, reading: "Atos 20:4-38; 21-22; 23:1-35", suggestedBook: "Atos" },
      { dayNumber: 4, reading: "Atos 24 a 26", suggestedBook: "Atos" },
      { dayNumber: 5, reading: "Atos 27 e 28", suggestedBook: "Atos" },
      { dayNumber: 6, reading: "Cl 1 a 4; Filemon", suggestedBook: "Colossenses" },
      { dayNumber: 7, reading: "Efésios 1 a 6", suggestedBook: "Efésios" }
    ]
  },
  {
    weekNumber: 51,
    days: [
      { dayNumber: 1, reading: "Filipenses 1 a 4", suggestedBook: "Filipenses" },
      { dayNumber: 2, reading: "1 Timóteo 1 a 6", suggestedBook: "1 Timóteo" },
      { dayNumber: 3, reading: "Tito 1 a 3", suggestedBook: "Tito" },
      { dayNumber: 4, reading: "1 Pedro 1 a 5", suggestedBook: "1 Pedro" },
      { dayNumber: 5, reading: "Hebreus 1 a 6", suggestedBook: "Hebreus" },
      { dayNumber: 6, reading: "Hebreus 7 a 10", suggestedBook: "Hebreus" },
      { dayNumber: 7, reading: "Hebreus 11 a 13", suggestedBook: "Hebreus" }
    ]
  },
  {
    weekNumber: 52,
    days: [
      { dayNumber: 1, reading: "2 Tm 1 a 4", suggestedBook: "2 Timóteo" },
      { dayNumber: 2, reading: "2 Pe 1 a 3; Judas", suggestedBook: "2 Pedro" },
      { dayNumber: 3, reading: "1 João 1 a 5", suggestedBook: "1 João" },
      { dayNumber: 4, reading: "2 João; 3 João", suggestedBook: "2 João" },
      { dayNumber: 5, reading: "Ap 1 a 5", suggestedBook: "Apocalipse" },
      { dayNumber: 6, reading: "Ap 6 a 11", suggestedBook: "Apocalipse" },
      { dayNumber: 7, reading: "Ap 12 a 22", suggestedBook: "Apocalipse" }
    ]
  }
];
