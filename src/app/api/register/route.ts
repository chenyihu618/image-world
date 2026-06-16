import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json();
    if (!username || !password) return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    if (username.length < 2) return NextResponse.json({ error: '用户名至少2个字符' }, { status: 400 });
    if (password.length < 4) return NextResponse.json({ error: '密码至少4个字符' }, { status: 400 });
    const existing = await getUserByUsername(username);
    if (existing) return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    const passwordHash = await hashPassword(password);
    const user = await createUser(username, passwordHash, email || '');
    if (!user) return NextResponse.json({ error: '注册失败，请确保数据库已连接' }, { status: 500 });
    const token = signToken({ userId: user.id, username: user.username, role: user.role });
    return NextResponse.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } });
  } catch (e) { return NextResponse.json({ error: '服务器错误' }, { status: 500 }); }
}