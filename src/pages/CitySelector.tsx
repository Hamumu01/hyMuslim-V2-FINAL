import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X } from 'lucide-react';
import Header from '../components/Header';

interface City {
  id: string;
  nama: string;
  lokasi: string;
}

const CitySelector = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Try to get from local storage first
        const cachedCities = localStorage.getItem('citiesList');
        
        if (cachedCities) {
          try {
            const parsedCities = JSON.parse(cachedCities);
            if (Array.isArray(parsedCities)) {
              setCities(parsedCities);
              setFilteredCities(parsedCities);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing cached cities:', parseError);
            // Continue to fetch from API if parse fails
          }
        }
        
        // Fetch from API if not in cache
        const response = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
        const data = await response.json();
        
        if (data && data.data && Array.isArray(data.data)) {
          // Ensure all city objects have the expected properties
          const sanitizedData = data.data.map((city: any) => ({
            id: city.id || '',
            nama: city.nama || '',
            lokasi: city.lokasi || ''
          }));
          setCities(sanitizedData);
          setFilteredCities(sanitizedData);
          // Cache the cities
          localStorage.setItem('citiesList', JSON.stringify(sanitizedData));
        } else {
          // Fallback to empty array if API returns unexpected format
          setCities([]);
          setFilteredCities([]);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCities();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city => {
        const searchQueryLower = searchQuery.toLowerCase();
        const cityNameLower = city.nama ? city.nama.toLowerCase() : '';
        const cityLocationLower = city.lokasi ? city.lokasi.toLowerCase() : '';
        
        return cityNameLower.includes(searchQueryLower) || 
               cityLocationLower.includes(searchQueryLower);
      });
      setFilteredCities(filtered);
    }
  }, [searchQuery, cities]);
  
  const handleSelectCity = (city: City) => {
    localStorage.setItem('selectedCity', JSON.stringify({
      id: city.id,
      name: `${city.nama}, ${city.lokasi}`
    }));
    navigate(-1);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header title="Select City" showBack />
      
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {filteredCities.length} cities found
            </p>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCities.map(city => (
                <div 
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className="flex items-center gap-3 py-3 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <MapPin size={16} className="text-emerald-500" />
                  <div>
                    <p className="font-medium">{city.nama}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{city.lokasi}</p>
                  </div>
                </div>
              ))}
              
              {filteredCities.length === 0 && (
                <div className="py-4 text-center text-gray-500">
                  No cities found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySelector;
