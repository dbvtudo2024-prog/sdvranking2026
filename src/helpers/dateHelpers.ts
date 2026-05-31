
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/') && dateStr.split('/').length === 3 && dateStr.split('/')[2].length === 4) return dateStr; 
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    // Se a string contém hora (isto é, um 'T' do formato ISO), formatamos no fuso horário local do usuário.
    // Caso contrário (como "2026-05-30" sem hora), usamos UTC para evitar deslocamento de fuso.
    const isAbsoluteTimestamp = dateStr.includes('T');
    
    const day = String(isAbsoluteTimestamp ? date.getDate() : date.getUTCDate()).padStart(2, '0');
    const month = String(isAbsoluteTimestamp ? (date.getMonth() + 1) : (date.getUTCMonth() + 1)).padStart(2, '0');
    const year = isAbsoluteTimestamp ? date.getFullYear() : date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
};
