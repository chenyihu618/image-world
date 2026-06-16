import { NextResponse, NextRequest } from 'next/server';
import { getScenicSpot } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spot = await getScenicSpot(id);
  if (!spot) return NextResponse.json({ error: '景区不存在' }, { status: 404 });
  return NextResponse.json(spot);
}