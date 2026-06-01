import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather, getCurrentWeatherByCoords, WeatherApiError } from '@/lib/weather-api';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const units = (searchParams.get('units') as 'metric' | 'imperial') || 'metric';

    let data;

    if (lat && lon) {
      data = await getCurrentWeatherByCoords(parseFloat(lat), parseFloat(lon), units);
    } else if (city) {
      const sanitizedCity = city.trim().slice(0, 100);
      if (!sanitizedCity) {
        return NextResponse.json(
          { error: 'City name is required', code: 'INVALID_INPUT' },
          { status: 400 }
        );
      }
      data = await getCurrentWeather(sanitizedCity, units);
    } else {
      return NextResponse.json(
        { error: 'Either city name or coordinates (lat, lon) are required', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Save to search history (non-blocking, graceful failure)
    if (db) {
      try {
        await db.searchHistory.create({
          data: {
            city: data.name,
            country: data.sys.country,
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            ipAddress: request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || null,
          },
        });
      } catch (dbError) {
        console.error('Failed to save search history:', dbError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
