
export const formatImageUrl = (url: string) => {
  if (!url) return '';
  
  // Google Drive links
  if (url.includes('drive.google.com')) {
    // Handle /file/d/ID/view or /file/d/ID/edit
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
    // Handle ?id=ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
    }
  }
  
  return url;
};
