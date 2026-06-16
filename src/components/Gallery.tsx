 'use client';
 
 import { useState, useCallback } from 'react';
 
 import { motion, AnimatePresence } from 'framer-motion';
 
 interface GalleryProps {
   images: string[];
   spotName: string;
 }
 
 export default function Gallery({ images, spotName }: GalleryProps) {
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
   const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
 
   const handlePrev = useCallback(() => {
     setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
   }, []);
 
   const handleNext = useCallback(() => {
     setSelectedIndex((i) =>
       i !== null && i < images.length - 1 ? i + 1 : i
     );
   }, [images.length]);
 
   const handleImgError = useCallback((idx: number) => {
     setImgErrors((prev) => new Set(prev).add(idx));
   }, []);
 
   if (!images || images.length === 0) {
     return (
       <div className="text-center py-16 text-white/30">
         <p>暂无照片</p>
         <p className="text-sm mt-2">将照片放入 public/images 目录即可显示</p>
       </div>
     );
   }
 
   return (
     <section>
       {/* 照片网格 */}
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
         {images.map((src, idx) => (
           <motion.button
             key={src}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: idx * 0.05, duration: 0.4 }}
             onClick={() => setSelectedIndex(idx)}
             className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
           >
             {imgErrors.has(idx) ? (
               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                 <div className="text-center">
                   <svg className="w-8 h-8 mx-auto mb-1 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                     <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   <p className="text-white/20 text-xs">{idx + 1}</p>
                 </div>
               </div>
             ) : (
               <img src={src}
                 alt={`${spotName} #${idx + 1}`} className="object-cover group-hover:scale-105 transition-transform duration-500" style={{ width: "100%", height: "100%", position: "absolute", inset: 0, objectFit: "cover" }} onError={() => handleImgError(idx)}
               />
             )}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
           </motion.button>
         ))}
       </div>
 
       {/* 灯箱 */}
       <AnimatePresence>
         {selectedIndex !== null && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
             onClick={() => setSelectedIndex(null)}
           >
             {/* 关闭 */}
             <button
               onClick={() => setSelectedIndex(null)}
               className="absolute top-4 right-4 text-white/60 hover:text-white p-2 z-10"
             >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
 
             {/* 上一张 */}
             {selectedIndex > 0 && (
               <button
                 onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M15 18l-6-6 6-6" />
                 </svg>
               </button>
             )}
 
             {/* 下一张 */}
             {selectedIndex < images.length - 1 && (
               <button
                 onClick={(e) => { e.stopPropagation(); handleNext(); }}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
               >
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M9 18l6-6-6-6" />
                 </svg>
               </button>
             )}
 
             {/* 计数器 + 下载 */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/50 text-sm z-10">
               <span>
                 {selectedIndex + 1} / {images.length}
               </span>
               <a
                 href={imgErrors.has(selectedIndex) ? undefined : images[selectedIndex]}
                 download
                 onClick={(e) => e.stopPropagation()}
                 className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                 </svg>
                 下载
               </a>
             </div>
 
             {/* 图片 */}
             <motion.div
               key={selectedIndex}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 0.2 }}
               className="relative w-full max-w-4xl aspect-[4/3]"
               onClick={(e) => e.stopPropagation()}
             >
               {!imgErrors.has(selectedIndex) ? (
                 <img src={images[selectedIndex]}
                   alt={`${spotName} #${selectedIndex + 1}`} style={{ objectFit: "contain", width: "100%", height: "100%", position: "absolute", inset: 0 }} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg">
                   <p className="text-white/40">图片加载失败</p>
                 </div>
               )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </section>
   );
 }
