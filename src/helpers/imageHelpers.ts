
export const formatImageUrl = (url: string): string => {
  if (!url) return '';
  // If it's a Google Drive link, format it for direct access
  if (url.includes('drive.google.com')) {
    const id = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1]?.split('&')[0];
    if (id) return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
};
