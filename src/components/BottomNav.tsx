import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, House, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPressing, setIsPressing] = useState<string | null>(null);
  
  useEffect(() => {
    // Update active tab based on current location
  }, [location.pathname]);
  
  const getActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  const handlePress = (path: string) => {
    setIsPressing(path);
    setTimeout(() => setIsPressing(null), 150);
  };
  
  // Pindahkan pengecekan setelah semua hook
  if (location.pathname === '/welcome') {
    return null;
  }
  
  const navItems = [
    { path: '/', icon: House, label: 'Home' },
    { path: '/prayer', icon: Clock, label: 'Prayer' },
    { path: '/quran', icon: BookOpen, label: 'Quran' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 shadow-sm">
        {navItems.map((item) => {
          const isActive = getActiveRoute(item.path);
          const isPressed = isPressing === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => {
                handlePress(item.path);
                navigate(item.path);
              }}
              onTouchStart={() => setIsPressing(item.path)}
              onTouchEnd={() => setIsPressing(null)}
              className={`relative flex flex-col items-center justify-center h-full px-4 transition-all duration-300 ease-in-out ${
                isPressed ? 'scale-90' : 'scale-100'
              }`}
              aria-label={item.label}
            >
              <div 
                className={`p-2 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-green-600 text-white' : 'text-gray-500'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`transition-all duration-300 ${isPressed ? 'scale-90' : 'scale-100'}`} 
                />
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
