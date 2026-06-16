 'use client';
 
 import { useEffect, useRef, useState } from 'react';
 import { useRouter } from 'next/navigation';
 
 const CHINA_BOUNDS = { north: 54, south: 18, west: 73, east: 135 };
 
 export default function MapContentDB({ countryId }: { countryId: string }) {
   const mapRef = useRef<HTMLDivElement>(null);
   const mapInstRef = useRef<any>(null);
   const router = useRouter();
   const [loaded, setLoaded] = useState(false);
   const [spots, setSpots] = useState<any[]>([]);
   const initRef = useRef(false);
 
   useEffect(() => {
     if (!mapRef.current || initRef.current) return;
     initRef.current = true;
 
     (async () => {
       try {
         const L = (await import('leaflet')).default;
         await import('leaflet/dist/leaflet.css');
         if (!mapRef.current) return;
 
         delete (L.Icon.Default.prototype as any)._getIconUrl;
         L.Icon.Default.mergeOptions({
           iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
           iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
           shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
         });
 
         const map = L.map(mapRef.current, {
           center: [35, 108], zoom: 4, zoomControl: false, attributionControl: false,
           maxBounds: L.latLngBounds([CHINA_BOUNDS.south - 5, CHINA_BOUNDS.west - 5], [CHINA_BOUNDS.north + 5, CHINA_BOUNDS.east + 5]),
           maxBoundsViscosity: 1.0,
         });
 
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '' }).addTo(map);
         L.control.zoom({ position: 'bottomright' }).addTo(map);
         L.rectangle(L.latLngBounds([CHINA_BOUNDS.south, CHINA_BOUNDS.west], [CHINA_BOUNDS.north, CHINA_BOUNDS.east]),
           { color: '#4fc3f7', weight: 2, fillOpacity: 0.02, dashArray: '6 6' }).addTo(map);
 
         // Fetch spots from API
         let spotList;
         try {
           const res = await fetch('/api/spots');
           if (res.ok) spotList = await res.json();
         } catch {}
         if (!spotList || !spotList.length) {
           const { getAllScenicSpots } = await import('@/lib/data');
           spotList = getAllScenicSpots();
         }
 
         spotList.forEach((spot: any) => {
           if (!spot.coordinates?.lat || !spot.coordinates?.lng) return;
           const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], { opacity: 0.9 });
           const popupHtml = `<div style="min-width:180px;background:rgba(15,20,40,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:12px;font-family:system-ui,sans-serif;">
             <div style="font-size:15px;font-weight:600;color:white;margin-bottom:4px;">${spot.name}</div>
             <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:8px;">${spot.country} · ${spot.province}</div>
             <p style="font-size:12px;color:rgba(255,255,255,0.65);margin:0 0 10px 0;">${(spot.description||'').slice(0, 60)}...</p>
             <a href="/scenic/${spot.id}" style="display:inline-block;padding:6px 16px;border-radius:6px;background:#3b82f6;color:white;font-size:12px;text-decoration:none;">进入景区</a>
           </div>`;
           marker.bindPopup(popupHtml, { maxWidth: 300, className: 'sp-popup', closeButton: true, offset: L.point(0, -20) });
           marker.addTo(map);
         });
 
         setSpots(spotList);
         mapInstRef.current = map;
         setLoaded(true);
       } catch (e) { console.error('Map error:', e); setLoaded(true); }
     })();
 
     return () => { if (mapInstRef.current) { mapInstRef.current.remove(); mapInstRef.current = null; initRef.current = false; } };
   }, [countryId]);
 
   return (
     <div className="relative w-full h-full">
       {!loaded && <div className="absolute inset-0 bg-[#0e1225] flex items-center justify-center z-10"><div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /></div>}
       <div ref={mapRef} style={{ width: '100%', height: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }} />
       <style jsx global>{`
         .sp-popup .leaflet-popup-content-wrapper { background:transparent !important; box-shadow:none !important; padding:0 !important; border-radius:10px !important; }
         .sp-popup .leaflet-popup-content { margin:0 !important; min-width:180px; }
         .sp-popup .leaflet-popup-tip { background:rgba(15,20,40,0.95) !important; border:1px solid rgba(255,255,255,0.15); }
         .sp-popup .leaflet-popup-close-button { color:rgba(255,255,255,0.5) !important; top:6px !important; right:6px !important; }
       `}</style>
     </div>
   );
 }
