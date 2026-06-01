import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  if (!db) {
    return NextResponse.json({
      totalSearches: 0,
      mostSearchedCities: [],
      searchesPerDay: [],
      recentSearches: [],
    });
  }

  try {
    // Total searches
    const totalSearches = await db.searchHistory.count();

    // Most searched cities
    const mostSearched = await db.searchHistory.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    const mostSearchedCities = mostSearched.map((item) => ({
      city: item.city,
      count: item._count.city,
    }));

    // Searches per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSearches = await db.searchHistory.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
    });

    // Group by day
    const searchesPerDay: Record<string, number> = {};
    recentSearches.forEach((search) => {
      const day = search.createdAt.toISOString().split('T')[0];
      searchesPerDay[day] = (searchesPerDay[day] || 0) + 1;
    });

    const searchesPerDayArray = Object.entries(searchesPerDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent searches (last 10)
    const recentSearchesList = await db.searchHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      totalSearches,
      mostSearchedCities,
      searchesPerDay: searchesPerDayArray,
      recentSearches: recentSearchesList,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({
      totalSearches: 0,
      mostSearchedCities: [],
      searchesPerDay: [],
      recentSearches: [],
    });
  }
}
