const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org';

export interface CurrentWeatherData {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  name: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
    wind: { speed: number; deg: number; gust?: number };
    visibility: number;
    pop: number;
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export class WeatherApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
  }
}

async function fetchFromOpenWeather(endpoint: string, params: Record<string, string>) {
  if (!OPENWEATHER_API_KEY) {
    throw new WeatherApiError(
      'OpenWeatherMap API key is not configured. Please set OPENWEATHERMAP_API_KEY in your environment variables.',
      500,
      'MISSING_API_KEY'
    );
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('appid', OPENWEATHER_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), { next: { revalidate: 300 } });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'An error occurred fetching weather data';
    const code = errorData.cod?.toString() || response.status.toString();

    if (response.status === 404) {
      throw new WeatherApiError('City not found. Please check the spelling and try again.', 404, 'CITY_NOT_FOUND');
    }
    if (response.status === 401) {
      throw new WeatherApiError('Invalid API key. Please check your OpenWeatherMap API key.', 401, 'INVALID_API_KEY');
    }
    if (response.status === 429) {
      throw new WeatherApiError('API rate limit exceeded. Please try again in a few minutes.', 429, 'RATE_LIMIT');
    }
    throw new WeatherApiError(message, response.status, code);
  }

  return response.json();
}

export async function getCurrentWeather(city: string, units: 'metric' | 'imperial' = 'metric'): Promise<CurrentWeatherData> {
  return fetchFromOpenWeather('/data/2.5/weather', { q: city, units });
}

export async function getCurrentWeatherByCoords(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): Promise<CurrentWeatherData> {
  return fetchFromOpenWeather('/data/2.5/weather', { lat: lat.toString(), lon: lon.toString(), units });
}

export async function getForecast(city: string, units: 'metric' | 'imperial' = 'metric'): Promise<ForecastData> {
  return fetchFromOpenWeather('/data/2.5/forecast', { q: city, units });
}

export async function getForecastByCoords(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): Promise<ForecastData> {
  return fetchFromOpenWeather('/data/2.5/forecast', { lat: lat.toString(), lon: lon.toString(), units });
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  return fetchFromOpenWeather('/geo/1.0/direct', { q: query, limit: '5' });
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function getWeatherBackground(weatherMain: string, isDark: boolean): string {
  const backgrounds: Record<string, string> = {
    Clear: isDark
      ? 'linear-gradient(135deg, #0c1445 0%, #1a237e 30%, #283593 60%, #1565c0 100%)'
      : 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 30%, #039be5 60%, #0277bd 100%)',
    Clouds: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #2d3748 30%, #4a5568 60%, #2d3748 100%)'
      : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 30%, #78909c 60%, #607d8b 100%)',
    Rain: isDark
      ? 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #1a3a4a 60%, #2c3e50 100%)'
      : 'linear-gradient(135deg, #546e7a 0%, #455a64 30%, #37474f 60%, #263238 100%)',
    Drizzle: isDark
      ? 'linear-gradient(135deg, #1a2a3a 0%, #2c3e50 30%, #34495e 60%, #2c3e50 100%)'
      : 'linear-gradient(135deg, #78909c 0%, #607d8b 30%, #546e7a 60%, #455a64 100%)',
    Thunderstorm: isDark
      ? 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a1a2e 60%, #0d0d1a 100%)'
      : 'linear-gradient(135deg, #4a4a6a 0%, #3d3d5c 30%, #2d2d4a 60%, #1a1a2e 100%)',
    Snow: isDark
      ? 'linear-gradient(135deg, #1a2332 0%, #2c3e50 30%, #4a6178 60%, #34495e 100%)'
      : 'linear-gradient(135deg, #e0e7ee 0%, #cfd8dc 30%, #b0bec5 60%, #90a4ae 100%)',
    Mist: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 30%, #3d3d5c 60%, #2d2d44 100%)'
      : 'linear-gradient(135deg, #cfd8dc 0%, #b0bec5 30%, #90a4ae 60%, #78909c 100%)',
    Haze: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 30%, #3d3d5c 60%, #2d2d44 100%)'
      : 'linear-gradient(135deg, #c9bca0 0%, #b8a990 30%, #a69880 60%, #948770 100%)',
    Fog: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 30%, #3d3d5c 60%, #2d2d44 100%)'
      : 'linear-gradient(135deg, #cfd8dc 0%, #b0bec5 30%, #90a4ae 60%, #78909c 100%)',
    Dust: isDark
      ? 'linear-gradient(135deg, #2d1b0e 0%, #3e2723 30%, #4e342e 60%, #3e2723 100%)'
      : 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 30%, #a1887f 60%, #8d6e63 100%)',
    Sand: isDark
      ? 'linear-gradient(135deg, #2d1b0e 0%, #3e2723 30%, #4e342e 60%, #3e2723 100%)'
      : 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 30%, #a1887f 60%, #8d6e63 100%)',
    Ash: isDark
      ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 30%, #3d3d5c 60%, #2d2d44 100%)'
      : 'linear-gradient(135deg, #9e9e9e 0%, #757575 30%, #616161 60%, #424242 100%)',
    Squall: isDark
      ? 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #1a3a4a 60%, #2c3e50 100%)'
      : 'linear-gradient(135deg, #546e7a 0%, #455a64 30%, #37474f 60%, #263238 100%)',
    Tornado: isDark
      ? 'linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 30%, #1a1a1a 60%, #0d0d0d 100%)'
      : 'linear-gradient(135deg, #616161 0%, #424242 30%, #303030 60%, #212121 100%)',
  };

  return backgrounds[weatherMain] || backgrounds.Clear;
}

export function formatLocalTime(dt: number, timezone: number): string {
  const utcTime = new Date(dt * 1000);
  const localTime = new Date(utcTime.getTime() + timezone * 1000);
  return localTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}
