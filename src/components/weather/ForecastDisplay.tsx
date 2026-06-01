'use client';

import { Droplets, Wind } from 'lucide-react';
import type { ForecastData } from '@/lib/weather-api';
import { getWeatherIconUrl } from '@/lib/weather-api';
import { processForecastDays, getDayName } from './weather-utils';

interface ForecastDisplayProps {
  data: ForecastData;
  unit: 'metric' | 'imperial';
}

export default function ForecastDisplay({ data, unit }: ForecastDisplayProps) {
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';
  const dailyForecasts = processForecastDays(data);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground">5-Day Forecast</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {dailyForecasts.map((day) => (
          <div
            key={day.date}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground mb-1">
                {getDayName(day.date)}
              </div>
              <div className="text-xs text-muted-foreground mb-3">{day.date}</div>

              <img
                src={getWeatherIconUrl(day.weather.icon)}
                alt={day.weather.description}
                className="w-16 h-16 mx-auto drop-shadow-lg"
              />

              <div className="capitalize text-sm text-foreground/80 mb-3">
                {day.weather.description}
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg font-bold text-foreground">
                  {Math.round(day.tempMax)}{tempUnit}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(day.tempMin)}{tempUnit}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span>{Math.round(day.pop * 100)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>{day.windSpeed.toFixed(1)} {speedUnit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
