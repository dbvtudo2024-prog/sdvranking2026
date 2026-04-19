
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/') && dateStr.split('/').length === 3 && dateStr.split('/')[2].length === 4) return dateStr; 
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    // Use UTC to avoid timezone shifts for simple date strings
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
};
