import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const user = await getUserById(payload.userId);
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  return NextResponse.json({ id: user.id, username: user.username, displayName: user.display_name, role: user.role });
}