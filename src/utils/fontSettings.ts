interface FontSettings {
  quranFontSize: string;
  quranFontFamily: string;
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  quranFontSize: 'text-2xl',
  quranFontFamily: 'font-quran',
};

export const FONT_SIZE_OPTIONS = [
  { value: 'text-xl', label: 'Small' },
  { value: 'text-2xl', label: 'Medium' },
  { value: 'text-3xl', label: 'Large' },
  { value: 'text-4xl', label: 'Extra Large' },
];

export const FONT_FAMILY_OPTIONS = [
  { value: 'font-quran', label: 'Amiri (Default)' },
  { value: 'font-traditional', label: 'Scheherazade New' },
  { value: 'font-modern', label: 'Noto Naskh Arabic' },
];

export const getFontSettings = (): FontSettings => {
  try {
    const savedSettings = localStorage.getItem('fontSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading font settings:', error);
  }
  
  return DEFAULT_FONT_SETTINGS;
};

export const saveFontSettings = (settings: FontSettings): void => {
  try {
    localStorage.setItem('fontSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving font settings:', error);
  }
};
