'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeatherStore } from '@/lib/store';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useWeatherStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 transition-all duration-300"
      onClick={toggleDarkMode}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-blue-200" />
      )}
    </Button>
  );
}
