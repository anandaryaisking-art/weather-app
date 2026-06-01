import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  if (!db) {
    return NextResponse.json([]);
  }

  try {
    const favorites = await db.favoriteCity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available', code: 'DB_UNAVAILABLE' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { city, country, latitude, longitude } = body;

    if (!city || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'City, latitude, and longitude are required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const favorite = await db.favoriteCity.create({
      data: {
        city,
        country: country || null,
        latitude,
        longitude,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'City already in favorites', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    console.error('Favorites create error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite', code: 'DB_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available', code: 'DB_UNAVAILABLE' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Favorite ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    await db.favoriteCity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite', code: 'DB_ERROR' },
      { status: 500 }
    );
  }
}
