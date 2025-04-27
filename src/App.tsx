import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import QuranList from './pages/QuranList';
import SurahViewer from './pages/SurahViewer';
import PrayerTimes from './pages/PrayerTimes';
import CitySelector from './pages/CitySelector';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import BottomNav from './components/BottomNav';

export function App() {
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const isLandingPage = location.pathname === '/welcome';

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(err => {
            console.error('Service worker registration failed:', err);
          });
      });
    }

    // Check if app is installed or can be installed
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      deferredPrompt = e;
      
      // We could add an install button here if needed
      console.log('App can be installed');
    });
    
    // Handle installed event
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
    });

    // Check if permission is granted for notifications
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className={`relative min-h-screen w-full max-w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 mx-auto ${isLandingPage ? '' : 'pb-16'}`}>
        <Routes>
          <Route path="/" element={<Home toggleDarkMode={toggleDarkMode} />} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/quran" element={<QuranList />} />
          <Route path="/quran/:surahNumber" element={<SurahViewer />} />
          <Route path="/prayer" element={<PrayerTimes />} />
          <Route path="/city-selector" element={<CitySelector />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}

export default App;
