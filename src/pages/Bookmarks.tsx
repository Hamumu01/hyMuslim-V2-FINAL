import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Header from '../components/Header';

interface Bookmark {
  surah: number;
  surahName: string;
  verse: number;
  timestamp: string;
}

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  useEffect(() => {
    const loadBookmarks = () => {
      const savedBookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
      setBookmarks(savedBookmarks);
    };
    
    loadBookmarks();
    
    // Add event listener to update bookmarks if changed in another tab
    window.addEventListener('storage', loadBookmarks);
    
    return () => {
      window.removeEventListener('storage', loadBookmarks);
    };
  }, []);
  
  const handleDeleteBookmark = (index: number) => {
    const newBookmarks = [...bookmarks];
    newBookmarks.splice(index, 1);
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header title="Bookmarks" showBack />
      
      <div className="p-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No bookmarks yet</p>
            <button 
              onClick={() => navigate('/quran')}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-full text-sm"
            >
              Read Quran
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div 
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/quran/${bookmark.surah}`)}
                >
                  <h3 className="font-medium">{bookmark.surahName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Verse {bookmark.verse} • Saved on {formatDate(bookmark.timestamp)}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDeleteBookmark(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
