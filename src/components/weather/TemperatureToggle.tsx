'use client';

import { useWeatherStore, type TemperatureUnit } from '@/lib/store';

export default function TemperatureToggle() {
  const { unit, setUnit } = useWeatherStore();

  return (
    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          unit === 'metric'
            ? 'bg-white text-gray-900 shadow-lg'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setUnit('metric')}
      >
        °C
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          unit === 'imperial'
            ? 'bg-white text-gray-900 shadow-lg'
            : 'text-white/70 hover:text-white'
        }`}
        onClick={() => setUnit('imperial')}
      >
        °F
      </button>
    </div>
  );
}
