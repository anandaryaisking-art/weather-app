import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TemperatureUnit = 'metric' | 'imperial';

interface WeatherState {
  unit: TemperatureUnit;
  selectedCity: string | null;
  isDarkMode: boolean;
  setUnit: (unit: TemperatureUnit) => void;
  setSelectedCity: (city: string | null) => void;
  toggleDarkMode: () => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      unit: 'metric',
      selectedCity: null,
      isDarkMode: false,
      setUnit: (unit) => set({ unit }),
      setSelectedCity: (city) => set({ selectedCity: city }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'weather-app-storage',
      partialize: (state) => ({ unit: state.unit, isDarkMode: state.isDarkMode }),
    }
  )
);
