import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Compass, Map } from 'lucide-react';
import Header from '../components/Header';
import { fetchPrayerTimes, calculateNextPrayer, scheduleNotification } from '../utils/prayerUtils';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notificationUtils';

const PrayerTimes = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdownTime, setCountdownTime] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const toggleNotifications = async () => {
    const prefs = getNotificationPreferences();
    const newState = !prefs.enabled;
    
    if (newState && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return; // Don't enable if permission denied
      }
    }
    
    prefs.enabled = newState;
    saveNotificationPreferences(prefs);
    setNotificationsEnabled(newState);
    
    // Schedule or clear notifications based on new state
    if (newState && selectedCity) {
      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        scheduleNotification(prayer, time);
      });
    }
  };
  
  useEffect(() => {
    // Get selected city from localStorage
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      let cityObj: { id: string; name: string } | null = null;
      try {
        cityObj = JSON.parse(savedCity);
      } catch (e) {
        cityObj = null;
      }
      setSelectedCity(cityObj);
    }
    
    // Set hijri date (placeholder)
    setHijriDate('17 Safar 1443H');
    
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
        
        // Schedule notifications if enabled
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
      const updateCountdown = () => {
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
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      
      return () => clearInterval(interval);
    }
  }, [nextPrayer]);
  
  return (
    <div className="min-h-screen pb-16">
      <Header title="Prayer Times" showBack />
      
      <div className="p-4">
        {/* Hijri Date */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Date</p>
          <h2 className="text-xl font-semibold">{hijriDate}</h2>
        </div>
        
        {/* City Selection */}
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Map size={18} className="text-teal-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Selected Location</p>
              <p className="font-medium">{selectedCity?.name || 'No city selected'}</p>
            </div>
          </div>
          <button 
            className="px-3 py-1 bg-teal-500 text-white text-sm rounded-full"
            onClick={() => navigate('/city-selector')}
          >
            Change
          </button>
        </div>
        
        {selectedCity ? (
          <>
            {/* Prayer Times Card */}
            <div className="overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white mb-4 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Prayer Times</h3>
                <button 
                  onClick={toggleNotifications}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                >
                  {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
              </div>
            
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(prayerTimes).slice(0, 5).map(([prayer, time]) => (
                  <div 
                    key={prayer} 
                    className={`text-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${nextPrayer?.name === prayer ? 'bg-green-600/40' : ''}`}
                  >
                    <p className="text-xs uppercase mb-1">{prayer}</p>
                    <p className="text-sm font-bold">{time}</p>
                  </div>
                ))}
              </div>
              
              {nextPrayer && (
                <div className="mt-4 bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center transition-all duration-300">
                  <p className="text-sm">Next prayer: <span className="font-bold">{nextPrayer.name}</span></p>
                  <p className="text-xl font-bold">{nextPrayer.time}</p>
                  <p className="text-xs mt-1">Time remaining: {countdownTime}</p>
                </div>
              )}
            </div>
            
            {/* Additional Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Compass size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium">Qibla Direction</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Feature coming soon
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Map size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium">Nearest Mosque</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Feature coming soon
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="mb-4 text-gray-500">Please select your city to see prayer times</p>
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded-full"
              onClick={() => navigate('/city-selector')}
            >
              Select City
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerTimes;
