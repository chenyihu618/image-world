'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps { title?: string; transparent?: boolean; }

export default function Navbar({ title, transparent }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => { setLoggedIn(!!localStorage.getItem('token')); }, []);

  const handleLogout = () => { localStorage.removeItem('token'); setLoggedIn(false); router.push('/'); };

  return (
    <nav className={'fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors duration-500 ' + (transparent ? 'bg-transparent' : 'bg-black/60 backdrop-blur-md border-b border-white/10')}>
      <div className="flex items-center gap-4">
        {!isHome && <button onClick={() => window.history.back()} className="text-white/70 hover:text-white p-1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z"/></svg></div>
          <span className="text-white font-medium text-sm tracking-wider hidden sm:inline">影展地图</span>
        </Link>
      </div>
      {title && <div className="absolute left-1/2 -translate-x-1/2"><span className="text-white/80 text-sm font-medium truncate max-w-[200px] block">{title}</span></div>}
      <div className="flex items-center gap-3">
        {!isHome && <Link href="/" className="text-white/50 hover:text-white/80 text-xs hidden sm:inline">地球</Link>}
        {loggedIn ? (<><Link href="/admin" className="text-white/50 hover:text-white/80 text-xs">管理</Link><button onClick={handleLogout} className="text-white/50 hover:text-white/80 text-xs">退出</button></>) : (<Link href="/login" className="px-4 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10">登录 / 注册</Link>)}
      </div>
    </nav>
  );
}