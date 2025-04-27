interface NotificationPreferences {
  enabled: boolean;
  prayers: Record<string, boolean>;
  minutesBefore: number;
}

export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      return JSON.parse(savedPrefs);
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  
  // Default preferences
  return {
    enabled: false,
    prayers: {
      Subuh: true,
      Dzuhur: true,
      Ashar: true,
      Maghrib: true,
      Isya: true
    },
    minutesBefore: 10
  };
};

export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

export const shouldNotifyForPrayer = (prayerName: string): boolean => {
  const prefs = getNotificationPreferences();
  
  if (!prefs.enabled) return false;
  if (!prefs.prayers[prayerName]) return false;
  
  return true;
};

export const getMinutesBefore = (): number => {
  return getNotificationPreferences().minutesBefore;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};
