 'use client';
 
 import { useState, useEffect } from 'react';
 import { useRouter } from 'next/navigation';
 import Navbar from '@/components/Navbar';
 
 interface Spot { id: string; name: string; province: string; country: string; description: string; tags: string[]; images: string[]; }
 
 export default function AdminPage() {
   const router = useRouter();
   const [spots, setSpots] = useState<Spot[]>([]);
   const [loading, setLoading] = useState(true);
   const [token, setToken] = useState<string | null>(null);
   const [showNewForm, setShowNewForm] = useState(false);
   const [editSpot, setEditSpot] = useState<Spot | null>(null);
   const [form, setForm] = useState({ code: '', name: '', nameEn: '', description: '', culture: '', history: '', latitude: '', longitude: '', province: '', country: '', tags: '' });
   const [uploadFiles, setUploadFiles] = useState<File[]>([]);
   const [uploading, setUploading] = useState(false);
   const [uploadTarget, setUploadTarget] = useState('');
 
   useEffect(() => {
     const t = localStorage.getItem('token');
     setToken(t);
     if (!t) { router.push('/login'); return; }
     fetch('/api/spots', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()).then(setSpots).catch(() => {}).finally(() => setLoading(false));
   }, []);
 
   const handleUpload = async () => {
     if (!uploadFiles.length || !uploadTarget) return;
     setUploading(true);
     for (const file of uploadFiles) {
       const fd = new FormData();
       fd.append('file', file); fd.append('spotId', uploadTarget);
       await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
     }
     setUploadFiles([]); setUploading(false);
     alert('上传完成！请刷新页面');
   };
 
   if (!token) return null;
 
   return (
     <main className="min-h-screen bg-[#0a0e1a]">
       <Navbar title="管理后台" />
       <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">
         <div className="flex items-center justify-between mb-8">
           <div><h1 className="text-white text-xl font-medium">景区管理</h1><p className="text-white/40 text-sm mt-1">共 {spots.length} 个景区</p></div>
           <button onClick={() => setShowNewForm(!showNewForm)} className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm">添加景区</button>
         </div>
 
         {/* 添加/编辑表单 */}
         {(showNewForm || editSpot) && (
           <div className="mb-8 p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
             <h2 className="text-white text-base font-medium">{editSpot ? '编辑景区' : '新景区'}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <input placeholder="编码 (如 huangshan)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="名称 (如 黄山)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="英文名" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="国家" value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="省份" value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="纬度" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="经度" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
               <input placeholder="标签 (逗号分隔)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
             </div>
             <textarea placeholder="简介" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none" />
             <div className="flex gap-3">
               <button onClick={() => { setShowNewForm(false); setEditSpot(null); }} className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm">取消</button>
               <button className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm">保存（后续需连数据库）</button>
             </div>
           </div>
         )}
 
         {/* 景区列表 */}
         {loading ? (
           <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto" /></div>
         ) : (
           <div className="space-y-3">
             {spots.map(spot => (
               <div key={spot.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors flex items-start justify-between gap-4">
                 <div className="flex-1 min-w-0">
                   <h3 className="text-white font-medium">{spot.name} <span className="text-white/30 text-xs ml-2">{spot.id}</span></h3>
                   <p className="text-white/40 text-xs mt-1">{spot.country} · {spot.province}</p>
                   <div className="flex gap-2 mt-2 flex-wrap">
                     {spot.tags?.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">{t}</span>)}
                   </div>
                   <div className="mt-2 flex gap-3">
                     {/* 批量上传 */}
                     <label className="text-blue-400/80 hover:text-blue-400 text-xs cursor-pointer">
                       上传照片
                       <input type="file" multiple accept="image/*" className="hidden" onChange={e => { setUploadTarget(spot.id); setUploadFiles(Array.from(e.target.files || [])); setTimeout(handleUpload, 100); }} />
                     </label>
                     <button onClick={() => router.push(`/scenic/${spot.id}`)} className="text-blue-400/80 hover:text-blue-400 text-xs">查看</button>
                   </div>
                 </div>
                 <span className="text-white/20 text-xs">{spot.images?.length || 0} 张</span>
               </div>
             ))}
           </div>
         )}
       </div>
     </main>
   );
 }
