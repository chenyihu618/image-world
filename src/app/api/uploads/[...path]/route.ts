import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import pathModule from 'path';

export async function GET(_: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segments } = await params;
    if (!segments || !segments.length) return new NextResponse('Bad Request', { status: 400 });
    const fullPath = pathModule.join(process.cwd(), 'public', 'uploads', ...segments);
    if (!fs.existsSync(fullPath)) return new NextResponse('Not Found', { status: 404 });
    const ext = pathModule.extname(fullPath).toLowerCase();
    const mime: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    const buffer = fs.readFileSync(fullPath);
    return new NextResponse(buffer, { headers: { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' } });
  } catch (e) {
    console.error('File serve error:', e);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}