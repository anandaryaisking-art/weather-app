'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CloudSun, BarChart3, History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import WeatherSearch from '@/components/weather/WeatherSearch';
import CurrentWeather from '@/components/weather/CurrentWeather';
import ForecastDisplay from '@/components/weather/ForecastDisplay';
import TemperatureToggle from '@/components/weather/TemperatureToggle';
import FavoriteCities from '@/components/weather/FavoriteCities';
import AnalyticsDashboard from '@/components/weather/AnalyticsDashboard';
import WeatherBackground from '@/components/weather/WeatherBackground';
import DarkModeToggle from '@/components/weather/DarkModeToggle';
import { useWeatherStore } from '@/lib/store';
import type { CurrentWeatherData, ForecastData } from '@/lib/weather-api';
import { getWeatherBackground } from '@/lib/weather-api';

interface FavoriteCity {
  id: string;
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  createdAt: string; 
}

interface SearchHistoryItem {
  id: string;
  city: string;
  country: string | null;
  createdAt: string;
}

export default function Home() {
  const { unit, isDarkMode } = useWeatherStore();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('weather');
  const [weatherMain, setWeatherMain] = useState('Clear');

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load favorites and search history
  useEffect(() => {
    loadFavorites();
    loadSearchHistory();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const res = await fetch('/api/search-history');
      if (res.ok) {
        const data = await res.json();
        setSearchHistory(data);
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  const fetchWeatherData = useCallback(
    async (city: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`/api/weather?city=${encodeURIComponent(city)}&units=${unit}`),
          fetch(`/api/forecast?city=${encodeURIComponent(city)}&units=${unit}`),
        ]);

        if (!weatherRes.ok) {
          const errData = await weatherRes.json();
          throw new Error(errData.error || 'Failed to fetch weather data');
        }

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.ok ? await forecastRes.json() : null;

        setCurrentWeather(weatherData);
        setForecast(forecastData);
        setWeatherMain(weatherData.weather[0]?.main || 'Clear');
        loadSearchHistory();
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [unit]
  );

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${unit}`),
          fetch(`/api/forecast?lat=${lat}&lon=${lon}&units=${unit}`),
        ]);

        if (!weatherRes.ok) {
          const errData = await weatherRes.json();
          throw new Error(errData.error || 'Failed to fetch weather data');
        }

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.ok ? await forecastRes.json() : null;

        setCurrentWeather(weatherData);
        setForecast(forecastData);
        setWeatherMain(weatherData.weather[0]?.main || 'Clear');
        loadSearchHistory();
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [unit]
  );

  const handleCitySelect = (city: string) => {
    fetchWeatherData(city);
  };

  const handleCoordsSelect = (lat: number, lon: number, name: string) => {
    fetchWeatherByCoords(lat, lon);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        setIsGeolocating(false);
      },
      (error) => {
        let message = 'Failed to get your location';
        if (error.code === 1) message = 'Location access was denied';
        if (error.code === 2) message = 'Location information is unavailable';
        if (error.code === 3) message = 'Location request timed out';
        toast.error(message);
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const toggleFavorite = async () => {
    if (!currentWeather) return;

    const existingFav = favorites.find(
      (f) =>
        f.city === currentWeather.name &&
        f.country === currentWeather.sys.country
    );

    if (existingFav) {
      try {
        const res = await fetch(`/api/favorites?id=${existingFav.id}`, { method: 'DELETE' });
        if (res.ok) {
          setFavorites((prev) => prev.filter((f) => f.id !== existingFav.id));
          toast.success('Removed from favorites');
        }
      } catch (err) {
        toast.error('Failed to remove favorite');
      }
    } else {
      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: currentWeather.name,
            country: currentWeather.sys.country,
            latitude: currentWeather.coord.lat,
            longitude: currentWeather.coord.lon,
          }),
        });

        if (res.ok) {
          const newFav = await res.json();
          setFavorites((prev) => [newFav, ...prev]);
          toast.success('Added to favorites');
        } else {
          const errData = await res.json();
          toast.error(errData.error || 'Failed to add favorite');
        }
      } catch (err) {
        toast.error('Failed to add favorite');
      }
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/favorites?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      toast.error('Failed to remove favorite');
    }
  };

  const clearHistory = async () => {
    try {
      const res = await fetch('/api/search-history', { method: 'DELETE' });
      if (res.ok) {
        setSearchHistory([]);
        toast.success('Search history cleared');
      }
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const isFavorite = currentWeather
    ? favorites.some(
        (f) => f.city === currentWeather.name && f.country === currentWeather.sys.country
      )
    : false;

  const appBackground = currentWeather
    ? getWeatherBackground(weatherMain, isDarkMode)
    : isDarkMode
    ? 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #0d1b2a 100%)'
    : 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 50%, #039be5 100%)';

  return (
    <WeatherBackground weatherMain={weatherMain}>
      <div
        className="min-h-screen transition-all duration-1000"
        style={{ background: appBackground }}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudSun className="h-7 w-7 text-white" />
              <h1 className="text-xl font-bold text-white tracking-tight">WeatherNow</h1>
            </div>
            <div className="flex items-center gap-3">
              <TemperatureToggle />
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Search */}
          <WeatherSearch
            onCitySelect={handleCitySelect}
            onCoordsSelect={handleCoordsSelect}
            onGeolocate={handleGeolocate}
            isGeolocating={isGeolocating}
          />

          {/* Favorites */}
          <FavoriteCities
            favorites={favorites}
            onSelect={handleCoordsSelect}
            onRemove={removeFavorite}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-white/80" />
              <p className="mt-4 text-white/70 text-lg">Fetching weather data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="max-w-md mx-auto bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 text-center">
              <p className="text-white text-lg font-medium">{error}</p>
              <p className="text-white/70 text-sm mt-2">Please try searching for another city</p>
            </div>
          )}

          {/* Weather Content */}
          {!isLoading && !error && currentWeather && (
            <div className="space-y-6">
              <CurrentWeather
                data={currentWeather}
                unit={unit}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
              {forecast && <ForecastDisplay data={forecast} unit={unit} />}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && !currentWeather && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <CloudSun className="h-16 w-16 text-white/60" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Welcome to WeatherNow</h2>
              <p className="text-white/70 text-lg max-w-md">
                Search for any city to get current weather conditions and a 5-day forecast.
                You can also use your current location.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  onClick={handleGeolocate}
                >
                  <CloudSun className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>
              </div>
            </div>
          )}

          {/* Tabs for Analytics and History */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/10 backdrop-blur-md border border-white/10">
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <AnalyticsDashboard isDarkMode={isDarkMode} />
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Search History</h3>
                    {searchHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={clearHistory}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  {searchHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No search history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => handleCitySelect(item.city)}
                        >
                          <div>
                            <span className="font-medium text-foreground">{item.city}</span>
                            {item.country && (
                              <span className="text-muted-foreground ml-2">({item.country})</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 bg-black/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-white/50 text-sm">
            WeatherNow — Powered by OpenWeatherMap API | Built with Next.js, TypeScript & Tailwind CSS
          </div>
        </footer>
      </div>
    </WeatherBackground>
  );
}
