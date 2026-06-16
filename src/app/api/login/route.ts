import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    const user = await getUserByUsername(username);
    if (!user) return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    const token = signToken({ userId: user.id, username: user.username, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } });
  } catch (e) { return NextResponse.json({ error: '服务器错误' }, { status: 500 }); }
}