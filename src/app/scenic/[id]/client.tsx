 'use client';
 
 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import Navbar from '@/components/Navbar';
 import Gallery from '@/components/Gallery';
 import TravelNotes from '@/components/TravelNotes';
 import type { ScenicSpot } from '@/lib/types';
 
 interface Props {
   spot: ScenicSpot;
 }
 
 export default function ClientScenicPage({ spot }: Props) {
   const [activeSection, setActiveSection] = useState<'culture' | 'history'>('culture');
 
   return (
     <main className="min-h-screen bg-[#0a0e1a]">
       <Navbar title={`${spot.name} · ${spot.province}`} />
 
       {/* ── Hero 区域 ────────────────────────────────── */}
       <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
         {/* 背景 */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950">
           {spot.images.length > 0 && (
             // eslint-disable-next-line @next/next/no-img-element
             <img
               src={spot.images[0]}
               alt={spot.name}
               className="w-full h-full object-cover opacity-30"
               onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
           )}
         </div>
         {/* 渐变遮罩 */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
 
         {/* 标题 */}
         <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
             <div className="flex flex-wrap gap-2 mb-3">
               {spot.tags.map((tag) => (
                 <span
                   key={tag}
                   className="px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs border border-white/10"
                 >
                   {tag}
                 </span>
               ))}
             </div>
             <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
               {spot.name}
             </h1>
             <p className="text-white/50 text-sm sm:text-base">
               {spot.country} · {spot.province}
             </p>
           </motion.div>
         </div>
       </section>
 
       {/* ── 内容区 ──────────────────────────────────── */}
       <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-10 relative z-10 pb-20">
         {/* 简介卡片 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 mb-10"
         >
           <p className="text-white/80 text-base sm:text-lg leading-relaxed tracking-wide">
             {spot.description}
           </p>
         </motion.div>
 
         {/* 文化与历史 */}
         <section className="mb-12">
           <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
             <button
               onClick={() => setActiveSection('culture')}
               className={`text-sm font-medium transition-colors ${
                 activeSection === 'culture'
                   ? 'text-blue-400 border-b-2 border-blue-400 -mb-[17px]'
                   : 'text-white/40 hover:text-white/60'
               }`}
             >
               文化
             </button>
             <button
               onClick={() => setActiveSection('history')}
               className={`text-sm font-medium transition-colors ${
                 activeSection === 'history'
                   ? 'text-blue-400 border-b-2 border-blue-400 -mb-[17px]'
                   : 'text-white/40 hover:text-white/60'
               }`}
             >
               历史
             </button>
           </div>
 
           <motion.div
             key={activeSection}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
           >
             <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap space-y-4">
               {(activeSection === 'culture' ? spot.culture : spot.history)
                 .split('\n\n')
                 .map((paragraph, i) => (
                   <p key={i}>{paragraph}</p>
                 ))}
             </div>
           </motion.div>
         </section>
 
         {/* ── 摄影画廊 ──────────────────────────────── */}
         <section className="mb-12">
           <h2 className="text-white text-xl font-medium mb-6">摄影作品</h2>
           <Gallery images={spot.images} spotName={spot.name} />
         </section>
 
         {/* ── 上传区域 ──────────────────────────────── */}
         <section className="mb-12">
           <h2 className="text-white text-xl font-medium mb-4">上传照片</h2>
           <p className="text-white/40 text-sm mb-4">
             分享你的 {spot.name} 摄影作品
           </p>
           <UploadSection spotId={spot.id} />
         </section>
 
         {/* ── 游记 ──────────────────────────────────── */}
         <section className="mb-12">
           <TravelNotes spotId={spot.id} />
         </section>
       </div>
     </main>
   );
 }
 
 // ── 上传组件 ─────────────────────────────────────
 function UploadSection({ spotId }: { spotId: string }) {
   const [uploading, setUploading] = useState(false);
   const [message, setMessage] = useState('');
 
   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     setUploading(true);
     setMessage('');
 
     const formData = new FormData();
     formData.append('file', file);
     formData.append('spotId', spotId);
 
     try {
       const res = await fetch('/api/upload', {
         method: 'POST',
         body: formData,
       });
       if (res.ok) {
         setMessage('上传成功！刷新页面查看');
       } else {
         setMessage('上传失败，请重试');
       }
     } catch {
       setMessage('上传出错，请重试');
     }
     setUploading(false);
   };
 
   return (
     <div className="p-5 rounded-xl bg-white/[0.03] border border-dashed border-white/20 hover:border-white/30 transition-all">
       <label className="flex flex-col items-center gap-3 cursor-pointer py-4">
         <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
           <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
         </svg>
         <span className="text-white/50 text-sm">
           {uploading ? '上传中...' : '点击选择照片上传'}
         </span>
         <input
           type="file"
           accept="image/*"
           onChange={handleUpload}
           disabled={uploading}
           className="hidden"
         />
       </label>
       {message && (
         <p className="text-center text-sm mt-2 text-white/60">{message}</p>
       )}
     </div>
   );
 }
