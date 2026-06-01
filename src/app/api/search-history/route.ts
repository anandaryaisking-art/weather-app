import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  if (!db) {
    return NextResponse.json([]);
  }

  try {
    const history = await db.searchHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Search history fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not available', code: 'DB_UNAVAILABLE' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await db.searchHistory.delete({ where: { id } });
    } else {
      await db.searchHistory.deleteMany();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search history delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history', code: 'DB_ERROR' },
      { status: 500 }
    );
  }
}
