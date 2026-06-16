 'use client';
 
 import { useState } from 'react';
 import { useRouter } from 'next/navigation';
 import Navbar from '@/components/Navbar';
 
 export default function LoginPage() {
   const router = useRouter();
   const [tab, setTab] = useState<'login' | 'register'>('login');
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [email, setEmail] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault(); setError(''); setLoading(true);
     try {
       const url = tab === 'login' ? '/api/login' : '/api/register';
       const body = { username, password, ...(tab === 'register' ? { email } : {}) };
       const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
       const data = await res.json();
       if (!res.ok) { setError(data.error || '操作失败'); return; }
       localStorage.setItem('token', data.token);
       router.push('/admin');
     } catch { setError('网络错误'); } finally { setLoading(false); }
   };
 
   return (
     <main className="min-h-screen bg-[#0a0e1a] flex flex-col">
       <Navbar title={tab === 'login' ? '登录' : '注册'} />
       <div className="flex-1 flex items-center justify-center p-6">
         <div className="w-full max-w-sm">
           <div className="flex mb-8 bg-white/5 rounded-lg p-1">
             <button onClick={() => setTab('login')} className={'flex-1 py-2 text-sm rounded-md transition-all ' + (tab === 'login' ? 'bg-white/10 text-white' : 'text-white/40')}>登录</button>
             <button onClick={() => setTab('register')} className={'flex-1 py-2 text-sm rounded-md transition-all ' + (tab === 'register' ? 'bg-white/10 text-white' : 'text-white/40')}>注册</button>
           </div>
           <form onSubmit={handleSubmit} className="space-y-4">
             <input type="text" placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm" required />
             {tab === 'register' && <input type="email" placeholder="邮箱（可选）" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm" />}
             <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm" required />
             {error && <p className="text-red-400 text-sm">{error}</p>}
             <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-all disabled:opacity-50">{loading ? '处理中...' : (tab === 'login' ? '登录' : '注册')}</button>
           </form>
         </div>
       </div>
     </main>
   );
 }
