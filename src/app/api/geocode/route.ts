import { NextRequest, NextResponse } from 'next/server';
import { searchCities, WeatherApiError } from '@/lib/weather-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const sanitizedQuery = query.trim().slice(0, 100);
    const results = await searchCities(sanitizedQuery);

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
