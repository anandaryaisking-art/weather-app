'use client';

import { Star, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FavoriteCity {
  id: string;
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface FavoriteCitiesProps {
  favorites: FavoriteCity[];
  onSelect: (lat: number, lon: number, name: string) => void;
  onRemove: (id: string) => void;
}

export default function FavoriteCities({ favorites, onSelect, onRemove }: FavoriteCitiesProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        Favorite Cities
      </h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 hover:bg-white/15 transition-all duration-300"
          >
            <button
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => onSelect(fav.latitude, fav.longitude, fav.city)}
            >
              <MapPin className="h-3.5 w-3.5" />
              {fav.city}
              {fav.country && <span className="text-muted-foreground">, {fav.country}</span>}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
              onClick={() => onRemove(fav.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
