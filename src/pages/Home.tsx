import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, BookOpen, Clock } from 'lucide-react';
import Header from '../components/Header';
import { calculateNextPrayer, fetchPrayerTimes, scheduleNotification } from '../utils/prayerUtils';
import { getLastRead } from '../utils/quranUtils';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notificationUtils';
import { fetchHijriToday } from '../utils/hijriApi';
import { gregorianToHijri } from '../utils/hijriFallback';

interface HomeProps {
  toggleDarkMode: () => void;
}

const Home: React.FC<HomeProps> = ({ toggleDarkMode }) => {
  const navigate = useNavigate();
  const [hijriDate, setHijriDate] = useState<string>('');
  
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdownTime, setCountdownTime] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [lastRead, setLastRead] = useState<{ surah: number; name: string } | null>(null);
  
  // Toggle notification function
  const toggleNotifications = () => {
    const prefs = getNotificationPreferences();
    const newState = !prefs.enabled;
    
    // If enabling notifications, request permission
    if (newState && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          updateNotificationState(newState);
        }
      });
    } else {
      updateNotificationState(newState);
    }
  };
  
  const updateNotificationState = (enabled: boolean) => {
    const prefs = getNotificationPreferences();
    prefs.enabled = enabled;
    saveNotificationPreferences(prefs);
    setNotificationsEnabled(enabled);
    
    // If enabling, schedule notifications right away
    if (enabled && selectedCity) {
      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        scheduleNotification(prayer, time);
      });
    }
  };
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Check if landing page has been seen
  useEffect(() => {
    const landingPageSeen = localStorage.getItem('landingPageSeen');
    if (!landingPageSeen) {
      // Redirect with a small delay to ensure the app is fully loaded
      setTimeout(() => {
        navigate('/welcome');
      }, 100);
    }
  }, [navigate]);

  useEffect(() => {
    
    fetchHijriToday()
      .then((data) => {
        if (data && data.date && data.month && data.year) {
          const hijriStr = `${data.date} ${data.month} ${data.year} H`;
          setHijriDate(hijriStr);
          localStorage.setItem('hijriToday', hijriStr);
        } else {
          // fallback to cache
          const cached = localStorage.getItem('hijriToday');
          if (cached) {
            setHijriDate(cached);
          } else {
            // fallback manual
            const today = new Date();
            const hijri = gregorianToHijri(today);
            setHijriDate(`${hijri.date} ${hijri.month} ${hijri.year} H`);
          }
        }
      })
      .catch(() => {
        // fallback to cache
        const cached = localStorage.getItem('hijriToday');
        if (cached) {
          setHijriDate(cached);
        } else {
          // fallback manual
            const today = new Date();
            const hijri = gregorianToHijri(today);
            setHijriDate(`${hijri.date} ${hijri.month} ${hijri.year} H`);
        }
      })
      .finally(() => {});

    // Get selected city from localStorage
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      let cityObj: { id: string; name: string } | null = null;
      try {
        cityObj = JSON.parse(savedCity);
      } catch (e) {
        cityObj = null;
      }
      if (cityObj && typeof cityObj.name === 'string') {
        cityObj.name = cityObj.name.replace(/^[,\s]+/, '');
      }
      setSelectedCity(cityObj);
    }

    // Get last read from localStorage
    const lastReadData = getLastRead();
    setLastRead(lastReadData);

    // Get notification preferences
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchPrayerTimes(selectedCity.id).then(times => {
        setPrayerTimes(times);
        const next = calculateNextPrayer(times);
        setNextPrayer(next);
        
        // Schedule notifications for each prayer time if enabled
        if (notificationsEnabled) {
          Object.entries(times).forEach(([prayer, time]) => {
            if (typeof time !== 'string') return;
            scheduleNotification(prayer, time);
          });
        }
      });
    }
  }, [selectedCity, notificationsEnabled]);

  useEffect(() => {
    if (nextPrayer) {
      const interval = setInterval(() => {
        const now = new Date();
        const [hours, minutes] = nextPrayer.time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0);
        
        if (prayerTime < now) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }
        
        const diff = prayerTime.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setCountdownTime(`${hoursLeft}h ${minutesLeft}m`);
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [nextPrayer]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="hyMuslim+" 
        showDarkModeToggle 
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Greeting & Hijri Date */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Assalamualaikum</p>
          <h1 className="text-2xl font-bold">Selamat Datang</h1>
        </div>
        {/* Responsive grid for Last Read & Prayer Times */}
        <div className="flex flex-col md:flex-row gap-4">
          {lastRead && (
            <div 
              className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-green-700 p-4 text-white hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer min-w-0"
              onClick={() => navigate(`/quran/${lastRead.surah}`)}
            >
              <h3 className="font-medium">Last Read</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">{lastRead.name}</p>
                  <p className="text-sm opacity-80">Ayah No. 1</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5"></div>
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10"></div>
            </div>
          )}
          {/* Prayer Times Card */}
          <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Jadwal Sholat</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm mb-0">
                    {selectedCity?.name ? selectedCity.name.replace(/^[,\s]+/, '') : 'Pilih kota'}
                    <span className="ml-2 text-xs text-white/80 bg-emerald-800 rounded px-2 py-0.5">
                      {hijriDate || '-'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  onClick={toggleNotifications}
                  title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                >
                  {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                <button 
                  className="px-2 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors"
                  onClick={() => navigate('/city-selector')}
                >
                  Change City
                </button>
              </div>
            </div>
            {selectedCity ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-center">
                  {Object.entries(prayerTimes).slice(0, 5).map(([prayer, time]) => (
                    <div 
                      key={prayer} 
                      className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                        nextPrayer?.name === prayer ? 'bg-white/20 opacity-100' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="font-semibold text-lg">{time}</span>
                      <span className="text-xs mt-1">{prayer}</span>
                    </div>
                  ))}
                </div>
                {nextPrayer && (
                  <div className="mt-2 text-xs text-white/80">Next: {nextPrayer.name} in {countdownTime}</div>
                )}
              </>
            ) : (
              <div className="mt-4 text-center text-white/70">Pilih kota untuk melihat jadwal sholat</div>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button 
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md flex flex-col items-center gap-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-purple-500/10"
            onClick={() => navigate('/quran')}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-1">
              <BookOpen size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium">Read Quran</span>
          </button>
          
          <button 
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md flex flex-col items-center gap-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-teal-500/10"
            onClick={() => navigate('/prayer')}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-1">
              <Clock size={24} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium">Prayer Times</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
