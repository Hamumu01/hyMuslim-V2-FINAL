import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, CircleDot, Clock, Moon, Sun, Type } from 'lucide-react';
import Header from '../components/Header';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notificationUtils';
import { getFontSettings, saveFontSettings, FONT_SIZE_OPTIONS, FONT_FAMILY_OPTIONS } from '../utils/fontSettings';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerNotifications, setPrayerNotifications] = useState({
    Subuh: true,
    Dzuhur: true,
    Ashar: true,
    Maghrib: true,
    Isya: true,
  });
  const [minutesBefore, setMinutesBefore] = useState(10);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [quranFontSize, setQuranFontSize] = useState(FONT_SIZE_OPTIONS[1].value);
  const [quranFontFamily, setQuranFontFamily] = useState(FONT_FAMILY_OPTIONS[0].value);

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }

    // Load notification preferences
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);
    setPrayerNotifications(prefs.prayers);
    setMinutesBefore(prefs.minutesBefore);

    // Load font settings
    const fontSettings = getFontSettings();
    setQuranFontSize(fontSettings.quranFontSize);
    setQuranFontFamily(fontSettings.quranFontFamily);

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled && permissionStatus !== 'granted') {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission !== 'granted') {
          return; // Don't enable if permission denied
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return;
      }
    }

    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    // Save updated preferences
    saveNotificationPreferences({
      enabled: newValue,
      prayers: prayerNotifications,
      minutesBefore
    });
  };

  const togglePrayerNotification = (prayer: string) => {
    const updatedPrayers = {
      ...prayerNotifications,
      [prayer]: !prayerNotifications[prayer as keyof typeof prayerNotifications]
    };
    setPrayerNotifications(updatedPrayers);
    
    // Save updated preferences
    saveNotificationPreferences({
      enabled: notificationsEnabled,
      prayers: updatedPrayers,
      minutesBefore
    });
  };

  const handleMinutesChange = (value: number) => {
    setMinutesBefore(value);
    
    // Save updated preferences
    saveNotificationPreferences({
      enabled: notificationsEnabled,
      prayers: prayerNotifications,
      minutesBefore: value
    });
  };

  const handleFontSizeChange = (size: string) => {
    setQuranFontSize(size);
    saveFontSettings({
      quranFontSize: size,
      quranFontFamily
    });
  };

  const handleFontFamilyChange = (font: string) => {
    setQuranFontFamily(font);
    saveFontSettings({
      quranFontSize: quranFontSize,
      quranFontFamily: font
    });
  };

  return (
    <div className="min-h-screen pb-16">
      <Header title="Settings" showBack />
      
      <div className="p-4 space-y-6">
        {/* Theme Setting */}
        <div className="card hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-green-500" /> : <Sun size={20} className="text-emerald-500" />}
              <span>Dark Mode</span>
            </div>
            
            <button 
              onClick={toggleDarkMode}
              className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${darkMode ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span 
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </div>
        
        {/* Font Settings */}
        <div className="card hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4">Quran Text</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Type size={16} className="text-green-500" />
              Font Size
            </p>
            <div className="grid grid-cols-4 gap-2">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm flex justify-center items-center ${
                    quranFontSize === option.value 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {quranFontSize === option.value && <CircleDot size={12} className="mr-1" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Type size={16} className="text-green-500" />
              Font Family
            </p>
            <div className="space-y-2">
              {FONT_FAMILY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontFamilyChange(option.value)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg ${
                    quranFontFamily === option.value 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className={option.value}>{option.label}</span>
                  {quranFontFamily === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
            <p className={`${quranFontSize} ${quranFontFamily} text-right leading-loose`}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="card hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? <Bell size={20} className="text-emerald-500" /> : <BellOff size={20} className="text-gray-500" />}
              <span>Enable Notifications</span>
            </div>
            
            <button 
              onClick={toggleNotifications}
              className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span 
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="p-3 mb-4 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm">
              Notification permission denied. Please enable notifications in your browser settings.
            </div>
          )}
          
          {notificationsEnabled && (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notify me before prayer (minutes)</p>
                <div className="flex items-center gap-3">
                  {[5, 10, 15, 30].map(value => (
                    <button
                      key={value}
                      onClick={() => handleMinutesChange(value)}
                      className={`px-4 py-1.5 rounded-full text-sm ${
                        minutesBefore === value 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select prayers to notify</p>
                <div className="space-y-2">
                  {Object.keys(prayerNotifications).map(prayer => (
                    <div key={prayer} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-emerald-500" />
                        <span>{prayer}</span>
                      </div>
                      
                      <button
                        onClick={() => togglePrayerNotification(prayer)}
                        className={`h-5 w-5 rounded ${
                          prayerNotifications[prayer as keyof typeof prayerNotifications] 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        } flex items-center justify-center`}
                      >
                        {prayerNotifications[prayer as keyof typeof prayerNotifications] && <Check size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Company Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-600">hyMuslimplus</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Developed by KREYA</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">© {new Date().getFullYear()} KREYA. All rights reserved</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Helping Muslims stay connected with their faith</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
