import { NextRequest, NextResponse } from 'next/server';
import { getScenicSpots } from '@/lib/db';

export async function GET() {
  const spots = await getScenicSpots();
  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.code || !data.name) return NextResponse.json({ error: 'code和name不能为空' }, { status: 400 });
    return NextResponse.json({ message: 'POST /api/spots - DB write pending' });
  } catch (e) { return NextResponse.json({ error: '服务器错误' }, { status: 500 }); }
}