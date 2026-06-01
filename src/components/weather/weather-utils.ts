import type { CurrentWeatherData, ForecastData } from '@/lib/weather-api';

export function processForecastDays(forecastData: ForecastData) {
  const dailyForecasts: Record<string, typeof forecastData.list> = {};

  forecastData.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(item);
  });

  return Object.entries(dailyForecasts)
    .slice(0, 5)
    .map(([date, items]) => {
      const middayItem = items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
      const minTemp = Math.min(...items.map((i) => i.main.temp_min));
      const maxTemp = Math.max(...items.map((i) => i.main.temp_max));
      const maxPop = Math.max(...items.map((i) => i.pop));

      return {
        date,
        weather: middayItem.weather[0],
        tempMin: minTemp,
        tempMax: maxTemp,
        humidity: middayItem.main.humidity,
        windSpeed: middayItem.wind.speed,
        pop: maxPop,
        items,
      };
    });
}

export function getWeatherAnimation(weatherMain: string): string {
  const animations: Record<string, string> = {
    Clear: 'animate-clear-sky',
    Clouds: 'animate-clouds',
    Rain: 'animate-rain',
    Drizzle: 'animate-drizzle',
    Thunderstorm: 'animate-thunderstorm',
    Snow: 'animate-snow',
    Mist: 'animate-mist',
    Fog: 'animate-fog',
    Haze: 'animate-haze',
  };
  return animations[weatherMain] || animations.Clear;
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function formatPressure(hPa: number): string {
  return `${hPa} hPa`;
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getUVLevel(uvi: number): { level: string; color: string } {
  if (uvi <= 2) return { level: 'Low', color: 'text-green-500' };
  if (uvi <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
  if (uvi <= 7) return { level: 'High', color: 'text-orange-500' };
  if (uvi <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
}
