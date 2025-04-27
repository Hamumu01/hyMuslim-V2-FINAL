import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Header from '../components/Header';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const QuranList = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        // Try to get from local storage first
        const cachedSurahs = localStorage.getItem('quranSurahs');
        
        if (cachedSurahs) {
          try {
            const parsedSurahs = JSON.parse(cachedSurahs);
            if (Array.isArray(parsedSurahs)) {
              setSurahs(parsedSurahs);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing cached surahs:', parseError);
            // Continue to fetch from API if parse fails
          }
        }
        
        // Fetch from API if not in cache
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        
        if (data.code === 200 && Array.isArray(data.data)) {
          setSurahs(data.data);
          // Cache the surahs
          localStorage.setItem('quranSurahs', JSON.stringify(data.data));
        } else {
          // If API fails, use fallback data
          const fallbackSurahs = [
            { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
            { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" }
          ];
          setSurahs(fallbackSurahs);
          localStorage.setItem('quranSurahs', JSON.stringify(fallbackSurahs));
        }
      } catch (error) {
        console.error('Failed to fetch surahs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurahs();
  }, []);
  
  const filteredSurahs = surahs.filter(surah => { 
    const queryLower = searchQuery.toLowerCase();
    return (
      (surah.englishName && surah.englishName.toLowerCase().includes(queryLower)) ||
      (surah.name && surah.name.includes(searchQuery)) ||
      (surah.englishNameTranslation && surah.englishNameTranslation.toLowerCase().includes(queryLower))
    );
  });
  
  return (
    <div className="min-h-screen pb-16">
      <Header title="Quran App" showBack />
      
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        
        <div className="space-y-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            filteredSurahs.map(surah => (
              <div 
                key={surah.number}
                onClick={() => navigate(`/quran/${surah.number}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-10 h-10">
                    <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-300">{surah.number}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{surah.englishName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-arabic">{surah.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuranList;
