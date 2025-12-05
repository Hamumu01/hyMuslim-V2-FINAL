
import { ChevronRight } from 'lucide-react';

const LandingPage = () => {
  
  
  const handleStart = () => {
    // Set that user has seen landing page
    localStorage.setItem('landingPageSeen', 'true');
    // Force a proper reload to ensure the PWA is correctly initialized
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-green-400 filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-green-300 filter blur-3xl" />
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-white">
        {/* App logo and title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">
            hyMuslim+
          </h1>
          <p className="text-xl opacity-90 mb-4">Your companion for prayer and Quran</p>
          <p className="text-sm opacity-75 max-w-xs mx-auto">
            Access prayer times, read Quran, and maintain your daily worship with ease
          </p>
        </div>
        
        {/* Get started button */}
        <button 
          onClick={handleStart}
          className="px-6 py-3 rounded-full bg-white text-green-600 font-semibold flex items-center shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Get Started
          <ChevronRight className="ml-2" size={20} />
        </button>
        
        <p className="absolute bottom-8 text-sm opacity-75">
          Developed by KREYA
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
