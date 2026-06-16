'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryProps { images: string[]; spotName: string; }

export default function Gallery({ images, spotName }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePrev = useCallback(() => setSelectedIndex((i: number | null) => (i !== null && i > 0 ? i - 1 : i)), []);
  const handleNext = useCallback(() => setSelectedIndex((i: number | null) => (i !== null && i < images.length - 1 ? i + 1 : i)), [images.length]);
  const handleImgError = useCallback((idx: number) => setImgErrors((prev: Set<number>) => new Set(prev).add(idx)), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(5, z - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) { setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.map((src, idx) => (
          <motion.button key={src} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} onClick={() => { setSelectedIndex(idx); resetView(); }}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all focus:outline-none">
            {imgErrors.has(idx) ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                <div className="text-center"><svg className="w-8 h-8 mx-auto mb-1 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p className="text-white/20 text-xs">{idx + 1}</p></div>
              </div>
            ) : (<><img src={src} alt={`${spotName} #${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => handleImgError(idx)} /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" /></>)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => { setSelectedIndex(null); resetView(); }}>
            <button onClick={() => { setSelectedIndex(null); resetView(); }} className="absolute top-4 right-4 text-white/60 hover:text-white p-2 z-10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            {selectedIndex > 0 && <button onClick={(e) => { e.stopPropagation(); handlePrev(); resetView(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg></button>}
            {selectedIndex < images.length - 1 && <button onClick={(e) => { e.stopPropagation(); handleNext(); resetView(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg></button>}

            {/* 缩放/信息控制 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/50 text-sm z-10">
              <span>{selectedIndex + 1} / {images.length}</span>
              <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(5, z + 0.5)); }} className="hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.5)); }} className="hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); resetView(); }} className="hover:text-white text-xs">重置</button>
              <button onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }} className="hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
              <a href={images[selectedIndex]} download onClick={(e) => e.stopPropagation()} className="hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
            </div>

            {/* 元数据面板 */}
            {showInfo && <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 p-4 z-10 text-white/60 text-xs space-y-1.5" onClick={e => e.stopPropagation()}>
              <p>文件名: {images[selectedIndex]?.split('/').pop()}</p>
              <p>路径: {images[selectedIndex]}</p>
              <p>序号: {selectedIndex + 1} / {images.length}</p>
            </div>}

            {/* 图片 */}
            <motion.div key={selectedIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full flex items-center justify-center cursor-grab" onClick={e => e.stopPropagation()} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <img ref={imgRef} src={images[selectedIndex]} alt={`${spotName} #${selectedIndex + 1}`}
                style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: isPanning ? 'none' : 'transform 0.1s' }}
                onError={() => handleImgError(selectedIndex)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}