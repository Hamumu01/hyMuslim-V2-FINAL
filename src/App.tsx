// Custom interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
import { useEffect, useState, useRef } from 'react';
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
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Handler for install button click
  const handleInstallClick = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const choiceResult = await deferredPromptRef.current.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Register service worker for PWA
    let onLoad: (() => void) | undefined;
    if ('serviceWorker' in navigator) {
      onLoad = () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(err => {
            console.error('Service worker registration failed:', err);
          });
      };

      window.addEventListener('load', onLoad);
    }

    // Check if app is installed or can be installed
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
      console.log('App can be installed');
    };

    const appInstalledHandler = () => {
      console.log('App was installed');
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    // Check if permission is granted for notifications
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // cleanup listeners and injected link
    return () => {
      try {
        window.removeEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);
        window.removeEventListener('appinstalled', appInstalledHandler as EventListener);
      } catch (e) {
        // ignore if handlers not present
      }

      // remove onLoad service worker registration listener if added
      try {
        if ('serviceWorker' in navigator && typeof onLoad === 'function') {
          window.removeEventListener('load', onLoad as EventListener);
        }
      } catch (e) {}

      // remove appended link
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
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
        {canInstall && (
          <button
            onClick={handleInstallClick}
            className="fixed bottom-24 right-4 px-4 py-2 bg-green-600 text-white rounded shadow-lg z-50"
          >
            Install App
          </button>
        )}
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
