'use client';

import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Heart,
  HeartOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CurrentWeatherData } from '@/lib/weather-api';
import { getWeatherIconUrl, formatLocalTime, getWeatherBackground } from '@/lib/weather-api';
import { getWindDirection, formatVisibility, formatPressure } from './weather-utils';
import { useWeatherStore } from '@/lib/store';

interface CurrentWeatherProps {
  data: CurrentWeatherData;
  unit: 'metric' | 'imperial';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function CurrentWeather({ data, unit, isFavorite, onToggleFavorite }: CurrentWeatherProps) {
  const { isDarkMode } = useWeatherStore();
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';
  const weatherMain = data.weather[0]?.main || 'Clear';
  const background = getWeatherBackground(weatherMain, isDarkMode);

  return (
    <div
      className="relative rounded-3xl overflow-hidden p-6 md:p-8 text-white"
      style={{ background }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {weatherMain === 'Rain' || weatherMain === 'Drizzle' ? (
          Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-4 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `rain-fall ${0.5 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))
        ) : weatherMain === 'Snow' ? (
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `snow-fall ${3 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))
        ) : weatherMain === 'Clear' ? (
          <div className="absolute top-8 right-12 w-20 h-20 rounded-full bg-yellow-300/20 animate-pulse" />
        ) : null}
      </div>

      <div className="relative z-10">
        {/* Header: City name, date, favorite */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl md:text-4xl font-bold">{data.name}</h2>
              {data.sys.country && (
                <span className="text-lg md:text-xl font-medium opacity-80">
                  {data.sys.country}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base opacity-80 mt-1">
              {formatLocalTime(data.dt, data.timezone)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-white/20 text-white"
            onClick={onToggleFavorite}
          >
            {isFavorite ? (
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            ) : (
              <HeartOff className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Main temperature and icon */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-7xl md:text-9xl font-thin leading-none">
              {Math.round(data.main.temp)}
              <span className="text-4xl md:text-5xl align-top">{tempUnit}</span>
            </div>
            <p className="text-xl md:text-2xl mt-2 capitalize opacity-90">
              {data.weather[0]?.description}
            </p>
          </div>
          <img
            src={getWeatherIconUrl(data.weather[0]?.icon || '01d')}
            alt={data.weather[0]?.description || 'Weather'}
            className="w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
          />
        </div>

        {/* Feels like and high/low */}
        <div className="flex items-center gap-6 mb-6 text-base md:text-lg">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            <span>Feels like {Math.round(data.main.feels_like)}{tempUnit}</span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <span>H: {Math.round(data.main.temp_max)}{tempUnit}</span>
            <span>L: {Math.round(data.main.temp_min)}{tempUnit}</span>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DetailCard
            icon={<Droplets className="h-5 w-5" />}
            label="Humidity"
            value={`${data.main.humidity}%`}
          />
          <DetailCard
            icon={<Wind className="h-5 w-5" />}
            label="Wind"
            value={`${data.wind.speed} ${speedUnit} ${getWindDirection(data.wind.deg)}`}
          />
          <DetailCard
            icon={<Gauge className="h-5 w-5" />}
            label="Pressure"
            value={formatPressure(data.main.pressure)}
          />
          <DetailCard
            icon={<Eye className="h-5 w-5" />}
            label="Visibility"
            value={formatVisibility(data.visibility)}
          />
          <DetailCard
            icon={<Sunrise className="h-5 w-5" />}
            label="Sunrise"
            value={new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <DetailCard
            icon={<Sunset className="h-5 w-5" />}
            label="Sunset"
            value={new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <DetailCard
            icon={<Droplets className="h-5 w-5" />}
            label="Cloudiness"
            value={`${data.clouds.all}%`}
          />
          {data.wind.gust && (
            <DetailCard
              icon={<Wind className="h-5 w-5" />}
              label="Gust"
              value={`${data.wind.gust} ${speedUnit}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
      <div className="text-white/70">{icon}</div>
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
