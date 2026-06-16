import { NextResponse } from 'next/server';
import { getScenicSpots } from '@/lib/db';

export async function GET() {
  const spots = await getScenicSpots();
  return NextResponse.json(spots);
}