import { NextRequest, NextResponse } from 'next/server';
import { getForecast, getForecastByCoords, WeatherApiError } from '@/lib/weather-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const units = (searchParams.get('units') as 'metric' | 'imperial') || 'metric';

    let data;

    if (lat && lon) {
      data = await getForecastByCoords(parseFloat(lat), parseFloat(lon), units);
    } else if (city) {
      const sanitizedCity = city.trim().slice(0, 100);
      if (!sanitizedCity) {
        return NextResponse.json(
          { error: 'City name is required', code: 'INVALID_INPUT' },
          { status: 400 }
        );
      }
      data = await getForecast(sanitizedCity, units);
    } else {
      return NextResponse.json(
        { error: 'Either city name or coordinates (lat, lon) are required', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error('Forecast API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
