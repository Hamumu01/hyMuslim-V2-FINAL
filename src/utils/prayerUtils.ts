export const fetchPrayerTimes = async (cityId: string) => {
  try {
    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;
    
    // Try to get from local storage first
    const cacheKey = `prayerTimes_${cityId}_${formattedDate}`;
    const cachedTimes = localStorage.getItem(cacheKey);
    
    if (cachedTimes) {
      return JSON.parse(cachedTimes);
    }
    
    // Fetch from API if not in cache
    const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${formattedDate}`);
    const data = await response.json();
    
    if (data && data.data && data.data.jadwal) {
      const { subuh, dzuhur, ashar, maghrib, isya } = data.data.jadwal;
      const times = {
        Subuh: subuh,
        Dzuhur: dzuhur,
        Ashar: ashar,
        Maghrib: maghrib,
        Isya: isya
      };
      
      // Cache the prayer times
      localStorage.setItem(cacheKey, JSON.stringify(times));
      
      return times;
    }
    
    throw new Error('Failed to parse prayer times');
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // Return placeholder times if API fails
    return {
      Subuh: '04:30',
      Dzuhur: '12:00',
      Ashar: '15:30',
      Maghrib: '18:00',
      Isya: '19:30'
    };
  }
};

export const calculateNextPrayer = (prayerTimes: Record<string, string>) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert prayer times to minutes since midnight for comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const prayerTimesInMinutes = Object.entries(prayerTimes).map(([name, time]) => {
    const [hours, minutes] = time.split(':').map(Number);
    return {
      name,
      time,
      minutesSinceMidnight: hours * 60 + minutes
    };
  });
  
  // Sort by time
  prayerTimesInMinutes.sort((a, b) => a.minutesSinceMidnight - b.minutesSinceMidnight);
  
  // Find the next prayer
  const nextPrayer = prayerTimesInMinutes.find(prayer => 
    prayer.minutesSinceMidnight > currentTimeInMinutes
  );
  
  // If no prayer found, return the first prayer of the next day
  return nextPrayer || prayerTimesInMinutes[0];
};

export const scheduleNotification = (prayerName: string, prayerTime: string) => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return;
  }
  
  // Import notification preferences
  const { shouldNotifyForPrayer, getMinutesBefore } = require('./notificationUtils');
  
  // Check if notifications are enabled for this prayer
  if (!shouldNotifyForPrayer(prayerName)) {
    return;
  }
  
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
    return;
  }
  
  const [hours, minutes] = prayerTime.split(':').map(Number);
  
  const now = new Date();
  const notificationTime = new Date();
  const minutesBefore = getMinutesBefore(); // Get user preference
  notificationTime.setHours(hours, minutes - minutesBefore, 0);
  
  if (notificationTime < now) {
    // Prayer time already passed for today
    return;
  }
  
  const timeUntilNotification = notificationTime.getTime() - now.getTime();
  
  setTimeout(() => {
    new Notification('Prayer Time', {
      body: `${prayerName} will begin in ${minutesBefore} minutes. Time to prepare.`,
      icon: '/icon-192.png'
    });
  }, timeUntilNotification);
};
