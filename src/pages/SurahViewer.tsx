import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, Share } from 'lucide-react';
import Header from '../components/Header';
import ChevronUp from '../components/ChevronUp';
import { saveLastRead } from '../utils/quranUtils';
import { cleanQuranText } from '../utils/textCleaner';
import { getFontSettings } from '../utils/fontSettings';

interface Verse {
  number: number;
  text: string;
  translation: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  verses: Verse[];
}

const SurahViewer = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSettings, setFontSettings] = useState(getFontSettings());
  
  useEffect(() => {
    // Load font settings
    setFontSettings(getFontSettings());
    const fetchSurah = async () => {
      if (!surahNumber) return;
      
      try {
        setLoading(true);
        
        // Try to get from local storage first
        const cachedSurah = localStorage.getItem(`surah_${surahNumber}`);
        
        if (cachedSurah) {
          setSurah(JSON.parse(cachedSurah));
          setLoading(false);
          return;
        }
        
        // Fetch Arabic text
        const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
        const arabicData = await arabicResponse.json();
        
        // Fetch Indonesian translation from a different reliable source
        let indonesianData = { chapters: [] };
        
        try {
          // Try first API endpoint
          let translationData;
          try {
            const indonesianResponse = await fetch(`https://api.quran.com/api/v4/quran/translations/33?chapter_number=${surahNumber}`);
            translationData = await indonesianResponse.json();
          } catch (primaryApiError) {
            console.error('Failed with primary translation API:', primaryApiError);
            // Try fallback API
            const fallbackResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/id.indonesian`);
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackData.code === 200 && fallbackData.data && fallbackData.data.ayahs) {
              translationData = {
                translations: fallbackData.data.ayahs.map((ayah: any) => ({
                  text: ayah.text
                }))
              };
            }
          }
          
          if (translationData && translationData.translations) {
            indonesianData = {
              chapters: [{
                chapter: parseInt(surahNumber),
                verses: translationData.translations.map((item: any, index: number) => ({
                  verse: index + 1,
                  text: item.text
                }))
              }]
            };
          }
        } catch (translationError) {
          console.error('Failed to fetch translation:', translationError);
          // Continue with empty translations if there's an error
        }
        
        if (arabicData.code === 200) {
          // Find the Indonesian translation for this surah
          const translationChapters = indonesianData.chapters || [];
          const thisChapter = translationChapters.find((c: any) => c.chapter === parseInt(surahNumber));
          
          // Combine Arabic text with Indonesian translation
          const verses = arabicData.data.ayahs.map((ayah: any, index: number) => {
            let translation = thisChapter && thisChapter.verses[index] ? 
              thisChapter.verses[index].text : 'Translation not available';
            
            // Clean translation text by removing HTML tags and footnotes
            translation = cleanQuranText(translation);
            
            return {
              number: ayah.numberInSurah,
              text: ayah.text,
              translation
            };
          });
          
          const formattedSurah = {
            number: arabicData.data.number,
            name: arabicData.data.name,
            englishName: arabicData.data.englishName,
            englishNameTranslation: arabicData.data.englishNameTranslation,
            numberOfAyahs: arabicData.data.numberOfAyahs,
            verses
          };
          
          setSurah(formattedSurah);
          
          // Cache the surah
          localStorage.setItem(`surah_${surahNumber}`, JSON.stringify(formattedSurah));
          
          // Save as last read
          saveLastRead(formattedSurah.number, formattedSurah.englishName);
        }
      } catch (error) {
        console.error('Failed to fetch surah:', error);
        // Set fallback data if fetch fails
        setSurah({
          number: parseInt(surahNumber || '1'),
          name: 'Error loading',
          englishName: 'Error loading surah',
          englishNameTranslation: 'Please try again later',
          numberOfAyahs: 0,
          verses: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurah();
  }, [surahNumber]);
  
  const handleBookmark = (verseNumber: number) => {
    if (!surah) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
    
    const existingBookmarkIndex = bookmarks.findIndex(
      (b: any) => b.surah === surah.number && b.verse === verseNumber
    );
    
    if (existingBookmarkIndex >= 0) {
      // Remove bookmark if it exists
      bookmarks.splice(existingBookmarkIndex, 1);
    } else {
      // Add new bookmark
      bookmarks.push({
        surah: surah.number,
        surahName: surah.englishName,
        verse: verseNumber,
        timestamp: new Date().toISOString()
      });
    }
    
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header title={surah?.englishName || 'Loading...'} showBack />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : surah ? (
        <div className="p-4">
          {/* Surah Header */}
          <div className="rounded-xl bg-green-600 p-6 text-white text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">{surah.englishName}</h1>
            <p className="text-sm opacity-80">{surah.englishNameTranslation}</p>
            <div className="flex justify-center items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">
                {surah.numberOfAyahs} verses
              </span>
            </div>
          </div>
          
          {/* Verses */}
          <div className="space-y-6">
            {surah.verses && Array.isArray(surah.verses)
              ? surah.verses.map((verse: Verse) => {
                  return (
                    <div key={verse.number} className="ayah-container py-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <span className="text-xs text-green-600 dark:text-green-300">{verse.number}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleBookmark(verse.number)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Bookmark size={16} />
                          </button>
                          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Share size={16} />
                          </button>
                        </div>
                      </div>
                      <p dir="rtl" className={`text-right leading-loose mb-3 ${fontSettings.quranFontSize} ${fontSettings.quranFontFamily}`}>{verse.text}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{verse.translation}</p>
                    </div>
                  );
                })
              : null}
          </div>
          
          {/* Navigation buttons */}
          <div className="fixed bottom-20 right-4 flex flex-col gap-2">
            <button 
              className="p-3 bg-green-600 text-white rounded-full shadow-lg"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ChevronUp size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p>Surah not found</p>
        </div>
      )}
    </div>
  );
};

export default SurahViewer;
