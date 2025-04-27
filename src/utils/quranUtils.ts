export const saveLastRead = (surahNumber: number, surahName: string) => {
  localStorage.setItem('lastRead', JSON.stringify({
    surah: surahNumber,
    name: surahName,
    timestamp: new Date().toISOString()
  }));
};

export const getLastRead = () => {
  const lastRead = localStorage.getItem('lastRead');
  if (lastRead) {
    return JSON.parse(lastRead);
  }
  return null;
};
